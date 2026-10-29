/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#FDFBF7',
          DEFAULT: '#F7F4EE',
          dark: '#E6E1D8',
        },
        graphite: {
          light: '#3E4540',
          DEFAULT: '#1F2421',
          dark: '#141816',
        },
        electric: {
          DEFAULT: '#FF5A36',
          hover: '#E04826',
        },
      },
    },
  },
  plugins: [],
}
