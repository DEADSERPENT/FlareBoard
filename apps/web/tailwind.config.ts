import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Orange Palette
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Neutral/White Palette
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Functional colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'orange-sm': '0 2px 8px rgba(249, 115, 22, 0.15)',
        'orange-md': '0 4px 16px rgba(249, 115, 22, 0.2)',
        'orange-lg': '0 8px 24px rgba(249, 115, 22, 0.25)',
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
        'gradient-light': 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
