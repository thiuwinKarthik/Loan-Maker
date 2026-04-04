from typing import Any, List

from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    field_validator,
)


# ============================================================
# RAG QUERY REQUEST
# ============================================================

class RagQueryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question: str = Field(
        min_length=5,
        max_length=4000,
        description="User question submitted to RAG engine.",
    )

    role: str = Field(
        pattern="^(USER|ADMIN)$",
        description="Access role for the request.",
    )

    structured_user_profile: dict[str, Any]

    correlation_id: str | None = Field(
        default=None,
        max_length=128,
        description="Optional request trace identifier.",
    )

    # --------------------------------------------------------
    # Prompt injection guard
    # --------------------------------------------------------
    @field_validator("question")
    @classmethod
    def reject_prompt_injection(cls, value: str) -> str:
        lowered = value.lower()

        blocked_patterns = [
            "ignore previous instructions",
            "reveal system prompt",
            "show system prompt",
            "bypass guardrails",
            "override policy",
            "disregard instructions",
            "act as system",
        ]

        if any(pattern in lowered for pattern in blocked_patterns):
            raise ValueError("Unsafe prompt content detected.")

        return value.strip()


# ============================================================
# RAG ENGINE RESPONSE
# ============================================================

class RagEngineResponse(BaseModel):
    """
    Structured response returned by the LLM-backed RAG engine.
    Strict schema enforcement is required for financial safety.
    """

    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True,
        str_strip_whitespace=True,
    )

    summary: str = Field(
        min_length=1,
        max_length=5000,
    )

    riskFactors: List[str] = Field(
        default_factory=list,
        description="Identified risk factors derived from retrieved documents.",
    )

    recommendations: List[str] = Field(
        default_factory=list,
        description="Actionable recommendations based on risk assessment.",
    )

    confidenceScore: float = Field(
        ge=0.0,
        le=1.0,
        description="Model confidence score between 0 and 1.",
    )

    # --------------------------------------------------------
    # Defensive coercion (LLM safety)
    # --------------------------------------------------------
    @field_validator("riskFactors", "recommendations", mode="before")
    @classmethod
    def ensure_list(cls, v):
        """
        Prevent LLM schema drift where single values
        are returned as strings instead of arrays.
        """
        if v is None:
            return []

        if isinstance(v, str):
            return [v.strip()]

        return v

    # --------------------------------------------------------
    # Confidence normalization
    # --------------------------------------------------------
    @field_validator("confidenceScore", mode="before")
    @classmethod
    def normalize_confidence(cls, v):
        """
        Allow LLM to return:
        - 0–1 float
        - percentage string like '82%'
        - integer 0–100
        """
        if isinstance(v, str):
            v = v.strip().replace("%", "")
            try:
                v = float(v)
            except ValueError:
                raise ValueError("Invalid confidenceScore format.")

        if isinstance(v, int):
            if 0 <= v <= 100:
                return v / 100
            return float(v)

        return float(v)