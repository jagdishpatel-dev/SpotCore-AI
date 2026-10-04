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
V2 - the permitted/conditional/not-permitted status is decided in code
     (zoning_tables.pre_screen_status) and handed to the model as fixed; the model
     only explains it. The evals in backend/evals/ showed V1 models inventing table
     cells when the lookup found no match and upgrading endnote-qualified cells to a
     confident answer. V1 is kept so that baseline stays reproducible.
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


# ---------------------------------------------------------------------------
# V2 — status decided by the rules engine, model explains only
# ---------------------------------------------------------------------------

ZONING_QA_SYSTEM_PROMPT_V2: str = """\
You are a zoning code research assistant for SpotCore AI. You explain a zoning
pre-screen result to a business owner or real estate professional.

JURISDICTION SCOPE (pilot)
---------------------------
Austin, TX — Land Development Code, Chapter 25-2 (Zoning) only. If a question
needs anything outside this scope, say so instead of guessing.

RULES
-----
1. The PRE-SCREEN STATUS block in the user message was decided by SpotCore's
   rules engine from the § 25-2-491 use table. Lead with that status in plain
   words. Never contradict it, soften it into something else, or upgrade it.
2. If the status is UNCLEAR, explain why using the reason given, and say what
   the user should confirm next (for example which use category their business
   falls under, the endnote's conditions, or the property's zoning district).
   Do NOT state or imply that the use is permitted, conditional, or prohibited —
   not even if an excerpt seems to suggest it. Never work out a status by reading
   rows of a use table yourself.
3. Use the retrieved excerpts only for context around the status: definitions,
   conditions, size limits, endnotes, and other requirements. Cite each claim
   inline as (§ 25-2-XXX). If the excerpts don't cover something, say so.
4. A conditional (C) use is not prohibited: it needs a conditional use permit,
   which involves a public hearing and Land Use Commission approval.
5. This is a preliminary pre-screen, not legal advice. Say briefly that the user
   should confirm with the City of Austin Development Services Department before
   making a decision.
6. Be direct and concrete: a few short paragraphs of plain prose, no JSON."""


_STATUS_LABELS = {
    "permitted": "PERMITTED",
    "conditional": "CONDITIONAL (conditional use permit required)",
    "not_permitted": "NOT PERMITTED",
    "unclear": "UNCLEAR",
}


_OVERLAY_EFFECT_TEXT = {
    "restricts": "can prohibit uses or make permitted uses conditional on this specific property",
    "modifies": "can add or remove allowed uses on this specific property",
    "adds_residential": "can allow residential uses the base district does not",
    "adds_uses": "can allow uses the base district does not",
    "adds_non_etod": "allows uses not prohibited by the ETOD district",
    "unknown": "is not modeled by SpotCore",
}


def _overlay_reason(pre: dict) -> str:
    changed = [n for n in pre.get("overlay_notes", []) if n["changed"] and n["effect"] != "modeled"]
    parts = [
        f"{n['code']} ({n['citation'] or 'not modeled'}) {_OVERLAY_EFFECT_TEXT.get(n['effect'], 'is not modeled')}"
        for n in changed
    ]
    cases = pre.get("case_numbers") or []
    case_text = f" Check the ordinance for zoning case{'s' if len(cases) > 1 else ''} {', '.join(cases)}." if cases else ""
    return (
        f"The base-district answer would be decided by the § 25-2-491 table, but the parcel's overlay "
        f"{'; '.join(parts)}. SpotCore does not read parcel-specific zoning ordinances yet.{case_text}"
    )


def _etod_reason(pre: dict) -> str:
    use = pre.get("matched_use")
    if pre.get("status") == "not_permitted":
        return (
            f'"{use}" is a prohibited use on property with ETOD combining district zoning (§ 25-2-653(D)), '
            "which governs over the base-district table (§ 25-2-653(B))."
        )
    return (
        f'"{use}" is a conditional use on property with ETOD combining district zoning when the base '
        "zoning permits it (§ 25-2-653(E))."
    )


def _pre_screen_reason(pre: dict) -> str:
    district = pre.get("district") or "the property's district"
    use, value = pre.get("matched_use"), pre.get("value")
    if pre.get("reason") == "overlay_not_modeled":
        return _overlay_reason(pre)
    if pre.get("reason") == "overlay_table":
        return _etod_reason(pre)
    return {
        "table": f'"{use}" is marked "{value}" for {district} in the § 25-2-491 use table.',
        "endnote": (
            f'"{use}" is marked "{value}" for {district} in the § 25-2-491 use table. That cell '
            "depends on a numbered endnote whose conditions SpotCore does not evaluate yet."
        ),
        "ambiguous_match": (
            f"The business could fall under more than one listed use ({', '.join(pre.get('candidates', []))}), "
            f"and those uses have different statuses in {district}."
        ),
        "no_confident_match": (
            "The business type did not match any use listed in § 25-2-491 closely enough to "
            "determine a status."
        ),
        "unknown_district": f'"{district}" is not a zoning district column in the § 25-2-491 use table.',
        "no_district": "The property's zoning district was not provided.",
        "unrecognized_zoning_code": (
            f'The zoning on record ("{pre.get("zoning_code")}") does not reduce to a current base district '
            "in the § 25-2-491 table (it may be a pre-1980s code)."
        ),
        "conflicting_zoning_records": (
            "The city's zoning records at this location list different base districts "
            f"({', '.join(pre.get('candidates', []))})."
        ),
    }.get(pre.get("reason", ""), "The rules engine could not determine a status.")


def zoning_qa_user_prompt_v2(
    *,
    question: str,
    excerpts: list[dict],
    pre_screen: dict,
    zoning_district: str | None = None,
    address: str | None = None,
) -> str:
    """
    Build the user-turn prompt for the V2 zoning Q&A call.

    `pre_screen` is the dict returned by zoning_tables.pre_screen_status(); its
    status is stated as fixed so the model explains it rather than re-deriving it.
    """
    context_lines = []
    if address:
        context_lines.append(f"Property address : {address}")
    if zoning_district:
        source = {"parcel": " (city zoning records for this location)", "user": " (provided by the user)"}.get(
            pre_screen.get("district_source", ""), ""
        )
        context_lines.append(f"Zoning : {zoning_district}{source}")
    context_block = ("\n".join(context_lines) + "\n\n") if context_lines else ""

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

PRE-SCREEN STATUS (decided by SpotCore's rules engine — see system rules)
-------------------------------------------------------------------------
Status : {_STATUS_LABELS.get(pre_screen.get("status", "unclear"), "UNCLEAR")}
Reason : {_pre_screen_reason(pre_screen)}

RETRIEVED ZONING CODE EXCERPTS (Austin, TX — Land Development Code, Ch. 25-2)
------------------------------------------------------------------------------
{excerpts_block}

Explain this pre-screen result to the user, following the rules in your system
instructions."""
