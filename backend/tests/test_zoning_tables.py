"""
Unit tests for the deterministic § 25-2-491 use-table lookup (app/services/zoning_tables.py).

This is the source of truth for "is use X permitted in district Y", so a parsing
regression here would silently flip zoning answers. The expected cell values come
from evals/zoning_golden.json, which were hand-checked against the raw source text
(each case carries its source_line) rather than copied from the parser's output.
"""

import pytest

from app.services import zoning_tables
from app.services.zoning_tables import (
    AUSTIN_DISTRICT_COLUMNS,
    find_alias_match,
    find_matching_uses,
    load_use_aliases,
    load_use_table,
    lookup,
    pre_screen_status,
    status_for_value,
)

from .conftest import load_golden_cases

_CELL_CASES = [c for c in load_golden_cases() if c["expected_value"] is not None]
_EXACT_CASES = [c for c in load_golden_cases() if c["category"] == "exact"]


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def test_table_parses_every_use_row():
    table = load_use_table("austin_tx")
    assert len(table) == 147


def test_every_row_has_all_38_district_columns():
    for use, row in load_use_table("austin_tx").items():
        assert list(row) == AUSTIN_DISTRICT_COLUMNS, use


def test_unknown_jurisdiction_returns_empty_table():
    assert load_use_table("nowhere_zz") == {}


@pytest.mark.parametrize("case", _CELL_CASES, ids=lambda c: c["id"])
def test_cell_matches_hand_verified_source(case):
    table = load_use_table("austin_tx")
    use = case["acceptable_uses"][0]
    assert table[use][case["district"]] == case["expected_value"]


# ---------------------------------------------------------------------------
# Matching + lookup
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("case", _EXACT_CASES, ids=lambda c: c["id"])
def test_exact_use_name_is_top_match(case):
    results = lookup(case["question"], case["district"], top_n=1)
    assert results, "expected a match"
    assert results[0]["use"] in case["acceptable_uses"]
    assert results[0]["value"] == case["expected_value"]


def test_lookup_unknown_district_returns_nothing():
    assert lookup("Restaurant (General)", "XZ-9") == []


def test_lookup_normalizes_district_case_and_whitespace():
    results = lookup("Restaurant (General)", "  cs-1 ", top_n=1)
    assert results[0]["district"] == "CS-1"
    assert results[0]["value"] == "P"


@pytest.mark.parametrize(
    ("query", "district", "meaning"),
    [
        ("Restaurant (General)", "CS-1", "Permitted"),
        ("Cocktail Lounge", "CS-1", "Conditional Use (needs a conditional use permit)"),
        ("Cocktail Lounge", "CS", "Not permitted"),
        ("Restaurant (General)", "LR", "See endnote 11"),
    ],
)
def test_lookup_meaning_labels(query, district, meaning):
    assert lookup(query, district, top_n=1)[0]["meaning"] == meaning


def test_stopword_only_query_matches_nothing():
    assert find_matching_uses("can I do it on the lot here") == []


def test_min_score_filters_weak_partial_matches():
    # "shop" alone only partially overlaps "Pawn Shop Services" (1 of 3 words).
    assert find_matching_uses("tattoo shop", top_n=5)
    assert find_matching_uses("tattoo shop", top_n=5, min_score=0.5) == []


def test_results_sorted_best_first():
    scores = [s for s, _ in find_matching_uses("Restaurant (General)", top_n=3)]
    assert scores == sorted(scores, reverse=True)


def test_table_is_cached_between_calls():
    zoning_tables.load_use_table.cache_clear()
    load_use_table("austin_tx")
    load_use_table("austin_tx")
    assert zoning_tables.load_use_table.cache_info().hits >= 1


# ---------------------------------------------------------------------------
# Everyday-name aliases
# ---------------------------------------------------------------------------

def test_every_alias_targets_a_real_table_row():
    import json

    path = zoning_tables.DATA_DIR / "austin_tx" / "use_aliases.json"
    table = load_use_table("austin_tx")
    for use in json.loads(path.read_text(encoding="utf-8"))["uses"]:
        assert use in table, use


def test_no_alias_phrase_maps_to_two_uses():
    import json
    from collections import Counter

    path = zoning_tables.DATA_DIR / "austin_tx" / "use_aliases.json"
    phrases = [
        zoning_tables._normalize(p)
        for ps in json.loads(path.read_text(encoding="utf-8"))["uses"].values()
        for p in ps
    ]
    assert [p for p, n in Counter(phrases).items() if n > 1] == []


@pytest.mark.parametrize(
    ("query", "use"),
    [
        ("Can I open a bar here?", "Cocktail Lounge"),
        ("Can I open a juice bar?", "Restaurant (Limited)"),  # longest phrase wins over "bar"
        ("Are gas stations allowed?", "Service Station"),  # plural
        ("Can I open a Liquor Store?", "Liquor Sales"),  # case-insensitive
        ("Can I open a self-storage site?", "Convenience Storage"),  # punctuation
    ],
)
def test_alias_match(query, use):
    assert find_alias_match(query) == use


@pytest.mark.parametrize("query", ["Can I open a barber college?", "barbecue stand", "Can I open a restaurant?"])
def test_alias_requires_whole_words_and_skips_ambiguous_terms(query):
    # "barber college" is two aliases; the longer wins, so it must not be Cocktail Lounge via "bar".
    assert find_alias_match(query) != "Cocktail Lounge"
    if "restaurant" in query:
        assert find_alias_match(query) is None


def test_alias_ranks_first_in_matches():
    assert find_matching_uses("coffee shop", top_n=1) == [(1.0, "Restaurant (Limited)")]


def test_aliases_are_cached():
    load_use_aliases.cache_clear()
    load_use_aliases("austin_tx")
    load_use_aliases("austin_tx")
    assert load_use_aliases.cache_info().hits >= 1


# ---------------------------------------------------------------------------
# Pre-screen status (the source of truth for the reported status)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    ("value", "status"),
    [("P", "permitted"), ("C", "conditional"), ("—", "not_permitted"), ("11", "unclear"), ("PC", "unclear"), ("P5", "unclear"), ("", "unclear"), (None, "unclear")],
)
def test_status_for_value(value, status):
    assert status_for_value(value) == status


@pytest.mark.parametrize(
    ("query", "district", "status", "reason"),
    [
        ("Can I open a Restaurant (General) in CS-1?", "CS-1", "permitted", "table"),
        ("I want to open a bar in CS-1", "cs-1", "conditional", "table"),
        ("Can I open a liquor store?", "CS", "not_permitted", "table"),
        ("Can I open a Restaurant (General)?", None, "unclear", "no_district"),
        ("Can I open a Restaurant (General)?", "  ", "unclear", "no_district"),
        ("Can I open a Restaurant (General)?", "XZ-9", "unclear", "unknown_district"),
        ("Can I open a coffee roastery?", "GR", "unclear", "no_confident_match"),
        ("Can I open a food truck park?", "GR", "unclear", "no_confident_match"),  # partial "food" match is not enough
        ("Can I open a Restaurant (General) with a bar?", "CS-1", "unclear", "ambiguous_match"),  # P vs C
        ("Can I run Bail Bond Services?", "GR", "unclear", "endnote"),
    ],
)
def test_pre_screen_status(query, district, status, reason):
    result = pre_screen_status(query, district)
    assert (result["status"], result["reason"]) == (status, reason)


def test_pre_screen_reports_matched_use_and_cell():
    result = pre_screen_status("Can I open a bar?", "CBD")
    assert result["matched_use"] == "Cocktail Lounge"
    assert result["value"] == "P"
    assert result["district"] == "CBD"


def test_ambiguous_match_lists_candidates_without_picking_one():
    result = pre_screen_status("Can I open a Restaurant (General) with a bar?", "CS-1")
    assert result["matched_use"] is None
    assert set(result["candidates"]) == {"Cocktail Lounge", "Restaurant (General)"}
