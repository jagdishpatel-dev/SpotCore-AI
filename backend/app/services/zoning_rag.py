"""
Zoning RAG: embedding + retrieval over the parsed zoning corpus
=================================================================
Pilot scope: single jurisdiction (Austin, TX), Chapter 25-2 (Zoning) only.

Embeddings come from OpenRouter's OpenAI-compatible /embeddings endpoint
(settings.embedding_model, default nvidia/llama-nemotron-embed-vl-1b-v2:free)
— reusing the same client/config as ai_consultant.py's chat calls. Note:
OpenRouter's embeddings endpoint rejects the openai SDK's default base64
encoding_format for at least this provider, so encoding_format="float" is
passed explicitly.

At this corpus size (a few hundred chunks) a vector database is unnecessary
overhead: the index is a flat numpy array plus a JSON metadata sidecar, and
retrieval is brute-force cosine similarity.

Build the index once (or whenever the source corpus changes):

    .venv/bin/python3 -m app.services.zoning_rag --jurisdiction austin_tx

Then call retrieve() at request time.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

import numpy as np
from openai import OpenAI

from app.config import settings
from app.services.zoning_ingest import load_zoning_chunks

logger = logging.getLogger(__name__)

_INDEX_DIR = Path(__file__).resolve().parent.parent / "data" / "zoning" / "_index"
_EMBED_BATCH_SIZE = 32


def _client() -> OpenAI:
    return OpenAI(api_key=settings.openrouter_api_key, base_url=settings.openrouter_base_url)


def _embed(client: OpenAI, texts: list[str]) -> list[list[float]]:
    resp = client.embeddings.create(model=settings.embedding_model, input=texts, encoding_format="float")
    return [d.embedding for d in resp.data]


def _index_paths(jurisdiction: str) -> tuple[Path, Path]:
    return (
        _INDEX_DIR / f"{jurisdiction}.vectors.npy",
        _INDEX_DIR / f"{jurisdiction}.chunks.json",
    )


def build_index(jurisdiction: str = "austin_tx", batch_size: int = _EMBED_BATCH_SIZE) -> int:
    """Embed every chunk for `jurisdiction` and persist the index to disk. Returns chunk count."""
    chunks = load_zoning_chunks(jurisdiction)
    if not chunks:
        raise ValueError(f"No zoning chunks found for jurisdiction={jurisdiction!r}")

    client = _client()
    vectors: list[list[float]] = []
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        vectors.extend(_embed(client, [c.text for c in batch]))
        logger.info(
            "zoning_rag.build_index embedded %d/%d chunks",
            min(i + batch_size, len(chunks)),
            len(chunks),
        )

    _INDEX_DIR.mkdir(parents=True, exist_ok=True)
    vec_path, meta_path = _index_paths(jurisdiction)
    np.save(vec_path, np.array(vectors, dtype=np.float32))
    meta_path.write_text(
        json.dumps([c.to_dict() for c in chunks], ensure_ascii=False),
        encoding="utf-8",
    )
    return len(chunks)


def index_exists(jurisdiction: str) -> bool:
    vec_path, meta_path = _index_paths(jurisdiction)
    return vec_path.exists() and meta_path.exists()


def _load_index(jurisdiction: str) -> tuple[np.ndarray, list[dict]]:
    vec_path, meta_path = _index_paths(jurisdiction)
    if not vec_path.exists() or not meta_path.exists():
        raise FileNotFoundError(
            f"No zoning index for jurisdiction={jurisdiction!r}. Build it first with: "
            f"python -m app.services.zoning_rag --jurisdiction {jurisdiction}"
        )
    vectors = np.load(vec_path)
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    return vectors, meta


def retrieve(query: str, jurisdiction: str = "austin_tx", k: int = 6) -> list[dict]:
    """Return the top-k most relevant zoning chunks for `query`, each carrying a similarity score."""
    vectors, meta = _load_index(jurisdiction)
    q = np.array(_embed(_client(), [query])[0], dtype=np.float32)

    q_norm = q / (np.linalg.norm(q) or 1.0)
    v_norm = vectors / (np.linalg.norm(vectors, axis=1, keepdims=True) + 1e-9)
    sims = v_norm @ q_norm

    top_idx = np.argsort(-sims)[:k]
    results = []
    for idx in top_idx:
        row = dict(meta[int(idx)])
        row["score"] = float(sims[idx])
        results.append(row)
    return results


if __name__ == "__main__":
    import argparse

    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description="Build the zoning RAG index for a jurisdiction.")
    parser.add_argument("--jurisdiction", default="austin_tx")
    args = parser.parse_args()
    n = build_index(args.jurisdiction)
    print(f"Indexed {n} chunks for {args.jurisdiction} -> {_INDEX_DIR}")
