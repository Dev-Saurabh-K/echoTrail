/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8B0',
        mint: '#AEEED3',
        teal: '#55A9A0',
        deepTeal: '#287A74',
      },
    },
  },
  plugins: [],
};
