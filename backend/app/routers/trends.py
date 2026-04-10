from __future__ import annotations

import asyncio
import functools
import logging

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.models.schemas import (
    GeocodedLocationGoogle,
    RegionTrendRow,
    TrendsKeywordsRequest,
    TrendsKeywordsResponse,
)
from app.services.google_geocode import geocode_google_structured
from app.services.trends_pytrends import DISCLAIMER, fetch_area_interest_blocking

logger = logging.getLogger(__name__)

router = APIRouter(tags=["trends"])


@router.post("/trends-area-demand", response_model=TrendsKeywordsResponse)
async def post_trends_area_demand(body: TrendsKeywordsRequest) -> TrendsKeywordsResponse:
    if not (settings.google_geocoding_api_key or "").strip():
        raise HTTPException(
            status_code=503,
            detail="Google Geocoding is not configured. Set GOOGLE_GEOCODING_API_KEY in the server environment.",
        )

    raw = await geocode_google_structured(body.address)
    if not raw:
        raise HTTPException(
            status_code=400,
            detail="Google Geocoding did not return a result for this address. Check spelling and API key restrictions.",
        )

    keys = set(GeocodedLocationGoogle.model_fields.keys())
    geo_model = GeocodedLocationGoogle.model_validate({k: raw[k] for k in keys if k in raw})

    loop = asyncio.get_running_loop()
    out = await loop.run_in_executor(
        None,
        functools.partial(
            fetch_area_interest_blocking,
            raw,
            list(body.keywords),
            body.timeframe,
        ),
    )

    if not out:
        raise HTTPException(
            status_code=502,
            detail="Google Trends returned no regional data (empty result, unsupported geo, or rate limit). Try again in a minute.",
        )

    geo_used, resolution_used, rows = out
    return TrendsKeywordsResponse(
        disclaimer=DISCLAIMER,
        geocode=geo_model,
        primary_keyword=body.keywords[0],
        trends_geo=geo_used,
        trends_resolution=resolution_used,
        timeframe=body.timeframe,
        keywords=list(body.keywords),
        regions=[RegionTrendRow(**r) for r in rows],
    )
