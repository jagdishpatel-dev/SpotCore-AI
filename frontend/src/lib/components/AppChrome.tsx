import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FLUID_GLASS_BAR_INITIAL,
  type FluidGlassBarProps,
} from './chrome/fluidGlassDefaults';
import { clearReportSession } from '$lib/reportSession';
import { syncGlassCssVars } from './chrome/syncGlassCssVars';
import ChromeErrorBoundary from './react/ChromeErrorBoundary';
import FluidGlassBarCanvas from './react/FluidGlassBarCanvas';
import './app-chrome.css';

const sectionLinks = [
  { id: 'how-it-works', label: 'How it works' },
  { id: 'insights', label: 'Insights' },
  { id: 'faq', label: 'FAQ' },
] as const;

const routeLinks = [
  { href: '/', label: 'Home' },
  { href: '/analyze', label: 'Analyze' },
  { href: '/report', label: 'Map' },
] as const;

function sectionHref(path: string, id: string) {
  return path === '/' ? `#${id}` : `/#${id}`;
}

function NavLink({
  href,
  active,
  children,
  className = '',
  router = false,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
  className?: string;
  router?: boolean;
}) {
  const classes = `group relative inline-flex shrink-0 items-center whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:px-2.5 sm:text-sm lg:px-3 ${className} ${
    active ? 'text-spotcore-text' : 'text-spotcore-text-muted hover:text-spotcore-text'
  }`;

  const underline = (
    <span
      className={`pointer-events-none absolute inset-x-2.5 bottom-1 h-px origin-left rounded bg-spotcore-accent transition-transform duration-200 group-hover:scale-x-100 lg:inset-x-3 ${
        active ? 'scale-x-100' : 'scale-x-0'
      }`}
      aria-hidden
    />
  );

  if (router) {
    return (
      <Link to={href} className={classes}>
        {children}
        {underline}
      </Link>
    );
  }

  return (
    <a href={href} className={classes}>
      {children}
      {underline}
    </a>
  );
}

export default function AppChrome({
  barProps = FLUID_GLASS_BAR_INITIAL,
}: {
  barProps?: FluidGlassBarProps;
}) {
  const { pathname: path, hash } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    syncGlassCssVars(barProps);
  }, [barProps]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function newAnalysis() {
    clearReportSession();
    navigate('/analyze');
  }

  return (
    <header className="chrome-header pointer-events-none sticky top-0 z-50 bg-transparent px-3 pt-3 sm:px-4 md:px-6 lg:px-8">
      <div
        className={`chrome-bar chrome-bar--fluid-glass pointer-events-auto relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 overflow-hidden rounded-2xl px-3 sm:h-[60px] sm:gap-4 sm:px-4 md:px-5 ${
          scrolled ? 'chrome-bar--scrolled' : ''
        }`}
      >
        <div aria-hidden className="chrome-bar-backdrop" />
        <ChromeErrorBoundary
          fallback={
            <div
              aria-hidden
              className="chrome-bar-glass pointer-events-none absolute inset-0 z-[1] rounded-[inherit]"
            />
          }
        >
          <FluidGlassBarCanvas barProps={barProps} />
        </ChromeErrorBoundary>

        <Link
          to="/"
          className="group relative z-10 flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-spotcore-accent/35 bg-gradient-to-b from-spotcore-accent-soft to-spotcore-accent text-[11px] font-bold tracking-tight text-white shadow-[0_0_0_1px_rgba(15,124,117,0.2),0_8px_24px_-8px_rgba(15,124,117,0.35)] transition-transform duration-300 group-hover:scale-[1.03]">
            GS
          </div>
          <div className="hidden leading-tight lg:block">
            <p className="text-sm font-medium tracking-tight text-spotcore-text">SpotCore</p>
            <p className="text-[11px] tracking-wide text-spotcore-text-muted">
              Location intelligence for operators
            </p>
          </div>
        </Link>

        <nav
          className="relative z-10 hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-0.5 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex md:gap-1 [&::-webkit-scrollbar]:hidden"
          aria-label="Primary"
        >
          {sectionLinks.map((link) => {
            const href = sectionHref(path, link.id);
            const active = path === '/' && hash === `#${link.id}`;
            return (
              <NavLink key={link.id} href={href} active={active} className="inline-flex">
                {link.label}
              </NavLink>
            );
          })}
          {routeLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              active={path === link.href}
              className={link.href === '/report' ? 'hidden lg:inline-flex' : 'inline-flex'}
              router
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="relative z-10 flex shrink-0 items-center gap-2">
          {path === '/report' ? (
            <button
              type="button"
              onClick={newAnalysis}
              className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-transparent px-4 text-sm font-semibold text-spotcore-text transition-colors hover:border-accent-cyan/40"
            >
              New analysis
            </button>
          ) : (
            <>
              <Link
                to="/analyze"
                className="hidden h-9 items-center justify-center rounded-full bg-spotcore-accent px-4 text-sm font-semibold text-white shadow-[0_18px_50px_-18px_rgba(15,124,117,0.38)] transition-all hover:scale-[1.02] hover:bg-spotcore-accent-hover sm:inline-flex"
              >
                Analyze Address
              </Link>
              <Link
                to="/analyze"
                className="inline-flex h-9 items-center justify-center rounded-full bg-spotcore-accent px-3 text-sm font-semibold text-white shadow-[0_18px_50px_-18px_rgba(15,124,117,0.38)] hover:bg-spotcore-accent-hover sm:hidden"
              >
                Analyze
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
