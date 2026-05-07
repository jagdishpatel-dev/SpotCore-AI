/** @type {import('tailwindcss').Config} */
module.exports = {
  // Must include `.svelte` or Tailwind purges almost all utilities used in components.
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        score: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Legacy tokens retained (consumed by analyze/report routes)
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        'muted-2': 'var(--color-muted-2)',
        line: 'var(--color-line)',

        // Theme-aware tokens for the new homepage
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-surface-2': 'var(--bg-surface-2)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-soft': 'var(--border-soft)',

        accent: {
          DEFAULT: 'var(--accent-cyan)',
          cyan: 'var(--accent-cyan)',
          blue: 'var(--accent-blue)',
          purple: 'var(--accent-purple)',
        },
        'accent-2': 'var(--accent-blue)',

        positive: 'var(--positive)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',

        // Legacy alias retained
        success: 'var(--positive)',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 12px 40px -12px rgba(2, 6, 23, 0.7)',
        'card-hover':
          '0 1px 0 rgba(255, 255, 255, 0.05) inset, 0 18px 60px -16px rgba(34, 211, 238, 0.18)',
        glass: '0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 8px 30px rgba(2, 6, 23, 0.6)',
        nav: '0 1px 0 rgba(255, 255, 255, 0.05) inset, 0 8px 24px rgba(2, 6, 23, 0.6)',
        glow: '0 0 0 1px rgba(34, 211, 238, 0.18), 0 24px 80px -24px rgba(34, 211, 238, 0.3)',
        'glow-soft':
          '0 0 0 1px rgba(34, 211, 238, 0.18), 0 12px 40px -10px rgba(34, 211, 238, 0.22)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        fall: {
          from: { transform: 'translateY(-10vh)', opacity: '0' },
          to: { transform: 'translateY(110vh)', opacity: '1' },
        },
        'orbit-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'thread-drift': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(2%, -1%, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        'mesh-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(2%, -1.5%, 0) scale(1.04)' },
        },
        'mesh-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'shimmer-x': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'cta-pulse': {
          '0%, 100%': {
            boxShadow:
              '0 0 0 0 rgba(34, 211, 238, 0.18), 0 18px 60px -22px rgba(34, 211, 238, 0.45)',
          },
          '50%': {
            boxShadow:
              '0 0 0 8px rgba(34, 211, 238, 0)' +
              ', 0 26px 70px -22px rgba(34, 211, 238, 0.55)',
          },
        },
        'caret-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        fall: 'fall linear infinite',
        'orbit-slow': 'orbit-slow 60s linear infinite',
        'thread-drift': 'thread-drift 22s ease-in-out infinite',
        'mesh-drift': 'mesh-drift 18s ease-in-out infinite',
        'mesh-shift': 'mesh-shift 16s ease-in-out infinite',
        'soft-pulse': 'soft-pulse 5s ease-in-out infinite',
        'shimmer-x': 'shimmer-x 6s linear infinite',
        'float-y': 'float-y 4s ease-in-out infinite',
        'cta-pulse': 'cta-pulse 2.4s ease-in-out infinite',
        'caret-blink': 'caret-blink 1.1s step-end infinite',
      },
      letterSpacing: {
        micro: '0.14em',
        display: '-0.02em',
      },
    },
  },
  plugins: [],
};
