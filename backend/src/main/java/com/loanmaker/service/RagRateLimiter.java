package com.loanmaker.service;

import com.loanmaker.infrastructure.ai.RagProperties;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RagRateLimiter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final RagProperties ragProperties;

    public RagRateLimiter(RagProperties ragProperties) {
        this.ragProperties = ragProperties;
    }

    public boolean allow(String key) {
        Bucket bucket = buckets.computeIfAbsent(key, this::newBucket);
        return bucket.tryConsume(1);
    }

    private Bucket newBucket(String ignored) {
        int capacity = Math.max(5, ragProperties.maxRequestsPerMinute());
        Bandwidth limit = Bandwidth.classic(capacity, Refill.greedy(capacity, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }
}
