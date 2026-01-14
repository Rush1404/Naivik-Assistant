/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // This allows the manual dark/light toggle
  theme: {
    extend: {
      colors: {
        'naivik-indigo': '#6366f1',
        'naivik-dark-bg': '#0b0f1a', // Deeper, more modern dark
        'naivik-dark-card': '#161b2b',
      },
    },
  },
  plugins: [],
}