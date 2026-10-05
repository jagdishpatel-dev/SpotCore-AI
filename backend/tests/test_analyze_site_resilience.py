"""analyze_site must still return a report when the Overpass POI lookup fails."""

import asyncio

import httpx

from app.services import analyze_site as svc


def test_overpass_outage_degrades_instead_of_failing(monkeypatch):
    async def fake_geocode(*_args, **_kwargs):
        return {"lat": 30.2645, "lon": -97.743, "display_name": "Downtown Austin, TX", "address": {"state": "Texas"}}

    async def failing_pois(*_args, **_kwargs):
        raise httpx.ConnectTimeout("all mirrors down")

    async def no_tract(*_args, **_kwargs):
        return None

    async def no_signals(*_args, **_kwargs):
        return None

    async def no_ai(*_args, **_kwargs):
        return None

    monkeypatch.setattr(svc.geocode, "geocode_address", fake_geocode)
    monkeypatch.setattr(svc.overpass, "fetch_nearby_pois", failing_pois)
    monkeypatch.setattr(svc.census, "coordinates_to_tract", no_tract)
    monkeypatch.setattr(svc, "fetch_soft_demand_signals", no_signals)
    monkeypatch.setattr(svc, "get_ai_consultant_insights", no_ai)

    result = asyncio.run(
        svc._analyze_site_live("Downtown Austin, TX", "Coffee shop", None, 500)
    )

    assert result.data_sources["pois"] == "unavailable"
    assert result.competitors == []
    assert "unavailable" in result.summary[0]
