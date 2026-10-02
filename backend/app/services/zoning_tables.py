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

import json
import logging
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "zoning"

AUSTIN_DISTRICT_COLUMNS = [
    "LA", "RR", "SF-1", "SF-2", "SF-3", "SF-4A", "SF-4B", "SF-5", "SF-6", "MF-1",
    "MF-2", "MF-3", "MF-4", "MF-5", "MF-6", "MH", "NO", "LO", "GO", "CR", "LR",
    "GR", "L", "CBD", "DMU", "W/LO", "CS", "CS-1", "CH", "IP", "MI", "LI",
    "R&D", "DR", "AV", "AG", "PUD", "P",
]

# A use only drives a pre-screen status when every word of its table name appears in
# the query, or the query contains a curated everyday alias for it. Partial word
# overlap ("coffee shop" ~ "Pawn Shop Services") is too weak to state an answer on.
CONFIDENT_MATCH_SCORE = 1.0

_STATUS_BY_VALUE = {"P": "permitted", "C": "conditional", "—": "not_permitted"}

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


def _normalize(text: str) -> str:
    return " ".join("".join(c if c.isalnum() else " " for c in text.lower()).split())


@lru_cache(maxsize=8)
def load_use_aliases(jurisdiction: str = "austin_tx") -> dict[str, str]:
    """Load use_aliases.json into {normalized phrase: table use name}. Unknown use names are skipped."""
    path = DATA_DIR / jurisdiction / "use_aliases.json"
    if not path.exists():
        return {}
    table = load_use_table(jurisdiction)
    aliases: dict[str, str] = {}
    for use, phrases in json.loads(path.read_text(encoding="utf-8"))["uses"].items():
        if use not in table:
            logger.warning("use_aliases.json: %r is not a row in the %s use table; skipped", use, jurisdiction)
            continue
        for phrase in phrases:
            aliases[_normalize(phrase)] = use
    return aliases


def find_alias_match(query: str, jurisdiction: str = "austin_tx") -> str | None:
    """Return the table use for the longest everyday alias found in `query` (whole words, optional plural 's')."""
    padded = f" {_normalize(query)} "
    best: tuple[str, str] | None = None
    for phrase, use in load_use_aliases(jurisdiction).items():
        if f" {phrase} " in padded or f" {phrase}s " in padded:
            if best is None or len(phrase) > len(best[0]):
                best = (phrase, use)
    return best[1] if best else None


def status_for_value(value: str | None) -> str:
    """Map a raw table cell to a pre-screen status. Endnote-qualified cells (11, P5, PC, ...) are unclear."""
    return _STATUS_BY_VALUE.get(value or "", "unclear")


def _tokenize(text: str) -> set[str]:
    words = "".join(c if c.isalnum() else " " for c in text.lower()).split()
    return {w for w in words if w not in _STOPWORDS and len(w) > 2}


def find_matching_uses(
    query: str, jurisdiction: str = "austin_tx", top_n: int = 3, min_score: float = 0.0
) -> list[tuple[float, str]]:
    """
    Return up to top_n (score, use_name) pairs for `query`, highest score first.

    A curated alias hit ("liquor store" -> Liquor Sales) ranks first with score 1.0;
    the rest are scored by the fraction of the use name's words found in the query.
    """
    table = load_use_table(jurisdiction)
    if not table:
        return []
    alias_use = find_alias_match(query, jurisdiction)
    query_words = _tokenize(query)
    if not query_words:
        return [(1.0, alias_use)] if alias_use else []

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
    if alias_use:
        scored = [(1.0, alias_use), *(t for t in scored if t[1] != alias_use)]
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


def pre_screen_status(query: str, district: str | None, jurisdiction: str = "austin_tx") -> dict:
    """
    Decide the pre-screen status for "can use X operate in district Y" from the table alone.

    This, not the LLM, is the source of truth for the status SpotCore reports. It
    returns "unclear" instead of guessing whenever:
      - no_district          the property's zoning district wasn't given
      - unknown_district     the district isn't a column of the use table
      - no_confident_match   no use matched fully (partial word overlap doesn't count)
      - ambiguous_match      several uses matched fully and their statuses differ
      - endnote              the cell carries an endnote whose conditions aren't modeled

    Returns {status, reason, district, matched_use, value, candidates}.
    """
    result = {"status": "unclear", "reason": "", "district": None, "matched_use": None, "value": None, "candidates": []}
    if not district or not district.strip():
        return {**result, "reason": "no_district"}
    code = district.strip().upper()
    result["district"] = code
    if code not in AUSTIN_DISTRICT_COLUMNS:
        return {**result, "reason": "unknown_district"}

    confident = lookup(query, code, jurisdiction, top_n=5, min_score=CONFIDENT_MATCH_SCORE)
    if not confident:
        return {**result, "reason": "no_confident_match"}
    result["candidates"] = [r["use"] for r in confident]
    if len({status_for_value(r["value"]) for r in confident}) > 1:
        return {**result, "reason": "ambiguous_match"}

    top = confident[0]
    status = status_for_value(top["value"])
    return {
        **result,
        "status": status,
        "reason": "table" if status != "unclear" else "endnote",
        "matched_use": top["use"],
        "value": top["value"],
    }
