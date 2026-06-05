/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: '#262626',
        input: '#262626',
        ring: '#3b82f6',
        background: '#0a0a0a',
        foreground: '#fafafa',
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#fafafa',
        },
        secondary: {
          DEFAULT: '#111111',
          foreground: '#a1a1aa',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#161616',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#161616',
          foreground: '#fafafa',
        },
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
        critical: '#dc2626',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
