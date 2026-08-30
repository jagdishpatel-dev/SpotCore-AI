"""
US state / country normalization for geocoding and Google Trends geo codes.

Never derive state codes from the first two letters of a full name (e.g. Texas -> TE).
"""

from __future__ import annotations

from typing import Any

US_STATE_NAME_TO_CODE: dict[str, str] = {
    "ALABAMA": "AL",
    "ALASKA": "AK",
    "ARIZONA": "AZ",
    "ARKANSAS": "AR",
    "CALIFORNIA": "CA",
    "COLORADO": "CO",
    "CONNECTICUT": "CT",
    "DELAWARE": "DE",
    "FLORIDA": "FL",
    "GEORGIA": "GA",
    "HAWAII": "HI",
    "IDAHO": "ID",
    "ILLINOIS": "IL",
    "INDIANA": "IN",
    "IOWA": "IA",
    "KANSAS": "KS",
    "KENTUCKY": "KY",
    "LOUISIANA": "LA",
    "MAINE": "ME",
    "MARYLAND": "MD",
    "MASSACHUSETTS": "MA",
    "MICHIGAN": "MI",
    "MINNESOTA": "MN",
    "MISSISSIPPI": "MS",
    "MISSOURI": "MO",
    "MONTANA": "MT",
    "NEBRASKA": "NE",
    "NEVADA": "NV",
    "NEW HAMPSHIRE": "NH",
    "NEW JERSEY": "NJ",
    "NEW MEXICO": "NM",
    "NEW YORK": "NY",
    "NORTH CAROLINA": "NC",
    "NORTH DAKOTA": "ND",
    "OHIO": "OH",
    "OKLAHOMA": "OK",
    "OREGON": "OR",
    "PENNSYLVANIA": "PA",
    "RHODE ISLAND": "RI",
    "SOUTH CAROLINA": "SC",
    "SOUTH DAKOTA": "SD",
    "TENNESSEE": "TN",
    "TEXAS": "TX",
    "UTAH": "UT",
    "VERMONT": "VT",
    "VIRGINIA": "VA",
    "WASHINGTON": "WA",
    "WEST VIRGINIA": "WV",
    "WISCONSIN": "WI",
    "WYOMING": "WY",
    "DISTRICT OF COLUMBIA": "DC",
}

# Census tract lookup returns STATE as 2-digit FIPS, not postal abbreviation.
US_FIPS_TO_CODE: dict[str, str] = {
    "01": "AL",
    "02": "AK",
    "04": "AZ",
    "05": "AR",
    "06": "CA",
    "08": "CO",
    "09": "CT",
    "10": "DE",
    "11": "DC",
    "12": "FL",
    "13": "GA",
    "15": "HI",
    "16": "ID",
    "17": "IL",
    "18": "IN",
    "19": "IA",
    "20": "KS",
    "21": "KY",
    "22": "LA",
    "23": "ME",
    "24": "MD",
    "25": "MA",
    "26": "MI",
    "27": "MN",
    "28": "MS",
    "29": "MO",
    "30": "MT",
    "31": "NE",
    "32": "NV",
    "33": "NH",
    "34": "NJ",
    "35": "NM",
    "36": "NY",
    "37": "NC",
    "38": "ND",
    "39": "OH",
    "40": "OK",
    "41": "OR",
    "42": "PA",
    "44": "RI",
    "45": "SC",
    "46": "SD",
    "47": "TN",
    "48": "TX",
    "49": "UT",
    "50": "VT",
    "51": "VA",
    "53": "WA",
    "54": "WV",
    "55": "WI",
    "56": "WY",
}

_COUNTRY_ALIASES: dict[str, str] = {
    "UNITED STATES": "US",
    "UNITED STATES OF AMERICA": "US",
    "USA": "US",
    "U.S.": "US",
    "U.S.A.": "US",
}


def normalize_country_code(raw: str | None) -> str:
    if not raw:
        return ""
    c = raw.strip().upper()
    if len(c) == 2 and c.isalpha():
        return c
    return _COUNTRY_ALIASES.get(c, c[:2] if len(c) == 2 else "")


def resolve_us_state_code(addr: dict[str, Any]) -> str | None:
    """
    Resolve a US postal state code (TX) from a geocoder address dict.
    Returns None if unknown.
    """
    iso = (addr.get("ISO3166-2-lvl4") or "").strip()
    if iso and "-" in iso:
        part = iso.split("-")[-1].upper()
        if len(part) == 2 and part.isalpha():
            return part

    raw = (addr.get("state") or addr.get("administrative_area_level_1") or "").strip().upper()
    if not raw:
        return None
    if raw.isdigit():
        return US_FIPS_TO_CODE.get(raw.zfill(2))
    if len(raw) == 2 and raw.isalpha():
        return raw
    return US_STATE_NAME_TO_CODE.get(raw)


def fips_state_to_code(fips: str | None) -> str | None:
    if not fips:
        return None
    key = str(fips).strip().zfill(2)
    return US_FIPS_TO_CODE.get(key)


def normalize_geocode_address(addr: dict[str, Any]) -> dict[str, Any]:
    """Return address dict with normalized country_code and US state abbreviation."""
    out = dict(addr)
    country = normalize_country_code(out.get("country_code") or out.get("country"))
    if country:
        out["country_code"] = country
    state_code = resolve_us_state_code(out)
    if state_code:
        out["state"] = state_code
        if country == "US":
            out["ISO3166-2-lvl4"] = f"US-{state_code}"
    return out


def geocode_to_trends_geo(geo: dict[str, Any]) -> dict[str, Any] | None:
    """Build Trends ladder fields from a normalized geocode result."""
    addr = normalize_geocode_address(geo.get("address") or {})
    country = normalize_country_code(addr.get("country_code") or addr.get("country"))
    if not country:
        return None
    state = resolve_us_state_code(addr) if country == "US" else None
    return {
        "country": country,
        "administrative_area_level_1": state or "",
        "locality": addr.get("city") or addr.get("town") or addr.get("village"),
        "administrative_area_level_2": addr.get("county"),
    }
