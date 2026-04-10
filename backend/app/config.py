from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    census_api_key: str = ""
    google_geocoding_api_key: str = ""
    nominatim_user_agent: str = "GeoScoreAI/1.0 (contact@example.com)"
    overpass_url: str = "https://overpass.kumi.systems/api/interpreter"
    overpass_radius_m: int = 500
    census_year: str = "2022"
    use_mock_on_failure: bool = True

    photon_suggest_url: str = "https://photon.komoot.io/api"
    # Optional bias for NYC metro suggestions: minLon,minLat,maxLon,maxLat (set empty to disable)
    address_suggest_bbox: str = "-74.35,40.49,-73.70,40.93"
    address_suggest_cache_max: int = 200
    address_suggest_min_chars: int = 3


settings = Settings()
