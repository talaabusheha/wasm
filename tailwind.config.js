/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FBF6EF',
        beige: '#F3E8DA',
        sand: '#E6D5BF',
        gold: {
          DEFAULT: '#B8925A',
          dark: '#8C6A3C',
          light: '#CFA872',
        },
        brown: {
          DEFAULT: '#3B2A1E',
          muted: '#7A6656',
          dark: '#261B13',
        },
      },
      fontFamily: {
        arabic: ['"El Messiri"', 'sans-serif'],
        latin: ['"Montserrat"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(59, 42, 30, 0.05)',
        'card': '0 8px 30px -4px rgba(59, 42, 30, 0.07)',
        'gold-glow': '0 4px 20px 0 rgba(140, 106, 60, 0.25)',
      },
    },
  },
  plugins: [],
}

