/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  safelist: [
    'line-clamp-2',
    'line-clamp-3',
  ],
  theme: {
    extend: {
      fontFamily: {
        space: ['"Space Grotesk"', "sans-serif"],
        geist: ['"Geist"', "sans-serif"],
      },
    },
  },
  plugins: [],
};