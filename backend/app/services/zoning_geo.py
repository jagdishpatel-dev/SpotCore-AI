"""
Live zoning district polygons for map rendering.

Sourced from the City of Austin's public GIS open-data API (Socrata dataset
xt8n-xrjg, "Zoning Ordinance" boundaries — https://data.austintexas.gov/d/xt8n-xrjg),
queried live per request rather than baked into the scraped text corpus:
polygon geometry has nothing to do with the legal-text RAG pipeline in
zoning_rag.py, and Austin's dataset is already the authoritative, current source.

Each polygon's raw district code (e.g. "CS-MU-NCCD-NP", a base district plus
combining/overlay suffixes) is split by zoning_overlays.parse_zoning_code(), and
map colors come from zoning_overlays.pre_screen_zoning() — the same status logic
as the text answer, overlays included. Older parcels can carry pre-1980s codes
(e.g. "C-2-H") that don't reduce to any current base code — these are returned
tagged base_district=None, permission="unknown" rather than dropped, since the
polygon shape itself is still useful context on the map.

resolve_zoning_at_point() answers "what is this address zoned?" with a
point-in-polygon query against the same dataset.
"""

from __future__ import annotations

import logging
import math
from datetime import datetime, timezone

import httpx

from app.services.zoning_overlays import parse_zoning_code, pre_screen_zoning

logger = logging.getLogger(__name__)

_SOCRATA_URL = "https://data.austintexas.gov/resource/xt8n-xrjg.geojson"
_SOCRATA_JSON_URL = "https://data.austintexas.gov/resource/xt8n-xrjg.json"
ZONING_DATA_SOURCE = "City of Austin Zoning Ordinance boundaries (data.austintexas.gov/d/xt8n-xrjg)"

_STATUS_TO_PERMISSION = {
    "permitted": "permitted",
    "conditional": "conditional",
    "not_permitted": "prohibited",
    "unclear": "unknown",
}

_PERMISSION_COLORS = {
    "permitted": "#22C55E",
    "conditional": "#F59E0B",
    "prohibited": "#EF4444",
    "unknown": "#6B7280",
}


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
        base, _ = parse_zoning_code(ztype)

        permission = "unknown"
        matched_use = None
        if base and business_query:
            pre = pre_screen_zoning(business_query, ztype, jurisdiction=jurisdiction)
            permission = _STATUS_TO_PERMISSION[pre["status"]]
            matched_use = pre["matched_use"]

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


async def resolve_zoning_at_point(lat: float, lon: float) -> dict | None:
    """
    Look up the zoning on record at (lat, lon) with a point-in-polygon query.

    One point can sit inside several ordinance records (amended cases, overlay-only
    records such as "NP"). They are combined conservatively: overlays from every
    record are kept, and if records disagree on the base district, base_district is
    None and conflicting_bases lists them.

    Returns None if the lookup fails, otherwise:
      {"zoning_code", "base_district", "overlays", "case_numbers", "records",
       "conflicting_bases", "source", "retrieved_at"}
    where zoning_code is None when no record had a recognizable base district.
    """
    params = {
        "$select": "zoning_ordinance_ztype,case_number",
        "$where": f"intersects(the_geom, 'POINT ({lon} {lat})')",
        "$limit": "50",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(_SOCRATA_JSON_URL, params=params)
            resp.raise_for_status()
            rows = resp.json()
        except Exception as exc:
            logger.error("zoning_geo.resolve_zoning_at_point error: %s", exc)
            return None

    records = [
        {"ztype": r["zoning_ordinance_ztype"].strip().upper(), "case_number": r.get("case_number")}
        for r in rows
        if (r.get("zoning_ordinance_ztype") or "").strip()
    ]
    bases: list[str] = []
    overlays: list[str] = []
    for record in records:
        base, record_overlays = parse_zoning_code(record["ztype"])
        if base and base not in bases:
            bases.append(base)
        overlays += [o for o in record_overlays if o not in overlays]

    base = bases[0] if len(bases) == 1 else None
    return {
        "zoning_code": "-".join([base, *overlays]) if base else None,
        "base_district": base,
        "overlays": overlays,
        "case_numbers": [r["case_number"] for r in records if r["case_number"]],
        "records": records,
        "conflicting_bases": bases if len(bases) > 1 else [],
        "source": ZONING_DATA_SOURCE,
        "retrieved_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
