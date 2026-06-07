/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          light: '#d4a574',
          DEFAULT: '#8b5a2b',
          dark: '#5c3a1e',
        },
        ink: '#2c1810'
      },
      fontFamily: {
        song: ['"Source Han Serif SC"', '"Noto Serif SC"', 'SimSun', 'serif']
      }
    },
  },
  plugins: [],
}
