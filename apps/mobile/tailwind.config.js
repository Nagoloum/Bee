/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        amber: {
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
      },
    },
  },
  plugins: [],
};
