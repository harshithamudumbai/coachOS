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
        border: '#1F2937',
        input: '#1F2937',
        ring: '#3B82F6',
        background: '#0B0F17',
        foreground: '#F9FAFB',
        card: '#111827',
        primary: {
          DEFAULT: '#3B82F6',
          foreground: '#F9FAFB',
        },
        secondary: {
          DEFAULT: '#F59E0B',
          foreground: '#0B0F17',
        },
        muted: {
          DEFAULT: '#111827',
          foreground: '#9CA3AF',
        },
        accent: {
          DEFAULT: '#1F2937',
          foreground: '#F9FAFB',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      borderRadius: {
        xl: '1rem',
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
