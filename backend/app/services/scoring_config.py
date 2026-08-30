"""Load per-business-type scoring profiles from JSON."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Any

_PROFILES_PATH = Path(__file__).resolve().parent.parent / "data" / "scoring_profiles.json"


@dataclass(frozen=True)
class ScoringProfile:
    key: str
    weights_no_budget: dict[str, float]
    weights_with_budget: dict[str, float]
    demand: dict[str, Any]
    competition: dict[str, Any]
    accessibility: dict[str, Any]
    demographic_fit: dict[str, Any]
    cost_fit: dict[str, Any]
    recommendation: dict[str, Any]


def _parse_profile(key: str, raw: dict[str, Any]) -> ScoringProfile:
    return ScoringProfile(
        key=key,
        weights_no_budget=dict(raw["weights_no_budget"]),
        weights_with_budget=dict(raw["weights_with_budget"]),
        demand=dict(raw["demand"]),
        competition=dict(raw["competition"]),
        accessibility=dict(raw["accessibility"]),
        demographic_fit=dict(raw["demographic_fit"]),
        cost_fit=dict(raw["cost_fit"]),
        recommendation=dict(raw["recommendation"]),
    )


@lru_cache(maxsize=1)
def _load_config() -> tuple[dict[str, ScoringProfile], dict[str, str]]:
    with _PROFILES_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    profiles = {k: _parse_profile(k, v) for k, v in data["profiles"].items()}
    aliases = {k.lower(): v for k, v in data.get("aliases", {}).items()}
    return profiles, aliases


def resolve_profile(business_type: str) -> ScoringProfile:
    profiles, aliases = _load_config()
    bt = business_type.lower().strip()
    if bt in profiles:
        return profiles[bt]
    for alias, profile_key in sorted(aliases.items(), key=lambda x: -len(x[0])):
        if alias in bt:
            return profiles.get(profile_key, profiles["default"])
    return profiles["default"]
