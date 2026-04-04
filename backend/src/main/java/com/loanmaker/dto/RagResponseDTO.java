package com.loanmaker.dto;

import java.util.List;

public record RagResponseDTO(
        String summary,
        List<String> riskFactors,
        List<String> recommendations,
        Double confidenceScore,
        List<RagSourceDTO> sources,
        String modelName,
        Integer tokensUsed,
        String disclaimer
) {
    public record RagSourceDTO(
            String documentId,
            Double similarityScore,
            String documentType
    ) {
    }
}
