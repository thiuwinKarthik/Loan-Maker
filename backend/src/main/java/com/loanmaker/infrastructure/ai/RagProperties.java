package com.loanmaker.infrastructure.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "rag")
public record RagProperties(
        int maxRequestsPerMinute
) {
}
