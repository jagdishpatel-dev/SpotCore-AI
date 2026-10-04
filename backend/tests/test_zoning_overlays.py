"""
Overlay / combining-district handling (app/services/zoning_overlays.py) and the
point-in-polygon zoning lookup (zoning_geo.resolve_zoning_at_point, HTTP stubbed).
"""

import asyncio
import json

import pytest

from app.services import zoning_geo
from app.services.zoning_overlays import (
    OVERLAY_RULES,
    _etod_uses,
    parse_zoning_code,
    pre_screen_request,
    pre_screen_zoning,
    residential_uses,
)
from app.services.zoning_tables import load_use_table

# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("code", "base", "overlays"),
    [
        ("CS-MU-CO-ETOD-DBETOD-NP", "CS", ["MU", "CO", "ETOD", "DBETOD", "NP"]),
        ("CS-1-CO-NP", "CS-1", ["CO", "NP"]),  # "CS-1" is a base, not CS + overlay "1"
        ("cbd-cure-ddb400", "CBD", ["CURE", "DDB400"]),
        ("PUD", "PUD", []),
        ("NP", None, ["NP"]),  # overlay-only record
        ("C-2-H", None, ["C", "2", "H"]),  # pre-1980s code
        ("CO,GR", None, ["CO"]),  # malformed record; base-like tokens dropped
        ("GR-MU-CO-MU", "GR", ["MU", "CO"]),  # duplicates collapsed
        ("", None, []),
        (None, None, []),
    ],
)
def test_parse_zoning_code(code, base, overlays):
    assert parse_zoning_code(code) == (base, overlays)


# ---------------------------------------------------------------------------
# Reference data
# ---------------------------------------------------------------------------


def test_etod_tables_name_real_use_rows():
    table = load_use_table("austin_tx")
    prohibited, conditional = _etod_uses("austin_tx")
    assert len(prohibited) == 32 and len(conditional) == 17
    assert [u for u in prohibited | conditional if u not in table] == []
    assert not prohibited & conditional


def test_residential_block_is_the_first_16_rows():
    res = residential_uses("austin_tx")
    assert len(res) == 16
    assert "Multifamily Residential" in res and "Liquor Sales" not in res


def test_every_rule_cites_a_section():
    assert all(citation.startswith("§ 25-2-") for _, citation in OVERLAY_RULES.values())


# ---------------------------------------------------------------------------
# Status with overlays
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("query", "code", "status", "reason"),
    [
        # No overlays: same as the base table
        ("Can I open a gas station?", "CS", "permitted", "table"),
        # ETOD Table D prohibits, and governs over every other overlay (§ 25-2-653(B))
        ("Can I open a gas station?", "CS-ETOD", "not_permitted", "overlay_table"),
        ("Can I open a gas station?", "CS-MU-CO-ETOD-DBETOD-NP", "not_permitted", "overlay_table"),
        ("Can I open a funeral home?", "GR-ETOD-DBETOD", "not_permitted", "overlay_table"),
        # ETOD Table E: permitted -> conditional
        ("Can I open a pawn shop?", "GR-ETOD", "conditional", "overlay_table"),
        ("Can I open a kennel?", "CS-ETOD", "conditional", "overlay_table"),
        # ETOD leaves uses outside Tables D/E alone
        ("Can I open a coffee shop?", "CS-ETOD", "permitted", "table"),
        # CO only restricts: P/C become unclear, "not permitted" stays
        ("Can I open a liquor store?", "CS-1-CO", "unclear", "overlay_not_modeled"),
        ("Can I open a bar?", "CS-1-CO", "unclear", "overlay_not_modeled"),
        ("Can I open a liquor store?", "CS-CO", "not_permitted", "table"),
        # ETOD conditional + CO: CO may restrict further
        ("Can I open a car wash?", "CS-CO-ETOD", "unclear", "overlay_not_modeled"),
        # Modifying overlays: anything becomes unclear
        ("Can I open a hotel?", "CBD-CURE", "unclear", "overlay_not_modeled"),
        ("Can I open a liquor store?", "CS-NCCD", "unclear", "overlay_not_modeled"),
        # Residential-only additions don't touch commercial "not permitted"
        ("Can I open a liquor store?", "GR-MU", "not_permitted", "table"),
        ("Can I build Multifamily Residential?", "CS-MU", "unclear", "overlay_not_modeled"),
        ("Can I open a gym?", "GR-V", "permitted", "table"),
        # NP / H can add uses: only "not permitted" becomes unclear
        ("Can I open a church?", "SF-3-NP", "permitted", "table"),
        ("Can I open a liquor store?", "SF-3-H", "unclear", "overlay_not_modeled"),
        # Unknown suffixes are never trusted
        ("Can I open a gym?", "GR-C0", "unclear", "overlay_not_modeled"),
        ("Can I open a gym?", "CBD-DDB400", "unclear", "overlay_not_modeled"),
        # Base-level unclear reasons survive overlays
        ("Can I open a food truck park?", "CS-CO", "unclear", "no_confident_match"),
        ("Can I open a bar?", "C-2-H", "unclear", "unrecognized_zoning_code"),
        ("Can I open a bar?", None, "unclear", "no_district"),
    ],
)
def test_pre_screen_zoning(query, code, status, reason):
    result = pre_screen_zoning(query, code)
    assert (result["status"], result["reason"]) == (status, reason)


def test_etod_prohibition_cites_governing_sections():
    result = pre_screen_zoning("Can I open a gas station?", "CS-MU-CO-ETOD-DBETOD-NP")
    assert result["citations"] == ["§ 25-2-491", "§ 25-2-653(B)", "§ 25-2-653(D)"]
    assert result["value"] == "P"  # the base cell is still reported for traceability
    assert result["zoning_code"] == "CS-MU-CO-ETOD-DBETOD-NP"


def test_overlay_notes_record_which_overlay_changed_the_answer():
    notes = {n["code"]: n for n in pre_screen_zoning("Can I open a liquor store?", "CS-1-CO-NP")["overlay_notes"]}
    assert notes["CO"]["changed"] is True and notes["CO"]["citation"] == "§ 25-2-332"
    assert notes["NP"]["changed"] is False


# ---------------------------------------------------------------------------
# Which zoning to trust
# ---------------------------------------------------------------------------

_SOUTH_CONGRESS = {
    "zoning_code": "CS-MU-CO-ETOD-DBETOD-NP",
    "base_district": "CS",
    "overlays": ["MU", "CO", "ETOD", "DBETOD", "NP"],
    "case_numbers": ["C20-2023-004", "C14-02-0031"],
    "records": [{"ztype": "CS-MU-CO-ETOD-DBETOD-NP", "case_number": "C20-2023-004"}, {"ztype": "NP", "case_number": "C14-02-0031"}],
    "conflicting_bases": [],
}


def test_parcel_record_wins_over_user_district():
    result = pre_screen_request("Can I open a gas station?", "CS-1", _SOUTH_CONGRESS)
    assert result["district_source"] == "parcel"
    assert result["district"] == "CS"
    assert result["status"] == "not_permitted"
    assert result["case_numbers"] == ["C20-2023-004", "C14-02-0031"]


def test_user_district_used_when_lookup_fails_or_finds_nothing():
    for parcel in (None, {"records": [], "case_numbers": []}):
        result = pre_screen_request("Can I open a liquor store?", "CS-1", parcel)
        assert result["district_source"] == "user"
        assert result["status"] == "permitted"


def test_overlay_only_records_add_overlays_to_user_base():
    parcel = {"zoning_code": None, "overlays": ["CO"], "records": [{"ztype": "CO", "case_number": "C14-1"}], "case_numbers": ["C14-1"], "conflicting_bases": []}
    result = pre_screen_request("Can I open a liquor store?", "CS-1", parcel)
    assert result["zoning_code"] == "CS-1-CO"
    assert result["status"] == "unclear"


def test_conflicting_records_are_unclear():
    parcel = {**_SOUTH_CONGRESS, "zoning_code": None, "base_district": None, "conflicting_bases": ["CS", "GR"]}
    result = pre_screen_request("Can I open a coffee shop?", "CS", parcel)
    assert (result["status"], result["reason"]) == ("unclear", "conflicting_zoning_records")
    assert result["candidates"] == ["CS", "GR"]


def test_no_zoning_at_all():
    result = pre_screen_request("Can I open a coffee shop?", None, None)
    assert (result["status"], result["district_source"]) == ("unclear", "none")


# ---------------------------------------------------------------------------
# Point-in-polygon lookup (HTTP stubbed)
# ---------------------------------------------------------------------------


class _FakeResponse:
    def __init__(self, rows):
        self._rows = rows

    def raise_for_status(self):
        pass

    def json(self):
        return self._rows


def _stub_socrata(monkeypatch, rows=None, error=None):
    calls = []

    class FakeClient:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def get(self, url, params=None):
            calls.append(params)
            if error:
                raise error
            return _FakeResponse(rows)

    monkeypatch.setattr(zoning_geo.httpx, "AsyncClient", FakeClient)
    return calls


def test_resolve_combines_records_conservatively(monkeypatch):
    calls = _stub_socrata(monkeypatch, [
        {"zoning_ordinance_ztype": "CS-MU-CO-ETOD-DBETOD-NP", "case_number": "C20-2023-004"},
        {"zoning_ordinance_ztype": "NP", "case_number": "C14-02-0031"},
        {},  # records without a zoning code are skipped
    ])
    result = asyncio.run(zoning_geo.resolve_zoning_at_point(30.25, -97.7505))
    assert "POINT (-97.7505 30.25)" in calls[0]["$where"]
    assert result["zoning_code"] == "CS-MU-CO-ETOD-DBETOD-NP"
    assert result["case_numbers"] == ["C20-2023-004", "C14-02-0031"]
    assert result["conflicting_bases"] == []
    assert result["source"] and result["retrieved_at"]


def test_resolve_flags_conflicting_bases(monkeypatch):
    _stub_socrata(monkeypatch, [{"zoning_ordinance_ztype": "CS-CO"}, {"zoning_ordinance_ztype": "GR"}])
    result = asyncio.run(zoning_geo.resolve_zoning_at_point(30.0, -97.0))
    assert result["zoning_code"] is None
    assert result["conflicting_bases"] == ["CS", "GR"]
    assert result["overlays"] == ["CO"]


def test_resolve_returns_none_on_http_error(monkeypatch):
    _stub_socrata(monkeypatch, error=RuntimeError("socrata down"))
    assert asyncio.run(zoning_geo.resolve_zoning_at_point(30.0, -97.0)) is None


def test_map_colors_use_overlay_aware_status(monkeypatch):
    geom = {"type": "Point", "coordinates": [0, 0]}
    rows = {"features": [
        {"geometry": geom, "properties": {"zoning_ordinance_ztype": "CS-ETOD"}},
        {"geometry": geom, "properties": {"zoning_ordinance_ztype": "CS"}},
        {"geometry": geom, "properties": {"zoning_ordinance_ztype": "CS-1-CO"}},
    ]}
    _stub_socrata(monkeypatch, rows)
    features = asyncio.run(zoning_geo.fetch_zoning_polygons(30.0, -97.0, business_query="gas station"))
    assert [f["permission"] for f in features] == ["prohibited", "permitted", "unknown"]


def test_map_no_longer_colors_weak_partial_matches(monkeypatch):
    # "food truck park" used to color polygons via a 0.5 word overlap with "Food Preparation".
    geom = {"type": "Point", "coordinates": [0, 0]}
    _stub_socrata(monkeypatch, {"features": [{"geometry": geom, "properties": {"zoning_ordinance_ztype": "CS"}}]})
    features = asyncio.run(zoning_geo.fetch_zoning_polygons(30.0, -97.0, business_query="food truck park"))
    assert features[0]["permission"] == "unknown"
