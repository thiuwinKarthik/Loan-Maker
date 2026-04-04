package com.loanmaker.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loan_requests")
public class LoanRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String providerName;
    private String assetType;
    private Double loanAmount;
    private Integer tenure;

    @Enumerated(EnumType.STRING)
    private LoanStatus status = LoanStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public enum LoanStatus {
        PENDING, APPROVED, REJECTED
    }

    // getters & setters
}
