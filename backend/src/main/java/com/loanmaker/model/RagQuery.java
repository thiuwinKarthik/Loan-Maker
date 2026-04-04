package com.loanmaker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "rag_queries", indexes = {
        @Index(name = "idx_rag_queries_user_id", columnList = "user_id"),
        @Index(name = "idx_rag_queries_created_at", columnList = "created_at")
})
@Getter
@Setter
public class RagQuery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String response;

    @Column(name = "model_name", length = 120, nullable = false)
    private String modelName;

    @Column(name = "tokens_used", nullable = false)
    private Integer tokensUsed;

    @Column(name = "confidence_score", nullable = false)
    private Double confidenceScore;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
