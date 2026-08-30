"""
Structured extraction of the Austin, TX permitted/conditional/prohibited-use
table (§ 25-2-491).

Small/free LLMs are unreliable at manually counting a use's value across a
38-column table from raw retrieved text — verified against this exact
scenario: asked "can I open a restaurant in CS-1?", the model said "not
permitted" while the actual table value at (Restaurant (General), CS-1) is
"P" (permitted). For the single most decision-critical fact in this corpus —
is use X permitted in district Y — we parse the table once into a structured
lookup so get_zoning_answer() can report the exact value deterministically
instead of asking the model to count columns.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "zoning"

AUSTIN_DISTRICT_COLUMNS = [
    "LA", "RR", "SF-1", "SF-2", "SF-3", "SF-4A", "SF-4B", "SF-5", "SF-6", "MF-1",
    "MF-2", "MF-3", "MF-4", "MF-5", "MF-6", "MH", "NO", "LO", "GO", "CR", "LR",
    "GR", "L", "CBD", "DMU", "W/LO", "CS", "CS-1", "CH", "IP", "MI", "LI",
    "R&D", "DR", "AV", "AG", "PUD", "P",
]

_STOPWORDS = {"a", "an", "the", "on", "in", "at", "for", "of", "to", "here", "land", "site", "property", "lot"}


@lru_cache(maxsize=8)
def load_use_table(jurisdiction: str = "austin_tx") -> dict[str, dict[str, str]]:
    """Parse § 25-2-491's ZONING USE SUMMARY TABLE into {use_name: {district: value}}."""
    path = DATA_DIR / jurisdiction / "ch25-2_subchapter_c_art2.txt"
    if not path.exists():
        return {}

    n_cols = len(AUSTIN_DISTRICT_COLUMNS)
    table: dict[str, dict[str, str]] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if "\t" not in line:
            continue
        parts = line.split("\t")
        if len(parts) != n_cols + 1:
            continue  # not a data row of this exact table (narrative text, footnotes, etc.)
        name = parts[0].strip()
        if not name:
            continue
        table[name] = dict(zip(AUSTIN_DISTRICT_COLUMNS, (v.strip() for v in parts[1:])))
    return table


def _tokenize(text: str) -> set[str]:
    words = "".join(c if c.isalnum() else " " for c in text.lower()).split()
    return {w for w in words if w not in _STOPWORDS and len(w) > 2}


def find_matching_uses(
    query: str, jurisdiction: str = "austin_tx", top_n: int = 3, min_score: float = 0.0
) -> list[tuple[float, str]]:
    """Return up to top_n (score, use_name) pairs whose words best overlap `query`, highest score first."""
    table = load_use_table(jurisdiction)
    if not table:
        return []
    query_words = _tokenize(query)
    if not query_words:
        return []

    scored: list[tuple[float, str]] = []
    for name in table:
        name_words = _tokenize(name)
        if not name_words:
            continue
        overlap = len(query_words & name_words)
        if overlap == 0:
            continue
        # Favor near-complete matches of the (usually short) use name over partial ones.
        score = overlap / len(name_words)
        if score >= min_score:
            scored.append((score, name))

    scored.sort(key=lambda t: (-t[0], t[1]))
    return scored[:top_n]


def lookup(
    query: str, district: str, jurisdiction: str = "austin_tx", top_n: int = 3, min_score: float = 0.0
) -> list[dict]:
    """
    Find uses matching `query` and report their exact table value for `district`.

    `min_score` filters out weak fuzzy matches — raise it for callers where a wrong
    match is costly to show confidently (e.g. coloring a map by permission status),
    vs. the default 0.0 used for text Q&A, where the LLM can hedge on a-weak match.

    Returns a list of {use, district, value, meaning, score} dicts, most relevant first.
    Empty list if the district isn't a known column or nothing matched above min_score.
    """
    district = district.strip().upper()
    if district not in AUSTIN_DISTRICT_COLUMNS:
        return []
    table = load_use_table(jurisdiction)
    meanings = {"P": "Permitted", "C": "Conditional Use (needs a conditional use permit)", "—": "Not permitted"}
    results = []
    for score, name in find_matching_uses(query, jurisdiction, top_n=top_n, min_score=min_score):
        value = table.get(name, {}).get(district, "")
        results.append(
            {
                "use": name,
                "district": district,
                "value": value,
                "meaning": meanings.get(value, f"See endnote {value}" if value else "unknown"),
                "score": score,
            }
        )
    return results
