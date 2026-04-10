import httpx

from app.config import settings


async def coordinates_to_tract(lat: float, lon: float) -> dict | None:
    """US Census Geocoder: coordinates -> census tract."""
    url = "https://geocoding.geo.census.gov/geocoder/geographies/coordinates"
    params = {
        "x": lon,
        "y": lat,
        "benchmark": "Public_AR_Current",
        "vintage": "Current_Current",
        "format": "json",
    }
    async with httpx.AsyncClient(timeout=25.0) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        body = r.json()
    matches = body.get("result", {}).get("geographies", {}).get("Census Tracts") or []
    if not matches:
        return None
    m = matches[0]
    return {
        "tract": m.get("TRACT"),
        "county": m.get("COUNTY"),
        "state": m.get("STATE"),
        "geoid": m.get("GEOID"),
        "basename": m.get("BASENAME"),
    }


def _acs_var_url(geoid: str, year: str, variables: list[str]) -> str:
    """GEOID: state(2) + county(3) + tract(6) = 11 chars."""
    if len(geoid) < 11:
        raise ValueError("Invalid tract GEOID")
    state, county, tract = geoid[0:2], geoid[2:5], geoid[5:11]
    key = settings.census_api_key
    var_list = ",".join(variables)
    base = f"https://api.census.gov/data/{year}/acs/acs5"
    q = f"get={var_list}&for=tract:{tract}&in=state:{state}&in=county:{county}"
    if key:
        return f"{base}?{q}&key={key}"
    return f"{base}?{q}"


async def fetch_acs_tract_demographics(geoid: str) -> dict | None:
    """
    ACS 5-year tract variables:
    B01003_001E population
    B19013_001E median household income
    B01002_001E median age
    B15003_022E + ... bachelor's+ (simplified: use B15003_022E-B15003_025E sum / B15003_001E)
    """
    year = settings.census_year
    variables = [
        "NAME",
        "B01003_001E",
        "B19013_001E",
        "B01002_001E",
        "B25004_001E",  # vacant
        "B25002_001E",  # total units
        "B08301_010E",  # public transportation (excluding taxicab)
        "B08301_001E",  # total workers for commute
        "B15003_001E",  # education total 25+
        "B15003_022E",
        "B15003_023E",
        "B15003_024E",
        "B15003_025E",
    ]
    url = _acs_var_url(geoid, year, variables)
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(url)
        if r.status_code != 200:
            return None
        rows = r.json()
    if not rows or len(rows) < 2:
        return None
    header, row = rows[0], rows[1]
    d = dict(zip(header, row))

    def num(k: str) -> float | None:
        v = d.get(k)
        if v is None or v in ("-666666666", "-555555555", None, ""):
            return None
        try:
            return float(v)
        except ValueError:
            return None

    pop = num("B01003_001E")
    income = num("B19013_001E")
    age = num("B01002_001E")
    vac = num("B25004_001E")
    units = num("B25002_001E")
    transit_workers = num("B08301_010E")
    commute_total = num("B08301_001E")
    edu_total = num("B15003_001E")
    bach = sum((num(f"B15003_{i:03d}E") or 0) for i in range(22, 26))

    vacancy_pct = None
    if units and units > 0 and vac is not None:
        vacancy_pct = round(100.0 * vac / units, 1)

    pct_transit = None
    if commute_total and commute_total > 0 and transit_workers is not None:
        pct_transit = round(100.0 * transit_workers / commute_total, 1)

    pct_bach = None
    if edu_total and edu_total > 0:
        pct_bach = round(100.0 * bach / edu_total, 1)

    return {
        "tract_id": geoid,
        "population": int(pop) if pop is not None else None,
        "median_household_income": int(income) if income is not None else None,
        "median_age": age,
        "pct_bachelors_or_higher": pct_bach,
        "commute_pct_public_transit": pct_transit,
        "vacancy_rate_pct": vacancy_pct,
    }
