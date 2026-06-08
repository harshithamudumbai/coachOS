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
        border: '#333333',
        input: '#1A1A1A',
        ring: '#F5B041', /* Warm Yellow */
        background: '#121212', /* Near-black paper */
        foreground: '#EAEAEA', /* Off-white */
        card: '#1A1A1A', /* Dark charcoal */
        primary: {
          DEFAULT: '#F5B041', /* Warm Yellow */
          foreground: '#121212',
        },
        secondary: {
          DEFAULT: '#3498DB', /* Scientific Blue */
          foreground: '#EAEAEA',
        },
        muted: {
          DEFAULT: '#222222',
          foreground: '#9CA3AF',
        },
        accent: {
          DEFAULT: '#333333',
          foreground: '#EAEAEA',
        },
        success: '#2ECC71',
        warning: '#F5B041',
        danger: '#E74C3C',
      },
      borderRadius: {
        xl: '0px',
        lg: '0px',
        md: '0px',
        sm: '0px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['IBM Plex Serif', 'serif'],
      },
      boxShadow: {
        'soft': 'none',
      }
    },
  },
  plugins: [],
}
