package com.loanmaker.service;

import com.loanmaker.dto.LoanAiRequest;
import com.loanmaker.infrastructure.ai.AiServiceProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LoanAIService {

    private final RestTemplate restTemplate;
    private final AiServiceProperties aiServiceProperties;

    private String baseUrl() {
        return aiServiceProperties.baseUrl();
    }

    // 1️⃣ Prediction API
    public Map<String, Object> getLoanPrediction(LoanAiRequest request) {
        try {
            Map<String, Object> response = restTemplate.postForObject(baseUrl() + "/predict", request, Map.class);
            return unwrapData(response);
        } catch (HttpClientErrorException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Prediction failed: " + e.getResponseBodyAsString());
            return error;
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Prediction failed: " + e.getMessage());
            return error;
        }
    }


    // 2️⃣ Recommendation API
    public Map<String, Object> getLoanRecommendations(LoanAiRequest request) {
        try {
            Map<String, Object> response = restTemplate.postForObject(baseUrl() + "/recommend", request, Map.class);
            return unwrapData(response);
        } catch (HttpClientErrorException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Recommendation failed: " + e.getResponseBodyAsString());
            return error;
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Recommendation failed: " + e.getMessage());
            return error;
        }
    }

    // 3️⃣ Predict + Recommend API
    public Map<String, Object> predictAndRecommend(LoanAiRequest request) {
        Map<String, Object> response = new LinkedHashMap<>();

        Map<String, Object> prediction = getLoanPrediction(request);
        Map<String, Object> recommendations = getLoanRecommendations(request);

        response.put("prediction", prediction.getOrDefault("approved", null));
        response.put("recommendations", recommendations.getOrDefault("recommendations", null));

        return response;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> unwrapData(Map<String, Object> payload) {
        if (payload == null) {
            return Map.of();
        }
        Object success = payload.get("success");
        if (Boolean.TRUE.equals(success) && payload.get("data") instanceof Map<?, ?> data) {
            return (Map<String, Object>) data;
        }
        return payload;
    }
}
