CREATE TABLE IF NOT EXISTS rag_queries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    model_name VARCHAR(120) NOT NULL,
    tokens_used INT NOT NULL,
    confidence_score DOUBLE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rag_queries_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_rag_queries_user_id ON rag_queries(user_id);
CREATE INDEX idx_rag_queries_created_at ON rag_queries(created_at);

CREATE TABLE IF NOT EXISTS rag_retrieval_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rag_query_id BIGINT NOT NULL,
    document_id VARCHAR(255) NOT NULL,
    similarity_score DOUBLE NOT NULL,
    metadata JSON,
    CONSTRAINT fk_rag_retrieval_query FOREIGN KEY (rag_query_id) REFERENCES rag_queries(id)
);
