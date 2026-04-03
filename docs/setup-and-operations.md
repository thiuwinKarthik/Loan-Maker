# Setup and Operations

## Environment

### Backend
- `DB_URL`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET` (required, min 32 chars)
- `JWT_EXPIRATION_MS` (optional, defaults to 3600000)
- `AI_SERVICE_BASE_URL` (optional, defaults to `http://127.0.0.1:8000`)
- `AI_SERVICE_TIMEOUT_MS` (optional, defaults to 5000)

### Frontend
- `VITE_API_BASE_URL` (optional, defaults to `http://localhost:8080`)

## Run

1. Start database.
2. Start AI service:
   - install requirements
   - run `uvicorn main:app --reload --port 8000`
3. Start backend Spring Boot service.
4. Start frontend Vite app.

## Audit and Traceability

- Every backend request is assigned a correlation ID (`X-Correlation-Id`).
- Audit log events are emitted for:
  - login and registration
  - loan application and auto evaluation
  - AI predict and predict/recommend calls

## Reliability Expectations

- Backend wraps errors in a deterministic `ApiResponse` envelope.
- AI endpoints validate feature ranges prior to scoring/recommendation.
- Domain policy logic includes unit tests for approval/rejection boundaries.
