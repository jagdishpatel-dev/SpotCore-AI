from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


class AnalyzeSiteRequest(BaseModel):
    address: str = Field(..., min_length=3, max_length=500)
    business_type: str = Field(..., min_length=2, max_length=120)
    budget: float | None = Field(default=None, ge=0, description="Optional monthly budget in USD")
    radius_m: int | None = Field(
        default=None,
        ge=100,
        le=2000,
        description="Overpass search radius in meters (OSM businesses/transit); omit to use server default",
    )


class CompareSitesRequest(BaseModel):
    address_a: str = Field(..., min_length=3, max_length=500)
    address_b: str = Field(..., min_length=3, max_length=500)
    business_type: str = Field(..., min_length=2, max_length=120)
    budget: float | None = Field(default=None, ge=0)
    radius_m: int | None = Field(default=None, ge=100, le=2000)


class LatLon(BaseModel):
    lat: float
    lon: float


class LocationInfo(BaseModel):
    label: str
    lat: float
    lon: float
    display_name: str | None = None
    census_tract: str | None = None
    county: str | None = None
    state: str | None = None


class BusinessMarker(BaseModel):
    name: str
    category: str
    lat: float
    lon: float
    distance_m: float
    osm_type: str | None = None
    osm_id: int | None = None


class DemographicsBlock(BaseModel):
    tract_id: str | None = None
    population: int | None = None
    median_household_income: int | None = None
    median_age: float | None = None
    pct_bachelors_or_higher: float | None = None
    commute_pct_public_transit: float | None = None
    vacancy_rate_pct: float | None = None
    summary: str


class TransitBlock(BaseModel):
    subway_stops_within_800m: int
    bus_or_light_rail_stops_within_400m: int
    nearest_subway_distance_m: float | None = None
    parking_nodes_within_radius: int | None = None
    bicycle_parking_within_radius: int | None = None
    major_road_nodes_within_radius: int | None = None
    summary: str


class SoftDemandSignals(BaseModel):
    """Behavioral / relative demand proxies — not census population or foot traffic."""

    search_interest_index: float | None = Field(
        default=None,
        description="Region-level Google Trends relative score (0–100), not address-level search volume.",
    )
    search_interest_geo_used: str | None = None
    search_interest_resolution: str | None = None
    search_interest_keywords: list[str] | None = None
    search_interest_timeframe: str | None = None
    search_interest_disclaimer: str | None = None


class ScoreInputs(BaseModel):
    """Raw values fed into scoring — evidence behind the 0–100 subscores."""

    population: int | None = None
    median_income: int | None = None
    median_age: float | None = None
    pct_college_educated: float | None = None
    vacancy_pct: float | None = None
    competitor_count: int | None = None
    complementary_count: int | None = None
    commercial_poi_count: int | None = None
    subway_within_800m: int | None = None
    bus_within_400m: int | None = None
    nearest_subway_m: float | None = None
    parking_within_radius: int | None = None
    bicycle_parking_within_radius: int | None = None
    major_road_nodes_within_radius: int | None = None
    traffic_signal_nodes_within_radius: int | None = None
    monthly_budget: float | None = None


class ScoreBreakdown(BaseModel):
    demand: int
    competition: int
    accessibility: int
    demographic_fit: int
    cost_fit: int | None = None


class AIInsight(BaseModel):
    strategic_overview: str
    the_edge: str
    the_blindspot: str
    the_power_move: str


class AIInsights(BaseModel):
    insights: AIInsight
    confidence_score: float


class AnalyzeSiteResponse(BaseModel):
    location: LocationInfo
    total_score: int
    recommendation: str
    scores: ScoreBreakdown
    ai_insights: AIInsights | None = None
    competitors: list[BusinessMarker]
    complementary_businesses: list[BusinessMarker]
    demographics: DemographicsBlock
    transit: TransitBlock
    summary: list[str]
    data_sources: dict[str, Any] = Field(default_factory=dict)
    demand_signals: SoftDemandSignals | None = None
    score_inputs: ScoreInputs | None = None


class CompareSitesResponse(BaseModel):
    site_a: AnalyzeSiteResponse
    site_b: AnalyzeSiteResponse
    comparison_winner: str = Field(..., description="The address of the winning site")
    winner_reason: str = Field(..., description="AI-generated explanation of why site A or B is better")


class AddressSuggestion(BaseModel):
    label: str
    lat: float
    lon: float
    osm_id: int | None = None
    osm_type: str | None = None


class AddressSuggestResponse(BaseModel):
    suggestions: list[AddressSuggestion]
    source: str = "photon"


TrendsTimeframe = Literal["today 3-m", "today 12-m", "today 5-y", "now 7-d"]


class TrendsKeywordsRequest(BaseModel):
    address: str = Field(..., min_length=3, max_length=500)
    keywords: list[str] = Field(..., min_length=1, max_length=5)
    timeframe: TrendsTimeframe = "today 3-m"

    @field_validator("keywords")
    @classmethod
    def strip_keywords(cls, v: list[str]) -> list[str]:
        out = [k.strip() for k in v if k and k.strip()]
        if not out:
            raise ValueError("At least one non-empty keyword is required")
        if len(out) > 5:
            raise ValueError("Maximum 5 keywords")
        return out[:5]


class GeocodedLocationGoogle(BaseModel):
    formatted_address: str | None = None
    lat: float
    lng: float
    street_number: str | None = None
    route: str | None = None
    locality: str | None = None
    sublocality: str | None = None
    neighborhood: str | None = None
    administrative_area_level_1: str | None = None
    administrative_area_level_1_long: str | None = None
    administrative_area_level_2: str | None = None
    administrative_area_level_2_long: str | None = None
    country: str | None = None
    country_long: str | None = None
    postal_code: str | None = None
    place_id: str | None = None


class RegionTrendRow(BaseModel):
    region: str
    scores: dict[str, float]


class ZoningQuestionRequest(BaseModel):
    question: str = Field(..., min_length=5, max_length=1000)
    jurisdiction: str = Field(
        default="austin_tx",
        pattern=r"^[a-z0-9_]{1,64}$",
        description="Zoning corpus key under app/data/zoning/. Pilot scope: 'austin_tx' only.",
    )
    zoning_district: str | None = Field(
        default=None, max_length=20, description="Known district code, e.g. 'CS-1', if the user has it."
    )
    address: str | None = Field(default=None, max_length=500)


class ZoningCitation(BaseModel):
    citation: str
    title: str
    score: float


class ZoningAnswerResponse(BaseModel):
    answer: str
    citations: list[ZoningCitation]
    jurisdiction: str
    disclaimer: str = (
        "Informational only, not legal advice. Verify against the current code with the "
        "City of Austin Development Services Department before making a decision."
    )


class ZoningMapRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    radius_m: int = Field(default=500, ge=100, le=1500)
    business_type: str | None = Field(
        default=None, max_length=120, description="If given, polygons are colored by permission for this use."
    )
    jurisdiction: str = Field(default="austin_tx", pattern=r"^[a-z0-9_]{1,64}$")


class ZoningMapFeature(BaseModel):
    geometry: dict[str, Any]
    ztype: str
    base_district: str | None
    case_number: str | None
    permission: str
    color: str
    matched_use: str | None


class ZoningMapResponse(BaseModel):
    jurisdiction: str
    business_type: str | None
    features: list[ZoningMapFeature]


class TrendsKeywordsResponse(BaseModel):
    disclaimer: str
    geocode: GeocodedLocationGoogle
    primary_keyword: str
    trends_geo: str
    trends_resolution: str
    timeframe: str
    keywords: list[str]
    regions: list[RegionTrendRow]
