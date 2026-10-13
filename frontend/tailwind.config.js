/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wfu: {
          gold: '#C8A14E',
          'gold-light': '#D4B76A',
          'gold-dark': '#A88430',
          black: '#000000',
          'gray-900': '#1a1a1a',
          'gray-800': '#2d2d2d',
          'gray-700': '#404040',
          'gray-600': '#525252',
          'gray-400': '#9ca3af',
          'gray-300': '#d1d5db',
          white: '#ffffff'
        }
      }
    }
  },
  plugins: [],
};
