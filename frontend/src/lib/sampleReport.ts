/**
 * Static illustration payload so users can preview the full report layout without calling the API.
 */
import type { AnalyzeSiteResponse } from '$lib/types';

export const SAMPLE_ANALYZE_SITE_RESPONSE: AnalyzeSiteResponse = {
  location: {
    label: 'Sample — Downtown Brooklyn retail corridor',
    lat: 40.6892,
    lon: -73.9906,
    display_name: 'Example block near transit & daytime foot traffic (demo)',
    census_tract: '47001004700',
    county: 'Kings',
    state: 'NY',
  },
  total_score: 78,
  recommendation: 'strong',
  scores: {
    demand: 82,
    competition: 68,
    accessibility: 85,
    demographic_fit: 76,
    cost_fit: 71,
  },
  ai_insights: {
    insights: {
      strategic_overview:
        'Foot traffic and transit access line up well with a specialty café concept; competition is present but validates demand.',
      the_edge:
        'Strong pedestrian circulation within 500m of subway access and a cluster of complementary food retailers.',
      the_blindspot:
        'Lease economics and tenant improvement costs are not in SpotCore—confirm rent and CAM with a broker.',
      the_power_move:
        'Pilot weekday breakfast + lunch dayparts before committing to evening hours; measure repeat visits for 60 days.',
    },
    confidence_score: 0.82,
  },
  competitors: [
    {
      name: 'Neighborhood Espresso Bar',
      category: 'cafe',
      lat: 40.6895,
      lon: -73.991,
      distance_m: 140,
      osm_type: 'node',
      osm_id: 9001,
    },
    {
      name: 'QuickCup Chain',
      category: 'cafe',
      lat: 40.6888,
      lon: -73.9902,
      distance_m: 210,
      osm_type: 'node',
      osm_id: 9002,
    },
  ],
  complementary_businesses: [
    {
      name: 'Artisan Bakery',
      category: 'bakery',
      lat: 40.6898,
      lon: -73.9912,
      distance_m: 95,
      osm_type: 'node',
      osm_id: 9003,
    },
    {
      name: 'Fitness Studio',
      category: 'gym',
      lat: 40.6885,
      lon: -73.9898,
      distance_m: 260,
      osm_type: 'node',
      osm_id: 9004,
    },
  ],
  demographics: {
    tract_id: '47001004700',
    population: 4520,
    median_household_income: 92000,
    median_age: 34.5,
    pct_bachelors_or_higher: 48,
    commute_pct_public_transit: 52,
    vacancy_rate_pct: 7.1,
    summary:
      'Illustrative tract: younger, transit-oriented commuters with above-median income (sample only).',
  },
  transit: {
    subway_stops_within_800m: 2,
    bus_or_light_rail_stops_within_400m: 6,
    nearest_subway_distance_m: 280,
    summary:
      'Sample summary: multiple bus stops nearby and subway access within a short walk (not live data).',
  },
  summary: [
    'Sample report: layout preview only.',
    'Scores and POIs are synthetic—run Analyze site on a real address for live OSM + Census signals.',
    'Daytime office-adjacent demand is directionally favorable in this fabricated example.',
    'Validate rent, licensing, and co-tenancy with local diligence.',
  ],
  data_sources: {
    mode: 'sample',
    note: 'Static demo payload shipped with the app for UX preview.',
  },
};
