/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14342B',
          dark: '#0E241E',
          light: '#1D4A3E'
        },
        accent: {
          DEFAULT: '#C2A878',
          dark: '#AB915F',
          light: '#D4BF94'
        },
        cream: {
          DEFAULT: '#FAF8F3',
          dark: '#F0ECE1'
        },
        dark: {
          DEFAULT: '#1C1C1C',
          muted: '#4A4A4A'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

