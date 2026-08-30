"""Deterministic mock payload when upstream APIs fail or for demos."""

from app.models.schemas import (
    AnalyzeSiteResponse,
    BusinessMarker,
    DemographicsBlock,
    LocationInfo,
    ScoreBreakdown,
    ScoreInputs,
    SoftDemandSignals,
    TransitBlock,
)
from app.services.trends_pytrends import DISCLAIMER


def mock_response(address: str, business_type: str, budget: float | None, radius_m: int) -> AnalyzeSiteResponse:
    loc = LocationInfo(
        label="Queens Village, NY (demo)",
        lat=40.728,
        lon=-73.745,
        display_name=f"{address} (mock)",
        census_tract="36081050100",
        county="Queens",
        state="NY",
    )
    competitors = [
        BusinessMarker(
            name="Demo Cafe",
            category="cafe",
            lat=40.7284,
            lon=-73.7442,
            distance_m=120,
            osm_type="node",
            osm_id=1,
        ),
        BusinessMarker(
            name="Chain Coffee",
            category="cafe",
            lat=40.7275,
            lon=-73.7460,
            distance_m=210,
            osm_type="node",
            osm_id=2,
        ),
    ]
    complementary = [
        BusinessMarker(
            name="Neighborhood Bakery",
            category="bakery",
            lat=40.7290,
            lon=-73.7448,
            distance_m=180,
            osm_type="node",
            osm_id=3,
        ),
    ]
    scores = ScoreBreakdown(
        demand=80,
        competition=65,
        accessibility=78,
        demographic_fit=74,
        cost_fit=68 if budget is not None else None,
    )
    total = 76 if budget is None else 73
    return AnalyzeSiteResponse(
        location=loc,
        total_score=total,
        recommendation="strong" if total >= 72 else "medium",
        scores=scores,
        competitors=competitors,
        complementary_businesses=complementary,
        demographics=DemographicsBlock(
            tract_id="36081050100",
            population=4200,
            median_household_income=78000,
            median_age=38.2,
            pct_bachelors_or_higher=32.5,
            commute_pct_public_transit=48.0,
            vacancy_rate_pct=6.2,
            summary="Mock tract profile: mid-high income, transit-heavy commuting, moderate vacancy.",
        ),
        transit=TransitBlock(
            subway_stops_within_800m=1,
            bus_or_light_rail_stops_within_400m=4,
            nearest_subway_distance_m=520,
            parking_nodes_within_radius=3,
            bicycle_parking_within_radius=2,
            major_road_nodes_within_radius=8,
            summary="Mock: one subway node within ~800m, bus stops, parking and major-road proxies nearby.",
        ),
        summary=[
            "This is mock data because a live data source timed out or failed.",
            "Use it to validate UI flows; rerun with working network keys for real results.",
            "Nearby mapped competition looks moderate in this synthetic example.",
            "Transit access is directionally favorable in the mock profile.",
        ],
        data_sources={"mode": "mock", "radius_m": radius_m, "scoring_profile": "default"},
        demand_signals=SoftDemandSignals(
            search_interest_index=72.0,
            search_interest_geo_used="US-NY",
            search_interest_resolution="DMA",
            search_interest_keywords=["coffee shop", "cafe"],
            search_interest_timeframe="today 3-m",
            search_interest_disclaimer=DISCLAIMER,
        ),
        score_inputs=ScoreInputs(
            population=4200,
            median_income=78000,
            median_age=38.2,
            pct_college_educated=32.5,
            vacancy_pct=6.2,
            competitor_count=2,
            complementary_count=1,
            commercial_poi_count=12,
            subway_within_800m=1,
            bus_within_400m=4,
            nearest_subway_m=520.0,
            parking_within_radius=3,
            bicycle_parking_within_radius=2,
            major_road_nodes_within_radius=8,
            traffic_signal_nodes_within_radius=4,
            monthly_budget=budget,
        ),
    )
