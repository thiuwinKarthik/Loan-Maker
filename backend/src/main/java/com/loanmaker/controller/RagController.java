package com.loanmaker.controller;

import com.loanmaker.dto.RagQueryDTO;
import com.loanmaker.dto.RagResponseDTO;
import com.loanmaker.service.RagRateLimiter;
import com.loanmaker.service.RagService;
import com.loanmaker.shared.api.ApiError;
import com.loanmaker.shared.api.ApiResponse;
import com.loanmaker.shared.context.RequestContext;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rag")
public class RagController {
    private final RagService ragService;
    private final RagRateLimiter ragRateLimiter;

    public RagController(RagService ragService, RagRateLimiter ragRateLimiter) {
        this.ragService = ragService;
        this.ragRateLimiter = ragRateLimiter;
    }

    @PostMapping("/query")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<RagResponseDTO>> query(@Valid @RequestBody RagQueryDTO request, Authentication authentication) {
        String identityKey = authentication.getName();
        if (!ragRateLimiter.allow(identityKey)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(ApiResponse.fail(
                            ApiError.of("RATE_LIMITED", "Too many RAG requests. Try again later."),
                            RequestContext.correlationId()
                    ));
        }
        RagResponseDTO response = ragService.query(request, RequestContext.correlationId());
        return ResponseEntity.ok(ApiResponse.ok(response, RequestContext.correlationId()));
    }
}
