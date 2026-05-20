
import { useCallback, useEffect, useRef, useState } from 'react';
import { suggestAddress } from '$lib/api';
import type { AddressSuggestion } from '$lib/types';
import { cn } from '$lib/utils/cn';

const DEBOUNCE_MS = 320;
const MIN_CHARS = 3;

const defaultInputClass =
  'mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm ring-1 ring-slate-900/[0.02] placeholder:text-muted/45 transition focus:border-teal-600/40 focus:outline-none focus:ring-4 focus:ring-teal-600/15 disabled:cursor-not-allowed disabled:opacity-50';

export interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
  required?: boolean;
  disabled?: boolean;
  inputClass?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  id,
  required = false,
  disabled = false,
  inputClass = defaultInputClass,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const suppressSuggestUntilRef = useRef(0);

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  const runSuggest = useCallback(
    async (q: string) => {
      if (Date.now() < suppressSuggestUntilRef.current) return;
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();
      const query = q.trim();
      if (query.length < MIN_CHARS) {
        setSuggestions([]);
        setOpen(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await suggestAddress(query, 8, controllerRef.current.signal);
        setSuggestions(res.suggestions);
        setOpen(res.suggestions.length > 0);
        setActive(res.suggestions.length > 0 ? 0 : -1);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setSuggestions([]);
        setOpen(false);
        setActive(-1);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (disabled) {
      close();
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void runSuggest(value);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, disabled, runSuggest, close]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    function onDocClick(ev: MouseEvent) {
      if (!containerRef.current?.contains(ev.target as Node)) close();
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [close]);

  function pick(s: AddressSuggestion) {
    suppressSuggestUntilRef.current = Date.now() + 450;
    onChange(s.label);
    close();
    setSuggestions([]);
  }

  function onKeydown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      pick(suggestions[active]);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative isolate', open && suggestions.length > 0 && 'z-50')}
    >
      <input
        id={id}
        name="address"
        className={inputClass}
        autoComplete="off"
        autoCapitalize="words"
        spellCheck
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={onKeydown}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        role="combobox"
      />
      {loading ? (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 pt-1">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-teal-700"></span>
        </div>
      ) : null}

      {open && suggestions.length > 0 ? (
        <ul
          id={`${id}-listbox`}
          className="absolute left-0 right-0 z-[200] mt-2 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface py-1 shadow-lg ring-1 ring-slate-900/[0.06]"
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li key={s.label} role="presentation">
              <button
                type="button"
                className={cn(
                  'flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-canvas/50',
                  i === active && 'bg-canvas/20',
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s);
                }}
                role="option"
                aria-selected={i === active}
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700"
                  aria-hidden="true"
                ></span>
                <span className="leading-snug">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
