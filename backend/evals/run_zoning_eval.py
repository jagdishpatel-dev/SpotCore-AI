"""
Zoning answer accuracy eval
===========================
Scores zoning pipelines against the hand-verified golden set in
evals/zoning_golden.json (Austin § 25-2-491 permitted-use questions).

Modes
-----
table     Rules engine only: zoning_tables.pre_screen_status(). Offline. (Before
          2026-10-01 this was the plain top lookup match; that baseline is archived
          in results/baseline/.)
rag_only  Retrieved code excerpts + LLM, WITHOUT the verified table lookup — the
          pipeline before zoning_tables.py existed (the LLM reads raw table text).
hybrid    Retrieved excerpts + verified table lookup + LLM, where the LLM decides
          the status (V1 prompt) — production before 2026-10-01.
v2        Production today: status from pre_screen_status(), LLM explains it (V2
          prompt). Also checks whether the LLM's prose agrees with that status.

Both LLM modes see the exact same retrieved excerpts per case (retrieval is cached),
so the only difference between them is whether the verified lookup is present.

Each LLM answer is asked to end with a machine-readable "STATUS: ..." line so it
can be scored; this suffix is the only change from the production prompt.

Metrics
-------
status accuracy      predicted permitted / conditional / not_permitted / unclear == expected
overconfident errors wrong AND not "unclear" — the system stated a definite answer
                     that is wrong. This is the failure that matters most for a
                     pre-screen product: an "unclear" costs the user a phone call,
                     a confident wrong answer can cost them a lease.
use match (table)    top matched table row is one of the acceptable uses
cites § 25-2-491     answer text cites the use-table section (LLM modes)

Usage (from backend/)
---------------------
    .venv/bin/python -m evals.run_zoning_eval --mode table
    .venv/bin/python -m evals.run_zoning_eval --mode rag_only hybrid --delay 3
    .venv/bin/python -m evals.run_zoning_eval --mode all --limit 10

LLM results are cached per case in evals/results/ so an interrupted or
rate-limited run resumes where it stopped; pass --fresh to re-run everything.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import threading
import time
from collections import defaultdict
from pathlib import Path

from app.services import zoning_tables

EVAL_DIR = Path(__file__).resolve().parent
CASE_SETS = {"golden": EVAL_DIR / "zoning_golden.json", "holdout": EVAL_DIR / "zoning_holdout.json"}
# Reassigned in main(): results/<run name>/<case set>/
RESULTS_DIR = EVAL_DIR / "results" / "latest" / "golden"
RETRIEVAL_CACHE = RESULTS_DIR / "retrieval_cache.json"

ALL_MODES = ("table", "rag_only", "hybrid", "v2")
STATUSES = ("permitted", "conditional", "not_permitted", "unclear")

_STATUS_SUFFIX = """

FORMAT REQUIREMENT FOR THIS RESPONSE
After your answer, end with exactly one final line in this form:
STATUS: PERMITTED | CONDITIONAL | NOT_PERMITTED | UNCLEAR
Use UNCLEAR if the answer depends on an endnote, a missing fact, or anything
you cannot verify from the lookup or excerpts."""

_STATUS_RE = re.compile(r"STATUS:\s*\**\s*(PERMITTED|CONDITIONAL|NOT[_ ]PERMITTED|UNCLEAR)", re.IGNORECASE)


def parse_status(answer: str) -> str | None:
    matches = _STATUS_RE.findall(answer)
    if not matches:
        return None
    return matches[-1].lower().replace(" ", "_")


# ---------------------------------------------------------------------------
# Predictors
# ---------------------------------------------------------------------------

def predict_table(case: dict) -> dict:
    pre = zoning_tables.pre_screen_status(case["question"], case["district"])
    return {"status": pre["status"], "reason": pre["reason"], "matched_use": pre["matched_use"], "value": pre["value"]}


def _retrieve_cached(case: dict, cache: dict) -> list[dict]:
    from app.services import zoning_rag

    if case["id"] not in cache:
        cache[case["id"]] = zoning_rag.retrieve(case["question"], jurisdiction="austin_tx", k=6)
        RETRIEVAL_CACHE.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
    return cache[case["id"]]


def predict_v2(case: dict, retrieval_cache: dict) -> dict:
    from app.services.ai_consultant import _chat_completion, _strip_thought_tags, build_zoning_messages

    excerpts = _retrieve_cached(case, retrieval_cache)
    messages, pre = build_zoning_messages(case["question"], excerpts, zoning_district=case["district"])
    messages[-1]["content"] += _STATUS_SUFFIX
    response = _chat_completion(messages=messages, temperature=0)
    answer = _strip_thought_tags(response.choices[0].message.content or "")
    llm_status = parse_status(answer)
    return {
        "status": pre["status"],
        "reason": pre["reason"],
        "matched_use": pre["matched_use"],
        "llm_status": llm_status,
        "llm_agrees": llm_status == pre["status"],
        "model": response.model,
        "cites_491": "25-2-491" in answer,
        "answer": answer,
    }


def predict_llm(case: dict, mode: str, retrieval_cache: dict) -> dict:
    from app.prompts.zoning_qa import ZONING_QA_SYSTEM_PROMPT_V1, zoning_qa_user_prompt_v1
    from app.services.ai_consultant import _chat_completion, _strip_thought_tags

    if mode == "v2":
        return predict_v2(case, retrieval_cache)
    excerpts = _retrieve_cached(case, retrieval_cache)
    district = case["district"]
    table_lookups = (
        zoning_tables.lookup(case["question"], district) if mode == "hybrid" and district else []
    )
    user_msg = zoning_qa_user_prompt_v1(
        question=case["question"],
        excerpts=excerpts,
        zoning_district=district,
        table_lookups=table_lookups,
    )
    response = _chat_completion(
        messages=[
            {"role": "system", "content": ZONING_QA_SYSTEM_PROMPT_V1},
            {"role": "user", "content": user_msg + _STATUS_SUFFIX},
        ],
        temperature=0,
    )
    answer = _strip_thought_tags(response.choices[0].message.content or "")
    return {
        "status": parse_status(answer),
        "model": response.model,
        "cites_491": "25-2-491" in answer,
        "answer": answer,
    }


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------


_CASE_DEADLINE_S = 120.0


def _call_with_deadline(fn, *args, deadline_s: float = _CASE_DEADLINE_S):
    """Run fn(*args) in a daemon thread and give up after deadline_s of wall-clock time.

    The client's httpx timeout only bounds the gap between received bytes, and
    OpenRouter keeps slow requests alive with whitespace padding, so a stalled
    provider can hold one call open indefinitely. A daemon thread is abandoned
    on timeout rather than joined, so it can't block the run or interpreter exit.
    """
    result: dict = {}

    def target() -> None:
        try:
            result["value"] = fn(*args)
        except Exception as exc:  # noqa: BLE001 - re-raised in the caller's thread
            result["error"] = exc

    thread = threading.Thread(target=target, daemon=True)
    thread.start()
    thread.join(deadline_s)
    if thread.is_alive():
        raise TimeoutError(f"no answer within {deadline_s:.0f}s")
    if "error" in result:
        raise result["error"]
    return result["value"]


def _load_cached_results(mode: str) -> dict[str, dict]:
    path = RESULTS_DIR / f"{mode}.jsonl"
    if not path.exists():
        return {}
    rows = (json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip())
    return {r["id"]: r for r in rows}


def run_mode(mode: str, cases: list[dict], *, fresh: bool, delay: float) -> list[dict]:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    if mode == "table":
        rows = [{"id": c["id"], **predict_table(c)} for c in cases]
        (RESULTS_DIR / "table.jsonl").write_text(
            "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8"
        )
        return rows

    out_path = RESULTS_DIR / f"{mode}.jsonl"
    cached = {} if fresh else _load_cached_results(mode)
    if fresh and out_path.exists():
        out_path.unlink()
    retrieval_cache = json.loads(RETRIEVAL_CACHE.read_text(encoding="utf-8")) if RETRIEVAL_CACHE.exists() else {}

    rows = []
    for i, case in enumerate(cases, 1):
        if case["id"] in cached:
            rows.append(cached[case["id"]])
            continue
        print(f"[{mode}] {i}/{len(cases)} {case['id']}", file=sys.stderr)
        try:
            row = {"id": case["id"], **_call_with_deadline(predict_llm, case, mode, retrieval_cache)}
        except Exception as exc:  # noqa: BLE001 - record and keep going; a failed call is scored as wrong
            print(f"  error: {type(exc).__name__}: {exc}", file=sys.stderr)
            rows.append({"id": case["id"], "status": None, "error": f"{type(exc).__name__}: {exc}"})
            continue  # not cached, so the next run retries it
        with out_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
        rows.append(row)
        time.sleep(delay)
    return rows


def score(mode: str, cases: list[dict], rows: list[dict]) -> dict:
    by_id = {r["id"]: r for r in rows}
    totals: dict[str, dict] = defaultdict(lambda: defaultdict(int))
    failures = []
    for case in cases:
        row = by_id[case["id"]]
        for bucket in ("all", case["category"]):
            t = totals[bucket]
            t["n"] += 1
            correct = row.get("status") == case["expected_status"]
            t["correct"] += correct
            if not correct and row.get("status") in ("permitted", "conditional", "not_permitted"):
                t["overconfident"] += 1
            if row.get("status") is None:
                t["no_status"] += 1
            if mode == "v2":
                t["llm_agrees"] += bool(row.get("llm_agrees"))
            if mode == "table":
                if case["acceptable_uses"]:
                    t["use_match"] += row["matched_use"] in case["acceptable_uses"]
                else:
                    t["use_match"] += row["matched_use"] is None
            else:
                t["cites_491"] += bool(row.get("cites_491"))
        if row.get("status") != case["expected_status"]:
            failures.append((case, row))
    return {"totals": totals, "failures": failures}


def _pct(num: int, den: int) -> str:
    return f"{100 * num / den:5.1f}%" if den else "   n/a"


def print_report(mode: str, result: dict) -> None:
    totals, failures = result["totals"], result["failures"]
    extra = "use match" if mode == "table" else "cites §491"
    extra_key = "use_match" if mode == "table" else "cites_491"
    print(f"\n=== {mode} ===")
    print(f"{'category':<12} {'n':>3}  {'accuracy':>8}  {'overconfident':>13}  {extra:>10}")
    for bucket in ("all", "exact", "paraphrase", "unclear"):
        t = totals.get(bucket)
        if not t:
            continue
        print(
            f"{bucket:<12} {t['n']:>3}  {_pct(t['correct'], t['n']):>8}  "
            f"{t['overconfident']:>6} ({_pct(t['overconfident'], t['n']).strip()})  {_pct(t[extra_key], t['n']):>10}"
        )
    if mode == "v2":
        t = totals["all"]
        print(f"  LLM explanation agrees with the rules-engine status: {_pct(t['llm_agrees'], t['n']).strip()}")
    if totals["all"]["no_status"]:
        print(f"  ({totals['all']['no_status']} answers had no parseable STATUS line or errored — scored wrong)")
    if failures:
        print("  misses:")
        for case, row in failures:
            got = row.get("status") or row.get("error", "no status")
            detail = f"  matched={row['matched_use']!r} reason={row.get('reason')}" if mode == "table" else ""
            print(f"    {case['id']:<11} expected={case['expected_status']:<13} got={got}{detail}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--mode", nargs="+", default=["table"], choices=[*ALL_MODES, "all"])
    parser.add_argument("--set", dest="case_set", choices=sorted(CASE_SETS), default="golden")
    parser.add_argument("--run-name", default="latest", help="Results go to results/<run name>/<set>/.")
    parser.add_argument("--limit", type=int, default=None, help="Only run the first N cases.")
    parser.add_argument("--category", choices=["exact", "paraphrase", "unclear"], default=None)
    parser.add_argument("--fresh", action="store_true", help="Ignore cached LLM results.")
    parser.add_argument("--delay", type=float, default=2.0, help="Seconds between LLM calls (free-tier rate limits).")
    args = parser.parse_args()

    global RESULTS_DIR, RETRIEVAL_CACHE
    RESULTS_DIR = EVAL_DIR / "results" / args.run_name / args.case_set
    RETRIEVAL_CACHE = RESULTS_DIR / "retrieval_cache.json"

    cases = json.loads(CASE_SETS[args.case_set].read_text(encoding="utf-8"))["cases"]
    if args.category:
        cases = [c for c in cases if c["category"] == args.category]
    if args.limit:
        cases = cases[: args.limit]
    modes = ALL_MODES if "all" in args.mode else args.mode

    summary = {}
    for mode in modes:
        result = score(mode, cases, run_mode(mode, cases, fresh=args.fresh, delay=args.delay))
        print_report(mode, result)
        summary[mode] = {bucket: dict(t) for bucket, t in result["totals"].items()}

    (RESULTS_DIR / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
