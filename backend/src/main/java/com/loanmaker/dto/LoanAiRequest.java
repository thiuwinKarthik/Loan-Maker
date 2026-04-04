package com.loanmaker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoanAiRequest {
    private Integer age;
    private Double income;
    private Double asset_value;
    private Integer credit_score;
    private Double loan_amount;
    private Integer tenure;
    private Double existing_emi;
}
