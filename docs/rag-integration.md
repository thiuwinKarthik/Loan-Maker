# Production RAG Integration - Loan Maker

## Updated Folder Structure

- `backend/src/main/java/com/loanmaker/controller/RagController.java`
- `backend/src/main/java/com/loanmaker/service/RagService.java`
- `backend/src/main/java/com/loanmaker/service/RagRateLimiter.java`
- `backend/src/main/java/com/loanmaker/dto/RagQueryDTO.java`
- `backend/src/main/java/com/loanmaker/dto/RagResponseDTO.java`
- `backend/src/main/java/com/loanmaker/model/RagQuery.java`
- `backend/src/main/java/com/loanmaker/model/RagRetrievalLog.java`
- `backend/src/main/java/com/loanmaker/repository/RagQueryRepository.java`
- `backend/src/main/java/com/loanmaker/repository/RagRetrievalLogRepository.java`
- `AI/loanmaker-ai/rag/schema.py`
- `AI/loanmaker-ai/rag/retriever.py`
- `AI/loanmaker-ai/rag/embeddings.py`
- `AI/loanmaker-ai/rag/vector_store.py`
- `AI/loanmaker-ai/rag/agent.py`
- `AI/loanmaker-ai/rag/prompt_template.txt`
- `AI/loanmaker-ai/jobs/ingest_vectors.py`
- `frontend/src/pages/shared/LoanAdvisor.jsx`
- `frontend/src/components/rag/RagChatBox.jsx`
- `frontend/src/features/rag/api.js`

## SQL Migrations

- `scripts/migrations/V20260403__create_rag_tables.sql`
- `scripts/migrations/V20260403__optional_loan_summary_column.sql`

## Security Controls Implemented

- JWT-protected `/api/rag/query` with role restriction (`USER`, `ROLE_ADMIN`).
- Per-user rate limiting in backend with Bucket4j.
- PII masking in AI context payload (name/email/phone masked).
- Prompt injection guard in AI request schema.
- Strict output schema validation in AI and backend.
- Correlation ID propagation to AI service.
- RAG query + retrieval logs persisted for audit trail.

## Deployment Steps

1. Start Qdrant:
   - `docker compose -f docker-compose.rag.yml up -d`
2. Configure environment:
   - backend vars from `backend/.env.example`
   - AI vars from `AI/loanmaker-ai/.env.example`
   - frontend vars from `frontend/.env.example`
3. Run DB migrations:
   - execute SQL scripts under `scripts/migrations`
4. Seed vector database:
   - run `python jobs/ingest_vectors.py` in `AI/loanmaker-ai`
5. Start services:
   - backend Spring Boot
   - AI FastAPI (`uvicorn main:app --reload --port 8000`)
   - frontend Vite

## Testing Strategy

- Backend:
  - Unit tests for context builder and schema validation paths.
  - Integration tests for `/api/rag/query` auth, rate limiting, and persistence.
- AI:
  - Schema tests for request/response constraints.
  - Retrieval tests to verify metadata filter by `user_id`.
  - Contract tests for JSON output format.
- Frontend:
  - Component tests for `RagChatBox` loading/error/success rendering.
  - Route guard tests for role-based access.

## Operational Notes

- RAG response is advisory-only and includes mandatory disclaimer.
- No transactional loan approval or mutation is performed by RAG pipeline.
- Cross-user retrieval is blocked via metadata filter on `user_id`.
