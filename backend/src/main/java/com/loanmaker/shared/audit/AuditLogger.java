package com.loanmaker.shared.audit;

import com.loanmaker.shared.context.RequestContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class AuditLogger {
    public void logEvent(String eventType, String actor, Map<String, Object> metadata) {
        log.info(
                "audit_event type={} actor={} correlationId={} metadata={}",
                eventType,
                actor == null ? "anonymous" : actor,
                RequestContext.correlationId(),
                metadata
        );
    }
}
