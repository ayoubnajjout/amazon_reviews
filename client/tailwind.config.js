// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: { 
      colors: {
        'review-yellow': '#f39c12',
      },
      animation: {
        'flash': 'flash 1s ease-in-out',
      },
      keyframes: {
        flash: {
          '0%': { backgroundColor: '#fff799' },
          '100%': { backgroundColor: 'transparent' },
        }
      }
    },
  },
  plugins: [],
}