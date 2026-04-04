from typing import Any

from rag.embeddings import EmbeddingClient
from rag.vector_store import VectorStore


class RagRetriever:
    def __init__(self) -> None:
        self.embedding_client = EmbeddingClient()
        self.vector_store = VectorStore()
        self.vector_store.ensure_collections()

    def retrieve(self, question: str, user_id: int, top_k: int = 5) -> list[dict[str, Any]]:
        query_vector = self.embedding_client.embed_query(question)
        docs = []
        for collection in self.vector_store.collections:
            docs.extend(self.vector_store.query(collection, query_vector, user_id, top_k=top_k))
        docs.sort(key=lambda item: item["similarity_score"], reverse=True)
        return docs[:top_k]
