/** @type {import('tailwindcss').Config} */
module.exports = {
  // Must include `.svelte` or Tailwind purges almost all utilities used in components.
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        score: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        'muted-2': 'var(--color-muted-2)',
        line: 'var(--color-line)',

        // GeoScore Dark accents
        accent: '#22D3EE', // primary cyan
        'accent-2': '#38BDF8', // secondary blue
        positive: '#22C55E',
        warning: '#F97316',
        danger: '#EF4444',

        // Legacy aliases retained
        success: '#22C55E',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 12px 40px -12px rgba(2, 6, 23, 0.7)',
        'card-hover':
          '0 1px 0 rgba(255, 255, 255, 0.05) inset, 0 18px 60px -16px rgba(34, 211, 238, 0.18)',
        glass: '0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 8px 30px rgba(2, 6, 23, 0.6)',
        nav: '0 1px 0 rgba(255, 255, 255, 0.05) inset, 0 8px 24px rgba(2, 6, 23, 0.6)',
        glow: '0 0 0 1px rgba(34, 211, 238, 0.18), 0 24px 80px -24px rgba(34, 211, 238, 0.3)',
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
        'fall': {
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
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'fall': 'fall linear infinite',
        'orbit-slow': 'orbit-slow 60s linear infinite',
        'thread-drift': 'thread-drift 22s ease-in-out infinite',
      },
      letterSpacing: {
        'micro': '0.14em',
      },
    },
  },
  plugins: [],
};
