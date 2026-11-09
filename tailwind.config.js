/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cardio: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        uco: {
          bg: '#fef2f2',
          border: '#f87171',
          text: '#991b1b',
        },
        piso: {
          bg: '#eff6ff',
          border: '#60a5fa',
          text: '#1e40af',
        }
      }
    },
  },
  plugins: [],
}
