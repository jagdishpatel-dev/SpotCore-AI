
import Reveal from './Reveal';
import AccentIcon from './AccentIcon';

export interface FooterCTAProps {
  onAnalyzeAnother: () => void;
  secondaryLabel?: string | null;
  onSecondary?: (() => void) | null;
}

export default function FooterCTA({
  onAnalyzeAnother,
  secondaryLabel = null,
  onSecondary = null,
}: FooterCTAProps) {
  return (
    <section className="relative px-2 py-2 md:py-4">
      <Reveal y={16} duration={560}>
        <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-surface px-6 py-12 text-center md:px-12 md:py-16">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
          radial-gradient(60% 80% at 50% 0%, rgba(34, 211, 238, 0.18), transparent 60%),
          radial-gradient(50% 60% at 100% 100%, rgba(56, 189, 248, 0.10), transparent 60%)`,
            }}
          ></div>
          <div className="relative">
            <p className="gs-label text-accent">Next step</p>
            <h3 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              Compare another address.
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted md:text-base">
              Run another site and see how this block stacks up. Most operators short-list 3–5
              locations before committing.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onAnalyzeAnother}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.3),0_18px_48px_-12px_rgba(34,211,238,0.45)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
              >
                Run another analysis
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  <AccentIcon name="arrow-right" size={16} />
                </span>
              </button>
              {secondaryLabel && onSecondary ? (
                <button
                  type="button"
                  onClick={onSecondary}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white/[0.02] px-6 py-3.5 text-sm font-medium text-ink transition hover:border-accent/40 hover:bg-white/[0.04]"
                >
                  {secondaryLabel}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
