"""
Soft demand signals (Google Trends) for analyze-site.

search_interest_index is a region-level relative score (0–100), not address-level volume.
"""

from __future__ import annotations

import asyncio
import functools
import json
import logging
from pathlib import Path
from typing import Any

from app.config import settings
from app.models.schemas import SoftDemandSignals
from app.observability.pipeline_events import log_event
from app.services.google_geocode import geocode_google_structured
from app.services.trends_pytrends import DISCLAIMER, fetch_area_interest_blocking
from app.services.us_regions import geocode_to_trends_geo

logger = logging.getLogger(__name__)

_TRENDS_KEYWORDS_PATH = Path(__file__).resolve().parent.parent / "data" / "trends_keywords.json"
DEFAULT_TIMEFRAME = "today 3-m"
TRENDS_TIMEOUT_S = 14.0

_keywords_cache: dict | None = None


def _load_keywords_config() -> dict:
    global _keywords_cache
    if _keywords_cache is None:
        with _TRENDS_KEYWORDS_PATH.open(encoding="utf-8") as f:
            _keywords_cache = json.load(f)
    return _keywords_cache


def derive_trends_keywords(business_type: str) -> list[str]:
    cfg = _load_keywords_config()
    bt = business_type.lower().strip()
    aliases: dict[str, list[str]] = cfg.get("aliases", {})
    for alias, kws in sorted(aliases.items(), key=lambda x: -len(x[0])):
        if alias in bt:
            return kws[:5]
    return [business_type.strip()][:5] if business_type.strip() else ["local business"]


def nominatim_to_trends_geo(geo: dict) -> dict[str, Any] | None:
    """Map Nominatim/Photon geocode result to fields expected by trends geo ladder."""
    return geocode_to_trends_geo(geo)


def _match_region_index(
    rows: list[dict[str, Any]],
    primary_keyword: str,
    location_hints: list[str],
) -> float | None:
    if not rows:
        return None
    hints = [h.lower() for h in location_hints if h]
    for row in rows:
        region = str(row.get("region", "")).lower()
        if any(h in region or region in h for h in hints if len(h) > 2):
            scores = row.get("scores") or {}
            val = scores.get(primary_keyword)
            if val is not None:
                return float(val)
    top = rows[0]
    scores = top.get("scores") or {}
    val = scores.get(primary_keyword)
    return float(val) if val is not None else None


def _fetch_blocking(geocoded: dict[str, Any], keywords: list[str], timeframe: str):
    return fetch_area_interest_blocking(geocoded, keywords, timeframe)


async def fetch_soft_demand_signals(
    address: str,
    business_type: str,
    geo: dict,
    location_label: str,
    timeframe: str = DEFAULT_TIMEFRAME,
) -> SoftDemandSignals | None:
    keywords = derive_trends_keywords(business_type)
    if not keywords:
        log_event("analyze_site.trends.unavailable", reason="no_keywords")
        return None

    geocoded: dict[str, Any] | None = None
    if (settings.google_geocoding_api_key or "").strip():
        geocoded = await geocode_google_structured(address)
    if not geocoded:
        geocoded = geocode_to_trends_geo(geo)
    if not geocoded or not geocoded.get("country"):
        log_event("analyze_site.trends.unavailable", reason="no_geo")
        return None

    loop = asyncio.get_running_loop()
    try:
        out = await asyncio.wait_for(
            loop.run_in_executor(
                None,
                functools.partial(_fetch_blocking, geocoded, keywords, timeframe),
            ),
            timeout=TRENDS_TIMEOUT_S,
        )
    except asyncio.TimeoutError:
        log_event("analyze_site.trends.unavailable", reason="timeout")
        return None
    except Exception as e:
        logger.warning("Trends fetch failed: %s", e)
        log_event("analyze_site.trends.unavailable", reason="error", error_type=type(e).__name__)
        return None

    if not out:
        log_event("analyze_site.trends.unavailable", reason="empty")
        return None

    geo_used, resolution_used, rows = out
    primary = keywords[0]
    hints = [
        location_label,
        geo.get("display_name") or "",
        (geo.get("address") or {}).get("city") or "",
        (geo.get("address") or {}).get("state") or "",
        (geo.get("address") or {}).get("county") or "",
    ]
    index = _match_region_index(rows, primary, hints)

    if index is None:
        log_event("analyze_site.trends.unavailable", reason="no_index")
        return None

    log_event(
        "analyze_site.trends.success",
        geo=geo_used,
        resolution=resolution_used,
        index=round(index, 1),
    )
    return SoftDemandSignals(
        search_interest_index=round(index, 2),
        search_interest_geo_used=geo_used,
        search_interest_resolution=resolution_used,
        search_interest_keywords=keywords,
        search_interest_timeframe=timeframe,
        search_interest_disclaimer=DISCLAIMER,
    )
