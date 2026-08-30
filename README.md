# SpotCore AI (MVP)

SpotCore AI is a small **rules-based** web tool that helps answer:

> “Is this location good for opening this type of business?”

It combines **OpenStreetMap / Overpass** (nearby businesses + transit proxies), **U.S. Census ACS** (tract demographics), and a **transparent scoring engine** (not ML).

## Repo layout

```
spotcore-ai/
  backend/          # FastAPI service
  frontend/         # SvelteKit + Tailwind + Leaflet UI
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
