import logging

import httpx

from app.config import settings
from app.services.us_regions import normalize_geocode_address

logger = logging.getLogger(__name__)


async def geocode_address(address: str) -> dict | None:
    """Forward geocode: try Nominatim, then Photon (Komoot) as a pragmatic fallback."""
    q = address.strip()
    if not q:
        return None
    geo = await _geocode_nominatim(q)
    if geo:
        return geo
    logger.warning("Nominatim geocode failed or empty; trying Photon fallback")
    return await _geocode_photon(q)


async def _geocode_nominatim(q: str) -> dict | None:
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": q,
        "format": "json",
        "limit": 1,
        "addressdetails": 1,
    }
    headers = {"User-Agent": settings.nominatim_user_agent, "Accept-Language": "en"}
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            r = await client.get(url, params=params, headers=headers)
            if r.status_code != 200:
                return None
            data = r.json()
        except httpx.HTTPError:
            return None
    if not data:
        return None
    hit = data[0]
    return {
        "lat": float(hit["lat"]),
        "lon": float(hit["lon"]),
        "display_name": hit.get("display_name"),
        "address": normalize_geocode_address(hit.get("address") or {}),
        "source": "nominatim",
    }


async def _geocode_photon(q: str) -> dict | None:
    """Photon is a helpful fallback when Nominatim blocks datacenter/automation traffic."""
    url = "https://photon.komoot.io/api/"
    params = {"q": q, "limit": 1}
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            r = await client.get(url, params=params, headers={"User-Agent": settings.nominatim_user_agent})
            if r.status_code != 200:
                return None
            body = r.json()
        except httpx.HTTPError:
            return None
    feats = body.get("features") or []
    if not feats:
        return None
    geom = feats[0].get("geometry") or {}
    coords = geom.get("coordinates")
    if not coords or len(coords) < 2:
        return None
    lon, lat = float(coords[0]), float(coords[1])
    props = feats[0].get("properties") or {}
    parts = [props.get("name"), props.get("street"), props.get("city") or props.get("district"), props.get("state")]
    display = ", ".join(str(p) for p in parts if p)
    return {
        "lat": lat,
        "lon": lon,
        "display_name": display or q,
        "address": normalize_geocode_address(
            {
                "road": props.get("street"),
                "city": props.get("city") or props.get("district"),
                "state": props.get("state"),
                "postcode": props.get("postcode"),
                "country_code": props.get("countrycode"),
            }
        ),
        "source": "photon",
    }


def extract_location_label(display_name: str | None, address: dict) -> str:
    if display_name:
        parts = display_name.split(",")
        return ", ".join(parts[:3]).strip()
    road = address.get("road") or address.get("house_number", "")
    city = address.get("city") or address.get("town") or address.get("village") or ""
    return ", ".join(p for p in [road, city] if p).strip() or "Selected location"
