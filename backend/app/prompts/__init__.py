"""
GeoScore — LLM Prompt Registry
================================
All prompt strings and template functions live in this package.
Import ONLY from backend services / API handlers — never from the frontend.

Available prompts
-----------------

business_context
  BUSINESS_CONTEXT_SYSTEM_PROMPT_V1          str constant
  business_context_system_prompt_v1(...)     template function

  Establishes the model's role, decision framework, and output contract.
  Injected as the OpenAI "system" role message before every site-analysis call.

site_analysis
  site_analysis_prompt_v1(...)               template function

  Supplies numeric site signals and requests the four-lens JSON critique.
  Injected as the OpenAI "user" role message in get_ai_consultant_insights().

site_comparison
  SITE_COMPARISON_SYSTEM_PROMPT_V1           str constant
  site_comparison_prompt_v1(...)             template function

  Compares two candidate sites and requests a plain-prose differentiator.
  Used in get_comparison_insight().

zoning_qa
  ZONING_QA_SYSTEM_PROMPT_V1                 str constant
  zoning_qa_user_prompt_v1(...)              template function

  Answers "can I build/operate X here?" questions grounded in retrieved
  zoning-code excerpts (see app/services/zoning_rag.py). Pilot scope:
  Austin, TX, Land Development Code Chapter 25-2 only.
  Used in get_zoning_answer().
"""

from .business_context import (
    BUSINESS_CONTEXT_SYSTEM_PROMPT_V1,
    business_context_system_prompt_v1,
)
from .site_analysis import site_analysis_prompt_v1
from .site_comparison import (
    SITE_COMPARISON_SYSTEM_PROMPT_V1,
    site_comparison_prompt_v1,
)
from .zoning_qa import (
    ZONING_QA_SYSTEM_PROMPT_V1,
    zoning_qa_user_prompt_v1,
)

__all__ = [
    # business context
    "BUSINESS_CONTEXT_SYSTEM_PROMPT_V1",
    "business_context_system_prompt_v1",
    # site analysis
    "site_analysis_prompt_v1",
    # site comparison
    "SITE_COMPARISON_SYSTEM_PROMPT_V1",
    "site_comparison_prompt_v1",
    # zoning Q&A
    "ZONING_QA_SYSTEM_PROMPT_V1",
    "zoning_qa_user_prompt_v1",
]
