package com.loanmaker.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "loan_providers")
public class LoanProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ REMOVE the @Column(name = "bank_name")
    private String bankName;

    // ✅ REMOVE the @Column(name = "interest_rate")
    private Double interestRate;

    // ✅ REMOVE the @Column(name = "max_amount")
    private Double maxAmount;

    // ✅ REMOVE the @Column(name = "min_credit_score")
    private Integer minCreditScore;

    // ✅ REMOVE the @Column(name = "loan_type")
    private String loanType;
}
