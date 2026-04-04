package com.loanmaker.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loanmaker.dto.RagQueryDTO;
import com.loanmaker.dto.RagResponseDTO;
import com.loanmaker.infrastructure.ai.AiServiceProperties;
import com.loanmaker.model.*;
import com.loanmaker.repository.*;
import com.loanmaker.shared.audit.AuditLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RagService {
    private static final String DISCLAIMER = "AI guidance is advisory only and cannot approve loans or override lending decisions.";

    private final UserRepository userRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final AssetRepository assetRepository;
    private final RagQueryRepository ragQueryRepository;
    private final RagRetrievalLogRepository ragRetrievalLogRepository;
    private final RestTemplate restTemplate;
    private final AuditLogger auditLogger;
    private final ObjectMapper objectMapper;
    private final AiServiceProperties aiServiceProperties;

    @Transactional
    public RagResponseDTO query(RagQueryDTO ragQueryDTO, String correlationId) {
        User user = authenticatedUser();
        List<LoanApplication> loans = loanApplicationRepository.findByUserId(user.getId());
        List<Asset> assets = assetRepository.findByUserId(user.getId());

        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("question", ragQueryDTO.question());
        requestPayload.put("role", normalizeRole(user.getRole()));
        requestPayload.put("structured_user_profile", buildProfileContext(user, loans, assets));
        requestPayload.put("correlation_id", correlationId);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Correlation-Id", correlationId);
        ResponseEntity<Map> responseEntity = restTemplate.postForEntity(
                aiServiceProperties.baseUrl() + "/rag/query",
                new HttpEntity<>(requestPayload, headers),
                Map.class
        );

        Map<String, Object> payload = Optional.ofNullable(responseEntity.getBody()).orElse(Map.of());
        RagResponseDTO parsed = parseAndValidateResponse(payload);
        RagQuery savedQuery = saveRagQuery(user, ragQueryDTO.question(), parsed);
        saveRetrievalLogs(savedQuery, payload);

        auditLogger.logEvent(
                "RAG_QUERY_EXECUTED",
                user.getEmail(),
                Map.of("userId", user.getId(), "model", parsed.modelName(), "tokensUsed", parsed.tokensUsed())
        );
        return parsed;
    }

    private User authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private String normalizeRole(String role) {
        if ("ROLE_ADMIN".equalsIgnoreCase(role)) {
            return "ADMIN";
        }
        return "USER";
    }

    private Map<String, Object> buildProfileContext(User user, List<LoanApplication> loans, List<Asset> assets) {
        double totalAssetValue = assets.stream().map(Asset::getValue).filter(Objects::nonNull).mapToDouble(Double::doubleValue).sum();
        long rejectedLoans = loans.stream().filter(l -> "REJECTED".equalsIgnoreCase(l.getStatus())).count();
        String riskCategory = user.getCreditScore() >= 750 ? "LOW" : user.getCreditScore() >= 650 ? "MEDIUM" : "HIGH";

        List<Map<String, Object>> loanHistory = loans.stream().map(loan -> {
            Map<String, Object> item = new HashMap<>();
            item.put("loanId", loan.getId());
            item.put("loanAmount", loan.getLoanAmount());
            item.put("tenure", loan.getTenure());
            item.put("status", loan.getStatus());
            item.put("provider", loan.getProvider() == null ? "unknown" : loan.getProvider().getBankName());
            return item;
        }).toList();

        List<Map<String, Object>> assetHistory = assets.stream()
                .map(asset -> Map.<String, Object>of(
                        "assetId", asset.getId(),
                        "assetType", asset.getAssetType(),
                        "value", asset.getValue()
                ))
                .toList();

        Map<String, Object> profile = new HashMap<>();
        profile.put("user_id", user.getId());
        profile.put("role", normalizeRole(user.getRole()));
        profile.put("credit_score", user.getCreditScore());
        profile.put("risk_category", riskCategory);
        profile.put("previous_loans", user.getPreviousLoans());
        profile.put("rejected_loans", rejectedLoans);
        profile.put("loan_history", loanHistory);
        profile.put("assets", assetHistory);
        profile.put("total_asset_value", totalAssetValue);
        profile.put("masked_identity", Map.of(
                "name", maskName(user.getName()),
                "email", maskEmail(user.getEmail()),
                "phone", maskPhone(user.getPhone())
        ));

        if ("ADMIN".equals(normalizeRole(user.getRole()))) {
            List<LoanApplication> allLoans = loanApplicationRepository.findAll();
            long approved = allLoans.stream().filter(l -> "APPROVED".equalsIgnoreCase(l.getStatus())).count();
            long rejected = allLoans.stream().filter(l -> "REJECTED".equalsIgnoreCase(l.getStatus())).count();
            long pending = allLoans.stream().filter(l -> "PENDING".equalsIgnoreCase(l.getStatus())).count();
            profile.put("portfolio_overview", Map.of(
                    "total_loans", allLoans.size(),
                    "approved_loans", approved,
                    "rejected_loans", rejected,
                    "pending_loans", pending
            ));
        }
        return profile;
    }

    private RagResponseDTO parseAndValidateResponse(Map<String, Object> payload) {
        Map<String, Object> data = payload;
        if (payload.containsKey("data") && payload.get("data") instanceof Map<?, ?> wrapped) {
            data = castMap(wrapped);
        }

        String summary = asString(data.get("summary"));
        List<String> riskFactors = asStringList(data.get("riskFactors"));
        List<String> recommendations = asStringList(data.get("recommendations"));
        Double confidence = asDouble(data.get("confidenceScore"));
        if (summary == null || riskFactors == null || recommendations == null || confidence == null) {
            throw new IllegalArgumentException("Invalid RAG response schema");
        }
        if (confidence < 0 || confidence > 1) {
            throw new IllegalArgumentException("Invalid confidence score range");
        }

        List<RagResponseDTO.RagSourceDTO> sources = readSources(payload.get("sources"));
        String modelName = Optional.ofNullable(asString(payload.get("modelName"))).orElse("unknown");
        Integer tokensUsed = Optional.ofNullable(asInteger(payload.get("tokensUsed"))).orElse(0);
        return new RagResponseDTO(summary, riskFactors, recommendations, confidence, sources, modelName, tokensUsed, DISCLAIMER);
    }

    private RagQuery saveRagQuery(User user, String question, RagResponseDTO dto) {
        RagQuery ragQuery = new RagQuery();
        ragQuery.setUser(user);
        ragQuery.setQuestion(question);
        ragQuery.setResponse(dto.summary());
        ragQuery.setModelName(dto.modelName());
        ragQuery.setTokensUsed(dto.tokensUsed());
        ragQuery.setConfidenceScore(dto.confidenceScore());
        ragQuery.setCreatedAt(LocalDateTime.now());
        return ragQueryRepository.save(ragQuery);
    }

    private void saveRetrievalLogs(RagQuery ragQuery, Map<String, Object> payload) {
        Object sourceObj = payload.get("sources");
        if (!(sourceObj instanceof List<?> sourceList)) {
            return;
        }
        for (Object sourceItem : sourceList) {
            if (!(sourceItem instanceof Map<?, ?> item)) {
                continue;
            }
            Map<String, Object> source = castMap(item);
            RagRetrievalLog log = new RagRetrievalLog();
            log.setRagQuery(ragQuery);
            log.setDocumentId(Optional.ofNullable(asString(source.get("documentId"))).orElse("unknown"));
            log.setSimilarityScore(Optional.ofNullable(asDouble(source.get("similarityScore"))).orElse(0.0));
            try {
                log.setMetadata(objectMapper.writeValueAsString(source));
            } catch (JsonProcessingException e) {
                log.setMetadata("{\"error\":\"serialization_failed\"}");
            }
            ragRetrievalLogRepository.save(log);
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@", 2);
        String local = parts[0].length() <= 2 ? "***" : parts[0].substring(0, 2) + "***";
        return local + "@" + parts[1];
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "***";
        return "***" + phone.substring(phone.length() - 4);
    }

    private String maskName(String name) {
        if (name == null || name.isBlank()) return "***";
        return name.charAt(0) + "***";
    }

    private String asString(Object value) {
        return value instanceof String str ? str : null;
    }

    private Double asDouble(Object value) {
        if (value instanceof Number n) return n.doubleValue();
        return null;
    }

    private Integer asInteger(Object value) {
        if (value instanceof Number n) return n.intValue();
        return null;
    }

    private List<String> asStringList(Object value) {
        if (!(value instanceof List<?> list)) return null;
        List<String> converted = new ArrayList<>();
        for (Object item : list) {
            if (!(item instanceof String str)) {
                return null;
            }
            converted.add(str);
        }
        return converted;
    }

    private List<RagResponseDTO.RagSourceDTO> readSources(Object value) {
        if (!(value instanceof List<?> list)) return List.of();
        List<RagResponseDTO.RagSourceDTO> sources = new ArrayList<>();
        for (Object item : list) {
            if (!(item instanceof Map<?, ?> map)) continue;
            Map<String, Object> sourceMap = castMap(map);
            sources.add(new RagResponseDTO.RagSourceDTO(
                    Optional.ofNullable(asString(sourceMap.get("documentId"))).orElse("unknown"),
                    Optional.ofNullable(asDouble(sourceMap.get("similarityScore"))).orElse(0.0),
                    Optional.ofNullable(asString(sourceMap.get("documentType"))).orElse("unknown")
            ));
        }
        return sources;
    }

    private Map<String, Object> castMap(Map<?, ?> raw) {
        return objectMapper.convertValue(raw, new TypeReference<>() {
        });
    }
}
