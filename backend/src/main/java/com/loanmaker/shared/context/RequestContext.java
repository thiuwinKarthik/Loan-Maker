package com.loanmaker.shared.context;

import org.slf4j.MDC;

public final class RequestContext {
    public static final String CORRELATION_ID_KEY = "correlationId";

    private RequestContext() {
    }

    public static String correlationId() {
        String value = MDC.get(CORRELATION_ID_KEY);
        return value == null ? "n/a" : value;
    }
}
