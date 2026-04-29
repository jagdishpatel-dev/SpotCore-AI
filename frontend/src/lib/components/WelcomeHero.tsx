'use client';

import { useEffect, useRef, useState } from 'react';
import SplitText from './SplitText';
import SiteIntelligenceMap from './SiteIntelligenceMap';
import LiveDemoCard from './LiveDemoCard';
import Reveal from './Reveal';

interface Props {
  onStart: () => void;
}

interface StoryStep {
  eyebrow: string;
  title: string;
  body: string;
  metricLabel: string;
  metricPrimary: string;
  metricSecondary: string;
  metricDetail: string;
}

const storySteps: StoryStep[] = [
  {
    eyebrow: 'Competitor landscape',
    title: "Who's already competing here?",
    body: 'We pull every relevant business within walking distance. Density can validate demand — or signal saturation. We show you which.',
    metricLabel: 'Within 800m',
    metricPrimary: '22 direct competitors',
    metricSecondary: '12 cafés · 6 bars · 4 QSR',
    metricDetail: 'Cluster density 1.7× district average — validation, not saturation.',
  },
  {
    eyebrow: 'Residential demand',
    title: 'Who lives nearby — and how many?',
    body: 'Recurring revenue starts with recurring customers. Population density and household composition reveal whether a neighborhood can sustain your concept.',
    metricLabel: 'Catchment',
    metricPrimary: '14,200 residents',
    metricSecondary: '62% renters · median age 34',
    metricDetail: 'Dense, young, urban — classic recurring demand profile.',
  },
  {
    eyebrow: 'Accessibility',
    title: 'How easily can people reach you?',
    body: 'Transit lines, walkability, and drive times determine your real catchment. The best storefront on an unreachable block still fails.',
    metricLabel: 'Reach',
    metricPrimary: 'Walk Score 92',
    metricSecondary: '3 transit lines · 7-min drive to 101',
    metricDetail: '10-min walk radius covers 18,400 residents.',
  },
  {
    eyebrow: 'Spending power',
    title: 'Can the neighborhood afford you?',
    body: 'Median household income and discretionary spend map the ceiling of what the area can support at your price point.',
    metricLabel: 'Purchasing power',
    metricPrimary: 'Median HH $112k',
    metricSecondary: '+38% vs metro average',
    metricDetail: 'Discretionary spend supports premium positioning.',
  },
  {
    eyebrow: 'Site viability',
    title: 'One number that answers the question.',
    body: 'Every signal is weighted and combined into a single GeoScore. Benchmark it against district and metro averages to decide with confidence.',
    metricLabel: 'GeoScore',
    metricPrimary: '84 / 100',
    metricSecondary: 'Strong retail potential',
    metricDetail: '+16 vs district · +22 vs metro benchmark.',
  },
];

export default function WelcomeHero({ onStart }: Props) {
  const storyRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [mapTilt, setMapTilt] = useState({ x: 4, y: -3 });

  useEffect(() => {
    const handleScroll = () => {
      const el = storyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = el.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const progress = total > 0 ? scrolled / total : 0;
      const idx = Math.min(storySteps.length - 1, Math.max(0, Math.floor(progress * storySteps.length)));
      setActiveStep(idx);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setMapTilt({ x: 4 - dy * 6, y: -3 + dx * 8 });
  };

  const handleMapMouseLeave = () => {
    setMapTilt({ x: 4, y: -3 });
  };

  const step = activeStep;
  const mapStep = step + 1;
  const activeStory = storySteps[step];

  return (
    <div className="relative w-full bg-canvas transition-colors duration-700">
      <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 pt-40 pb-20 md:pt-48 text-center z-20">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span className="text-xs font-medium text-slate-600 tracking-tight">Powered by Gemma 4 AI</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-[-0.035em] leading-[1.02] mt-2">
            <SplitText
              tag="span"
              text="From guesswork"
              className="block text-ink/40"
              textAlign="center"
              delay={70}
              duration={1.2}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 60 }}
              to={{ opacity: 0.4, y: 0 }}
              threshold={0.1}
              rootMargin="0px"
            />
            <SplitText
              tag="span"
              text="to real site intelligence."
              className="block text-ink [text-shadow:_0_0_40px_rgba(255,255,255,0.18)] dark:[text-shadow:_0_0_40px_rgba(255,255,255,0.18)]"
              textAlign="center"
              delay={50}
              duration={1.25}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 60 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="0px"
            />
          </h1>

          <p className="text-lg md:text-2xl text-muted max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            Analyze any address with AI-powered location intelligence to understand demand,
            potential, and site quality <span className="text-ink font-semibold">before you invest.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <button
              onClick={onStart}
              className="group relative px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-teal-500/40"
            >
              Analyze an Address
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
            <button
              onClick={onStart}
              className="px-8 py-5 text-slate-700 dark:text-slate-200 font-semibold text-lg hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              See a sample report →
            </button>
          </div>

          <div className="pt-16 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
            <LiveDemoCard />
          </div>
        </div>
      </div>

      <section className="relative bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-teal-500/10 blur-[140px]" aria-hidden />
          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-[140px]" aria-hidden />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 max-w-2xl">
            <Reveal delay={0}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-widest uppercase text-teal-300 ring-1 ring-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                Live site analysis
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="mt-4 text-4xl md:text-6xl font-black tracking-tighter text-white leading-[1.05]">
                Every block, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-blue-400 to-indigo-400">broken down signal by signal.</span>
              </h2>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-4 text-lg text-slate-300 leading-relaxed">
                Scroll through how GeoScore turns one address into five layers of intelligence — and one answer.
              </p>
            </Reveal>
          </div>

          <div ref={storyRef} className="relative hidden md:block" style={{ height: `${storySteps.length * 100}vh` }}>
            <div className="sticky top-24 h-[calc(100vh-8rem)] w-full">
              <div className="grid h-full grid-cols-12 gap-8">
                <div className="col-span-5 relative h-full">
                  {storySteps.map((s, i) => {
                    const isActive = i === step;
                    return (
                      <div
                        key={i}
                        className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-out ${
                          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                        }`}
                      >
                        <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-teal-300">
                          Step {String(i + 1).padStart(2, '0')} · {s.eyebrow}
                        </div>
                        <h3 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
                          {s.title}
                        </h3>
                        <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-lg">{s.body}</p>

                        <div className="mt-8 flex items-center gap-2">
                          {storySteps.map((_, j) => (
                            <span
                              key={j}
                              className={`h-[3px] rounded-full transition-all duration-500 ${
                                j === step ? 'w-10 bg-teal-400' : j < step ? 'w-6 bg-white/40' : 'w-6 bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="col-span-7 relative h-full flex items-center justify-center"
                  style={{ perspective: 1400 }}
                  onMouseMove={handleMapMouseMove}
                  onMouseLeave={handleMapMouseLeave}
                >
                  <div
                    className="relative w-full h-[88%] p-[1.5px] rounded-3xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(45,212,191,0.5) 0%, rgba(59,130,246,0.18) 50%, rgba(99,102,241,0.45) 100%)',
                      transform: `rotateX(${mapTilt.x}deg) rotateY(${mapTilt.y}deg) scale(0.98)`,
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
                      boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8), 0 20px 40px -10px rgba(45,212,191,0.15), 0 4px 20px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-[1.4rem] bg-slate-900">
                      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-br from-teal-500/5 via-transparent to-indigo-500/10" />
                      <div className="absolute inset-0 pointer-events-none z-[1] bg-[radial-gradient(circle_at_50%_45%,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
                      <SiteIntelligenceMap step={mapStep} />

                      <div className="absolute top-4 left-4 z-[2] flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-1.5 ring-1 ring-white/10 backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                        <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-200">
                          {activeStory.eyebrow}
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 z-[2] text-right">
                        <div className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Mission District</div>
                        <div className="text-[10px] font-mono text-slate-500">37.7599° N, 122.4148° W</div>
                      </div>

                      <div
                        key={step}
                        className="absolute bottom-6 right-6 z-[2] w-[320px] rounded-2xl bg-slate-950/85 p-5 ring-1 ring-white/10 backdrop-blur-md shadow-xl transition-all duration-700 ease-out"
                        style={{ animation: 'fadeInUp 0.7s ease-out' }}
                      >
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-teal-300">
                          {activeStory.metricLabel}
                        </div>
                        <div className="mt-2 text-2xl font-black tracking-tight text-white leading-tight">
                          {activeStory.metricPrimary}
                        </div>
                        <div className="mt-1 text-sm text-slate-300 font-medium">{activeStory.metricSecondary}</div>
                        <div className="mt-3 pt-3 border-t border-white/10 text-[12px] text-slate-400 leading-relaxed">
                          {activeStory.metricDetail}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden space-y-16">
            {storySteps.map((s, i) => (
              <Reveal key={i} delay={0} y={32}>
              <div className="space-y-5">
                <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-teal-300">
                  Step {String(i + 1).padStart(2, '0')} · {s.eyebrow}
                </div>
                <h3 className="text-3xl font-black tracking-tight text-white leading-tight">{s.title}</h3>
                <p className="text-base text-slate-300 leading-relaxed">{s.body}</p>
                <div
                  className="relative h-[270px] w-full p-[1.5px] rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,212,191,0.45) 0%, rgba(59,130,246,0.15) 50%, rgba(99,102,241,0.4) 100%)',
                    boxShadow: '0 20px 50px -10px rgba(0,0,0,0.65), 0 8px 20px rgba(45,212,191,0.09)',
                    transform: 'rotateX(2deg) scale(0.99)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-[0.9rem] bg-slate-900">
                    <SiteIntelligenceMap step={i + 1} />
                    <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-950/85 p-4 ring-1 ring-white/10 backdrop-blur">
                      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-teal-300">{s.metricLabel}</div>
                      <div className="mt-1 text-lg font-black text-white">{s.metricPrimary}</div>
                      <div className="text-xs text-slate-300">{s.metricSecondary}</div>
                    </div>
                  </div>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-20 py-32 px-6 bg-white dark:bg-slate-900 text-center transition-colors duration-500">
        <Reveal delay={0}>
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-ink mb-12">
            Ready to find your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">perfect location?</span>
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <button
            onClick={onStart}
            className="px-12 py-6 bg-slate-900 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-teal-500/40"
          >
            Start Analyzing Now
          </button>
        </Reveal>
      </div>
    </div>
  );
}
