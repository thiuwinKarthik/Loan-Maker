/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#0b1d30',
          950: '#06101c'
        },
        accent: '#d4af37', // Premium Gold
        danger: '#dc2626',
        warning: '#d97706',
        info: '#0284c7',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ],
      },
      boxShadow: {
        soft: '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.05)',
        card: '0 6px 20px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        xl: '1rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
      }
    },
  },
  plugins: [],
};
