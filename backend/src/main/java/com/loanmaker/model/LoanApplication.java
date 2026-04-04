package com.loanmaker.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "loan_applications")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LoanApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double loanAmount;
    private Integer tenure;

    @Column(nullable = false)
    private String status = "PENDING";  // ✅ Default value

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private LoanProvider provider;

    @ManyToOne
    @JoinColumn(name = "asset_id")
    private Asset asset;
}
