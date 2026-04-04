import hashlib
import os
from typing import List

import numpy as np


class EmbeddingClient:
    def __init__(self) -> None:
        self.provider = os.getenv("EMBEDDING_PROVIDER", "hash")

    def embed_query(self, text: str) -> List[float]:
        if self.provider == "hash":
            return self._hash_embedding(text)
        return self._hash_embedding(text)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self.embed_query(text) for text in texts]

    def _hash_embedding(self, text: str, dims: int = 384) -> List[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        seed = int.from_bytes(digest[:8], "big", signed=False)
        rng = np.random.default_rng(seed)
        vector = rng.normal(0, 1, dims)
        normalized = vector / np.linalg.norm(vector)
        return normalized.tolist()
