"""
Site Analysis Prompt
====================
Used in: app/services/ai_consultant.py → get_ai_consultant_insights()
         Injected as the USER message after the business-context system turn.

Purpose
-------
Supplies the full numeric signal payload for a single site and instructs
the model to return a structured JSON critique with four analytical lenses:
strategic_overview, the_edge, the_blindspot, the_power_move.

Output contract (must match app/models/schemas.AIInsights)
----------------------------------------------------------
{
  "insights": {
    "strategic_overview": "<string>",
    "the_edge":           "<string>",
    "the_blindspot":      "<string>",
    "the_power_move":     "<string>"
  },
  "confidence_score": <float 0.0–1.0>
}

Versions
--------
V1  –  all core signals; four-lens output; explicit JSON schema in prompt.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_UNKNOWN = "Unknown"


def _fmt(value: object, suffix: str = "") -> str:
    """Format an optional numeric value for prompt insertion."""
    if value is None:
        return _UNKNOWN
    return f"{value}{suffix}"


# ---------------------------------------------------------------------------
# V1 — User / Data Prompt
# ---------------------------------------------------------------------------

def site_analysis_prompt_v1(
    *,
    # ── Concept ─────────────────────────────────────────────────────────────
    business_type: str,
    address: str = "",
    # ── Composite score ─────────────────────────────────────────────────────
    total_score: int,
    recommendation: str,
    # ── Demographics ────────────────────────────────────────────────────────
    population: int | None = None,
    median_income: int | None = None,
    median_age: float | None = None,
    pct_college_educated: float | None = None,
    vacancy_pct: float | None = None,
    # ── Competition / POI density ────────────────────────────────────────────
    competitor_count: int = 0,
    complementary_count: int = 0,
    commercial_poi_count: int = 0,
    # ── Transit ─────────────────────────────────────────────────────────────
    subway_within_800m: int = 0,
    bus_within_400m: int = 0,
    nearest_subway_m: float | None = None,
    # ── Sub-scores ──────────────────────────────────────────────────────────
    score_demand: int | None = None,
    score_competition: int | None = None,
    score_accessibility: int | None = None,
    score_demographic_fit: int | None = None,
) -> str:
    """
    Build the user-turn prompt for the site-analysis AI call.

    All parameters are keyword-only to prevent silent positional mistakes.

    Parameters
    ----------
    business_type : str
        Human-readable concept label, e.g. "specialty coffee shop".
    address : str, optional
        Human-readable address string; included for model context only.
    total_score : int
        Composite viability score 0–100.
    recommendation : str
        One of: "strong" | "medium" | "weak".
    population : int | None
        Census tract total population.
    median_income : int | None
        Median household income (USD).
    median_age : float | None
        Median age of tract residents.
    pct_college_educated : float | None
        Percentage with bachelor's degree or higher.
    vacancy_pct : float | None
        Commercial vacancy rate percentage.
    competitor_count : int
        Direct competitors mapped within the search radius.
    complementary_count : int
        Complementary businesses within the search radius.
    commercial_poi_count : int
        Total commercial POIs within the search radius.
    subway_within_800m : int
        Subway entrances within 800 m.
    bus_within_400m : int
        Bus / light-rail stops within 400 m.
    nearest_subway_m : float | None
        Distance to the nearest subway entrance (meters).
    score_demand : int | None
        0–100 demand sub-score.
    score_competition : int | None
        0–100 competition sub-score.
    score_accessibility : int | None
        0–100 accessibility sub-score.
    score_demographic_fit : int | None
        0–100 demographic-fit sub-score.

    Returns
    -------
    str
        Formatted prompt string ready to pass as the "user" role message.

    Usage
    -----
    ::
        user_msg = site_analysis_prompt_v1(
            business_type=business_type,
            address=address,
            total_score=total_score,
            recommendation=recommendation,
            population=signals.population,
            median_income=signals.median_income,
            median_age=signals.median_age,
            pct_college_educated=signals.pct_college_educated,
            vacancy_pct=signals.vacancy_pct,
            competitor_count=signals.competitor_count,
            complementary_count=signals.complementary_count,
            commercial_poi_count=signals.commercial_poi_count,
            subway_within_800m=signals.subway_within_800m,
            bus_within_400m=signals.bus_within_400m,
            nearest_subway_m=signals.nearest_subway_m,
            score_demand=scores.demand,
            score_competition=scores.competition,
            score_accessibility=scores.accessibility,
            score_demographic_fit=scores.demographic_fit,
        )
    """

    # Build optional address line
    address_line = f"\nAddress          : {address}" if address else ""

    # Build optional sub-score block
    sub_scores_block = ""
    if any(
        v is not None
        for v in (score_demand, score_competition, score_accessibility, score_demographic_fit)
    ):
        sub_scores_block = (
            "\n\nSUB-SCORES (0–100)\n"
            f"  Demand           : {_fmt(score_demand)}\n"
            f"  Competition      : {_fmt(score_competition)}\n"
            f"  Accessibility    : {_fmt(score_accessibility)}\n"
            f"  Demographic fit  : {_fmt(score_demographic_fit)}"
        )

    return f"""\
SITE ANALYSIS REQUEST
=====================
Business concept : {business_type}{address_line}

COMPOSITE SCORE
  Total viability  : {total_score}/100  ({recommendation.upper()})

DEMOGRAPHICS  (Census ACS-5 tract level)
  Population       : {_fmt(population)}
  Median HH income : {_fmt(median_income, ' USD')}
  Median age       : {_fmt(median_age)}
  College educated : {_fmt(pct_college_educated, '%')}
  Vacancy rate     : {_fmt(vacancy_pct, '%')}

COMPETITION & POI DENSITY  (OpenStreetMap Overpass)
  Direct competitors   : {competitor_count}
  Complementary biz    : {complementary_count}
  Total commercial POI : {commercial_poi_count}

TRANSIT & MOBILITY  (OpenStreetMap Overpass)
  Subway nodes ≤800 m  : {subway_within_800m}
  Bus/rail stops ≤400 m: {bus_within_400m}
  Nearest subway       : {_fmt(nearest_subway_m, ' m')}{sub_scores_block}

ANALYTICAL TASK
---------------
Move beyond the raw numbers. Focus on the RELATIONSHIPS between signals —
e.g. high competition + high complementary count may indicate validated
demand, not saturation. Consider trade-offs and second-order effects.

Return ONLY a valid JSON object matching this exact schema:

{{
  "insights": {{
    "strategic_overview" : "<2–3 sentence executive summary of this site's viability>",
    "the_edge"           : "<the single strongest signal in favour of this location>",
    "the_blindspot"      : "<the single biggest risk or data gap the operator must investigate>",
    "the_power_move"     : "<one concrete, actionable recommendation to maximise success here>"
  }},
  "confidence_score": <float between 0.0 and 1.0>
}}

Do not include any text outside the JSON object."""
