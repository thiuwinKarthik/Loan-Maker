import json
import os
from typing import Any

from google import genai
from pydantic import ValidationError

from rag.schema import RagEngineResponse


SYSTEM_PROMPT = """You are a financial advisory assistant.
You cannot approve loans.
You must answer questions based on the user's structured profile (real database records) AND any retrieved documents.
Use the structured profile data (e.g. loan history, credit score) to provide personalized insights.
If context is insufficient to answer the question, explicitly state uncertainty.

You MUST return valid JSON.
You MUST follow this exact schema:

{
  "summary": string,
  "riskFactors": string[],
  "recommendations": string[],
  "confidenceScore": number
}

STRICT RULES:
- riskFactors MUST be an array of strings
- recommendations MUST be an array of strings
- Even if there is only ONE item, it must still be inside an array
- Do NOT return strings instead of arrays
- Do NOT return markdown
- Do NOT add commentary
- Output JSON only
"""


class RagAgent:
    def __init__(self) -> None:
        self.api_key = os.getenv("LLM_API_KEY")
        self.model_name = os.getenv("LLM_MODEL", "gemini-1.5-flash")

        if not self.api_key:
            self.client = None
            return

        self.client = genai.Client(api_key=self.api_key)

    def generate(
        self,
        question: str,
        profile: dict[str, Any],
        retrieved_docs: list[dict[str, Any]],
    ) -> tuple[RagEngineResponse, int, str]:

        # ---------------------------------------------------
        # 1. Handle unconfigured model
        # ---------------------------------------------------
        if self.client is None:
            response = RagEngineResponse(
                summary="Insufficient model configuration to generate advisory response.",
                riskFactors=["LLM provider is not configured in the environment."],
                recommendations=["Configure LLM_API_KEY and retry query."],
                confidenceScore=0.0,
            )
            return response, 0, "unconfigured"

        # ---------------------------------------------------
        # 2. Build retrieval context
        # ---------------------------------------------------
        context_chunks = []
        for idx, doc in enumerate(retrieved_docs, start=1):
            context_chunks.append(
                f"[{idx}] "
                f"score={doc.get('similarity_score', 0):.4f} "
                f"type={doc.get('metadata', {}).get('document_type', 'unknown')} "
                f"text={doc.get('text', '')}"
            )

        full_prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"Role: {profile.get('role')}\n"
            f"Structured profile: {json.dumps(profile)}\n\n"
            f"Retrieved context:\n"
            + "\n".join(context_chunks)
            + "\n\n"
            f"Question: {question}\n\n"
            "Return strict JSON with keys: "
            "summary, riskFactors, recommendations, confidenceScore."
        )

        try:
            # ---------------------------------------------------
            # 3. Call Gemini
            # ---------------------------------------------------
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt,
                config={
                    "temperature": 0.2,
                    "response_mime_type": "application/json",
                },
            )

            # ---------------------------------------------------
            # 4. Extract response text safely
            # ---------------------------------------------------
            raw_text = ""

            if hasattr(response, "text") and response.text:
                raw_text = response.text.strip()
            elif (
                hasattr(response, "candidates")
                and response.candidates
                and response.candidates[0].content.parts
            ):
                raw_text = response.candidates[0].content.parts[0].text.strip()

            if not raw_text:
                raise ValueError("Empty response received from LLM.")

            # ---------------------------------------------------
            # 5. Strip Markdown wrappers if present
            # ---------------------------------------------------
            if raw_text.startswith("```"):
                raw_text = raw_text.replace("```json", "")
                raw_text = raw_text.replace("```", "")
                raw_text = raw_text.strip()

            # ---------------------------------------------------
            # 6. Parse JSON
            # ---------------------------------------------------
            parsed = json.loads(raw_text)

        except Exception as e:
            raise ValueError(f"LLM generation failed: {str(e)}") from e

        # ---------------------------------------------------
        # 7. Defensive normalization (CRITICAL FIX)
        # ---------------------------------------------------
        if isinstance(parsed.get("riskFactors"), str):
            parsed["riskFactors"] = [parsed["riskFactors"]]

        if isinstance(parsed.get("recommendations"), str):
            parsed["recommendations"] = [parsed["recommendations"]]

        # Optional: ensure arrays exist
        parsed.setdefault("riskFactors", [])
        parsed.setdefault("recommendations", [])

        # ---------------------------------------------------
        # 8. Validate against schema
        # ---------------------------------------------------
        try:
            validated = RagEngineResponse.model_validate(parsed)
        except ValidationError as ex:
            raise ValueError(f"Invalid LLM schema output: {ex}") from ex

        # ---------------------------------------------------
        # 9. Extract token usage (if available)
        # ---------------------------------------------------
        tokens_used = 0
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            tokens_used = response.usage_metadata.total_token_count or 0

        return validated, tokens_used, self.model_name