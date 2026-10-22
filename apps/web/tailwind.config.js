/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'Tajawal', 'Tahoma', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#FFF9F2',
          100: '#F6E7D4',
          200: '#EAD3B5',
          300: '#D9BC96',
        },
        ink: {
          DEFAULT: '#241711',
          soft: '#4A3B2A',
        },
        stamp: {
          DEFAULT: '#8C1D18',
          dark: '#6E1511',
        },
        palm: {
          DEFAULT: '#1F6B45',
          dark: '#154E32',
        },
        gold: '#8A5A10',
      },
      boxShadow: {
        hard: '6px 6px 0 #241711',
        soft: '3px 3px 0 #241711',
      },
    },
  },
  plugins: [],
}
