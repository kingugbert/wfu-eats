/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wfu: {
          gold: '#C8A14E',
          'gold-light': '#DFC373',
          'gold-dark': '#A8842F',
          black: '#000000',
          'gray-900': '#111111',
          'gray-800': '#1A1A1A',
          'gray-700': '#2A2A2A',
          'gray-600': '#3A3A3A',
          'gray-500': '#5A5A5A',
          'gray-400': '#8A8A8A',
          'gray-300': '#B0B0B0',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
