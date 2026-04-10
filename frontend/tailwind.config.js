/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        ink: '#0F172A',
        muted: '#475569',
        line: '#E2E8F0',
        accent: '#2563EB',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.08)',
        glass: '0 1px 0 rgba(255, 255, 255, 0.65) inset, 0 1px 2px rgba(15, 23, 42, 0.06)',
        nav: '0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 4px 24px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
