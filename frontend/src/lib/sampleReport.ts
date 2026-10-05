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

/** One parcel's zoning pre-screen, captured from SpotCore's rules engine for the Highland sample. */
export interface SamplePrescreen {
  label: string;
  lat: number;
  lon: number;
  zoningCode: string;
  baseDistrict: string;
  status: 'permitted' | 'conditional' | 'not_permitted' | 'unclear';
  matchedUse: string;
  tableValue: string;
  reason: string;
  overlays: { code: string; note: string; citation: string; changesResult: boolean }[];
  citations: string[];
  caseNumbers: string[];
  nextSteps: string[];
}

/** City of Austin zoning boundaries, retrieved 2026-10-05; status decided by the rules engine, not an LLM. */
export const HIGHLAND_ZONING_RETRIEVED = 'Oct 5, 2026';
export const HIGHLAND_ZONING_SOURCE = 'City of Austin zoning boundaries (data.austintexas.gov/d/xt8n-xrjg)';

export const HIGHLAND_PRESCREENS: SamplePrescreen[] = [
  {
    label: 'Parcel west of ACC Highland',
    lat: 30.32656,
    lon: -97.72008,
    zoningCode: 'CS-ETOD-DBETOD-NP',
    baseDistrict: 'CS · General Commercial Services',
    status: 'permitted',
    matchedUse: 'Restaurant (Limited)',
    tableValue: 'P',
    reason:
      'The use table lists Restaurant (Limited) as permitted (P) in CS, and none of the overlays on this parcel remove it.',
    overlays: [
      { code: 'ETOD', note: 'Equitable transit-oriented overlay; modeled, no change for this use', citation: '§ 25-2-653', changesResult: false },
      { code: 'DBETOD', note: 'Density bonus option; adds non-ETOD standards only', citation: '§ 25-2-653(G)', changesResult: false },
      { code: 'NP', note: 'Neighborhood plan; can add uses, does not remove this one', citation: '§ 25-2-176', changesResult: false },
    ],
    citations: ['§ 25-2-491'],
    caseNumbers: ['C20-2023-004', 'C14-04-0012.002'],
    nextSteps: [
      'Confirm the exact parcel boundary and any site-specific restrictive covenants.',
      'Check site development standards (parking, signage) for a restaurant buildout.',
      'Verify with the City of Austin Development Services Department before signing.',
    ],
  },
  {
    label: 'Parcel on the Highland redevelopment block',
    lat: 30.32871,
    lon: -97.71704,
    zoningCode: 'CS-MU-V-CO-ETOD-DBETOD-NP',
    baseDistrict: 'CS · General Commercial Services',
    status: 'unclear',
    matchedUse: 'Restaurant (Limited)',
    tableValue: 'P',
    reason:
      'The base district permits this use, but a Conditional Overlay (CO) applies. CO ordinances can prohibit specific uses parcel by parcel, and SpotCore does not model ordinance text yet.',
    overlays: [
      { code: 'CO', note: 'Conditional overlay; may restrict uses. Not modeled', citation: '§ 25-2-332', changesResult: true },
      { code: 'MU', note: 'Mixed use; adds residential uses', citation: '§ 25-2-172', changesResult: false },
      { code: 'V', note: 'Vertical mixed use; adds residential uses', citation: '§ 25-2-172', changesResult: false },
      { code: 'ETOD', note: 'Equitable transit-oriented overlay; modeled, no change', citation: '§ 25-2-653', changesResult: false },
      { code: 'NP', note: 'Neighborhood plan; can add uses', citation: '§ 25-2-176', changesResult: false },
    ],
    citations: ['§ 25-2-491', '§ 25-2-332'],
    caseNumbers: ['C20-2023-004', 'C14-04-0012.002', 'C14-2009-0012'],
    nextSteps: [
      'Pull the ordinance for the zoning cases on record and read the CO conditions.',
      'If the CO lists prohibited uses, check whether restaurant uses are among them.',
      'Ask the City of Austin zoning case manager to confirm before committing.',
    ],
  },
];

/** Market layer for the Highland sample. Scores, POIs and demographics are illustrative, not live data. */
export const HIGHLAND_SAMPLE_RESPONSE: AnalyzeSiteResponse = {
  location: {
    label: 'Sample — Highland, Austin, TX',
    lat: 30.32656,
    lon: -97.72008,
    display_name: 'Highland neighborhood near ACC Highland and the Airport Blvd corridor (sample)',
    census_tract: 'Sample tract',
    county: 'Travis',
    state: 'TX',
  },
  total_score: 71,
  recommendation: 'medium',
  scores: {
    demand: 74,
    competition: 66,
    accessibility: 78,
    demographic_fit: 69,
    cost_fit: 72,
  },
  ai_insights: {
    insights: {
      strategic_overview:
        'A campus-anchored trade area: steady weekday daytime traffic from ACC Highland and nearby offices, softer evenings and weekends.',
      the_edge:
        'Student and staff foot traffic within a short walk, plus rail and frequent bus access along Airport Blvd.',
      the_blindspot:
        'Demand follows the academic calendar. Summer and winter breaks can cut weekday volume. Model a slow quarter before signing.',
      the_power_move:
        'Lead with a morning and lunch menu, add grab-and-go for class changeovers, and test evening hours only after 90 days of data.',
    },
    confidence_score: 0.74,
  },
  competitors: [
    { name: 'Campus café (sample)', category: 'cafe', lat: 30.3281, lon: -97.7186, distance_m: 260, osm_type: 'node', osm_id: 91001 },
    { name: 'Drive-thru coffee chain (sample)', category: 'cafe', lat: 30.3252, lon: -97.7172, distance_m: 410, osm_type: 'node', osm_id: 91002 },
    { name: 'Bakery café (sample)', category: 'cafe', lat: 30.3239, lon: -97.7221, distance_m: 330, osm_type: 'node', osm_id: 91003 },
  ],
  complementary_businesses: [
    { name: 'Coworking space (sample)', category: 'office', lat: 30.3276, lon: -97.7208, distance_m: 120, osm_type: 'node', osm_id: 91004 },
    { name: 'Fitness studio (sample)', category: 'gym', lat: 30.3259, lon: -97.7183, distance_m: 190, osm_type: 'node', osm_id: 91005 },
  ],
  demographics: {
    tract_id: 'Sample tract',
    population: 5180,
    median_household_income: 54300,
    median_age: 29.8,
    pct_bachelors_or_higher: 38,
    commute_pct_public_transit: 9,
    vacancy_rate_pct: 8.4,
    summary: 'Illustrative profile: younger, student-heavy daytime population with below-metro median income.',
  },
  transit: {
    subway_stops_within_800m: 1,
    bus_or_light_rail_stops_within_400m: 5,
    nearest_subway_distance_m: 620,
    summary: 'Sample summary: commuter rail station within a walk and several bus stops on Airport Blvd (illustrative).',
  },
  summary: [
    'Zoning results above come from the rules engine and City of Austin data.',
    'Scores, competitors and demographics in this section are illustrative.',
    'Run an analysis on a real address for live OpenStreetMap and Census signals.',
  ],
  data_sources: {
    mode: 'sample',
    note: 'Illustrative market layer for the Highland sample page.',
  },
};
