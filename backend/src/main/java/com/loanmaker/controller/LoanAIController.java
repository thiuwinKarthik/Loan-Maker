package com.loanmaker.controller;

import com.loanmaker.dto.LoanAiRequest;
import com.loanmaker.service.LoanAIService;
import com.loanmaker.shared.api.ApiResponse;
import com.loanmaker.shared.audit.AuditLogger;
import com.loanmaker.shared.context.RequestContext;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class LoanAIController {

    @Autowired
    private LoanAIService loanAIService;

    @Autowired
    private AuditLogger auditLogger;

    // 1️⃣ Loan Prediction
    @PostMapping("/predict")
    public ResponseEntity<ApiResponse<Map<String, Object>>> predictLoan(@Valid @RequestBody LoanAiRequest request) {
        Map<String, Object> aiResponse = loanAIService.getLoanPrediction(request);
        auditLogger.logEvent("AI_PREDICT", null, Map.of("approved", aiResponse.get("approved")));
        return ResponseEntity.ok(ApiResponse.ok(aiResponse, RequestContext.correlationId()));
    }

    // 2️⃣ Loan Recommendation
    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recommendLoan(@Valid @RequestBody LoanAiRequest request) {
        Map<String, Object> recommendations = loanAIService.getLoanRecommendations(request);
        return ResponseEntity.ok(ApiResponse.ok(recommendations, RequestContext.correlationId()));
    }

    // 3️⃣ Predict + Recommend
    @PostMapping("/predict-and-recommend")
    public ResponseEntity<ApiResponse<Map<String, Object>>> predictAndRecommend(@Valid @RequestBody LoanAiRequest request) {
        Map<String, Object> result = loanAIService.predictAndRecommend(request);
        auditLogger.logEvent("AI_PREDICT_RECOMMEND", null, Map.of("prediction", result.get("prediction")));
        return ResponseEntity.ok(ApiResponse.ok(result, RequestContext.correlationId()));
    }
}
