package com.loanmaker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "rag_retrieval_logs")
@Getter
@Setter
public class RagRetrievalLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rag_query_id", nullable = false)
    private RagQuery ragQuery;

    @Column(name = "document_id", length = 255, nullable = false)
    private String documentId;

    @Column(name = "similarity_score", nullable = false)
    private Double similarityScore;

    @Column(name = "metadata", columnDefinition = "json")
    private String metadata;
}
