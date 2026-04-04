package com.loanmaker.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loan_providers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String bankName;

    @Column(nullable = false)
    private double interestRate;

    @Column(nullable = false)
    private double maxLoan;

    @Column(nullable = false)
    private double processingFee;

    @Column(nullable = false)
    private String loanType; // "Land", "Gold", "Personal", etc.
}
