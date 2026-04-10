from __future__ import annotations

import logging
from collections import OrderedDict

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_cache: OrderedDict[str, list[dict]] = OrderedDict()


def _cache_key(q: str, limit: int, bbox: str | None) -> str:
    return f"{q.lower().strip()}|{limit}|{bbox or ''}"


def _cache_get(key: str) -> list[dict] | None:
    if key not in _cache:
        return None
    _cache.move_to_end(key)
    return _cache[key]


def _cache_set(key: str, value: list[dict]) -> None:
    _cache[key] = value
    _cache.move_to_end(key)
    maxsize = max(10, settings.address_suggest_cache_max)
    while len(_cache) > maxsize:
        _cache.popitem(last=False)


def _bbox_param() -> str | None:
    raw = (settings.address_suggest_bbox or "").strip()
    if not raw:
        return None
    parts = [p.strip() for p in raw.split(",")]
    if len(parts) != 4:
        logger.warning("ADDRESS_SUGGEST_BBOX must be minLon,minLat,maxLon,maxLat; ignoring invalid value")
        return None
    try:
        for p in parts:
            float(p)
    except ValueError:
        logger.warning("ADDRESS_SUGGEST_BBOX contains non-numeric parts; ignoring")
        return None
    return ",".join(parts)


def _label_from_props(props: dict) -> str:
    hn = (props.get("housenumber") or "").strip()
    st = (props.get("street") or "").strip()
    street_line = f"{hn} {st}".strip() if (hn or st) else ""
    if not street_line:
        street_line = (props.get("name") or "").strip()
    city = (props.get("city") or props.get("district") or props.get("town") or props.get("locality") or "").strip()
    state = (props.get("state") or "").strip()
    pc = (props.get("postcode") or "").strip()
    country = (props.get("country") or "").strip()
    bits = [b for b in [street_line or None, city or None, state or None, pc or None] if b]
    label = ", ".join(bits) if bits else (props.get("name") or "").strip()
    return label or "Unknown address"


async def suggest_addresses(query: str, limit: int = 6) -> list[dict]:
    q = query.strip()
    if len(q) < settings.address_suggest_min_chars:
        return []

    bbox = _bbox_param()
    key = _cache_key(q, limit, bbox)
    cached = _cache_get(key)
    if cached is not None:
        return cached

    params: dict[str, str | int] = {"q": q, "limit": int(limit)}
    if bbox:
        params["bbox"] = bbox

    url = settings.photon_suggest_url.rstrip("/") + "/"
    headers = {"User-Agent": settings.nominatim_user_agent, "Accept": "application/json"}

    async with httpx.AsyncClient(timeout=12.0) as client:
        r = await client.get(url, params=params, headers=headers)
        r.raise_for_status()
        body = r.json()

    feats = body.get("features") or []
    out: list[dict] = []
    for f in feats:
        props = f.get("properties") or {}
        geom = f.get("geometry") or {}
        coords = geom.get("coordinates")
        if not coords or len(coords) < 2:
            continue
        lon, lat = float(coords[0]), float(coords[1])
        label = _label_from_props(props)
        if not label or label == "Unknown address":
            continue
        out.append(
            {
                "label": label,
                "lat": lat,
                "lon": lon,
                "osm_id": props.get("osm_id"),
                "osm_type": props.get("osm_type"),
            }
        )
        if len(out) >= limit:
            break

    _cache_set(key, out)
    return out
