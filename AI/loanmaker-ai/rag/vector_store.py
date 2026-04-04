import os
import uuid
from typing import Any, List, Dict

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    Filter,
    FieldCondition,
    MatchValue,
    PointStruct,
    VectorParams,
)


class VectorStore:
    def __init__(self) -> None:
        url = os.getenv("QDRANT_URL", "http://localhost:6333")
        api_key = os.getenv("QDRANT_API_KEY")

        if api_key:
            self.client = QdrantClient(url=url, api_key=api_key)
        else:
            self.client = QdrantClient(url=url)

        self.collections = [
            "loan_policy_index",
            "provider_terms_index",
            "user_specific_index",
        ]

        self.vector_size = int(os.getenv("EMBEDDING_DIM", "384"))

    # ------------------------------------------------------------------
    # Collection Setup
    # ------------------------------------------------------------------

    def ensure_collections(self) -> None:
        existing = [c.name for c in self.client.get_collections().collections]

        for collection in self.collections:
            if collection not in existing:
                self.client.create_collection(
                    collection_name=collection,
                    vectors_config=VectorParams(
                        size=self.vector_size,
                        distance=Distance.COSINE,
                    ),
                )

    # ------------------------------------------------------------------
    # Query
    # ------------------------------------------------------------------

    def query(
        self,
        collection: str,
        vector: List[float],
        user_id: int,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:

        metadata_filter = Filter(
            should=[
                FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                FieldCondition(key="user_id", match=MatchValue(value=-1))
            ]
        )

        result = self.client.query_points(
            collection_name=collection,
            query=vector,
            query_filter=metadata_filter,
            limit=top_k,
        )

        documents: List[Dict[str, Any]] = []

        # Qdrant 1.17.x returns result.points
        points = getattr(result, "points", result)

        for item in points:

            # Handle tuple-based responses defensively
            if isinstance(item, tuple):
                point = item[0]
            else:
                point = item

            payload = getattr(point, "payload", {}) or {}
            score = getattr(point, "score", 0.0)

            documents.append(
                {
                    "document_id": payload.get("document_id"),
                    "text": payload.get("text", ""),
                    "similarity_score": float(score),
                    "metadata": payload,
                }
            )

        return documents

    # ------------------------------------------------------------------
    # Upsert
    # ------------------------------------------------------------------

    def upsert_documents(
        self,
        collection: str,
        vectors: List[List[float]],
        payloads: List[Dict[str, Any]],
    ) -> None:

        points: List[PointStruct] = []

        for vector, payload in zip(vectors, payloads):

            original_id = str(payload.get("document_id"))

            # Deterministic UUID based on document_id
            point_id = str(
                uuid.uuid5(uuid.NAMESPACE_DNS, original_id)
            )

            points.append(
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload=payload,
                )
            )

        self.client.upsert(
            collection_name=collection,
            points=points,
        )