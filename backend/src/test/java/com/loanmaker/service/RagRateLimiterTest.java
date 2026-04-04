package com.loanmaker.service;

import com.loanmaker.infrastructure.ai.RagProperties;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RagRateLimiterTest {

    @Test
    void shouldDenyWhenCapacityExceeded() {
        RagRateLimiter limiter = new RagRateLimiter(new RagProperties(5));
        for (int i = 0; i < 5; i++) {
            assertTrue(limiter.allow("user-1"));
        }
        assertFalse(limiter.allow("user-1"));
    }
}
