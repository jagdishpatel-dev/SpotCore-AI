"""
Explicit weighted scoring driven by per-business-type JSON profiles.
Total is a weighted blend of 0-100 subscores; recommendation bands are transparent.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.models.schemas import ScoreInputs
from app.services.scoring_config import ScoringProfile, resolve_profile


@dataclass
class RawSignals:
    population: int | None
    median_income: int | None
    competitor_count: int
    complementary_count: int
    commercial_poi_count: int
    subway_within_800m: int
    bus_within_400m: int
    nearest_subway_m: float | None
    vacancy_pct: float | None
    pct_college_educated: float | None
    median_age: float | None
    monthly_budget: float | None
    parking_within_radius: int = 0
    bicycle_parking_within_radius: int = 0
    major_road_nodes_within_radius: int = 0
    traffic_signal_nodes_within_radius: int = 0


def raw_signals_to_score_inputs(s: RawSignals) -> ScoreInputs:
    return ScoreInputs(
        population=s.population,
        median_income=s.median_income,
        median_age=s.median_age,
        pct_college_educated=s.pct_college_educated,
        vacancy_pct=s.vacancy_pct,
        competitor_count=s.competitor_count,
        complementary_count=s.complementary_count,
        commercial_poi_count=s.commercial_poi_count,
        subway_within_800m=s.subway_within_800m,
        bus_within_400m=s.bus_within_400m,
        nearest_subway_m=s.nearest_subway_m,
        parking_within_radius=s.parking_within_radius,
        bicycle_parking_within_radius=s.bicycle_parking_within_radius,
        major_road_nodes_within_radius=s.major_road_nodes_within_radius,
        traffic_signal_nodes_within_radius=s.traffic_signal_nodes_within_radius,
        monthly_budget=s.monthly_budget,
    )


def score_demand(s: RawSignals, profile: ScoringProfile | None = None) -> int:
    """Higher population and more nearby commercial activity imply stronger demand."""
    p = profile or resolve_profile("")
    d = p.demand
    pop = s.population or 0
    pop_div = d.get("pop_divisor", 8000)
    pop_score = min(100, max(0, int((pop / pop_div) * 100)))
    activity = min(100, s.commercial_poi_count * d.get("activity_multiplier", 8))
    if s.vacancy_pct is not None and s.vacancy_pct > d.get("vacancy_penalty_threshold", 15):
        activity = max(0, activity - d.get("vacancy_penalty", 15))
    return int(
        round(
            d.get("pop_weight", 0.55) * pop_score + d.get("activity_weight", 0.45) * activity
        )
    )


def score_competition(s: RawSignals, profile: ScoringProfile | None = None) -> int:
    """More direct competitors lower the score. Few competitors -> high score."""
    p = profile or resolve_profile("")
    c = s.competitor_count
    comp = p.competition
    tiers: list[list[float]] = comp.get("tiers", [[0, 92], [2, 78], [5, 62], [10, 48]])
    prev_max = -1
    for tier in tiers:
        max_c, score = int(tier[0]), int(tier[1])
        if c <= max_c:
            return score
        prev_max = max_c
    base = comp.get("fallback_base", 55)
    per = comp.get("fallback_per_competitor", 3)
    minimum = comp.get("fallback_min", 25)
    return max(minimum, int(base - c * per))


def score_accessibility(s: RawSignals, profile: ScoringProfile | None = None) -> int:
    p = profile or resolve_profile("")
    a = p.accessibility
    pts = 0.0
    pts += min(a.get("subway_cap", 55), s.subway_within_800m * a.get("subway_pts_per_stop", 18))
    pts += min(a.get("bus_cap", 35), s.bus_within_400m * a.get("bus_pts_per_stop", 4))
    nearest = s.nearest_subway_m
    if nearest is not None:
        if nearest < 250:
            pts += a.get("nearest_under_250", 15)
        elif nearest < 450:
            pts += a.get("nearest_under_450", 10)
        elif nearest < 800:
            pts += a.get("nearest_under_800", 5)
    parking_cap = a.get("parking_cap", 0)
    if parking_cap > 0:
        pts += min(parking_cap, s.parking_within_radius * a.get("parking_pts_per", 0))
    bike_cap = a.get("bike_cap", 0)
    if bike_cap > 0:
        pts += min(bike_cap, s.bicycle_parking_within_radius * a.get("bike_pts_per", 0))
    road_cap = a.get("road_cap", 0)
    if road_cap > 0:
        pts += min(road_cap, s.major_road_nodes_within_radius * a.get("road_pts_per", 0))
    signal_cap = a.get("signal_cap", 0)
    if signal_cap > 0:
        pts += min(signal_cap, s.traffic_signal_nodes_within_radius * a.get("signal_pts_per", 0))
    return int(min(100, round(pts)))


def _income_score(income: int, mode: str, df: dict) -> int:
    if mode == "coffee":
        return min(100, max(20, int((income - 35000) / 900)))
    if mode == "luxury":
        return min(100, max(15, int((income - 70000) / 1200)))
    baseline = df.get("income_baseline", 40000)
    slope = df.get("income_slope", 1000)
    min_score = df.get("income_min_score", 25)
    return min(100, max(min_score, int((income - baseline) / slope)))


def score_demographic_fit(
    s: RawSignals,
    business_type: str,
    profile: ScoringProfile | None = None,
) -> int:
    """Income/education/age fit vs business-type profile ideals."""
    p = profile or resolve_profile(business_type)
    df = p.demographic_fit
    income = s.median_income
    edu = s.pct_college_educated
    age = s.median_age

    income_score = 50
    if income:
        mode = df.get("income_mode", "default")
        income_score = _income_score(income, mode, df)

    edu_score = 55
    if edu is not None:
        edu_score = min(100, max(df.get("edu_min_score", 20), int(edu * df.get("edu_multiplier", 1.2))))

    ideal_age = df.get("ideal_age", 42)
    age_penalty = df.get("age_penalty_factor", 1.8)
    age_cap = df.get("age_penalty_cap", 35)
    age_score = 60
    if age is not None:
        age_score = 100 - min(age_cap, abs(age - ideal_age) * age_penalty)

    return int(
        round(
            df.get("income_weight", 0.45) * income_score
            + df.get("edu_weight", 0.30) * edu_score
            + df.get("age_weight", 0.25) * age_score
        )
    )


def score_cost_fit(s: RawSignals, profile: ScoringProfile | None = None) -> int | None:
    if s.monthly_budget is None:
        return None
    p = profile or resolve_profile("")
    cf = p.cost_fit
    b = float(s.monthly_budget)
    inc = s.median_income or cf.get("default_income", 65000)
    affordable = inc * cf.get("affordability_factor", 0.003)
    if b <= 0:
        return None
    ratio = affordable / max(b, 1)
    for threshold, score in cf.get("ratio_tiers", [[1.4, 88], [1.0, 72], [0.7, 55]]):
        if ratio >= threshold:
            return int(score)
    return int(cf.get("fallback_score", 38))


def aggregate_scores(
    demand: int,
    competition: int,
    accessibility: int,
    demographic_fit: int,
    cost_fit: int | None,
    profile: ScoringProfile | None = None,
) -> tuple[int, str]:
    p = profile or resolve_profile("")
    if cost_fit is None:
        w = p.weights_no_budget
        total = (
            w["demand"] * demand
            + w["competition"] * competition
            + w["accessibility"] * accessibility
            + w["demographic_fit"] * demographic_fit
        )
    else:
        w = p.weights_with_budget
        total = (
            w["demand"] * demand
            + w["competition"] * competition
            + w["accessibility"] * accessibility
            + w["demographic_fit"] * demographic_fit
            + w["cost_fit"] * cost_fit
        )
    total_i = int(round(min(100, max(0, total))))
    rec_cfg = p.recommendation
    if total_i >= rec_cfg.get("strong_min", 72):
        rec = "strong"
    elif total_i >= rec_cfg.get("medium_min", 52):
        rec = "medium"
    else:
        rec = "weak"
    return total_i, rec


def build_summary_bullets(
    s: RawSignals,
    scores: dict[str, int],
    business_type: str,
) -> list[str]:
    bullets: list[str] = []
    pop = s.population
    if pop and pop >= 5000:
        bullets.append("Residential density in the tract is relatively strong for local foot traffic.")
    elif pop:
        bullets.append("Tract population is moderate; consider weekday vs weekend traffic patterns.")
    else:
        bullets.append("Population signals were limited; treat demand as directional, not precise.")

    if s.competitor_count == 0:
        bullets.append(f"No obvious mapped {business_type} competitors within the search radius.")
    elif s.competitor_count <= 3:
        bullets.append("Competition looks moderate based on nearby mapped similar businesses.")
    else:
        bullets.append("Several similar businesses are mapped nearby—differentiation and visibility matter.")

    if s.subway_within_800m > 0 or (s.nearest_subway_m and s.nearest_subway_m < 600):
        bullets.append("Transit access is a plus for customer reach and staffing commutes.")
    elif s.bus_within_400m >= 3:
        bullets.append("Bus access is decent even if subway options are thin in this radius.")
    else:
        bullets.append("Transit within the search radius looks limited; verify parking and walk flows.")

    if s.parking_within_radius >= 2:
        bullets.append("Mapped parking nodes nearby may help drive-in or delivery access.")
    if s.bicycle_parking_within_radius >= 2:
        bullets.append("Bicycle parking nearby suggests some bike-friendly access.")

    inc = s.median_income
    if inc and inc >= 85000:
        bullets.append("Household income in the tract skews higher—price positioning can support premium SKUs.")
    elif inc and inc >= 55000:
        bullets.append("Household income is mid-market—value and consistency typically carry the day.")
    elif inc:
        bullets.append("Household income skews lower—volume, value, and cost control are especially important.")

    if s.monthly_budget is not None and scores.get("cost_fit", 70) < 55:
        bullets.append("Your stated budget looks tight versus a simple local affordability heuristic—validate rent quotes.")
    elif s.monthly_budget is not None:
        bullets.append("Budget signal is workable under our coarse affordability check (still verify real leases).")

    return bullets[:5]
