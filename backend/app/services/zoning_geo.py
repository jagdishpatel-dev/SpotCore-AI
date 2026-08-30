"""
Live zoning district polygons for map rendering.

Sourced from the City of Austin's public GIS open-data API (Socrata dataset
xt8n-xrjg, "Zoning Ordinance" boundaries — https://data.austintexas.gov/d/xt8n-xrjg),
queried live per request rather than baked into the scraped text corpus:
polygon geometry has nothing to do with the legal-text RAG pipeline in
zoning_rag.py, and Austin's dataset is already the authoritative, current source.

Each polygon's raw district code (e.g. "CS-MU-NCCD-NP", a base district plus
combining/overlay suffixes) is reduced to a base code matching
zoning_tables.AUSTIN_DISTRICT_COLUMNS by progressively stripping trailing
"-SUFFIX" segments. Older parcels can carry pre-1980s codes (e.g. "C-2-H")
that don't reduce to any current base code — these are returned tagged
base_district=None, permission="unknown" rather than dropped, since the
polygon shape itself is still useful context on the map.
"""

from __future__ import annotations

import logging
import math

import httpx

from app.services.zoning_tables import AUSTIN_DISTRICT_COLUMNS, lookup as table_lookup

logger = logging.getLogger(__name__)

_SOCRATA_URL = "https://data.austintexas.gov/resource/xt8n-xrjg.geojson"
_KNOWN_BASE_CODES = set(AUSTIN_DISTRICT_COLUMNS)

# A weak fuzzy match mis-coloring an entire visible zone on the map is a much
# more visible/confident-looking mistake than a hedged sentence in the text
# Q&A, so map coloring requires a much stronger word-overlap match.
_MAP_MIN_MATCH_SCORE = 0.5

_PERMISSION_COLORS = {
    "permitted": "#22C55E",
    "conditional": "#F59E0B",
    "prohibited": "#EF4444",
    "unknown": "#6B7280",
}


def _extract_base_district(ztype: str) -> str | None:
    """Reduce a compound zoning code to a known base district by stripping
    trailing "-SEGMENT" suffixes, e.g. "CS-MU-NCCD-NP" -> "CS"."""
    if not ztype:
        return None
    segments = ztype.strip().upper().split("-")
    for i in range(len(segments), 0, -1):
        candidate = "-".join(segments[:i])
        if candidate in _KNOWN_BASE_CODES:
            return candidate
    return None


def _bbox_wkt(lat: float, lon: float, radius_m: float) -> str:
    dlat = radius_m / 111_320
    dlon = radius_m / (111_320 * max(0.15, abs(math.cos(math.radians(lat)))))
    min_lon, max_lon = lon - dlon, lon + dlon
    min_lat, max_lat = lat - dlat, lat + dlat
    return (
        f"POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, "
        f"{max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))"
    )


async def fetch_zoning_polygons(
    lat: float,
    lon: float,
    radius_m: float = 500,
    business_query: str | None = None,
    jurisdiction: str = "austin_tx",
    limit: int = 400,
) -> list[dict]:
    """
    Fetch zoning district polygons intersecting a bounding box around (lat, lon),
    each tagged with its base district and, if `business_query` is given, the
    permission status for that use.

    Returns a list of:
      {"geometry": <GeoJSON geometry>, "ztype": str, "base_district": str | None,
       "case_number": str | None, "permission": "permitted"|"conditional"|"prohibited"|"unknown",
       "color": "#hex", "matched_use": str | None}
    """
    params = {
        "$where": f"intersects(the_geom, '{_bbox_wkt(lat, lon, radius_m)}')",
        "$select": "the_geom,zoning_ordinance_ztype,case_number",
        "$limit": str(limit),
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(_SOCRATA_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            logger.error("zoning_geo.fetch_zoning_polygons error: %s", exc)
            return []

    features_out = []
    for feat in data.get("features", []):
        geometry = feat.get("geometry")
        if not geometry:
            continue
        props = feat.get("properties", {})
        ztype = props.get("zoning_ordinance_ztype", "") or ""
        base = _extract_base_district(ztype)

        permission = "unknown"
        matched_use = None
        if base and business_query:
            results = table_lookup(
                business_query, base, jurisdiction=jurisdiction, top_n=1, min_score=_MAP_MIN_MATCH_SCORE
            )
            if results:
                value = results[0]["value"]
                matched_use = results[0]["use"]
                if value == "P":
                    permission = "permitted"
                elif value == "C":
                    permission = "conditional"
                elif value == "—":
                    permission = "prohibited"
                # else: footnote refs / PC-CP combos / empty -> leave "unknown"

        features_out.append(
            {
                "geometry": geometry,
                "ztype": ztype,
                "base_district": base,
                "case_number": props.get("case_number"),
                "permission": permission,
                "color": _PERMISSION_COLORS[permission],
                "matched_use": matched_use,
            }
        )
    return features_out
