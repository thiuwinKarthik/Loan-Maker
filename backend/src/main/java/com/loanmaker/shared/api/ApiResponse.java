package com.loanmaker.shared.api;

import java.time.Instant;

public record ApiResponse<T>(
        boolean success,
        T data,
        ApiError error,
        String correlationId,
        Instant timestamp
) {
    public static <T> ApiResponse<T> ok(T data, String correlationId) {
        return new ApiResponse<>(true, data, null, correlationId, Instant.now());
    }

    public static <T> ApiResponse<T> fail(ApiError error, String correlationId) {
        return new ApiResponse<>(false, null, error, correlationId, Instant.now());
    }
}
