/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Enable class-based dark mode (toggle via .dark class on <html>)
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['Space Mono', 'Menlo', 'monospace'],
      },
      colors: {
        // Legacy brand colors (kept for backward compatibility)
        brand: {
          bg: '#0f0a15',
          panel: '#1a1126',
          violet: '#7c3aed',
          violetDark: '#2e1065',
          orange: '#f97316',
          orangeDark: '#7c2d12',
          beige: '#fefce8',
          success: '#10b981',
          gold: '#fbbf24',
        },
        // Theme-aware semantic colors using CSS variables
        theme: {
          // Backgrounds
          'bg-primary': 'rgb(var(--color-bg-primary) / <alpha-value>)',
          'bg-secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          'bg-tertiary': 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
          // Cards
          'card': 'rgb(var(--color-card) / <alpha-value>)',
          'card-hover': 'rgb(var(--color-card-hover) / <alpha-value>)',
          'card-border': 'rgb(var(--color-card-border) / <alpha-value>)',
          // Text
          'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
          'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
          'text-tertiary': 'rgb(var(--color-text-tertiary) / <alpha-value>)',
          'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
          // Borders
          'border': 'rgb(var(--color-border-primary) / <alpha-value>)',
          'border-secondary': 'rgb(var(--color-border-secondary) / <alpha-value>)',
          // Inputs
          'input-bg': 'rgb(var(--color-input-bg) / <alpha-value>)',
          'input-border': 'rgb(var(--color-input-border) / <alpha-value>)',
          'input-focus': 'rgb(var(--color-input-focus) / <alpha-value>)',
          // Nav
          'nav-bg': 'rgb(var(--color-nav-bg) / <alpha-value>)',
          'nav-border': 'rgb(var(--color-nav-border) / <alpha-value>)',
          // Accents (same in both modes)
          'accent-orange': 'rgb(var(--color-accent-orange) / <alpha-value>)',
          'accent-indigo': 'rgb(var(--color-accent-indigo) / <alpha-value>)',
          'accent-green': 'rgb(var(--color-accent-green) / <alpha-value>)',
          'accent-purple': 'rgb(var(--color-accent-purple) / <alpha-value>)',
          'accent-cyan': 'rgb(var(--color-accent-cyan) / <alpha-value>)',
          'accent-red': 'rgb(var(--color-accent-red) / <alpha-value>)',
          'accent-yellow': 'rgb(var(--color-accent-yellow) / <alpha-value>)',
        },
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-xl': 'var(--shadow-xl)',
        'theme-accent': 'var(--shadow-accent)',
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'highlight-pulse': 'highlight-pulse 1.5s ease-in-out 2',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'highlight-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 2px rgb(99 102 241 / 0.5)' },
          '50%': { boxShadow: '0 0 0 4px rgb(99 102 241 / 0.3), 0 0 24px rgb(99 102 241 / 0.2)' },
        },
      },
    },
  },
  plugins: [],
}
