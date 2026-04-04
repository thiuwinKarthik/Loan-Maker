from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pickle
import numpy as np
from pathlib import Path
import os

app = FastAPI(title="Loan AI Microservice")

class LoanRequest(BaseModel):
    age: int = Field(ge=18, le=80)
    income: float = Field(gt=0, le=10000000)
    existing_emi: float = Field(ge=0, le=5000000)
    credit_score: int = Field(ge=300, le=900)
    asset_value: float = Field(gt=0, le=1000000000)
    loan_amount: float = Field(gt=0, le=1000000000)
    tenure: int = Field(ge=1, le=480)


class ApiResponse(BaseModel):
    success: bool
    data: dict | None = None
    error: dict | None = None


MODEL_PATH = Path("services/loan_model.pkl")
if not MODEL_PATH.exists():
    raise RuntimeError("Model file not found at services/loan_model.pkl")

with MODEL_PATH.open("rb") as f:
    model = pickle.load(f)

from rag.schema import RagQueryRequest
from rag.retriever import RagRetriever
from rag.agent import RagAgent

rag_retriever = RagRetriever()
rag_agent = RagAgent()

@app.post("/predict")
def predict(request: LoanRequest):
    data = request.dict()
    X = np.array([[data["age"], data["income"], data["existing_emi"],
                   data["credit_score"], data["asset_value"],
                   data["loan_amount"], data["tenure"]]])
    prediction = model.predict(X)[0]
    return ApiResponse(success=True, data={"approved": bool(prediction)})

# Existing recommend endpoint
from services.loan_recommendation import recommend_lenders

@app.post("/recommend")
def recommend(request: LoanRequest):
    user_data = request.dict()
    lenders = recommend_lenders(user_data)
    return ApiResponse(success=True, data={"recommendations": lenders})


@app.get("/health")
def health():
    return ApiResponse(success=True, data={"status": "ok"})


@app.post("/rag/query")
def rag_query(request: RagQueryRequest):
    profile = request.structured_user_profile
    user_id = profile.get("user_id")
    if not isinstance(user_id, int):
        raise HTTPException(status_code=400, detail="structured_user_profile.user_id must be integer")

    docs = rag_retriever.retrieve(request.question, user_id=user_id, top_k=int(os.getenv("RAG_TOP_K", "5")))
    result, tokens_used, model_name = rag_agent.generate(
        question=request.question,
        profile=profile,
        retrieved_docs=docs,
    )
    sources = [
        {
            "documentId": doc.get("document_id"),
            "similarityScore": doc.get("similarity_score", 0.0),
            "documentType": doc.get("metadata", {}).get("document_type", "unknown"),
            "riskLevel": doc.get("metadata", {}).get("risk_level", "unknown"),
        }
        for doc in docs
    ]
    return {
        "summary": result.summary,
        "riskFactors": result.riskFactors,
        "recommendations": result.recommendations,
        "confidenceScore": result.confidenceScore,
        "sources": sources,
        "tokensUsed": tokens_used,
        "modelName": model_name,
    }
