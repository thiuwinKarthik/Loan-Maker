package com.loanmaker.infrastructure.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai.service")
public record AiServiceProperties(
        String baseUrl,
        int timeoutMs
) {
}
