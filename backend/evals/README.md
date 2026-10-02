# Zoning accuracy evals

Measures how often SpotCore gives the **correct permitted-use status** for a business in an
Austin zoning district, and how often it is **confidently wrong**.

## Golden set — `zoning_golden.json`

53 questions, each with an expected answer hand-checked against the raw
§ 25-2-491 Zoning Use Summary Table (`source_line` points to the row in
`app/data/zoning/austin_tx/ch25-2_subchapter_c_art2.txt`).

| category     | what it tests                                                                 |
|--------------|-------------------------------------------------------------------------------|
| `exact`      | question uses the code's own use name ("Cocktail Lounge in CS-1")             |
| `paraphrase` | everyday wording a real user types ("bar", "liquor store", "payday lender")   |
| `unclear`    | the only correct answer is `unclear`: endnote-qualified cells, uses not in the table, unknown or missing district |

Status mapping: `P` → permitted, `C` → conditional, `—` → not_permitted, anything
else (endnote numbers, `P5`, `PC`) → unclear, since those depend on conditions
SpotCore does not model yet.

## Running

From `backend/`:

```bash
pip install -r requirements-dev.txt
python -m pytest                                        # unit tests, offline, <1s
python -m evals.run_zoning_eval --mode table            # deterministic lookup, offline
python -m evals.run_zoning_eval --mode all --delay 2    # + LLM modes (needs OPENROUTER_API_KEY)
```

LLM results are cached per case in `evals/results/` (git-ignored) so a
rate-limited run resumes; `--fresh` re-runs everything.

## Modes

- **table** — `zoning_tables.lookup()` top match only.
- **rag_only** — retrieved code excerpts + LLM, without the verified lookup (the original design).
- **hybrid** — excerpts + verified lookup + LLM (production `get_zoning_answer()`).

The two LLM modes see identical retrieved excerpts per case, so the only variable is
whether the deterministic lookup is in the prompt.

## Headline metric

**Overconfident errors**: answers that are wrong *and* not `unclear`. For a pre-screen
product, `unclear` costs the user a call to the city; a confident wrong answer can cost
them a lease. This number should trend to zero before accuracy is optimized further.

## Results — 2026-10-01

Two runs on the same day: **before** (LLM decides the status, V1 prompt) and
**after** (rules engine decides the status, LLM explains it, V2 prompt). Raw
results: `results/baseline/` and `results/latest/` (git-ignored).

### Golden set (53)

| pipeline                          | accuracy | confident wrong |
|-----------------------------------|---------:|----------------:|
| LLM only (`rag_only`)             | 26.4%    | 9               |
| Table lookup, word overlap        | 71.7%    | 2               |
| Lookup + LLM decides (`hybrid`)   | 64.2%    | 9               |
| **Rules engine decides (`table`/`v2`)** | **98.1%** | **0**     |

### Holdout set (28): written before the alias list

| pipeline                          | accuracy | confident wrong |
|-----------------------------------|---------:|----------------:|
| Table lookup, word overlap        | 28.6%    | 6               |
| Lookup + LLM decides (`hybrid`)   | 25.0%    | 4               |
| **Rules engine decides (`table`/`v2`)** | **92.9%** | **0**     |

### What the before run showed
1. **The LLM can't read the 38-column table.** `rag_only` got 22% of exact-wording questions right.
2. **When the lookup misses, the LLM makes up a cell.** "Car wash in IP" → "the row shows a 'P'"; the real cell is "—".
3. **Weak word overlap produced confident wrong answers.** "Coffee shop" matched Pawn Shop Services on "shop".
4. **The LLM resolved endnote cells.** `PC` / `P5` / `11` came back as "conditional" or "permitted".

### What changed (`app/services/zoning_tables.py`, `app/prompts/zoning_qa.py` V2)
- `use_aliases.json`: everyday names → table uses. Ambiguous words are left out on purpose.
- `pre_screen_status()`: a status only from a full use-name match or an alias; partial
  overlap, ambiguous matches with different answers, endnote cells, and unknown or missing
  districts all return `unclear` with a reason.
- `get_zoning_answer()` returns `status`, `status_reason`, `matched_use`, `table_value`
  from code. The LLM gets the status as fixed and only explains it. The status is
  returned even when the LLM call fails.

### LLM explanation vs. rules-engine status (`v2`)
The LLM's prose agreed with the code-decided status in 78 of 81 answers (96.3%). In all 3
disagreements the LLM was more cautious ("unclear") and never stated a different definite answer.
One of those three exposed a real gap. For "Pawn Shop Services in GR" the base table says P, but
§ 25-2-645 (East Austin overlay) makes uses that are permitted in GR but not in LR conditional.
**Overlay districts aren't modeled yet**, which is the next fix.

### Limits
- The holdout was written before the alias list, but by the same author, so it isn't blind.
  Real user queries are the next test.
- Two labels were corrected while reviewing the source, before the after run: `para-25`
  (daycare in IP is ambiguous, General = C / Limited = P → unclear) and `hold-27`
  (garden center → Plant Nursery, C).
- All remaining misses return `unclear` (e.g. "restaurant in GR", where both restaurant uses are
  P). They were not patched after seeing the holdout.
- Free-tier LLM routing varies by call, so the before LLM numbers are noisy. The after status
  doesn't depend on the LLM.
