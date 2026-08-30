
import { useState } from 'react';
import { Sparkles, ArrowRight, MapPin } from 'lucide-react';
import { cn } from '$lib/utils/cn';
import { zoningAsk } from '$lib/api';
import type { ZoningAnswerResponse } from '$lib/types';

interface LocationPreset {
  label: string;
  district: string;
  address: string;
}

const LOCATIONS: LocationPreset[] = [
  { label: 'Downtown', district: 'CBD', address: 'Downtown Austin, TX' },
  { label: 'South Congress', district: 'CS-1', address: 'South Congress Ave, Austin, TX' },
  { label: 'Residential block', district: 'SF-3', address: 'Residential neighborhood, Austin, TX' },
];

const QUESTION_CHIPS = ['a restaurant', 'a bar', 'a gas station', 'a daycare', 'a coffee shop'];

const STEPS = [
  { label: 'Parsing the question', detail: 'What use is being asked about, and where.' },
  { label: 'Retrieving matching code sections', detail: 'Embedding search over Austin’s Land Development Code.' },
  { label: 'Grounding the answer', detail: 'Cross-checked against the actual permitted-use table.' },
] as const;

type Phase = 'idle' | 'loading' | 'done' | 'error';

export default function ZoningDemoPanel() {
  const [locationIdx, setLocationIdx] = useState(0);
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<ZoningAnswerResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const location = LOCATIONS[locationIdx];
  const isRunning = phase === 'loading';

  async function runDemo(fullQuestion: string) {
    setQuestion(fullQuestion);
    setPhase('loading');
    setStepIdx(0);
    setResult(null);
    setErrorMsg('');

    const stepTimer1 = window.setTimeout(() => setStepIdx(1), 500);
    const stepTimer2 = window.setTimeout(() => setStepIdx(2), 1100);

    try {
      const res = await zoningAsk({
        question: fullQuestion,
        zoning_district: location.district,
        address: location.address,
      });
      setResult(res);
      setPhase('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setPhase('error');
    } finally {
      window.clearTimeout(stepTimer1);
      window.clearTimeout(stepTimer2);
      setStepIdx(2);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isRunning) return;
    void runDemo(trimmed);
  }

  return (
    <div className="geo-glass-soft rounded-2xl p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="geo-label">Live · Austin, TX pilot</p>
          <h3 className="mt-1.5 text-lg font-medium text-[var(--gs-text)] md:text-xl">
            Ask what you can build, get a cited answer
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/50 px-3 py-1.5 text-xs text-[var(--gs-text-muted)]">
          <MapPin className="h-3.5 w-3.5 text-accent-cyan" />
          {LOCATIONS.map((loc, i) => (
            <button
              key={loc.label}
              type="button"
              className={cn(
                'rounded-full px-2 py-0.5 transition-colors',
                i === locationIdx ? 'bg-accent-cyan/20 font-medium text-[var(--gs-text)]' : 'hover:text-[var(--gs-text)]',
              )}
              onClick={() => setLocationIdx(i)}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          className="gs-input flex-1"
          placeholder={`e.g. "Can I open a bar here?" (${location.district} district)`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isRunning}
        />
        <button
          type="submit"
          className="group demo-panel-input__submit shrink-0"
          disabled={isRunning || !question.trim()}
        >
          <Sparkles className="h-4 w-4" />
          {isRunning ? 'Asking…' : 'Ask'}
          {!isRunning ? <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /> : null}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUESTION_CHIPS.map((use) => (
          <button
            key={use}
            type="button"
            className="gs-chip"
            disabled={isRunning}
            onClick={() => void runDemo(`Can I open ${use} here?`)}
          >
            {use}
          </button>
        ))}
      </div>

      {phase !== 'idle' ? (
        <div className="mt-6 border-t border-white/50 pt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {STEPS.map((step, i) => (
              <div
                key={step.label}
                className={cn(
                  'flex items-center gap-2 text-xs transition-opacity',
                  i <= stepIdx ? 'opacity-100' : 'opacity-35',
                )}
                title={step.detail}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px]',
                    i < stepIdx || phase === 'done'
                      ? 'border-positive bg-positive/20 text-positive'
                      : i === stepIdx && isRunning
                        ? 'animate-pulse border-accent-cyan bg-accent-cyan/20 text-accent-cyan'
                        : 'border-[var(--gs-text-muted)]/40 text-[var(--gs-text-muted)]',
                  )}
                >
                  {i + 1}
                </span>
                <span className="text-[var(--gs-text-muted)]">{step.label}</span>
              </div>
            ))}
          </div>

          {phase === 'error' ? (
            <p className="mt-4 text-sm text-danger">{errorMsg}</p>
          ) : null}

          {phase === 'done' && result ? (
            <div className="mt-4 rounded-xl border border-white/60 bg-white/40 p-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--gs-text)]">{result.answer}</p>
              {result.citations.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.citations.slice(0, 6).map((c) => (
                    <span
                      key={c.citation}
                      className="rounded-full border border-white/60 bg-white/60 px-2 py-0.5 text-[11px] text-[var(--gs-text-muted)]"
                      title={c.title}
                    >
                      § {c.citation}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="mt-3 text-[11px] text-[var(--gs-text-muted)]">{result.disclaimer}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
