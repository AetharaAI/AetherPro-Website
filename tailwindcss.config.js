module.exports = {
  darkMode: 'class', // <== ADD THIS LINE
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        input: 'var(--input)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        // Add more as needed from your index.css
      },
    },
  },
  plugins: [],
}