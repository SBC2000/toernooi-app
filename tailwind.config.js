/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        sbcBlue: {
          500: '#305887',
        },
        sbcOrange: {
          500: '#EBA459',
          600: '#E58C37',
        },
      }
    }
  },
  plugins: [],
}
