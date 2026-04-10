"""
Google Trends via pytrends: area-level relative interest (0–100), not search volume.

Uses build_payload() then interest_by_region() with a derived geo (never raw street address).
"""

from __future__ import annotations

import logging
import time
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

DISCLAIMER = (
    "Values are relative Google Trends scores (0–100) for the selected geography and time window. "
    "They are normalized by Google, not raw search counts, not tied to a single street address, "
    "and not a measure of foot traffic."
)


def _geo_resolution_ladder(geocoded: dict[str, Any]) -> list[tuple[str, str]]:
    """
    Ordered (geo, resolution) attempts for interest_by_region.
    Geo must be Trends-supported (metro/state/country), not street-level.
    """
    country = (geocoded.get("country") or "").upper()
    admin1 = (geocoded.get("administrative_area_level_1") or "").upper()

    attempts: list[tuple[str, str]] = []

    if country == "US" and admin1:
        attempts.extend(
            [
                (f"US-{admin1}", "DMA"),
                (f"US-{admin1}", "CITY"),
                (f"US-{admin1}", "REGION"),
            ]
        )
    if country == "US":
        attempts.extend([("US", "DMA"), ("US", "REGION")])
    elif country:
        attempts.extend([(country, "REGION"), (country, "CITY")])

    seen: set[tuple[str, str]] = set()
    out: list[tuple[str, str]] = []
    for g, r in attempts:
        if (g, r) not in seen:
            seen.add((g, r))
            out.append((g, r))
    return out


def _interest_blocking(
    keywords: list[str],
    timeframe: str,
    geo: str,
    resolution: str,
) -> pd.DataFrame | None:
    from pytrends import exceptions
    from pytrends.request import TrendReq

    tr = TrendReq(hl="en-US", tz=360, timeout=(10, 30))
    try:
        tr.build_payload(keywords, cat=0, timeframe=timeframe, geo=geo, gprop="")
        df = tr.interest_by_region(
            resolution=resolution,
            inc_low_vol=True,
            inc_geo_code=False,
        )
    except exceptions.TooManyRequestsError:
        logger.warning("pytrends 429 for geo=%s resolution=%s", geo, resolution)
        return None
    except Exception as e:
        logger.warning("pytrends error geo=%s res=%s: %s", geo, resolution, e)
        return None

    if df is None or df.empty:
        return None
    # Normalize column names to match keywords order where possible
    return df


def _dedupe_keywords(keywords: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for k in keywords:
        kk = (k or "").strip()
        if not kk or kk.lower() in seen:
            continue
        seen.add(kk.lower())
        out.append(kk)
    return out[:5]


def fetch_area_interest_blocking(
    geocoded: dict[str, Any],
    keywords: list[str],
    timeframe: str,
    max_regions: int = 75,
    pause_s: float = 1.2,
) -> tuple[str, str, list[dict[str, Any]]] | None:
    """
    Returns (geo_used, resolution_used, rows) or None if all attempts fail.
    rows: [{ "region": str, "scores": {kw: float} }, ...] sorted by primary keyword desc.
    """
    keywords = _dedupe_keywords(keywords)
    if not keywords:
        return None

    ladder = _geo_resolution_ladder(geocoded)
    primary = keywords[0]

    for geo, resolution in ladder:
        time.sleep(pause_s)
        df = _interest_blocking(keywords, timeframe, geo, resolution)
        if df is None or df.empty:
            continue

        # Ensure keyword columns exist (pytrends uses keyword strings as columns)
        missing = [k for k in keywords if k not in df.columns]
        if missing:
            logger.warning("pytrends columns missing %s; skipping this slice", missing)
            continue

        df = df.copy()
        df[primary] = pd.to_numeric(df[primary], errors="coerce").fillna(0)
        df = df.sort_values(by=primary, ascending=False).head(max_regions)

        rows: list[dict[str, Any]] = []
        for region_name, row in df.iterrows():
            scores = {}
            for kw in keywords:
                v = row.get(kw, 0)
                try:
                    scores[kw] = float(v)
                except (TypeError, ValueError):
                    scores[kw] = 0.0
            rows.append({"region": str(region_name), "scores": scores})

        return geo, resolution, rows

    return None
