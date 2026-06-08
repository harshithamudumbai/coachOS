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
        ring: '#4F8CFF', /* Math Blue */
        background: '#0B0F17',
        foreground: '#F5F5F5', /* Chalk White */
        card: '#111827',
        primary: {
          DEFAULT: '#4F8CFF', /* Math Blue */
          foreground: '#F5F5F5', /* Chalk White */
        },
        secondary: {
          DEFAULT: '#F4D03F', /* Sigma Yellow */
          foreground: '#0B0F17',
        },
        muted: {
          DEFAULT: '#111827',
          foreground: '#9CA3AF',
        },
        accent: {
          DEFAULT: '#1F2937',
          foreground: '#F5F5F5',
        },
        success: '#22C55E', /* Proof Green */
        warning: '#F4D03F', /* Sigma Yellow */
        danger: '#EF4444', /* Error Red */
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
