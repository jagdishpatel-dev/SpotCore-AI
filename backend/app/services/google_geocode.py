"""Structured forward geocoding via Google Geocoding API (JSON)."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.config import settings
from app.services.us_regions import normalize_country_code, resolve_us_state_code

logger = logging.getLogger(__name__)


def _pick(components: list[dict[str, Any]], typ: str) -> tuple[str | None, str | None]:
    for c in components:
        if typ in (c.get("types") or []):
            return c.get("long_name"), c.get("short_name")
    return None, None


async def geocode_google_structured(address: str) -> dict[str, Any] | None:
    """Returns normalized dict or None if not found / error."""
    key = (settings.google_geocoding_api_key or "").strip()
    if not key:
        logger.warning("GOOGLE_GEOCODING_API_KEY missing; Google geocode unavailable")
        return None

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address.strip(), "key": key}
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        body = r.json()
    status = body.get("status")
    if status != "OK" or not body.get("results"):
        logger.info("Google geocode status=%s", status)
        return None

    res = body["results"][0]
    loc = res.get("geometry", {}).get("location") or {}
    lat, lng = loc.get("lat"), loc.get("lng")
    if lat is None or lng is None:
        return None

    comps = res.get("address_components") or []

    def both(t: str) -> tuple[str | None, str | None]:
        return _pick(comps, t)

    street_num_long, _ = both("street_number")
    route_long, _ = both("route")
    locality_long, _ = both("locality")
    subloc_long, _ = both("sublocality")
    if not subloc_long:
        subloc_long, _ = both("sublocality_level_1")
    neighborhood_long, _ = both("neighborhood")
    admin1_long, admin1_short = both("administrative_area_level_1")
    admin2_long, admin2_short = both("administrative_area_level_2")
    country_long, country_short = both("country")
    postal_long, _ = both("postal_code")

    country_short = normalize_country_code(country_short) or country_short
    state_code = (
        resolve_us_state_code(
            {
                "state": admin1_short or admin1_long,
                "administrative_area_level_1": admin1_short,
                "country_code": country_short,
            }
        )
        or admin1_short
    )

    return {
        "formatted_address": res.get("formatted_address"),
        "lat": float(lat),
        "lng": float(lng),
        "street_number": street_num_long,
        "route": route_long,
        "locality": locality_long,
        "sublocality": subloc_long,
        "neighborhood": neighborhood_long,
        "administrative_area_level_1": state_code,
        "administrative_area_level_1_long": admin1_long,
        "administrative_area_level_2": admin2_short,
        "administrative_area_level_2_long": admin2_long,
        "country": country_short,
        "country_long": country_long,
        "postal_code": postal_long,
        "place_id": res.get("place_id"),
        "types": res.get("types") or [],
    }
