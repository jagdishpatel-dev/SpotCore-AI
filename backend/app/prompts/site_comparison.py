"""
Site Comparison Prompt
======================
Used in: app/services/ai_consultant.py → get_comparison_insight()
         Injected as the USER message in the two-site comparison call.

Purpose
-------
Given the summary metrics for two candidate sites, asks the model to
identify the objectively superior location for the given business type
and articulate the single most critical differentiator in plain English.

Output contract
---------------
Plain prose string, 2–3 sentences.
No JSON required for this call; the winner label is determined by score
logic in analyze_site.py — this prompt produces the human-readable reason.

Versions
--------
V1  –  concise differentiator framing; site labels A / B; plain-text output.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_UNKNOWN = "Unknown"


def _fmt(value: object, suffix: str = "") -> str:
    """Format an optional value for prompt insertion."""
    if value is None:
        return _UNKNOWN
    return f"{value}{suffix}"


# ---------------------------------------------------------------------------
# V1 — Comparison System Prompt
# ---------------------------------------------------------------------------

SITE_COMPARISON_SYSTEM_PROMPT_V1: str = (
    "You are a professional urban planner and retail site-selection expert. "
    "You write concise, direct investment-grade assessments. "
    "Never hedge with 'it depends' — always identify the objectively stronger site "
    "and explain the single most decisive differentiator in 2–3 sentences."
)


# ---------------------------------------------------------------------------
# V1 — Comparison User Prompt
# ---------------------------------------------------------------------------

def site_comparison_prompt_v1(
    *,
    business_type: str,
    # ── Site A ───────────────────────────────────────────────────────────────
    address_a: str,
    score_a: int,
    recommendation_a: str,
    competitor_count_a: int,
    demographics_summary_a: str,
    transit_summary_a: str,
    # ── Site B ───────────────────────────────────────────────────────────────
    address_b: str,
    score_b: int,
    recommendation_b: str,
    competitor_count_b: int,
    demographics_summary_b: str,
    transit_summary_b: str,
) -> str:
    """
    Build the user-turn prompt for the two-site comparison call.

    All parameters are keyword-only to prevent silent positional mistakes.

    Parameters
    ----------
    business_type : str
        Human-readable concept label.
    address_a / address_b : str
        Human-readable address strings for display.
    score_a / score_b : int
        Composite viability scores 0–100.
    recommendation_a / recommendation_b : str
        One of: "strong" | "medium" | "weak".
    competitor_count_a / competitor_count_b : int
        Direct competitor count within the search radius.
    demographics_summary_a / demographics_summary_b : str
        Pre-rendered one-liner from DemographicsBlock.summary.
    transit_summary_a / transit_summary_b : str
        Pre-rendered one-liner from TransitBlock.summary.

    Returns
    -------
    str
        Formatted prompt string ready to pass as the "user" role message.

    Usage
    -----
    ::
        user_msg = site_comparison_prompt_v1(
            business_type=business_type,
            address_a=site_a.location.label,
            score_a=site_a.total_score,
            recommendation_a=site_a.recommendation,
            competitor_count_a=len(site_a.competitors),
            demographics_summary_a=site_a.demographics.summary,
            transit_summary_a=site_a.transit.summary,
            address_b=site_b.location.label,
            score_b=site_b.total_score,
            recommendation_b=site_b.recommendation,
            competitor_count_b=len(site_b.competitors),
            demographics_summary_b=site_b.demographics.summary,
            transit_summary_b=site_b.transit.summary,
        )
    """

    return f"""\
SITE COMPARISON REQUEST
=======================
Business concept: {business_type}

SITE A — {address_a}
  Viability score  : {score_a}/100  ({recommendation_a.upper()})
  Competitors      : {competitor_count_a}
  Demographics     : {demographics_summary_a}
  Transit          : {transit_summary_a}

SITE B — {address_b}
  Viability score  : {score_b}/100  ({recommendation_b.upper()})
  Competitors      : {competitor_count_b}
  Demographics     : {demographics_summary_b}
  Transit          : {transit_summary_b}

TASK
----
Identify which site is objectively better for this business concept.
Write 2–3 sentences. Lead with the winner (e.g. "Site A is the stronger
choice because …"). Focus on the single most decisive differentiator
— score gap, competitive density, transit access, or demographic fit."""
