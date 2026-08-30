export type AnalysisFieldId =
  | 'businessType'
  | 'address'
  | 'targetCustomer'
  | 'decisionGoal'
  | 'tradeArea'
  | 'priorityFactors'
  | 'competitors'
  | 'constraints'
  | 'timeline'
  | 'notes';

export type AnalysisFieldType = 'text' | 'textarea' | 'autocomplete' | 'select' | 'multi-chip';

export interface AnalysisFieldOption {
  value: string;
  label: string;
}

export interface AnalysisFieldDefinition {
  id: AnalysisFieldId;
  label: string;
  required: boolean;
  placeholder: string;
  helperText: string;
  type: AnalysisFieldType;
  section: 'core' | 'advanced';
  columnSpan?: 1 | 2;
  options?: readonly AnalysisFieldOption[];
  rows?: number;
}

export interface AnalysisIntakeValues {
  businessType: string;
  address: string;
  targetCustomer: string;
  decisionGoal: string;
  tradeArea: string;
  priorityFactors: string[];
  competitors: string;
  constraints: string;
  timeline: string;
  notes: string;
}

export const BUSINESS_TYPE_SUGGESTIONS = [
  'Coffee shop',
  'Fast casual restaurant',
  'Boutique fitness',
  'Convenience retail',
  'Clinic',
  'Salon',
  'Franchise concept',
] as const;

export const DECISION_GOAL_OPTIONS = [
  { value: 'New site selection', label: 'New site selection' },
  { value: 'Relocation', label: 'Relocation' },
  { value: 'Expansion', label: 'Expansion' },
  { value: 'Comparison', label: 'Comparison' },
  { value: 'Portfolio review', label: 'Portfolio review' },
] as const;

export const TRADE_AREA_OPTIONS = [
  { value: '5-minute drive', label: '5-minute drive' },
  { value: '10-minute drive', label: '10-minute drive' },
  { value: '1 mile radius', label: '1 mile radius' },
  { value: '10-minute walk', label: '10-minute walk' },
  { value: 'Custom boundary', label: 'Custom boundary' },
] as const;

export const PRIORITY_FACTOR_OPTIONS = [
  { value: 'Demand', label: 'Demand' },
  { value: 'Competition', label: 'Competition' },
  { value: 'Demographics', label: 'Demographics' },
  { value: 'Foot traffic', label: 'Foot traffic' },
  { value: 'Mobility', label: 'Mobility' },
  { value: 'Parking', label: 'Parking' },
  { value: 'Visibility', label: 'Visibility' },
  { value: 'Rent', label: 'Rent' },
] as const;

export const ANALYSIS_INTAKE_DEFAULTS: AnalysisIntakeValues = {
  businessType: '',
  address: '',
  targetCustomer: '',
  decisionGoal: '',
  tradeArea: '5-minute drive',
  priorityFactors: ['Demand', 'Competition', 'Demographics'],
  competitors: '',
  constraints: '',
  timeline: '',
  notes: '',
};

export const ANALYSIS_FORM_FIELDS: readonly AnalysisFieldDefinition[] = [
  {
    id: 'businessType',
    label: 'Business type',
    required: true,
    placeholder: 'e.g. Coffee shop',
    helperText: 'What kind of business are you evaluating?',
    type: 'text',
    section: 'core',
  },
  {
    id: 'address',
    label: 'Address or area',
    required: true,
    placeholder: 'e.g. 123 Main St, Austin, TX',
    helperText: 'Enter one location or a place you want to analyze.',
    type: 'autocomplete',
    section: 'core',
  },
  {
    id: 'targetCustomer',
    label: 'Target customer',
    required: true,
    placeholder: 'e.g. Young professionals',
    helperText: 'Who are you trying to attract to this location?',
    type: 'text',
    section: 'core',
  },
  {
    id: 'decisionGoal',
    label: 'What are you trying to decide?',
    required: true,
    placeholder: 'e.g. New site selection',
    helperText: 'Tell us what decision you want SpotCore to help with.',
    type: 'select',
    section: 'core',
    options: DECISION_GOAL_OPTIONS,
  },
  {
    id: 'tradeArea',
    label: 'Trade area',
    required: false,
    placeholder: 'e.g. 5-minute drive',
    helperText: 'How far should we look around the site?',
    type: 'select',
    section: 'advanced',
    options: TRADE_AREA_OPTIONS,
  },
  {
    id: 'priorityFactors',
    label: 'What matters most?',
    required: false,
    placeholder: 'e.g. Demand and competition',
    helperText: 'Pick the factors that matter most for this decision.',
    type: 'multi-chip',
    section: 'advanced',
    columnSpan: 2,
    options: PRIORITY_FACTOR_OPTIONS,
  },
  {
    id: 'competitors',
    label: 'Nearby competitors',
    required: false,
    placeholder: 'e.g. Starbucks, Dunkin, local cafes',
    helperText: 'Add specific competitors if you want us to compare against them.',
    type: 'textarea',
    section: 'advanced',
    rows: 3,
  },
  {
    id: 'constraints',
    label: 'Budget or constraints',
    required: false,
    placeholder: 'e.g. $8k/month rent, 1,500 sq ft',
    helperText: 'Add any rules or limits we should consider.',
    type: 'textarea',
    section: 'advanced',
    rows: 3,
  },
  {
    id: 'timeline',
    label: 'Timeline',
    required: false,
    placeholder: 'e.g. This week',
    helperText: 'Useful for prioritizing urgency.',
    type: 'text',
    section: 'advanced',
  },
  {
    id: 'notes',
    label: 'Additional notes',
    required: false,
    placeholder: 'e.g. Need strong lunch traffic and nearby parking',
    helperText: 'Add any extra context.',
    type: 'textarea',
    section: 'advanced',
    columnSpan: 2,
    rows: 4,
  },
] as const;
