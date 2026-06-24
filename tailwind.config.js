/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f1e',
        card: '#1a1a2e',
        accent: '#4a90d9',
      },
    },
  },
  plugins: [],
};
