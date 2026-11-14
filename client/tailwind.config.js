/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        darkbg: '#0a0d14',
        panel: '#101726'
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Oswald"', '"Montserrat"', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'shimmer': 'shimmer 3s infinite linear',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 25px rgba(234, 179, 8, 0.85))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

