/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'travel-blue': '#4A90E2',
        'travel-light': '#E8F4FD',
        'travel-dark': '#2C3E50',
      }
    },
  },
  plugins: [],
}
