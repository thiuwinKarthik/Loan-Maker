package com.loanmaker.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoanApplicationDTO {
    private Long id;
    private Long userId;
    private Long providerId;
    private String providerName;   // ✅ Added
    private Long assetId;
    private String assetType;      // ✅ Added
    private Double loanAmount;
    private Integer tenure;
    private String status;
}
