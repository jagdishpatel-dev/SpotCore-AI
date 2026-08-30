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
from app.observability.pipeline_events import log_event
from app.services import census, geocode, overpass
from app.services.access_signals import count_access_signals
from app.services.ai_consultant import get_ai_consultant_insights
from app.services.demand_signals import fetch_soft_demand_signals
from app.services.mock_data import mock_response
from app.services.overpass import classify_poi, poi_category, poi_display_name
from app.services.scoring import (
    RawSignals,
    aggregate_scores,
    build_summary_bullets,
    raw_signals_to_score_inputs,
    score_accessibility,
    score_competition,
    score_cost_fit,
    score_demographic_fit,
    score_demand,
)
from app.services.scoring_config import resolve_profile
from app.services.us_regions import fips_state_to_code, resolve_us_state_code

logger = logging.getLogger(__name__)

LOW_POI_THRESHOLD = 5


def _is_non_commercial_poi(tags: dict) -> bool:
    """Exclude transit, parking, bike, and pure highway nodes from commercial activity count."""
    amenity = (tags.get("amenity") or "").lower()
    highway = (tags.get("highway") or "").lower()
    railway = (tags.get("railway") or "").lower()
    pt = (tags.get("public_transport") or "").lower()
    if railway or pt == "platform" or highway == "bus_stop":
        return True
    if amenity in ("parking", "parking_entrance", "bicycle_parking", "subway_entrance"):
        return True
    if highway in ("primary", "secondary", "tertiary", "traffic_signals", "stop"):
        return True
    return False


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
            err_msg = str(e)
            log_event(
                "analyze_site.mock_fallback",
                error_type=type(e).__name__,
                error=err_msg[:120] + ("…" if len(err_msg) > 120 else ""),
                business_type=business_type,
                radius_m=effective_radius,
            )
            m = mock_response(address, business_type, budget, effective_radius)
            m.summary = [
                "Live analysis failed; showing mock fallback data.",
                err_msg[:120] + ("…" if len(err_msg) > 120 else ""),
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
        if tract is None:
            log_event(
                "analyze_site.census.no_tract",
                lat=round(lat, 4),
                lon=round(lon, 4),
            )
        return tract, None

    (tract_info, demo_raw), pois, demand_signals = await asyncio.gather(
        _get_census(),
        overpass.fetch_nearby_pois(lat, lon, effective_radius),
        fetch_soft_demand_signals(address, business_type, geo, label),
    )

    if tract_info and tract_info.get("geoid") and demo_raw is None:
        log_event("analyze_site.census.no_demographics", geoid=tract_info.get("geoid"))

    if len(pois) < LOW_POI_THRESHOLD:
        log_event(
            "analyze_site.overpass.low_poi_count",
            poi_count=len(pois),
            radius_m=effective_radius,
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
        if (shop or amenity) and not _is_non_commercial_poi(tags):
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
    access = count_access_signals(pois, effective_radius)

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
        parking_within_radius=access.parking_within_radius,
        bicycle_parking_within_radius=access.bicycle_parking_within_radius,
        major_road_nodes_within_radius=access.major_road_nodes_within_radius,
        traffic_signal_nodes_within_radius=access.traffic_signal_nodes_within_radius,
    )

    profile = resolve_profile(business_type)
    d = score_demand(signals, profile)
    c = score_competition(signals, profile)
    a = score_accessibility(signals, profile)
    df = score_demographic_fit(signals, business_type, profile)
    cf = score_cost_fit(signals, profile)

    total, rec = aggregate_scores(d, c, a, df, cf, profile)

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
        parking_nodes_within_radius=access.parking_within_radius,
        bicycle_parking_within_radius=access.bicycle_parking_within_radius,
        major_road_nodes_within_radius=access.major_road_nodes_within_radius,
        summary=_transit_summary(subway_n, bus_n, nearest_sub, access),
    )

    scores = ScoreBreakdown(demand=d, competition=c, accessibility=a, demographic_fit=df, cost_fit=cf)

    try:
        ai_insights = await asyncio.wait_for(
            get_ai_consultant_insights(
                signals,
                business_type,
                total,
                rec,
                address=address,
                scores=scores,
            ),
            timeout=25.0,
        )
    except asyncio.TimeoutError:
        log_event("analyze_site.ai_consultant.timeout", business_type=business_type)
        ai_insights = None
    except Exception as e:
        log_event(
            "analyze_site.ai_consultant.failure",
            failure_kind="unknown",
            error_type=type(e).__name__,
            business_type=business_type,
        )
        ai_insights = None

    bullets = build_summary_bullets(signals, scores.model_dump(), business_type)

    addr = geo.get("address") or {}
    state_abbr = resolve_us_state_code(addr) or fips_state_to_code((tract_info or {}).get("state"))

    loc = LocationInfo(
        label=label,
        lat=lat,
        lon=lon,
        display_name=geo.get("display_name"),
        census_tract=(tract_info or {}).get("basename"),
        county=(tract_info or {}).get("county"),
        state=state_abbr,
    )

    data_sources: dict = {
        "geocoder": geo.get("source") or "nominatim",
        "pois": "overpass",
        "demographics": "census_acs5" if demo_raw else None,
        "radius_m": effective_radius,
        "scoring_profile": profile.key,
    }
    if demand_signals is not None:
        data_sources["trends"] = "google_trends"

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
        data_sources=data_sources,
        demand_signals=demand_signals,
        score_inputs=raw_signals_to_score_inputs(signals),
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


def _transit_summary(
    subway_n: int,
    bus_n: int,
    nearest_sub: float | None,
    access,
) -> str:
    parts: list[str] = []
    if subway_n and nearest_sub:
        parts.append(
            f"{subway_n} subway-linked station node(s) within ~800m; nearest about {int(nearest_sub)}m."
        )
    elif subway_n:
        parts.append(f"{subway_n} subway-linked station node(s) within ~800m.")
    if bus_n:
        parts.append(f"{bus_n} bus/platform stops within ~400m.")
    if access.parking_within_radius:
        parts.append(f"{access.parking_within_radius} mapped parking node(s) in radius.")
    if access.bicycle_parking_within_radius:
        parts.append(f"{access.bicycle_parking_within_radius} bicycle parking node(s) nearby.")
    if access.major_road_nodes_within_radius:
        parts.append(
            f"{access.major_road_nodes_within_radius} major-road OSM node(s) nearby (connectivity proxy)."
        )
    if not parts:
        return (
            "Limited mapped transit/access features in the search radius; "
            "validate on the ground (OSM tagging varies)."
        )
    if not subway_n and not bus_n:
        parts.insert(0, "No subway station nodes in ~800m radius.")
    return " ".join(parts)
