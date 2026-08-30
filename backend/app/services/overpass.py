import logging
import math
import re

import httpx

from app.config import settings
from app.observability.pipeline_events import log_event

logger = logging.getLogger(__name__)

# Mirrors tried in order when the primary OVERPASS_URL fails.
_OVERPASS_FALLBACK_URLS = (
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
)


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _sanitize_radius(r: int) -> int:
    return max(100, min(r, 2000))


def _overpass_headers() -> dict[str, str]:
    """
    overpass-api.de rejects anonymous/bot-like clients with 406 unless User-Agent
    and Referer identify the application (see OSM community usage rules).
    """
    return {
        "Content-Type": "text/plain; charset=utf-8",
        "Accept": "*/*",
        "User-Agent": (settings.overpass_user_agent or settings.nominatim_user_agent).strip(),
        "Referer": (settings.overpass_referer or "http://127.0.0.1:5173/").strip(),
    }


def _overpass_urls() -> list[str]:
    primary = (settings.overpass_url or "").strip()
    seen: set[str] = set()
    out: list[str] = []
    for u in [primary, *_OVERPASS_FALLBACK_URLS]:
        if u and u not in seen:
            seen.add(u)
            out.append(u)
    return out


async def fetch_nearby_pois(lat: float, lon: float, radius_m: int | None = None) -> list[dict]:
    r = _sanitize_radius(radius_m or settings.overpass_radius_m)
    query = f"""
    [out:json][timeout:25];
    (
      node["shop"](around:{r},{lat},{lon});
      way["shop"](around:{r},{lat},{lon});
      node["amenity"](around:{r},{lat},{lon});
      way["amenity"](around:{r},{lat},{lon});
      node["railway"="station"](around:{r},{lat},{lon});
      way["railway"="station"](around:{r},{lat},{lon});
      node["railway"="subway_entrance"](around:{r},{lat},{lon});
      node["amenity"="subway_entrance"](around:{r},{lat},{lon});
      node["public_transport"="platform"](around:{r},{lat},{lon});
      way["public_transport"="platform"](around:{r},{lat},{lon});
      node["highway"="bus_stop"](around:{r},{lat},{lon});
      node["amenity"="parking"](around:{r},{lat},{lon});
      way["amenity"="parking"](around:{r},{lat},{lon});
      node["amenity"="parking_entrance"](around:{r},{lat},{lon});
      way["amenity"="parking_entrance"](around:{r},{lat},{lon});
      node["amenity"="bicycle_parking"](around:{r},{lat},{lon});
      way["amenity"="bicycle_parking"](around:{r},{lat},{lon});
      node["highway"~"^(primary|secondary|tertiary)$"](around:{r},{lat},{lon});
      way["highway"~"^(primary|secondary|tertiary)$"](around:{r},{lat},{lon});
      node["highway"="traffic_signals"](around:{r},{lat},{lon});
      node["highway"="stop"](around:{r},{lat},{lon});
    );
    out center;
    """
    headers = _overpass_headers()
    last_err: Exception | None = None
    data = None
    async with httpx.AsyncClient(timeout=35.0) as client:
        for url in _overpass_urls():
            try:
                resp = await client.post(url, content=query.encode("utf-8"), headers=headers)
                resp.raise_for_status()
                data = resp.json()
                if url != _overpass_urls()[0]:
                    logger.info("Overpass succeeded via fallback mirror: %s", url)
                break
            except Exception as e:
                last_err = e
                status = getattr(getattr(e, "response", None), "status_code", None)
                logger.warning("Overpass failed url=%s status=%s: %s", url, status, e)
                log_event(
                    "analyze_site.overpass.mirror_failed",
                    url=url.split("/")[2] if "/" in url else url,
                    status_code=status,
                    error_type=type(e).__name__,
                )
        if data is None:
            log_event(
                "analyze_site.overpass.all_mirrors_failed",
                error_type=type(last_err).__name__ if last_err else "unknown",
            )
            raise last_err or RuntimeError("Overpass request failed")
    elements = data.get("elements") or []
    out: list[dict] = []
    for el in elements:
        tags = el.get("tags") or {}
        if el["type"] == "node":
            plat_lat, plat_lon = el["lat"], el["lon"]
        else:
            c = el.get("center") or {}
            if "lat" not in c:
                continue
            plat_lat, plat_lon = c["lat"], c["lon"]
        dist = haversine_m(lat, lon, plat_lat, plat_lon)
        out.append(
            {
                "type": el["type"],
                "id": el.get("id"),
                "lat": plat_lat,
                "lon": plat_lon,
                "tags": tags,
                "distance_m": dist,
            }
        )
    return out


def _tag_str(tags: dict) -> str:
    parts = []
    for k in ("amenity", "shop", "railway", "public_transport", "highway", "name"):
        v = tags.get(k)
        if v:
            parts.append(str(v))
    return " ".join(parts).lower()


def classify_poi(tags: dict, business_type: str) -> str | None:
    """
    Returns 'competitor', 'complementary', 'transit', 'ignore'
    """
    bt = business_type.lower()
    ts = _tag_str(tags)
    amenity = (tags.get("amenity") or "").lower()
    shop = (tags.get("shop") or "").lower()
    railway = (tags.get("railway") or "").lower()
    highway = (tags.get("highway") or "").lower()
    pt = (tags.get("public_transport") or "").lower()

    if railway == "station" or amenity in ("subway_entrance",):
        return "transit"
    if pt == "platform" or highway == "bus_stop":
        return "transit"

    # Coffee / cafe
    if any(x in bt for x in ("coffee", "cafe", "café", "espresso")):
        if amenity in ("cafe", "fast_food") or shop in ("coffee",):
            return "competitor"
        if amenity in ("restaurant", "bar", "pub") or shop in ("bakery", "pastry", "confectionery"):
            return "complementary"
        if amenity in ("library", "coworking_space") or "office" in ts:
            return "complementary"

    # Restaurant / food
    if any(x in bt for x in ("restaurant", "food", "pizza", "bakery")):
        if amenity in ("restaurant", "fast_food", "food_court", "bar", "pub", "cafe"):
            if "pizza" in bt and "pizza" in ts:
                return "competitor"
            if "bakery" in bt and shop == "bakery":
                return "competitor"
            return "competitor"
        if shop in ("grocery", "supermarket", "convenience", "alcohol", "wine"):
            return "complementary"

    # Retail / apparel
    if any(x in bt for x in ("retail", "clothing", "apparel", "fashion", "boutique")):
        if shop in ("clothes", "shoes", "boutique", "fashion", "department_store"):
            return "competitor"
        if shop in ("jewelry", "beauty", "hairdresser", "cosmetics"):
            return "complementary"

    # Gym / fitness
    if any(x in bt for x in ("gym", "fitness", "yoga", "pilates")):
        if amenity in ("gym", "fitness_centre"):
            return "competitor"
        if shop in ("sports", "nutrition_supplements") or amenity in ("swimming_pool",):
            return "complementary"

    # Salon / beauty
    if any(x in bt for x in ("salon", "barber", "beauty", "nail", "spa")):
        if amenity in ("hairdresser", "beauty") or shop in ("beauty", "hairdresser"):
            return "competitor"
        if shop in ("cosmetics", "clothes"):
            return "complementary"

    # Default heuristics
    if amenity in ("cafe", "restaurant", "fast_food", "bar", "pub"):
        if "coffee" in bt or "cafe" in bt:
            return "competitor" if amenity == "cafe" else "complementary"
    return None


def poi_display_name(tags: dict) -> str:
    name = tags.get("name:en") or tags.get("name")
    if name:
        return str(name)
    parts = []
    if tags.get("shop"):
        parts.append(str(tags["shop"]).replace("_", " "))
    if tags.get("amenity"):
        parts.append(str(tags["amenity"]).replace("_", " "))
    if tags.get("railway"):
        parts.append(str(tags["railway"]).replace("_", " "))
    if tags.get("highway") == "bus_stop":
        parts.append("bus stop")
    return " ".join(parts).title() or "Unnamed POI"


def poi_category(tags: dict) -> str:
    return (tags.get("amenity") or tags.get("shop") or tags.get("railway") or tags.get("highway") or "poi").replace(
        "_", " "
    )


def slug_hint(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
