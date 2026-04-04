package com.loanmaker.shared.exception;

import com.loanmaker.shared.api.ApiError;
import com.loanmaker.shared.api.ApiResponse;
import com.loanmaker.shared.context.RequestContext;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> details = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fieldError -> details.put(fieldError.getField(), fieldError.getDefaultMessage()));

        ApiError error = new ApiError("VALIDATION_ERROR", "Validation failed", details);
        return ResponseEntity.badRequest().body(ApiResponse.fail(error, RequestContext.correlationId()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraint(ConstraintViolationException ex) {
        ApiError error = ApiError.of("VALIDATION_ERROR", ex.getMessage());
        return ResponseEntity.badRequest().body(ApiResponse.fail(error, RequestContext.correlationId()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArg(IllegalArgumentException ex) {
        ApiError error = ApiError.of("BAD_REQUEST", ex.getMessage());
        return ResponseEntity.badRequest().body(ApiResponse.fail(error, RequestContext.correlationId()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntime(RuntimeException ex) {
        ApiError error = ApiError.of("INTERNAL_ERROR", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail(error, RequestContext.correlationId()));
    }
}
