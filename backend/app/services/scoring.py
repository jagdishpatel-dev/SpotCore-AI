"""
Explicit weighted scoring. Tune weights and thresholds here.
Total is a weighted blend of 0-100 subscores; recommendation bands are transparent.
"""

from __future__ import annotations

from dataclasses import dataclass


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


WEIGHTS_NO_BUDGET = {
    "demand": 0.28,
    "competition": 0.24,
    "accessibility": 0.22,
    "demographic_fit": 0.26,
}

WEIGHTS_WITH_BUDGET = {
    "demand": 0.24,
    "competition": 0.20,
    "accessibility": 0.18,
    "demographic_fit": 0.22,
    "cost_fit": 0.16,
}


def score_demand(s: RawSignals) -> int:
    """Higher population and more nearby commercial activity imply stronger demand."""
    pop = s.population or 0
    pop_score = min(100, max(0, int((pop / 8000) * 100)))  # ~8k tract pop -> 100
    activity = min(100, s.commercial_poi_count * 8)
    if s.vacancy_pct is not None and s.vacancy_pct > 15:
        activity = max(0, activity - 15)
    return int(round(0.55 * pop_score + 0.45 * activity))


def score_competition(s: RawSignals) -> int:
    """
    More direct competitors lower the score. Few competitors -> high score.
    """
    c = s.competitor_count
    if c == 0:
        return 92
    if c <= 2:
        return 78
    if c <= 5:
        return 62
    if c <= 10:
        return 48
    return max(25, 55 - c * 3)


def score_accessibility(s: RawSignals) -> int:
    sub = s.subway_within_800m
    bus = s.bus_within_400m
    nearest = s.nearest_subway_m
    pts = 0
    pts += min(55, sub * 18)
    pts += min(35, bus * 4)
    if nearest is not None:
        if nearest < 250:
            pts += 15
        elif nearest < 450:
            pts += 10
        elif nearest < 800:
            pts += 5
    return int(min(100, round(pts)))


def score_demographic_fit(s: RawSignals, business_type: str) -> int:
    """
    Simple fit: income/education vs business type keywords.
    """
    bt = business_type.lower()
    income = s.median_income
    edu = s.pct_college_educated
    age = s.median_age

    income_score = 50
    if income:
        if any(x in bt for x in ("coffee", "cafe", "fast casual", "bakery")):
            income_score = min(100, max(20, int((income - 35000) / 900)))
        elif any(x in bt for x in ("luxury", "jewelry", "fine dining")):
            income_score = min(100, max(15, int((income - 70000) / 1200)))
        else:
            income_score = min(100, max(25, int((income - 40000) / 1000)))

    edu_score = 55
    if edu is not None:
        edu_score = min(100, max(20, int(edu * 1.2)))

    age_score = 60
    if age is not None:
        # younger skew slightly better for QSR/cafe in this MVP heuristic
        if any(x in bt for x in ("coffee", "gym", "fast food", "bubble")):
            age_score = 100 - min(40, abs(age - 34) * 2)
        else:
            age_score = 100 - min(35, abs(age - 42) * 1.8)

    return int(round(0.45 * income_score + 0.30 * edu_score + 0.25 * age_score))


def score_cost_fit(s: RawSignals) -> int | None:
    if s.monthly_budget is None:
        return None
    # NYC MVP: map budget to coarse affordability vs median income proxy
    b = float(s.monthly_budget)
    inc = s.median_income or 65000
    # Assume operator targets rent <= 8-12% of expected revenue; use income as coarse demand proxy
    affordable = inc * 0.003  # rough "monthly rent capacity" heuristic
    if b <= 0:
        return None
    ratio = affordable / max(b, 1)
    if ratio >= 1.4:
        return 88
    if ratio >= 1.0:
        return 72
    if ratio >= 0.7:
        return 55
    return 38


def aggregate_scores(
    demand: int,
    competition: int,
    accessibility: int,
    demographic_fit: int,
    cost_fit: int | None,
) -> tuple[int, str]:
    if cost_fit is None:
        w = WEIGHTS_NO_BUDGET
        total = (
            w["demand"] * demand
            + w["competition"] * competition
            + w["accessibility"] * accessibility
            + w["demographic_fit"] * demographic_fit
        )
    else:
        w = WEIGHTS_WITH_BUDGET
        total = (
            w["demand"] * demand
            + w["competition"] * competition
            + w["accessibility"] * accessibility
            + w["demographic_fit"] * demographic_fit
            + w["cost_fit"] * cost_fit
        )
    total_i = int(round(min(100, max(0, total))))
    if total_i >= 72:
        rec = "strong"
    elif total_i >= 52:
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
