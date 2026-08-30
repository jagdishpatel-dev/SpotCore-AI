"""
Count OSM-based accessibility signals from Overpass POI results.

major_road_nodes_within_radius counts highway-tagged nodes near the site — a lightweight
proxy for major-road proximity, not true intersection density or drive-time.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class AccessCounts:
    parking_within_radius: int
    bicycle_parking_within_radius: int
    major_road_nodes_within_radius: int
    traffic_signal_nodes_within_radius: int


_PARKING_AMENITIES = frozenset({"parking", "parking_entrance"})
_MAJOR_HIGHWAYS = frozenset({"primary", "secondary", "tertiary"})
_SIGNAL_HIGHWAYS = frozenset({"traffic_signals", "stop"})


def count_access_signals(pois: list[dict], radius_m: int) -> AccessCounts:
    parking = 0
    bike = 0
    major_roads = 0
    signals = 0

    for p in pois:
        tags = p.get("tags") or {}
        dist = p.get("distance_m", radius_m + 1)
        if dist > radius_m:
            continue

        amenity = (tags.get("amenity") or "").lower()
        highway = (tags.get("highway") or "").lower()

        if amenity in _PARKING_AMENITIES:
            parking += 1
        elif amenity == "bicycle_parking":
            bike += 1
        elif highway in _MAJOR_HIGHWAYS:
            major_roads += 1
        elif highway in _SIGNAL_HIGHWAYS:
            signals += 1

    return AccessCounts(
        parking_within_radius=parking,
        bicycle_parking_within_radius=bike,
        major_road_nodes_within_radius=major_roads,
        traffic_signal_nodes_within_radius=signals,
    )
