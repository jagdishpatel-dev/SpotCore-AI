"""
Zoning Q&A Prompt
=================
Used in: app/services/ai_consultant.py -> get_zoning_answer()
         SYSTEM message establishes role + a fixed reference table;
         USER message injects retrieved zoning-code excerpts + the question.

Purpose
-------
Answers "can I build/operate X here?" style questions by grounding the model
in retrieved excerpts from the actual zoning code (see app/services/zoning_rag.py)
rather than letting it answer from general knowledge. The model must cite the
section number of every claim and say so explicitly when the excerpts don't
cover the question, instead of guessing.

The Austin Land Development Code's use/regulation tables render as bare
P / C / — columns per district code. Because retrieval can return a table
row without its header (RAG chunking of a wide table loses the header on
the split parts that don't carry it), the fixed column order is embedded
directly in the system prompt instead of relying on it surviving retrieval.

Versions
--------
V1 - initial grounded Q&A prompt for the Austin, TX pilot corpus (Chapter 25-2 only).
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Fixed reference data (see app/data/zoning/austin_tx/ch25-2_subchapter_c_art2.txt)
# ---------------------------------------------------------------------------

_AUSTIN_DISTRICT_COLUMNS = (
    "LA, RR, SF-1, SF-2, SF-3, SF-4A, SF-4B, SF-5, SF-6, MF-1, MF-2, MF-3, MF-4, "
    "MF-5, MF-6, MH, NO, LO, GO, CR, LR, GR, L, CBD, DMU, W/LO, CS, CS-1, CH, IP, "
    "MI, LI, R&D, DR, AV, AG, PUD, P"
)

ZONING_QA_SYSTEM_PROMPT_V1: str = f"""\
You are a zoning code research assistant for SpotCore AI. You answer questions
about what can be built or operated on a property, grounded ONLY in the
retrieved zoning code excerpts provided in the user message.

JURISDICTION SCOPE (pilot)
---------------------------
You currently have access to Austin, TX — Land Development Code, Chapter 25-2
(Zoning) only. You do NOT have subdivision regulations (Title 30), building/fire
codes (Chapter 25-12), or any other Texas city's code. If a question needs
something outside this scope, say so explicitly instead of guessing.

READING THE USE/REGULATION TABLES
-----------------------------------
Some excerpts are rows from the "Permitted, Conditional, and Prohibited Uses"
or "Site Development Regulations" tables. Their columns are ALWAYS in this
fixed district order, even if the excerpt doesn't repeat the header:
{_AUSTIN_DISTRICT_COLUMNS}
P = Permitted, C = Conditional Use Permit (needs a public hearing / Land Use
Commission approval), — = Not permitted. A footnote number after a use name
(e.g. "Restaurant (General) 11") refers to a numbered endnote elsewhere in the
same section that may impose additional conditions — flag when you see one,
even if its exact text wasn't retrieved.

RULES
-----
1. If a VERIFIED TABLE LOOKUP block is present in the user message, its P/C/—
   value is ground truth for that use and district — state it as the answer.
   Do NOT re-derive or second-guess a P/C/— determination by reading the raw
   table text yourself: manually counting a value's position across a
   38-column table is exactly the failure mode the verified lookup exists to
   prevent. Use the retrieved excerpts only to explain context, definitions,
   footnote conditions, or additional requirements around that use — never to
   override the verified value.
2. When no verified lookup is present, ground every substantive claim in a
   retrieved excerpt and cite it inline as (§ 25-2-XXX). Never state a P/C/—
   determination you can't point to directly in the excerpts, and never
   infer one by counting table columns yourself.
3. If neither a verified lookup nor the excerpts contain enough to answer
   (e.g. the property's actual zoning district isn't stated, or the use
   wasn't matched), say what's missing and what the user should check next —
   do not guess.
4. A "conditional" (C) use is not equivalent to prohibited: explain briefly
   that it can be built but needs a conditional use permit / public hearing.
5. This is informational only, not legal advice — a real permit application
   must be verified against the current code and confirmed with the City of
   Austin Development Services Department. Say so briefly if the answer
   could plausibly lead to a real construction decision.
6. Be direct and concrete. Lead with the answer (yes / no / conditionally /
   depends on X), then the supporting citations.

Respond in plain prose (not JSON) — a few short paragraphs at most."""


def zoning_qa_user_prompt_v1(
    *,
    question: str,
    excerpts: list[dict],
    zoning_district: str | None = None,
    address: str | None = None,
    table_lookups: list[dict] | None = None,
) -> str:
    """
    Build the user-turn prompt for a grounded zoning Q&A call.

    Parameters
    ----------
    question : str
        The operator's free-form question, e.g. "Can I open a bar here?"
    excerpts : list[dict]
        Retrieved chunks from zoning_rag.retrieve(), each with at least
        "citation", "title", and "text" keys.
    zoning_district : str | None
        The property's zoning district code (e.g. "CS-1"), if known.
    address : str | None
        Human-readable address, for context only.
    table_lookups : list[dict] | None
        Deterministic P/C/— values from zoning_tables.lookup() for the
        matched use(s) in `zoning_district` — see app/services/zoning_tables.py
        for why this bypasses letting the model read the raw table itself.

    Returns
    -------
    str
        Formatted prompt string ready to pass as the "user" role message.
    """
    context_lines = []
    if address:
        context_lines.append(f"Property address : {address}")
    if zoning_district:
        context_lines.append(f"Known zoning district : {zoning_district}")
    context_block = ("\n".join(context_lines) + "\n\n") if context_lines else ""

    lookup_block = ""
    if table_lookups:
        rows = "\n".join(
            f"  - \"{r['use']}\" in {r['district']}: {r['value']} ({r['meaning']}) — § 25-2-491"
            for r in table_lookups
        )
        lookup_block = f"\nVERIFIED TABLE LOOKUP (ground truth — see system rules)\n---------------------------------------------------------\n{rows}\n"

    excerpts_block = "\n\n".join(
        f"--- Excerpt {i + 1} (§ {e.get('citation', '?')} - {e.get('title', '')}) ---\n{e.get('text', '')}"
        for i, e in enumerate(excerpts)
    )
    if not excerpts_block:
        excerpts_block = "(No relevant excerpts were retrieved for this question.)"

    return f"""\
{context_block}QUESTION
--------
{question}
{lookup_block}
RETRIEVED ZONING CODE EXCERPTS (Austin, TX — Land Development Code, Ch. 25-2)
------------------------------------------------------------------------------
{excerpts_block}

Answer the question using only the verified lookup (if present) and the
excerpts above, following the rules in your system instructions."""
