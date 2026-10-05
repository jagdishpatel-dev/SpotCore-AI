# SpotCore AI (MVP)

SpotCore AI is a small **rules-based** web tool that helps answer:

> “Is this location good for opening this type of business?”

It combines **OpenStreetMap / Overpass** (nearby businesses + transit proxies), **U.S. Census ACS** (tract demographics), and a **transparent scoring engine** (not ML).

It also runs a **zoning pre-screen** for Austin, TX: given an address and a business type, it returns the zoning district, a likely permission status (permitted / conditional / not permitted / unclear), the code sections behind it, and next steps.

**Live demo:** [spotcore.jagdishpatel.tech](https://spotcore.jagdishpatel.tech) · [sample report (Highland, Austin)](https://spotcore.jagdishpatel.tech/sample)

## Zoning accuracy research

**Question:** can an LLM be trusted to say whether a business is allowed at an address? For a pre-screen product, a confident wrong answer can cost someone a lease, while "unclear" only costs them a call to the city. So the main metric is **overconfident errors**: answers that are wrong *and* not "unclear".

### Method
- **Golden set: 53 questions**, each answer hand-checked against the Austin Land Development Code use table (§ 25-2-491), with a pointer to the exact source row. Three kinds: the code's own wording (18), everyday paraphrases like "bar" or "payday lender" (26), and cases where the only correct answer is "unclear" (9).
- **Holdout set: 28 questions**, written before the alias list was built, to check the fix wasn't tuned to the golden set.
- **Overlay set: 24 cases** for parcels whose zoning stacks overlays on the base district (e.g. `CS-MU-CO-ETOD-DBETOD-NP`).
- Every pipeline sees the **same retrieved code excerpts** per question, so the only variable is who decides the status.

### Results

| Pipeline | Golden (53) accuracy | Golden confident-wrong | Holdout (28) accuracy | Holdout confident-wrong |
|---|---:|---:|---:|---:|
| LLM only (retrieval + LLM) | 26.4% | 9 | n/a | n/a |
| LLM decides, with table lookup in the prompt | 64.2% | 9 | 25.0% | 4 |
| Table lookup, word overlap | 71.7% | 2 | 28.6% | 6 |
| **Rules engine decides, LLM only explains** | **98.1%** | **0** | **92.9%** | **0** |

Overlay set: the base-district-only engine was 25.0% accurate with **18** confident-wrong answers. The overlay-aware engine is 100% with **0**. (These cases came from the same reading of the code as the implementation, so treat 100% as a consistency check; the citywide numbers below don't depend on them.)

### What the research found
1. **The LLM couldn't read the 38-column use table.** It got 22% of exact-wording questions right.
2. **When the lookup missed, the LLM made up a cell.** "Car wash in IP" came back as "the row shows a P"; the real cell is "—".
3. **Loose word matching was dangerous.** "Coffee shop" matched *Pawn Shop Services* on the word "shop".
4. **Overlays change the answer citywide.** Across all 9,373 Austin zoning polygons, 76.5% carry at least one overlay and 45.5% carry a conditional overlay (CO). For "coffee shop", a base-only answer would have been overconfident on 59.8% of polygons. For "gas station", it was definitely wrong on 486 polygons, which the ETOD overlay prohibits.

### What changed in the product
- **Status is decided by code, not the LLM.** `pre_screen_status()` only returns a definite status on a full use-name or alias match. Partial matches, endnote-qualified cells, unknown districts, and unmodeled overlays all return **"unclear" with a reason**.
- **The LLM only explains** a status it's handed. Its prose agreed with the code in 78 of 81 answers. In the other 3 it was *more* cautious, never contradicting with a different definite answer.
- **Overlays are applied** (ETOD Tables D/E, § 25-2-653) or flagged "unclear" when they can change the answer (CO § 25-2-332, NCCD, …).
- **Address-based lookup** reads the zoning on record at the parcel instead of trusting a user-typed district. It caught a demo preset labeled CS-1 that is actually `CS-MU-CO-ETOD-DBETOD-NP`.

### Limits
- Golden and holdout sets were written by the same author, so they aren't blind. Real user queries are the next test.
- About half of overlay-affected answers are now "unclear". That's the cost of not guessing; reading each parcel's CO ordinance is the way to reduce it.
- Every remaining miss returns "unclear", not a wrong answer.

**Reproduce** (from `backend/`, offline, no API key):

```bash
python -m evals.run_zoning_eval --set golden --mode table
python -m evals.run_zoning_eval --set holdout --mode table
python -m evals.run_zoning_eval --set overlays --mode base_only table
```

Full method, per-category tables, and the LLM-mode runs are in [`backend/evals/README.md`](backend/evals/README.md).

## Repo layout

```
spotcore-ai/
  backend/          # FastAPI service
  frontend/         # React + Vite + Tailwind + Leaflet UI
  docs/
    sample_api_response.json
  .env.example
```

## Prerequisites

- Python **3.11+**
- Node **20+** (recommended)

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env    # optional: customize values
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

### Environment variables (backend)

See `../.env.example`. Highlights:

- `CENSUS_API_KEY` — recommended for reliable ACS calls ([key signup](https://api.census.gov/data/key_signup.html)).
- `NOMINATIM_USER_AGENT` — **required** by Nominatim policy (set to your contact info). This string is also reused as the HTTP `User-Agent` for Overpass requests.
- `USE_MOCK_ON_FAILURE` — if `true`, the API returns deterministic mock output when upstream calls fail.
- `GOOGLE_GEOCODING_API_KEY` — **required** for `POST /trends-area-demand` (Google Geocoding JSON API; Trends uses `pytrends`, no separate Trends API key).

### Geocoding + Overpass notes

- The backend tries **Nominatim first**, then falls back to **Photon (Komoot)** if Nominatim rejects the request (common for some automated/datacenter IPs).
- **Overpass** responses can take **15–60s** depending on public instance load. The API response field `data_sources.geocoder` will be `nominatim` or `photon`.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

In dev, the UI calls the API through a Vite proxy (`/api` → `http://127.0.0.1:8000`). Start **both** servers for the full flow.

### Environment variables (frontend)

- `VITE_API_BASE_URL` — optional. If unset in dev, requests go to `/api` (proxy).
- For a production build pointed at a remote API, set `VITE_API_BASE_URL` to your FastAPI origin (no trailing slash).

## API

### `GET /health`

Returns `{ "status": "ok", "service": "spotcore-ai" }`.

### `GET /suggest-address`

Query params:

- `q` — partial address (Photon is called server-side; results are LRU-cached).
- `limit` — optional, default `6`, max `10`.

Example:

```bash
curl -s "http://127.0.0.1:8000/suggest-address?q=208th%20st%20queens&limit=5" | jq .
```

### `POST /trends-area-demand`

Area-level **Google Trends** interest (via `pytrends`) for one or more keywords, using **Google Geocoding** to resolve the address to structured location and a **Trends-compatible `geo`** (state / country / DMA — never a raw street).

- **Requires** `GOOGLE_GEOCODING_API_KEY` on the server.
- **Body:** `{ "address": "...", "keywords": ["coffee", "bubble tea"], "timeframe": "today 3-m" }`
  - `timeframe` optional: `today 3-m` (default), `today 12-m`, `today 5-y`, `now 7-d`
  - Up to **5** keywords.
- **Response:** `disclaimer`, `geocode` (structured fields), `trends_geo`, `trends_resolution`, `regions[]` with relative **0–100** scores per keyword, sorted by the **first** keyword.

```bash
curl -s http://127.0.0.1:8000/trends-area-demand \
  -H 'Content-Type: application/json' \
  -d '{"address":"86-16 208th St, Queens Village, NY","keywords":["coffee shop","pizza"],"timeframe":"today 3-m"}' \
  | jq .
```

Google Trends can return **429** if queried too often; wait and retry.

### `POST /analyze-site`

Example:

Request JSON fields: `address`, `business_type`, optional `budget`, optional `radius_m` (100–2000 meters for Overpass; omit to use server default `OVERPASS_RADIUS_M`).

```bash
curl -s http://127.0.0.1:8000/analyze-site \
  -H 'Content-Type: application/json' \
  -d '{"address":"86-16 208th St, Queens Village, NY","business_type":"coffee shop","budget":5000,"radius_m":750}' \
  | jq .
```

A documented sample JSON payload lives in `docs/sample_api_response.json`.

## Scoring notes (intentionally simple)

Sub-scores are documented in `backend/app/services/scoring.py`. The **total** is a weighted blend of:

- **Demand** — tract population + nearby commercial POI density (with a vacancy penalty when available).
- **Competition** — fewer mapped direct competitors → higher score.
- **Accessibility** — subway + bus/platform proximity from OSM (coverage varies).
- **Demographic fit** — coarse keyword heuristics vs income / education / age.
- **Cost fit** — only if `budget` is provided; a rough affordability check vs tract income.

## Data limitations (read this once)

- OSM is **community-mapped**; omissions do not imply “no competition.”
- Census is **tract-level**, not storefront-level.
- Transit tagging around NYC can be **inconsistent**; always validate on the ground.

## License

Prototype / MVP — set a license when you productize.
