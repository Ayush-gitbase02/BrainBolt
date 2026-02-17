import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
        },
        ink: {
          primary: 'var(--color-ink-primary)',
          secondary: 'var(--color-ink-secondary)',
          muted: 'var(--color-ink-muted)',
        },
      },
      spacing: {
        'token-1': 'var(--spacing-1)',
        'token-2': 'var(--spacing-2)',
        'token-3': 'var(--spacing-3)',
        'token-4': 'var(--spacing-4)',
        'token-5': 'var(--spacing-5)',
        'token-6': 'var(--spacing-6)',
        'token-8': 'var(--spacing-8)',
        'token-10': 'var(--spacing-10)',
        'token-12': 'var(--spacing-12)',
        'token-16': 'var(--spacing-16)',
      },
      borderRadius: {
        token: 'var(--radius)',
        'token-lg': 'var(--radius-lg)',
        'token-xl': 'var(--radius-xl)',
      },
      boxShadow: {
        token: 'var(--shadow)',
        'token-lg': 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      fontSize: {
        'token-xs': 'var(--text-xs)',
        'token-sm': 'var(--text-sm)',
        'token-base': 'var(--text-base)',
        'token-lg': 'var(--text-lg)',
        'token-xl': 'var(--text-xl)',
        'token-2xl': 'var(--text-2xl)',
        'token-3xl': 'var(--text-3xl)',
      },
    },
  },
  plugins: [],
};

export default config;
