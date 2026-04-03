# Loan Maker Modernized Architecture

## New Structure

- `frontend/src/app` application shell and providers
- `frontend/src/features` feature modules (`auth`, `offers`, `user`)
- `frontend/src/shared` cross-cutting modules (API client, session, config)
- `backend/src/main/java/com/loanmaker/domain` domain policies and business rules
- `backend/src/main/java/com/loanmaker/application` use-cases and orchestrators
- `backend/src/main/java/com/loanmaker/infrastructure` framework adapters and integration components
- `backend/src/main/java/com/loanmaker/shared` API envelopes, context, audit, exception model
- `AI/loanmaker-ai` validated inference API with explicit contract envelope and tests

## Core Flow

1. Frontend calls shared API client (`apiClient`) with JWT and correlation headers.
2. Backend security layer validates JWT and injects request correlation ID.
3. Controller delegates to application use case.
4. Use case executes domain policy and repository changes in transaction boundaries.
5. Response is returned in a standardized envelope (`ApiResponse`).
6. Audit logger emits traceable domain events for sensitive operations.

## Banking Controls Added

- Standardized API response envelope and centralized exception handling.
- Correlation ID propagation for traceability.
- Audit event hooks for auth/loan/AI workflows.
- JWT secret hardening and explicit expiration property.
- Auth required for AI endpoints.
- Input validation envelopes in AI microservice with range checks.
