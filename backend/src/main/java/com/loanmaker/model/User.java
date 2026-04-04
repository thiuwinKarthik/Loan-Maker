package com.loanmaker.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String name;
    private String password;
    private String phone;

    @Column(name = "role")
    private String role = "USER";

    private int previousLoans;   // Number of previous loans
    private int creditScore;     // Credit score

    // getters and setters
    public int getPreviousLoans() { return previousLoans; }
    public void setPreviousLoans(int previousLoans) { this.previousLoans = previousLoans; }

    public int getCreditScore() { return creditScore; }
    public void setCreditScore(int creditScore) { this.creditScore = creditScore; }// Default role

    public User(String email, String name, String password, String phone) {
        this.email = email;
        this.name = name;
        this.password = password;
        this.phone = phone;
        this.role = "USER";
        this.previousLoans = 0;         // default value
        this.creditScore = 700;

    }
}