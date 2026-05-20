
import { useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import AddressAutocomplete from '$lib/components/AddressAutocomplete';
import { cn } from '$lib/utils/cn';
import {
  ANALYSIS_FORM_FIELDS,
  ANALYSIS_INTAKE_DEFAULTS,
  BUSINESS_TYPE_SUGGESTIONS,
  type AnalysisFieldDefinition,
  type AnalysisFieldId,
  type AnalysisIntakeValues,
} from './analysisIntakeFormConfig';
import './analysis-intake-form.css';

const premiumInputClass = 'analysis-form__control mt-0 w-full border-0 shadow-none ring-0';

const broadTargetTerms = new Set([
  'everyone',
  'anyone',
  'customers',
  'customer',
  'people',
  'general public',
  'all customers',
  'broad audience',
]);

function createInitialValues(): AnalysisIntakeValues {
  return {
    ...ANALYSIS_INTAKE_DEFAULTS,
    priorityFactors: [...ANALYSIS_INTAKE_DEFAULTS.priorityFactors],
  };
}

export interface AnalysisIntakeFormProps {
  loading?: boolean;
  error?: string | null;
  showSampleAction?: boolean;
  onSubmitRequest: (values: AnalysisIntakeValues) => void;
  onSampleRequest: (values: AnalysisIntakeValues) => void;
}

const coreFields = ANALYSIS_FORM_FIELDS.filter((field) => field.section === 'core');
const advancedFields = ANALYSIS_FORM_FIELDS.filter((field) => field.section === 'advanced');

export default function AnalysisIntakeForm({
  loading = false,
  error = null,
  showSampleAction = true,
  onSubmitRequest,
  onSampleRequest,
}: AnalysisIntakeFormProps) {
  const [values, setValues] = useState<AnalysisIntakeValues>(createInitialValues);
  const [touched, setTouched] = useState<Partial<Record<AnalysisFieldId, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function updateValue<K extends AnalysisFieldId>(id: K, value: AnalysisIntakeValues[K]) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function markTouched(id: AnalysisFieldId) {
    setTouched((prev) => ({ ...prev, [id]: true }));
  }

  function normalizeValues(source: AnalysisIntakeValues): AnalysisIntakeValues {
    return {
      businessType: source.businessType.trim(),
      address: source.address.trim(),
      targetCustomer: source.targetCustomer.trim(),
      decisionGoal: source.decisionGoal.trim(),
      tradeArea: source.tradeArea.trim(),
      priorityFactors: Array.from(new Set(source.priorityFactors)),
      competitors: source.competitors.trim(),
      constraints: source.constraints.trim(),
      timeline: source.timeline.trim(),
      notes: source.notes.trim(),
    };
  }

  function isMissing(field: AnalysisFieldDefinition): boolean {
    const value = values[field.id];
    if (Array.isArray(value)) return value.length === 0;
    return (value as string).trim().length === 0;
  }

  function fieldError(field: AnalysisFieldDefinition): string | null {
    if (!field.required) return null;
    if (!submitted && !touched[field.id]) return null;
    return isMissing(field) ? `${field.label} is required.` : null;
  }

  function addressSuggestion(): string | null {
    const value = values.address.trim();
    if (!value || (!submitted && !touched.address)) return null;
    const hasStreetNumber = /\d/.test(value);
    const hasSeparator = value.includes(',') || value.includes('&');
    const words = value.split(/\s+/).filter(Boolean);
    if (!hasStreetNumber && !hasSeparator && words.length < 2) {
      return 'A full street address or a clearer area usually gives a stronger readout.';
    }
    return null;
  }

  function targetSuggestion(): string | null {
    const value = values.targetCustomer.trim().toLowerCase();
    if (!value || (!submitted && !touched.targetCustomer)) return null;
    if (broadTargetTerms.has(value)) {
      return 'Try being a bit more specific, like commuters, families, or high-income shoppers.';
    }
    return null;
  }

  function fieldMessage(
    field: AnalysisFieldDefinition,
  ): { tone: 'error' | 'hint'; text: string } | null {
    const errorText = fieldError(field);
    if (errorText) return { tone: 'error', text: errorText };
    if (field.id === 'address') {
      const hint = addressSuggestion();
      if (hint) return { tone: 'hint', text: hint };
    }
    if (field.id === 'targetCustomer') {
      const hint = targetSuggestion();
      if (hint) return { tone: 'hint', text: hint };
    }
    return null;
  }

  function togglePriorityFactor(value: string) {
    markTouched('priorityFactors');
    const selected = values.priorityFactors.includes(value);
    updateValue(
      'priorityFactors',
      selected
        ? values.priorityFactors.filter((item) => item !== value)
        : [...values.priorityFactors, value],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const missingRequired = coreFields.some((field) => field.required && isMissing(field));
    if (missingRequired) {
      setTouched((prev) => ({
        ...prev,
        businessType: true,
        address: true,
        targetCustomer: true,
        decisionGoal: true,
      }));
      return;
    }
    onSubmitRequest(normalizeValues(values));
  }

  function handleSampleRequest() {
    onSampleRequest(normalizeValues(values));
  }

  function helperCopy(field: AnalysisFieldDefinition): string {
    if (field.type === 'select' || field.type === 'multi-chip') {
      return `${field.helperText} Example: ${field.placeholder}`;
    }
    return field.helperText;
  }

  function renderField(field: AnalysisFieldDefinition, optionalShell = false) {
    const message = fieldMessage(field);
    const textValue = typeof values[field.id] === 'string' ? (values[field.id] as string) : '';

    return (
      <div
        key={field.id}
        className={cn((field.columnSpan ?? 1) === 2 && 'analysis-form__field--span-2')}
      >
        <div
          className={cn(
            'analysis-form__field-shell',
            optionalShell && 'analysis-form__field-shell--optional',
          )}
        >
          <div className="analysis-form__field-head">
            <label className="analysis-form__label" htmlFor={field.id}>
              {field.label}
            </label>
            <span
              className={cn(
                'analysis-form__status',
                field.required && 'analysis-form__status--required',
              )}
            >
              {field.required ? 'Required' : 'Optional'}
            </span>
          </div>

          <p className="analysis-form__helper">{helperCopy(field)}</p>

          {field.id === 'address' ? (
            <div className="analysis-form__control-wrap">
              <AddressAutocomplete
                id={field.id}
                value={values.address}
                onChange={(v) => updateValue('address', v)}
                disabled={loading}
                inputClass={premiumInputClass}
              />
            </div>
          ) : field.type === 'text' ? (
            <div className="analysis-form__control-wrap">
              <input
                id={field.id}
                type="text"
                className="analysis-form__control"
                value={textValue}
                placeholder={field.placeholder}
                list={field.id === 'businessType' ? 'analysis-business-types' : undefined}
                aria-invalid={message?.tone === 'error'}
                aria-required={field.required}
                disabled={loading}
                onFocus={() => markTouched(field.id)}
                onBlur={() => markTouched(field.id)}
                onChange={(e) => updateValue(field.id, e.target.value)}
              />
            </div>
          ) : field.type === 'textarea' ? (
            <div className="analysis-form__control-wrap">
              <textarea
                id={field.id}
                className="analysis-form__control analysis-form__control--textarea"
                rows={field.rows ?? 4}
                placeholder={field.placeholder}
                aria-invalid={message?.tone === 'error'}
                disabled={loading}
                value={textValue}
                onFocus={() => markTouched(field.id)}
                onBlur={() => markTouched(field.id)}
                onChange={(e) => updateValue(field.id, e.target.value)}
              />
            </div>
          ) : field.type === 'select' ? (
            <div className="analysis-form__control-wrap">
              <select
                id={field.id}
                className="analysis-form__control analysis-form__control--select"
                value={textValue}
                aria-invalid={message?.tone === 'error'}
                disabled={loading}
                onFocus={() => markTouched(field.id)}
                onBlur={() => markTouched(field.id)}
                onChange={(e) => updateValue(field.id, e.target.value)}
              >
                {field.required ? (
                  <option value="" disabled={textValue !== ''}>
                    Select an option
                  </option>
                ) : null}
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : field.type === 'multi-chip' ? (
            <div className="analysis-form__chip-row">
              {(field.options ?? []).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="analysis-form__chip"
                  aria-pressed={values.priorityFactors.includes(option.value)}
                  disabled={loading}
                  onClick={() => togglePriorityFactor(option.value)}
                >
                  <span className="analysis-form__chip-dot" aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          ) : null}

          {message ? (
            <p
              className={cn(
                'analysis-form__message',
                message.tone === 'error' && 'analysis-form__message--error',
              )}
            >
              {message.text}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form className="analysis-form" onSubmit={handleSubmit} noValidate>
      <div className="analysis-form__notice">
        <div>
          <p className="analysis-form__eyebrow">Decision intake</p>
          <p className="analysis-form__notice-title">
            Start with the essentials. Add more context only if it helps.
          </p>
        </div>
        <span className="analysis-form__notice-badge">Required first</span>
      </div>

      <div className="analysis-form__grid">{coreFields.map((field) => renderField(field))}</div>

      <div className="analysis-form__advanced-shell">
        <button
          type="button"
          className="analysis-form__advanced-toggle"
          aria-expanded={showAdvanced}
          onClick={() => setShowAdvanced((v) => !v)}
        >
          <div>
            <p className="analysis-form__eyebrow">More details</p>
            <p className="analysis-form__advanced-title">Optional context for a deeper analysis</p>
          </div>
          <span
            className="analysis-form__advanced-icon"
            style={{ transform: showAdvanced ? 'rotate(180deg)' : undefined }}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>

        {showAdvanced ? (
          <div className="analysis-form__advanced-panel">
            <div className="analysis-form__grid">
              {advancedFields.map((field) => renderField(field, true))}
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="analysis-form__alert" role="alert">
          {error}
        </div>
      ) : null}

      <div className="analysis-form__footer">
        <div className="analysis-form__footer-main">
          <button type="submit" className="analysis-form__submit group" disabled={loading}>
            {loading ? (
              <>
                <span className="analysis-form__spinner"></span>
                Running analysis...
              </>
            ) : (
              <>
                Run GeoScore Analysis
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </>
            )}
          </button>
          <p className="analysis-form__consent">
            By submitting, you agree to our <strong>terms of service</strong>.
          </p>
          <p className="analysis-form__footer-copy">
            We&apos;ll turn your inputs into a decision-ready readout.
          </p>
        </div>

        {showSampleAction ? (
          <button
            type="button"
            className="analysis-form__secondary"
            disabled={loading}
            onClick={handleSampleRequest}
          >
            View sample report
          </button>
        ) : null}
      </div>

      <datalist id="analysis-business-types">
        {BUSINESS_TYPE_SUGGESTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </form>
  );
}
