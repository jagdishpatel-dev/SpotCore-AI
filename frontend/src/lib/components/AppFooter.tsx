import { Link } from 'react-router-dom';

const links = [
  { href: '/', label: 'Home' },
  { href: '/analyze', label: 'Analyze' },
  { href: '/report', label: 'Map' },
] as const;

export default function AppFooter() {
  return (
    <footer
      className="mt-auto border-t"
      style={{
        borderColor: 'var(--border-soft)',
        background: 'color-mix(in oklab, var(--bg-base) 92%, transparent)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <Link to="/" className="group flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-accent-cyan/40 bg-gradient-to-b from-cyan-300 to-cyan-600 text-[10px] font-bold tracking-tight text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.2)]">
              GS
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-text-primary">GeoScore</p>
              <p className="text-[11px] text-text-muted">Location intelligence for operators</p>
            </div>
          </Link>

          <nav className="flex items-center gap-5 text-[13px]" aria-label="Footer">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-text-secondary transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-2 border-t border-[var(--border-soft)] pt-6 text-[12px] text-text-muted md:flex-row md:items-center">
          <p className="max-w-xl leading-relaxed">
            GeoScore · Premium location intelligence · Not financial or legal advice.
          </p>
          <p>Built with React + FastAPI</p>
        </div>
      </div>
    </footer>
  );
}
