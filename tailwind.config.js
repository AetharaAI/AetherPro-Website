module.exports = {
  darkMode: 'class', // <== ADD THIS LINE
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
  
  },
  plugins: [
    require('@tailwindcss-animate'),
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
    require('tailwind-scrollbar'),
    require('tailwind-scrollbar-hide'),
    require('tailwindcss-debug-screens'),
    require('tailwindcss-filters')
  ]
}