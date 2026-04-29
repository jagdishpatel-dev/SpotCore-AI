from __future__ import annotations

import asyncio
import logging

from app.config import settings
from app.models.schemas import (
    AnalyzeSiteResponse,
    BusinessMarker,
    DemographicsBlock,
    LocationInfo,
    ScoreBreakdown,
    TransitBlock,
)
from app.services import census, geocode, overpass
from app.services.ai_consultant import get_ai_consultant_insights
from app.services.mock_data import mock_response
from app.services.overpass import classify_poi, poi_category, poi_display_name
from app.services.scoring import (
    RawSignals,
    aggregate_scores,
    build_summary_bullets,
    score_accessibility,
    score_competition,
    score_cost_fit,
    score_demographic_fit,
    score_demand,
)

logger = logging.getLogger(__name__)


def _count_transit(pois: list[dict], lat: float, lon: float) -> tuple[int, int, float | None]:
    subway = 0
    bus = 0
    nearest_sub: float | None = None
    for p in pois:
        tags = p["tags"]
        amenity = (tags.get("amenity") or "").lower()
        railway = (tags.get("railway") or "").lower()
        highway = (tags.get("highway") or "").lower()
        pt = (tags.get("public_transport") or "").lower()
        d = p["distance_m"]
        is_subway = (
            railway == "station"
            or railway == "subway_entrance"
            or amenity == "subway_entrance"
            or tags.get("station") == "subway"
        )
        if is_subway and d <= 800:
            subway += 1
            nearest_sub = d if nearest_sub is None else min(nearest_sub, d)
        if highway == "bus_stop" and d <= 400:
            bus += 1
        elif pt == "platform" and d <= 400 and not is_subway:
            bus += 1
    return subway, bus, nearest_sub


async def analyze_site(
    address: str,
    business_type: str,
    budget: float | None,
    radius_m: int | None = None,
) -> AnalyzeSiteResponse:
    effective_radius = radius_m if radius_m is not None else settings.overpass_radius_m
    try:
        return await _analyze_site_live(address, business_type, budget, effective_radius)
    except Exception as e:
        logger.exception("analyze_site failed: %s", e)
        if settings.use_mock_on_failure:
            m = mock_response(address, business_type, budget, effective_radius)
            m.summary = [
                "Live analysis failed; showing mock fallback data.",
                str(e)[:120] + ("…" if len(str(e)) > 120 else ""),
                *m.summary[2:],
            ][:5]
            return m
        raise


async def _analyze_site_live(
    address: str,
    business_type: str,
    budget: float | None,
    effective_radius: int,
) -> AnalyzeSiteResponse:
    geo = await geocode.geocode_address(address)
    if not geo:
        raise ValueError("Could not geocode address")

    lat, lon = geo["lat"], geo["lon"]
    label = geocode.extract_location_label(geo.get("display_name"), geo.get("address") or {})

    async def _get_census():
        tract = await census.coordinates_to_tract(lat, lon)
        if tract and tract.get("geoid"):
            demo = await census.fetch_acs_tract_demographics(tract["geoid"])
            return tract, demo
        return tract, None

    (tract_info, demo_raw), pois = await asyncio.gather(
        _get_census(),
        overpass.fetch_nearby_pois(lat, lon, effective_radius),
    )

    competitors: list[BusinessMarker] = []
    complementary: list[BusinessMarker] = []
    commercial = 0

    for p in pois:
        tags = p["tags"]
        role = classify_poi(tags, business_type)
        if role == "transit":
            continue
        shop = tags.get("shop")
        amenity = tags.get("amenity")
        if shop or amenity:
            commercial += 1
        if role == "competitor":
            competitors.append(
                BusinessMarker(
                    name=poi_display_name(tags),
                    category=poi_category(tags),
                    lat=p["lat"],
                    lon=p["lon"],
                    distance_m=round(p["distance_m"], 1),
                    osm_type=p.get("type"),
                    osm_id=p.get("id"),
                )
            )
        elif role == "complementary":
            complementary.append(
                BusinessMarker(
                    name=poi_display_name(tags),
                    category=poi_category(tags),
                    lat=p["lat"],
                    lon=p["lon"],
                    distance_m=round(p["distance_m"], 1),
                    osm_type=p.get("type"),
                    osm_id=p.get("id"),
                )
            )

    competitors.sort(key=lambda x: x.distance_m)
    complementary.sort(key=lambda x: x.distance_m)
    competitors = competitors[:25]
    complementary = complementary[:25]

    subway_n, bus_n, nearest_sub = _count_transit(pois, lat, lon)

    pop = demo_raw.get("population") if demo_raw else None
    income = demo_raw.get("median_household_income") if demo_raw else None
    age = demo_raw.get("median_age") if demo_raw else None
    edu = demo_raw.get("pct_bachelors_or_higher") if demo_raw else None
    vac = demo_raw.get("vacancy_rate_pct") if demo_raw else None

    signals = RawSignals(
        population=pop,
        median_income=income,
        competitor_count=len(competitors),
        complementary_count=len(complementary),
        commercial_poi_count=commercial,
        subway_within_800m=subway_n,
        bus_within_400m=bus_n,
        nearest_subway_m=nearest_sub,
        vacancy_pct=vac,
        pct_college_educated=edu,
        median_age=age,
        monthly_budget=budget,
    )

    d = score_demand(signals)
    c = score_competition(signals)
    a = score_accessibility(signals)
    df = score_demographic_fit(signals, business_type)
    cf = score_cost_fit(signals)

    total, rec = aggregate_scores(d, c, a, df, cf)

    demo_block = DemographicsBlock(
        tract_id=demo_raw.get("tract_id") if demo_raw else (tract_info or {}).get("geoid"),
        population=pop,
        median_household_income=income,
        median_age=age,
        pct_bachelors_or_higher=edu,
        commute_pct_public_transit=demo_raw.get("commute_pct_public_transit") if demo_raw else None,
        vacancy_rate_pct=vac,
        summary=_demo_summary(demo_raw, pop, income),
    )

    transit_block = TransitBlock(
        subway_stops_within_800m=subway_n,
        bus_or_light_rail_stops_within_400m=bus_n,
        nearest_subway_distance_m=round(nearest_sub, 1) if nearest_sub is not None else None,
        summary=_transit_summary(subway_n, bus_n, nearest_sub),
    )

    scores = ScoreBreakdown(demand=d, competition=c, accessibility=a, demographic_fit=df, cost_fit=cf)

    try:
        ai_insights = await asyncio.wait_for(
            get_ai_consultant_insights(signals, business_type, total, rec),
            timeout=25.0,
        )
    except Exception as e:
        logger.warning("AI Consultant failed or timed out: %s. Returning score without insights.", e)
        ai_insights = None

    bullets = build_summary_bullets(signals, scores.model_dump(), business_type)

    loc = LocationInfo(
        label=label,
        lat=lat,
        lon=lon,
        display_name=geo.get("display_name"),
        census_tract=(tract_info or {}).get("basename"),
        county=(tract_info or {}).get("county"),
        state=(tract_info or {}).get("state"),
    )

    return AnalyzeSiteResponse(
        location=loc,
        total_score=total,
        recommendation=rec,
        scores=scores,
        ai_insights=ai_insights,
        competitors=competitors,
        complementary_businesses=complementary,
        demographics=demo_block,
        transit=transit_block,
        summary=bullets,
        data_sources={
            "geocoder": geo.get("source") or "nominatim",
            "pois": "overpass",
            "demographics": "census_acs5" if demo_raw else None,
            "radius_m": effective_radius,
        },
    )


def _demo_summary(demo_raw: dict | None, pop: int | None, income: int | None) -> str:
    if not demo_raw:
        return "Census tract variables were unavailable; demographic fit uses weaker signals."
    parts = []
    if pop:
        parts.append(f"Tract population ~{pop:,}.")
    if income:
        parts.append(f"Median household income ~${income:,}.")
    if demo_raw.get("commute_pct_public_transit") is not None:
        parts.append(f"About {demo_raw['commute_pct_public_transit']}% of commuters report public transit.")
    return " ".join(parts) or "Tract-level ACS summary loaded."


def _transit_summary(subway_n: int, bus_n: int, nearest_sub: float | None) -> str:
    if subway_n and nearest_sub:
        return f"{subway_n} subway-linked station node(s) within ~800m; nearest about {int(nearest_sub)}m. {bus_n} bus/platform stops within ~400m."
    if subway_n:
        return f"{subway_n} subway-linked station node(s) within ~800m; {bus_n} bus/platform stops within ~400m."
    if bus_n:
        return f"No subway station nodes in ~800m radius; {bus_n} bus/platform stops within ~400m—verify actual entrances."
    return "Limited mapped transit stops in the search radius; validate on the ground (entrances can be tagged inconsistently)."
