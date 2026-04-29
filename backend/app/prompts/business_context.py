"""
Business Context Prompt
=======================
Used in: app/services/ai_consultant.py → get_ai_consultant_insights()
         Injected as the SYSTEM message BEFORE the site-analysis user turn.

Purpose
-------
Establishes the model's professional identity, decision framework, and
output contract once per request. Keeps the site-analysis prompt lean —
it only needs to pass data, not re-explain the role or rules.

Versions
--------
V1  –  initial structured role / rules / output-contract prompt.
        Awaiting final copy from product team; placeholder below.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# V1 — System / Role Prompt
# ---------------------------------------------------------------------------
# This string is injected as the OpenAI "system" role message.
# Replace the placeholder body with the final prompt copy when ready.
# Keep it model-agnostic (no references to Gemma / GPT / Claude).
# ---------------------------------------------------------------------------

BUSINESS_CONTEXT_SYSTEM_PROMPT_V1: str = (
    # ── PLACEHOLDER ─────────────────────────────────────────────────────────
    # The product team will supply the final prompt here.
    # Structure to follow:
    #   ROLE       – who the model is (title, expertise, geographic focus)
    #   CONTEXT    – what GeoScore is and how data is gathered
    #   RULES      – tone, forbidden phrases, length constraints
    #   OUTPUT     – JSON schema contract (mirrors AIInsights / AIInsight)
    # ────────────────────────────────────────────────────────────────────────
    "You are a world-class urban planner and SMB site-selection strategist. "
    "Respond only with valid JSON matching the schema provided in the user message. "
    "Do not include explanatory prose outside the JSON object."
)


def business_context_system_prompt_v1(
    *,
    business_type: str,
    concept_notes: str = "",
) -> str:
    """
    Returns the system prompt with optional runtime substitutions.

    Parameters
    ----------
    business_type : str
        The operator's concept, e.g. "specialty coffee shop".
    concept_notes : str, optional
        Free-form notes about the concept (price point, target demo, etc.)
        that should colour the model's framing.  May be empty.

    Returns
    -------
    str
        Final system prompt string, ready to pass as the "system" role message.

    Usage
    -----
    Called once per site-analysis request, before the data-rich user turn::

        system_msg = business_context_system_prompt_v1(
            business_type=business_type,
            concept_notes=concept_notes,
        )
        messages = [
            {"role": "system", "content": system_msg},
            {"role": "user",   "content": site_analysis_prompt_v1(...)},
        ]
    """
    base = BUSINESS_CONTEXT_SYSTEM_PROMPT_V1

    # Append concept context when supplied so the model can tailor its lens
    # without requiring a full prompt rewrite for every concept variant.
    if concept_notes:
        base = (
            f"{base}\n\n"
            f"CONCEPT CONTEXT\n"
            f"Business type : {business_type}\n"
            f"Operator notes: {concept_notes}"
        )
    else:
        base = f"{base}\n\nBusiness type under evaluation: {business_type}"

    return base
