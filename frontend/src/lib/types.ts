export type Recommendation = 'strong' | 'medium' | 'weak';

export interface BusinessMarker {
  name: string;
  category: string;
  lat: number;
  lon: number;
  distance_m: number;
  osm_type?: string | null;
  osm_id?: number | null;
}

export interface LocationInfo {
  label: string;
  lat: number;
  lon: number;
  display_name?: string | null;
  census_tract?: string | null;
  county?: string | null;
  state?: string | null;
}

export interface ScoreBreakdown {
  demand: number;
  competition: number;
  accessibility: number;
  demographic_fit: number;
  cost_fit?: number | null;
}

export interface DemographicsBlock {
  tract_id?: string | null;
  population?: number | null;
  median_household_income?: number | null;
  median_age?: number | null;
  pct_bachelors_or_higher?: number | null;
  commute_pct_public_transit?: number | null;
  vacancy_rate_pct?: number | null;
  summary: string;
}

export interface TransitBlock {
  subway_stops_within_800m: number;
  bus_or_light_rail_stops_within_400m: number;
  nearest_subway_distance_m?: number | null;
  summary: string;
}

export interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
  osm_id?: number | null;
  osm_type?: string | null;
}

export interface AddressSuggestResponse {
  suggestions: AddressSuggestion[];
  source: string;
}

export interface AnalyzeSiteResponse {
  location: LocationInfo;
  total_score: number;
  recommendation: Recommendation;
  scores: ScoreBreakdown;
  competitors: BusinessMarker[];
  complementary_businesses: BusinessMarker[];
  demographics: DemographicsBlock;
  transit: TransitBlock;
  summary: string[];
  data_sources?: Record<string, unknown>;
}

export type TrendsTimeframe = 'today 3-m' | 'today 12-m' | 'today 5-y' | 'now 7-d';

export interface GeocodedLocationGoogle {
  formatted_address?: string | null;
  lat: number;
  lng: number;
  street_number?: string | null;
  route?: string | null;
  locality?: string | null;
  sublocality?: string | null;
  neighborhood?: string | null;
  administrative_area_level_1?: string | null;
  administrative_area_level_1_long?: string | null;
  administrative_area_level_2?: string | null;
  administrative_area_level_2_long?: string | null;
  country?: string | null;
  country_long?: string | null;
  postal_code?: string | null;
  place_id?: string | null;
}

export interface RegionTrendRow {
  region: string;
  scores: Record<string, number>;
}

export interface TrendsKeywordsResponse {
  disclaimer: string;
  geocode: GeocodedLocationGoogle;
  primary_keyword: string;
  trends_geo: string;
  trends_resolution: string;
  timeframe: string;
  keywords: string[];
  regions: RegionTrendRow[];
}
