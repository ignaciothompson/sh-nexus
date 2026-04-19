/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        'primary-hover': '#059669',
        background: '#0f0f0f',
        surface: '#1c1c1e',
        'surface-elevated': '#2c2c2e',
      }
    },
  },
  plugins: [],
}
