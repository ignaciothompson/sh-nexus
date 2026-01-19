/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        background: '#0f172a',
        surface: '#1e293b',
      }
    },
  },
  plugins: [],
}
