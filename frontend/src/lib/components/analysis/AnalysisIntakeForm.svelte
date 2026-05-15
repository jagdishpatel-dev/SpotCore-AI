<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { ArrowRight, ChevronDown, Sparkles } from 'lucide-svelte';
  import AddressAutocomplete from '$lib/components/AddressAutocomplete.svelte';
  import {
    ANALYSIS_FORM_FIELDS,
    ANALYSIS_INTAKE_DEFAULTS,
    BUSINESS_TYPE_SUGGESTIONS,
    type AnalysisFieldDefinition,
    type AnalysisFieldId,
    type AnalysisIntakeValues,
  } from './analysisIntakeFormConfig';

  export let loading = false;
  export let error: string | null = null;
  export let showSampleAction = true;

  const dispatch = createEventDispatcher<{
    submitRequest: AnalysisIntakeValues;
    sampleRequest: AnalysisIntakeValues;
  }>();

  const coreFields = ANALYSIS_FORM_FIELDS.filter((field) => field.section === 'core');
  const advancedFields = ANALYSIS_FORM_FIELDS.filter((field) => field.section === 'advanced');

  const premiumInputClass =
    'analysis-form__control mt-0 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)] px-4 py-3.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-none ring-0 transition focus:border-accent-cyan/55 focus:outline-none focus:ring-4 focus:ring-accent-cyan/12 disabled:cursor-not-allowed disabled:opacity-60';

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

  let values = createInitialValues();
  let touched: Partial<Record<AnalysisFieldId, boolean>> = {};
  let submitted = false;
  let showAdvanced = false;

  function createInitialValues(): AnalysisIntakeValues {
    return {
      ...ANALYSIS_INTAKE_DEFAULTS,
      priorityFactors: [...ANALYSIS_INTAKE_DEFAULTS.priorityFactors],
    };
  }

  function updateValue<K extends AnalysisFieldId>(id: K, value: AnalysisIntakeValues[K]) {
    values = { ...values, [id]: value };
  }

  function markTouched(id: AnalysisFieldId) {
    touched = { ...touched, [id]: true };
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
    return value.trim().length === 0;
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

  function fieldMessage(field: AnalysisFieldDefinition): { tone: 'error' | 'hint'; text: string } | null {
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
        : [...values.priorityFactors, value]
    );
  }

  function handleSubmit() {
    submitted = true;
    const missingRequired = coreFields.some((field) => field.required && isMissing(field));

    if (missingRequired) {
      touched = {
        ...touched,
        businessType: true,
        address: true,
        targetCustomer: true,
        decisionGoal: true,
      };
      return;
    }

    dispatch('submitRequest', normalizeValues(values));
  }

  function handleSampleRequest() {
    dispatch('sampleRequest', normalizeValues(values));
  }

  function helperCopy(field: AnalysisFieldDefinition): string {
    if (field.type === 'select' || field.type === 'multi-chip') {
      return `${field.helperText} Example: ${field.placeholder}`;
    }
    return field.helperText;
  }
</script>

<form class="analysis-form" on:submit|preventDefault={handleSubmit} novalidate>
  <div class="analysis-form__notice">
    <div>
      <p class="analysis-form__eyebrow">Decision intake</p>
      <p class="analysis-form__notice-title">Start with the essentials. Add more context only if it helps.</p>
    </div>
    <span class="analysis-form__notice-badge">Required first</span>
  </div>

  <div class="analysis-form__grid">
    {#each coreFields as field (field.id)}
      {@const message = fieldMessage(field)}
      {@const textValue = typeof values[field.id] === 'string' ? values[field.id] : ''}
      <div class:analysis-form__field--span-2={(field.columnSpan ?? 1) === 2}>
        <div class="analysis-form__field-shell">
          <div class="analysis-form__field-head">
            <label class="analysis-form__label" for={field.id}>{field.label}</label>
            <span class:analysis-form__status--required={field.required} class="analysis-form__status">
              {field.required ? 'Required' : 'Optional'}
            </span>
          </div>

          <p class="analysis-form__helper">{helperCopy(field)}</p>

          {#if field.id === 'address'}
            <div class="analysis-form__control-wrap">
              <AddressAutocomplete
                id={field.id}
                bind:value={values.address}
                disabled={loading}
                inputClass={premiumInputClass}
              />
            </div>
          {:else if field.type === 'text'}
            <div class="analysis-form__control-wrap">
              <input
                id={field.id}
                type="text"
                class="analysis-form__control"
                value={textValue}
                placeholder={field.placeholder}
                list={field.id === 'businessType' ? 'analysis-business-types' : undefined}
                aria-invalid={message?.tone === 'error'}
                aria-required={field.required}
                disabled={loading}
                on:focus={() => markTouched(field.id)}
                on:blur={() => markTouched(field.id)}
                on:input={(event) =>
                  updateValue(field.id, (event.currentTarget as HTMLInputElement).value)}
              />
            </div>
          {:else if field.type === 'textarea'}
            <div class="analysis-form__control-wrap">
              <textarea
                id={field.id}
                class="analysis-form__control analysis-form__control--textarea"
                rows={field.rows ?? 4}
                placeholder={field.placeholder}
                aria-invalid={message?.tone === 'error'}
                disabled={loading}
                value={textValue}
                on:focus={() => markTouched(field.id)}
                on:blur={() => markTouched(field.id)}
                on:input={(event) =>
                  updateValue(field.id, (event.currentTarget as HTMLTextAreaElement).value)}
              ></textarea>
            </div>
          {:else if field.type === 'select'}
            <div class="analysis-form__control-wrap">
              <select
                id={field.id}
                class="analysis-form__control analysis-form__control--select"
                value={textValue}
                aria-invalid={message?.tone === 'error'}
                disabled={loading}
                on:focus={() => markTouched(field.id)}
                on:blur={() => markTouched(field.id)}
                on:change={(event) =>
                  updateValue(field.id, (event.currentTarget as HTMLSelectElement).value)}
              >
                {#if field.required}
                  <option value="" disabled selected={textValue === ''}>Select an option</option>
                {/if}
                {#each field.options ?? [] as option (option.value)}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </div>
          {:else if field.type === 'multi-chip'}
            <div class="analysis-form__chip-row">
              {#each field.options ?? [] as option (option.value)}
                <button
                  type="button"
                  class="analysis-form__chip"
                  aria-pressed={values.priorityFactors.includes(option.value)}
                  disabled={loading}
                  on:click={() => togglePriorityFactor(option.value)}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          {/if}

          {#if message}
            <p class:analysis-form__message--error={message.tone === 'error'} class="analysis-form__message">
              {message.text}
            </p>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <div class="analysis-form__advanced-shell">
    <button
      type="button"
      class="analysis-form__advanced-toggle"
      aria-expanded={showAdvanced}
      on:click={() => (showAdvanced = !showAdvanced)}
    >
      <div>
        <p class="analysis-form__eyebrow">More details</p>
        <p class="analysis-form__advanced-title">Optional context for a deeper analysis</p>
      </div>
      <span class="analysis-form__advanced-icon" style={showAdvanced ? 'transform: rotate(180deg);' : ''}>
        <ChevronDown class="h-4 w-4" />
      </span>
    </button>

    {#if showAdvanced}
      <div transition:slide={{ duration: 220 }} class="analysis-form__advanced-panel">
        <div class="analysis-form__grid">
          {#each advancedFields as field (field.id)}
            {@const message = fieldMessage(field)}
            {@const textValue = typeof values[field.id] === 'string' ? values[field.id] : ''}
            <div class:analysis-form__field--span-2={(field.columnSpan ?? 1) === 2}>
              <div class="analysis-form__field-shell analysis-form__field-shell--optional">
                <div class="analysis-form__field-head">
                  <label class="analysis-form__label" for={field.id}>{field.label}</label>
                  <span class="analysis-form__status">{field.required ? 'Required' : 'Optional'}</span>
                </div>

                <p class="analysis-form__helper">{helperCopy(field)}</p>

                {#if field.type === 'text'}
                  <div class="analysis-form__control-wrap">
                    <input
                      id={field.id}
                      type="text"
                      class="analysis-form__control"
                      value={textValue}
                      placeholder={field.placeholder}
                      disabled={loading}
                      on:focus={() => markTouched(field.id)}
                      on:blur={() => markTouched(field.id)}
                      on:input={(event) =>
                        updateValue(field.id, (event.currentTarget as HTMLInputElement).value)}
                    />
                  </div>
                {:else if field.type === 'textarea'}
                  <div class="analysis-form__control-wrap">
                    <textarea
                      id={field.id}
                      class="analysis-form__control analysis-form__control--textarea"
                      rows={field.rows ?? 4}
                      placeholder={field.placeholder}
                      disabled={loading}
                      value={textValue}
                      on:focus={() => markTouched(field.id)}
                      on:blur={() => markTouched(field.id)}
                      on:input={(event) =>
                        updateValue(field.id, (event.currentTarget as HTMLTextAreaElement).value)}
                    ></textarea>
                  </div>
                {:else if field.type === 'select'}
                  <div class="analysis-form__control-wrap">
                    <select
                      id={field.id}
                      class="analysis-form__control analysis-form__control--select"
                      value={textValue}
                      disabled={loading}
                      on:focus={() => markTouched(field.id)}
                      on:blur={() => markTouched(field.id)}
                      on:change={(event) =>
                        updateValue(field.id, (event.currentTarget as HTMLSelectElement).value)}
                    >
                      {#each field.options ?? [] as option (option.value)}
                        <option value={option.value}>{option.label}</option>
                      {/each}
                    </select>
                  </div>
                {:else if field.type === 'multi-chip'}
                  <div class="analysis-form__chip-row">
                    {#each field.options ?? [] as option (option.value)}
                      <button
                        type="button"
                        class="analysis-form__chip"
                        aria-pressed={values.priorityFactors.includes(option.value)}
                        disabled={loading}
                        on:click={() => togglePriorityFactor(option.value)}
                      >
                        {option.label}
                      </button>
                    {/each}
                  </div>
                {/if}

                {#if message}
                  <p class:analysis-form__message--error={message.tone === 'error'} class="analysis-form__message">
                    {message.text}
                  </p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if error}
    <div class="analysis-form__alert" role="alert">
      {error}
    </div>
  {/if}

  <div class="analysis-form__footer">
    <div>
      <button
        type="submit"
        class="analysis-form__submit group"
        disabled={loading}
      >
        {#if loading}
          <span class="analysis-form__spinner"></span>
          Running analysis...
        {:else}
          <Sparkles class="h-4 w-4" />
          Run GeoScore Analysis
          <ArrowRight class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        {/if}
      </button>
      <p class="analysis-form__footer-copy">We'll turn your inputs into a decision-ready readout.</p>
    </div>

    {#if showSampleAction}
      <button
        type="button"
        class="analysis-form__secondary"
        disabled={loading}
        on:click={handleSampleRequest}
      >
        View sample report
      </button>
    {/if}
  </div>
</form>

<datalist id="analysis-business-types">
  {#each BUSINESS_TYPE_SUGGESTIONS as option}
    <option value={option}></option>
  {/each}
</datalist>

<style>
  .analysis-form {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .analysis-form__notice,
  .analysis-form__advanced-shell,
  .analysis-form__alert {
    border-radius: 22px;
    border: 1px solid var(--border-soft);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.008)),
      var(--bg-surface-2);
  }

  .analysis-form__notice {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.05rem;
  }

  .analysis-form__eyebrow {
    margin: 0;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .analysis-form__notice-title,
  .analysis-form__advanced-title {
    margin: 0.35rem 0 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-primary);
  }

  .analysis-form__notice-badge,
  .analysis-form__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    border: 1px solid var(--border-soft);
    padding: 0.28rem 0.62rem;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.03);
    white-space: nowrap;
  }

  .analysis-form__status--required,
  .analysis-form__notice-badge {
    color: var(--accent-cyan);
    border-color: rgba(34, 211, 238, 0.3);
    background: rgba(34, 211, 238, 0.09);
  }

  .analysis-form__grid {
    display: grid;
    gap: 1rem;
  }

  .analysis-form__field-shell {
    height: 100%;
    border-radius: 22px;
    border: 1px solid var(--border-soft);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.005)),
      rgba(2, 10, 26, 0.62);
    padding: 1rem;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
  }

  .analysis-form__field-shell:hover,
  .analysis-form__field-shell:focus-within {
    border-color: rgba(34, 211, 238, 0.28);
    box-shadow: 0 12px 32px -22px rgba(34, 211, 238, 0.35);
    transform: translateY(-1px);
  }

  .analysis-form__field-shell--optional {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.004)),
      rgba(2, 10, 26, 0.48);
  }

  .analysis-form__field-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .analysis-form__label {
    display: inline-block;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .analysis-form__helper,
  .analysis-form__message {
    margin: 0.45rem 0 0;
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--text-secondary);
    transition:
      color 180ms ease,
      transform 180ms ease;
  }

  .analysis-form__field-shell:focus-within .analysis-form__helper {
    color: var(--text-primary);
    transform: translateX(2px);
  }

  .analysis-form__message {
    color: rgba(249, 115, 22, 0.9);
  }

  .analysis-form__message--error {
    color: var(--danger);
  }

  .analysis-form__control-wrap {
    margin-top: 0.8rem;
  }

  .analysis-form__control {
    width: 100%;
    border-radius: 18px;
    border: 1px solid var(--border-soft);
    background: var(--bg-surface-2);
    color: var(--text-primary);
    padding: 0.95rem 1rem;
    font-size: 15px;
    line-height: 1.45;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease,
      background-color 180ms ease;
  }

  .analysis-form__control::placeholder {
    color: var(--text-muted);
  }

  .analysis-form__control:hover {
    border-color: rgba(34, 211, 238, 0.22);
  }

  .analysis-form__control:focus {
    outline: none;
    border-color: rgba(34, 211, 238, 0.5);
    box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.12);
  }

  .analysis-form__control:disabled,
  .analysis-form__chip:disabled,
  .analysis-form__submit:disabled,
  .analysis-form__secondary:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .analysis-form__control--textarea {
    min-height: 112px;
    resize: vertical;
  }

  .analysis-form__control--select {
    appearance: none;
    background-image:
      linear-gradient(45deg, transparent 50%, var(--text-secondary) 50%),
      linear-gradient(135deg, var(--text-secondary) 50%, transparent 50%);
    background-position:
      calc(100% - 20px) calc(50% - 2px),
      calc(100% - 14px) calc(50% - 2px);
    background-size: 6px 6px, 6px 6px;
    background-repeat: no-repeat;
    padding-right: 2.8rem;
  }

  .analysis-form__chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin-top: 0.85rem;
  }

  .analysis-form__chip {
    border-radius: 9999px;
    border: 1px solid var(--border-soft);
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-secondary);
    padding: 0.65rem 0.95rem;
    font-size: 13px;
    font-weight: 500;
    transition:
      border-color 180ms ease,
      background-color 180ms ease,
      color 180ms ease,
      transform 180ms ease;
  }

  .analysis-form__chip:hover {
    transform: translateY(-1px);
    border-color: rgba(34, 211, 238, 0.26);
    color: var(--text-primary);
  }

  .analysis-form__chip[aria-pressed='true'] {
    border-color: rgba(34, 211, 238, 0.5);
    background: rgba(34, 211, 238, 0.12);
    color: var(--accent-cyan);
  }

  .analysis-form__advanced-toggle {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.05rem;
    text-align: left;
    background: transparent;
    border: 0;
    color: inherit;
  }

  .analysis-form__advanced-icon {
    display: inline-grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 9999px;
    border: 1px solid var(--border-soft);
    color: var(--text-secondary);
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      color 180ms ease;
  }

  .analysis-form__advanced-toggle:hover .analysis-form__advanced-icon {
    border-color: rgba(34, 211, 238, 0.28);
    color: var(--text-primary);
  }

  .analysis-form__advanced-panel {
    padding: 0 1rem 1rem;
  }

  .analysis-form__alert {
    padding: 0.95rem 1rem;
    color: var(--danger);
    font-size: 14px;
    line-height: 1.55;
    border-color: rgba(239, 68, 68, 0.28);
    background:
      linear-gradient(180deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.02)),
      rgba(127, 29, 29, 0.18);
  }

  .analysis-form__footer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .analysis-form__submit,
  .analysis-form__secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    border-radius: 9999px;
    font-weight: 600;
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      border-color 180ms ease,
      background-color 180ms ease;
  }

  .analysis-form__submit {
    min-height: 52px;
    border: 0;
    padding: 0 1.35rem;
    color: #020617;
    background: linear-gradient(180deg, #67e8f9 0%, var(--accent-cyan) 100%);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.4) inset,
      0 24px 60px -20px rgba(34, 211, 238, 0.55);
  }

  .analysis-form__submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.44) inset,
      0 28px 70px -22px rgba(34, 211, 238, 0.62);
  }

  .analysis-form__secondary {
    min-height: 46px;
    padding: 0 1rem;
    border: 1px solid var(--border-soft);
    background: rgba(255, 255, 255, 0.02);
    color: var(--text-primary);
  }

  .analysis-form__secondary:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(34, 211, 238, 0.28);
  }

  .analysis-form__footer-copy {
    margin: 0.55rem 0 0;
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--text-secondary);
  }

  .analysis-form__spinner {
    width: 16px;
    height: 16px;
    border-radius: 9999px;
    border: 2px solid rgba(2, 6, 23, 0.28);
    border-top-color: #020617;
    animation: analysis-spin 0.85s linear infinite;
  }

  @keyframes analysis-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (min-width: 768px) {
    .analysis-form__grid {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    .analysis-form__field--span-2 {
      grid-column: 1 / -1;
    }

    .analysis-form__footer {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  @media (max-width: 767px) {
    .analysis-form__notice {
      flex-direction: column;
    }
  }
</style>
