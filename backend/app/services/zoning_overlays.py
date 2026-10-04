"""
Combining / overlay districts on top of the § 25-2-491 base-district status.

A parcel's zoning code is a base district plus overlay suffixes, e.g.
"CS-MU-CO-ETOD-DBETOD-NP". The use table only covers the base district, and
overlays can change the answer: a conditional overlay (CO) — on ~46% of Austin's
zoning polygons — can prohibit uses the base district permits (§ 25-2-332).

Each overlay is handled by what the code says it can do to uses:

  modeled            ETOD: § 25-2-653 Tables D and E are applied exactly. ETOD
                     governs over conflicting provisions unless they are more
                     restrictive (§ 25-2-653(B)), so a Table D prohibition is
                     final whatever other overlays the parcel has.
  restricts          CO: may only make uses MORE restrictive (§ 25-2-332(A)), so
                     "not_permitted" stays; permitted/conditional become unclear.
  modifies           NCCD, PDA, CURE: may add or remove uses -> unclear.
  adds_residential   MU, V, DB90: allow residential uses -> a residential
                     "not_permitted" becomes unclear.
  adds_uses          NP, H, HD: can allow additional uses -> any
                     "not_permitted" becomes unclear.
  adds_non_etod      DBETOD: permits uses not prohibited by ETOD (§ 25-2-653(G)(1)),
                     so a "not_permitted" becomes unclear unless ETOD Table D
                     prohibits the use.
  unknown            anything else (DDB400, UNO, typos like "C0") -> unclear.

Parcel-specific terms (which uses a CO prohibits) live in each zoning case's
ordinance, which SpotCore doesn't read yet, so those results return the case
number for the user to check.
"""

from __future__ import annotations

import json
import re
from functools import lru_cache

from app.services.zoning_tables import AUSTIN_DISTRICT_COLUMNS, DATA_DIR, load_use_table, pre_screen_status

_BASE_CODES = set(AUSTIN_DISTRICT_COLUMNS)

# code -> (effect, citation)
OVERLAY_RULES: dict[str, tuple[str, str]] = {
    "ETOD": ("modeled", "§ 25-2-653"),
    "CO": ("restricts", "§ 25-2-332"),
    "NCCD": ("modifies", "§ 25-2-371"),
    "PDA": ("modifies", "§ 25-2-441"),
    "CURE": ("modifies", "§ 25-2-312"),
    "MU": ("adds_residential", "§ 25-2-172"),
    "V": ("adds_residential", "§ 25-2-172"),
    "DB90": ("adds_residential", "§ 25-2-181(B)"),
    "NP": ("adds_uses", "§ 25-2-176"),
    "H": ("adds_uses", "§ 25-2-171"),
    "HD": ("adds_uses", "§ 25-2-171"),
    "DBETOD": ("adds_non_etod", "§ 25-2-653(G)"),
}

_FIRST_NON_RESIDENTIAL_USE = "Administrative and Business Offices"


def parse_zoning_code(code: str | None) -> tuple[str | None, list[str]]:
    """
    Split a zoning code into (base district, overlay codes), e.g.
    "CS-MU-CO-NP" -> ("CS", ["MU", "CO", "NP"]). The base is the longest leading
    run of segments that is a § 25-2-491 column ("CS-1-CO" -> "CS-1"). A code with
    no recognizable base (overlay-only records like "NP", or pre-1980s codes like
    "C-2-H") returns base None.
    """
    if not code or not code.strip():
        return None, []
    segments = code.strip().upper().split("-")
    base, rest = None, segments
    for i in range(len(segments), 0, -1):
        candidate = "-".join(segments[:i])
        if candidate in _BASE_CODES:
            base, rest = candidate, segments[i:]
            break
    overlays: list[str] = []
    for segment in rest:
        for token in re.split(r"[\s,&/]+", segment):
            if token and token not in _BASE_CODES and token not in overlays:
                overlays.append(token)
    return base, overlays


@lru_cache(maxsize=8)
def _etod_uses(jurisdiction: str = "austin_tx") -> tuple[frozenset[str], frozenset[str]]:
    path = DATA_DIR / jurisdiction / "etod_uses.json"
    if not path.exists():
        return frozenset(), frozenset()
    data = json.loads(path.read_text(encoding="utf-8"))
    return frozenset(data["prohibited"]), frozenset(data["conditional"])


@lru_cache(maxsize=8)
def residential_uses(jurisdiction: str = "austin_tx") -> frozenset[str]:
    """Use-table rows listed before the first commercial use (the table's residential block)."""
    names = list(load_use_table(jurisdiction))
    if _FIRST_NON_RESIDENTIAL_USE not in names:
        return frozenset()
    return frozenset(names[: names.index(_FIRST_NON_RESIDENTIAL_USE)])


def apply_overlays(pre: dict, overlays: list[str], jurisdiction: str = "austin_tx") -> dict:
    """
    Adjust a base-district pre-screen result (from pre_screen_status) for overlays.

    Adds "overlays" and "overlay_notes" ([{code, effect, citation, changed}]) and
    "citations" (the sections that decided the status).
    """
    status, use = pre["status"], pre["matched_use"]
    reason = pre["reason"]
    citations = ["§ 25-2-491"]
    notes = []
    etod_prohibits = False

    if "ETOD" in overlays and use:
        prohibited, conditional = _etod_uses(jurisdiction)
        changed = False
        if use in prohibited:
            etod_prohibits = True
            if status != "not_permitted":
                status, reason, changed = "not_permitted", "overlay_table", True
            citations += ["§ 25-2-653(B)", "§ 25-2-653(D)"]
        elif use in conditional and status == "permitted":
            status, reason, changed = "conditional", "overlay_table", True
            citations.append("§ 25-2-653(E)")
        notes.append({"code": "ETOD", "effect": "modeled", "citation": "§ 25-2-653", "changed": changed})

    for code in overlays:
        if code == "ETOD":
            if not use:
                notes.append({"code": code, "effect": "modeled", "citation": "§ 25-2-653", "changed": False})
            continue
        effect, citation = OVERLAY_RULES.get(code, ("unknown", ""))
        becomes_unclear = not etod_prohibits and (
            (effect == "restricts" and status in ("permitted", "conditional"))
            or (effect in ("modifies", "unknown") and status != "unclear")
            or (effect == "adds_residential" and status == "not_permitted" and use in residential_uses(jurisdiction))
            or (effect == "adds_uses" and status == "not_permitted")
            or (effect == "adds_non_etod" and status == "not_permitted" and use not in _etod_uses(jurisdiction)[0])
        )
        if becomes_unclear:
            status, reason = "unclear", "overlay_not_modeled"
        notes.append({"code": code, "effect": effect, "citation": citation, "changed": becomes_unclear})

    if reason == "overlay_not_modeled":
        citations = ["§ 25-2-491"]
    return {**pre, "status": status, "reason": reason, "overlays": list(overlays), "overlay_notes": notes, "citations": citations}


def pre_screen_zoning(query: str, zoning_code: str | None, jurisdiction: str = "austin_tx") -> dict:
    """
    Pre-screen status for `query` on a full zoning code ("CS-MU-CO-NP", or just "CS").

    Returns pre_screen_status()'s fields plus zoning_code, overlays, overlay_notes
    and citations.
    """
    code = (zoning_code or "").strip().upper()
    base, overlays = parse_zoning_code(code)
    if code and base is None:
        pre = pre_screen_status(query, None, jurisdiction)
        pre = {**pre, "reason": "unrecognized_zoning_code", "district": None}
        return {**pre, "zoning_code": code, "overlays": overlays, "overlay_notes": [], "citations": []}
    pre = pre_screen_status(query, base, jurisdiction)
    return {**apply_overlays(pre, overlays, jurisdiction), "zoning_code": code or None}


def pre_screen_request(
    query: str,
    zoning_district: str | None = None,
    parcel: dict | None = None,
    jurisdiction: str = "austin_tx",
) -> dict:
    """
    Pre-screen a question using the best zoning information available.

    `parcel` is zoning_geo.resolve_zoning_at_point()'s result. The zoning on record
    for the parcel wins over a user-supplied `zoning_district`; the user's district
    is used only when no parcel record was found (or the lookup failed). Records that
    disagree on the base district return unclear.

    Adds district_source ("parcel" | "user" | "none") and case_numbers.
    """
    if parcel and parcel.get("records"):
        if parcel.get("conflicting_bases"):
            pre = pre_screen_zoning(query, None, jurisdiction)
            return {
                **pre,
                "reason": "conflicting_zoning_records",
                "candidates": parcel["conflicting_bases"],
                "district_source": "parcel",
                "case_numbers": parcel.get("case_numbers", []),
            }
        code = parcel.get("zoning_code")
        if not code and zoning_district:
            # Only overlay-only records (e.g. "NP") here: keep the user's base, add the parcel's overlays.
            code = "-".join([zoning_district.strip().upper(), *parcel.get("overlays", [])])
        if code:
            return {
                **pre_screen_zoning(query, code, jurisdiction),
                "district_source": "parcel" if parcel.get("zoning_code") else "user",
                "case_numbers": parcel.get("case_numbers", []),
            }
    pre = pre_screen_zoning(query, zoning_district, jurisdiction)
    return {**pre, "district_source": "user" if zoning_district else "none", "case_numbers": []}
