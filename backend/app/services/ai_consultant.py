"""
AI Consultant Service
=====================
Thin orchestration layer that:
  1. Calls the prompt registry to build messages.
  2. Sends them to the configured LLM (OpenRouter via OpenAI-compat API).
  3. Parses / validates the JSON response and returns typed Pydantic objects.

Prompt files live in app/prompts/ — edit prompts there, not here.
"""

from __future__ import annotations

import json
import logging
import re

from openai import OpenAI

from app.config import settings
from app.models.schemas import (
    AIInsight,
    AIInsights,
    AnalyzeSiteResponse,
    ZoningAnswerResponse,
    ZoningCitation,
)
from app.observability.pipeline_events import log_event
from app.prompts import (
    business_context_system_prompt_v1,
    site_analysis_prompt_v1,
    SITE_COMPARISON_SYSTEM_PROMPT_V1,
    site_comparison_prompt_v1,
    ZONING_QA_SYSTEM_PROMPT_V1,
    zoning_qa_user_prompt_v1,
)
from app.services import zoning_rag, zoning_tables
from app.services.scoring import RawSignals

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _make_client() -> OpenAI:
    return OpenAI(
        api_key=settings.openrouter_api_key,
        base_url=settings.openrouter_base_url,
    )


# OpenRouter's free-tier models rotate in and out of availability (a model
# that works one minute can 404/429 the next — verified live while building
# this). settings.ai_model ("openrouter/free") is OpenRouter's own routing
# alias and already fails over internally, but these are a second, explicit
# line of defense so a single bad provider response doesn't surface as a
# user-visible failure.
_CHAT_MODEL_FALLBACKS = (
    "nvidia/nemotron-3.5-lightning:free",
    "minimax/minimax-m3:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
)


# A free model occasionally returns a "successful" (200) response whose content
# is moderation/safety-classifier metadata instead of an actual answer (seen
# live: content == "User Safety: safe"). That's not an exception _chat_completion
# would otherwise retry on, so treat suspiciously short content as a failure too.
_MIN_VALID_CONTENT_CHARS = 40


class _LowQualityResponse(Exception):
    pass


def _chat_completion(**kwargs):
    """client.chat.completions.create(), retrying across free-model fallbacks on
    failure OR on a response too short/empty to be a real answer."""
    client = _make_client()
    models = [settings.ai_model, *(m for m in _CHAT_MODEL_FALLBACKS if m != settings.ai_model)]
    last_exc: Exception | None = None
    for model in models:
        try:
            response = client.chat.completions.create(model=model, **kwargs)
            content = (response.choices[0].message.content or "").strip()
            if len(content) < _MIN_VALID_CONTENT_CHARS:
                raise _LowQualityResponse(f"model={model} returned {len(content)} chars: {content!r}")
            return response
        except Exception as exc:  # noqa: BLE001 - deliberately broad: any provider failure should fail over
            logger.warning("chat completion failed on model=%s: %s", model, exc)
            last_exc = exc
    assert last_exc is not None
    raise last_exc


def _strip_thought_tags(raw: str) -> str:
    """Remove <thought>…</thought> blocks emitted by some Gemma variants."""
    return re.sub(r"<thought>.*?</thought>", "", raw, flags=re.DOTALL).strip()


_LENS_KEYS = frozenset({"strategic_overview", "the_edge", "the_blindspot", "the_power_move"})


def _normalize_ai_insights_payload(data: object) -> dict | None:
    """
    Coerce LLM JSON into the shape expected by AIInsights.

    Models sometimes return a list, or put lens fields at the top level instead of
    under "insights", which causes: AIInsights(**data) → "must be a mapping, not list".
    """
    if isinstance(data, list):
        if not data or not isinstance(data[0], dict):
            return None
        data = data[0]
    if not isinstance(data, dict):
        return None

    if isinstance(data.get("insights"), dict):
        payload = dict(data)
    elif _LENS_KEYS <= set(data.keys()):
        payload = {
            "insights": {k: str(data[k]) for k in _LENS_KEYS},
            "confidence_score": data.get("confidence_score", 0.6),
        }
    else:
        return None

    try:
        payload["confidence_score"] = float(payload.get("confidence_score", 0.6))
    except (TypeError, ValueError):
        payload["confidence_score"] = 0.6

    insights = payload.get("insights")
    if not isinstance(insights, dict):
        return None
    for key in _LENS_KEYS:
        if key not in insights:
            return None
        insights[key] = str(insights[key])

    return payload


# ---------------------------------------------------------------------------
# Site analysis insights
# ---------------------------------------------------------------------------

async def get_ai_consultant_insights(
    signals: RawSignals,
    business_type: str,
    total_score: int,
    recommendation: str,
    address: str = "",
    concept_notes: str = "",
    scores: object | None = None,
) -> AIInsights | None:
    """
    Build a four-lens strategic critique for a single site.

    Pipeline
    --------
    1. business_context_system_prompt_v1  →  system role message
    2. site_analysis_prompt_v1            →  user role message
    3. LLM call  →  JSON  →  AIInsights

    Parameters
    ----------
    signals : RawSignals
        Raw numeric signals from scoring service.
    business_type : str
        Operator's concept label.
    total_score : int
        Composite viability score 0–100.
    recommendation : str
        One of: "strong" | "medium" | "weak".
    address : str, optional
        Human-readable address for model context.
    concept_notes : str, optional
        Free-form operator notes (price point, target demo, etc.).
    scores : ScoreBreakdown-like, optional
        Object with .demand / .competition / .accessibility / .demographic_fit.
    """
    # ── Build messages from prompt registry ──────────────────────────────────
    system_msg = business_context_system_prompt_v1(
        business_type=business_type,
        concept_notes=concept_notes,
    )

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
        score_demand=getattr(scores, "demand", None) if scores else None,
        score_competition=getattr(scores, "competition", None) if scores else None,
        score_accessibility=getattr(scores, "accessibility", None) if scores else None,
        score_demographic_fit=getattr(scores, "demographic_fit", None) if scores else None,
    )

    try:
        response = _chat_completion(
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user",   "content": user_msg},
            ],
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
        raw = _strip_thought_tags(raw)
        parsed = json.loads(raw)
        payload = _normalize_ai_insights_payload(parsed)
        if payload is None:
            logger.error(
                "AI Consultant JSON shape invalid (expected object with insights + confidence_score): %s",
                type(parsed).__name__,
            )
            log_event("analyze_site.ai_consultant.failure", failure_kind="invalid_shape")
            return None
        return AIInsights(**payload)
    except json.JSONDecodeError as exc:
        logger.error("AI Consultant invalid JSON: %s", exc)
        log_event("analyze_site.ai_consultant.failure", failure_kind="invalid_json")
        return None
    except Exception as exc:
        failure_kind = "api_error" if "openai" in type(exc).__module__.lower() else "unknown"
        logger.error("AI Consultant error: %s", exc)
        log_event(
            "analyze_site.ai_consultant.failure",
            failure_kind=failure_kind,
            error_type=type(exc).__name__,
        )
        return None


# ---------------------------------------------------------------------------
# Site comparison insight
# ---------------------------------------------------------------------------

async def get_comparison_insight(
    site_a: AnalyzeSiteResponse,
    site_b: AnalyzeSiteResponse,
    business_type: str,
) -> str:
    """
    Produce a 2–3 sentence plain-prose explanation of why one site beats the other.

    Pipeline
    --------
    1. SITE_COMPARISON_SYSTEM_PROMPT_V1  →  system role message
    2. site_comparison_prompt_v1         →  user role message
    3. LLM call  →  plain text
    """
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

    try:
        response = _chat_completion(
            messages=[
                {"role": "system", "content": SITE_COMPARISON_SYSTEM_PROMPT_V1},
                {"role": "user",   "content": user_msg},
            ],
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.error("AI Comparison error: %s", exc)
        return "Comparison data available, but AI synthesis failed."


# ---------------------------------------------------------------------------
# Zoning Q&A (RAG)
# ---------------------------------------------------------------------------

async def get_zoning_answer(
    question: str,
    jurisdiction: str = "austin_tx",
    zoning_district: str | None = None,
    address: str | None = None,
    k: int = 6,
) -> ZoningAnswerResponse:
    """
    Answer a "can I build/operate X here?" question, grounded in retrieved
    excerpts from the jurisdiction's zoning code (see app/services/zoning_rag.py).

    Pipeline
    --------
    1. zoning_rag.retrieve()       ->  top-k relevant zoning code chunks
    2. ZONING_QA_SYSTEM_PROMPT_V1  ->  system role message
    3. zoning_qa_user_prompt_v1    ->  user role message (question + excerpts)
    4. LLM call  ->  plain-prose answer, cited inline as (§ 25-2-XXX)

    Raises
    ------
    FileNotFoundError
        If no RAG index has been built yet for `jurisdiction`
        (run `python -m app.services.zoning_rag --jurisdiction <name>`).
    """
    excerpts = zoning_rag.retrieve(question, jurisdiction=jurisdiction, k=k)

    table_lookups = (
        zoning_tables.lookup(question, zoning_district, jurisdiction=jurisdiction)
        if zoning_district
        else []
    )

    user_msg = zoning_qa_user_prompt_v1(
        question=question,
        excerpts=excerpts,
        zoning_district=zoning_district,
        address=address,
        table_lookups=table_lookups,
    )

    try:
        response = _chat_completion(
            messages=[
                {"role": "system", "content": ZONING_QA_SYSTEM_PROMPT_V1},
                {"role": "user",   "content": user_msg},
            ],
        )
        answer = _strip_thought_tags(response.choices[0].message.content or "")
    except Exception as exc:
        logger.error("Zoning Q&A error: %s", exc)
        log_event(
            "zoning_qa.failure",
            failure_kind="api_error" if "openai" in type(exc).__module__.lower() else "unknown",
            error_type=type(exc).__name__,
        )
        answer = (
            "Sorry, the zoning assistant couldn't generate an answer right now. "
            "The retrieved excerpts below may still help."
        )

    citations = [
        ZoningCitation(citation=e.get("citation", "?"), title=e.get("title", ""), score=e.get("score", 0.0))
        for e in excerpts
    ]
    return ZoningAnswerResponse(answer=answer, citations=citations, jurisdiction=jurisdiction)
