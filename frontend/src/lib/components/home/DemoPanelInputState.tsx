
import { useEffect, useRef, useState } from 'react';
import { MapPin, Sparkles, ArrowRight, ChevronDown, Search } from 'lucide-react';
import { cn } from '$lib/utils/cn';
import { prefersReducedMotion } from '$lib/utils/motion';
import {
  useDemoFlow,
  CONCEPTS,
  RADII,
  PROFILES,
  DEMO_EXAMPLE_ADDRESS,
} from '$lib/hooks/demoFlow';

export interface DemoPanelInputStateProps {
  onEngage?: () => void;
}

export default function DemoPanelInputState({ onEngage = () => {} }: DemoPanelInputStateProps) {
  const { formState, updateFormState, phase, run } = useDemoFlow();
  const [conceptOpen, setConceptOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const conceptRootRef = useRef<HTMLDivElement>(null);
  const [addressFocused, setAddressFocused] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('');
  const placeholderTimersRef = useRef<number[]>([]);

  const reducedMotion = prefersReducedMotion();
  const showTypingPlaceholder =
    !reducedMotion && !addressFocused && formState.address.trim().length === 0;
  const filteredConcepts = CONCEPTS.filter((c) =>
    c.toLowerCase().includes(filter.trim().toLowerCase()),
  );
  const isRunning = phase === 'running';

  const clearPlaceholderTimers = () => {
    placeholderTimersRef.current.forEach((t) => clearTimeout(t));
    placeholderTimersRef.current = [];
  };

  const startPlaceholderTyping = () => {
    if (typeof window === 'undefined' || reducedMotion) return;
    clearPlaceholderTimers();
    setPlaceholderText('');
    let i = 0;
    const full = DEMO_EXAMPLE_ADDRESS;

    const step = () => {
      if (!showTypingPlaceholder) return;
      setPlaceholderText(full.slice(0, i));
      i += 1;
      if (i <= full.length) {
        placeholderTimersRef.current.push(window.setTimeout(step, 38));
        return;
      }
      placeholderTimersRef.current.push(
        window.setTimeout(() => {
          if (!showTypingPlaceholder) return;
          i = 0;
          setPlaceholderText('');
          placeholderTimersRef.current.push(window.setTimeout(step, 420));
        }, 2400),
      );
    };

    placeholderTimersRef.current.push(window.setTimeout(step, 280));
  };

  useEffect(() => {
    if (showTypingPlaceholder) startPlaceholderTyping();
    else {
      clearPlaceholderTimers();
      setPlaceholderText('');
    }
    return () => clearPlaceholderTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTypingPlaceholder, reducedMotion]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (conceptRootRef.current && !conceptRootRef.current.contains(e.target as Node)) {
        setConceptOpen(false);
      }
    };
    document.addEventListener('click', close, true);
    return () => {
      document.removeEventListener('click', close, true);
      clearPlaceholderTimers();
    };
  }, []);

  const setConcept = (c: string) => {
    onEngage();
    updateFormState({ concept: c });
    setConceptOpen(false);
    setFilter('');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEngage();
    run();
  };

  return (
    <form className="demo-panel-input" onSubmit={onSubmit}>
      <header className="demo-panel-chrome">
        <span className="demo-panel-chrome__live">
          <span className="demo-panel-chrome__dot" aria-hidden="true" />
          Live workspace
        </span>
      </header>

      <div className="demo-panel-grid">
        <div className="demo-panel-col demo-panel-input__col">
          <label className="demo-panel-input__field">
            <span className="gs-label">Address</span>
            <span className="demo-panel-input__input-wrap">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-cyan" />
              <input
                type="text"
                className="gs-input"
                placeholder={reducedMotion ? DEMO_EXAMPLE_ADDRESS : ''}
                autoComplete="off"
                spellCheck={false}
                aria-label="Address"
                value={formState.address}
                onFocus={() => {
                  setAddressFocused(true);
                  onEngage();
                }}
                onBlur={() => setAddressFocused(false)}
                onChange={(e) => {
                  onEngage();
                  updateFormState({ address: e.target.value });
                }}
              />
              {showTypingPlaceholder ? (
                <span className="demo-panel-input__type-placeholder" aria-hidden="true">
                  {placeholderText}
                  <span className="demo-panel-input__type-cursor">|</span>
                </span>
              ) : null}
            </span>
          </label>

          <div className="demo-panel-input__field">
            <span className="gs-label">Business type</span>
            <div ref={conceptRootRef} className="relative mt-2">
              <button
                type="button"
                className="demo-panel-input__select-trigger"
                aria-expanded={conceptOpen}
                aria-haspopup="listbox"
                onClick={(e) => {
                  e.stopPropagation();
                  onEngage();
                  setConceptOpen((o) => !o);
                  if (!conceptOpen) setFilter('');
                }}
              >
                <span className="truncate text-left">{formState.concept}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-text-muted transition-transform',
                    conceptOpen && 'rotate-180',
                  )}
                />
              </button>

              {conceptOpen ? (
                <div className="demo-panel-input__select-panel" role="listbox" aria-label="Business type">
                  <div className="demo-panel-input__search">
                    <Search className="h-3.5 w-3.5 text-text-muted" />
                    <input
                      type="search"
                      className="demo-panel-input__search-input"
                      placeholder="Search types…"
                      value={filter}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>
                  <ul className="demo-panel-input__options">
                    {filteredConcepts.map((c) => (
                      <li key={c}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={formState.concept === c}
                          className="demo-panel-input__option"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConcept(c);
                          }}
                        >
                          {c}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="demo-panel-col demo-panel-input__col demo-panel-input__col--right">
          <fieldset className="demo-panel-input__field">
            <legend className="gs-label">Trade area</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {RADII.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="gs-chip"
                  aria-pressed={formState.radius === r}
                  onClick={() => {
                    onEngage();
                    updateFormState({ radius: r });
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="demo-panel-input__field">
            <legend className="gs-label">Target customer</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROFILES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="gs-chip"
                  aria-pressed={formState.profile === p}
                  onClick={() => {
                    onEngage();
                    updateFormState({ profile: p });
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="demo-panel-input__actions">
            <button type="submit" className="group demo-panel-input__submit" disabled={isRunning}>
              <Sparkles className="h-4 w-4" />
              {isRunning ? 'Running…' : 'Run SpotCore Analysis'}
              {!isRunning ? (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
