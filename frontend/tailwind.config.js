/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 50px rgba(124, 58, 237, 0.35)',
      },
      colors: {
        midnight: '#0b1020',
        panel: '#111827',
        accent: '#8b5cf6',
        accentSoft: '#c4b5fd',
      },
    },
  },
  plugins: [],
}

