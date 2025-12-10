/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Source Sans 3', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Source Sans 3', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Programme Insights Brand Colors - Navy & Copper Theme
        primary: '#2c3e50', // Navy
        'primary-dark': '#1a252f', // Dark Navy
        accent: '#c17a4a', // Copper
        'accent-hover': '#a66339', // Copper hover
        secondary: '#c17a4a', // Copper (for consistency)
        copper: '#c2703e', // Copper for evidence requirements
        'copper-light': '#d4a574', // Light copper for gradients
        navy: '#0f172a', // Dark navy
        'navy-light': '#1e293b', // Light navy
        success: '#00703c',
        warning: '#f47738',
        error: '#d4351c',
        'rag-green': '#00703c',
        'rag-amber': '#f47738',
        'rag-red': '#d4351c',
        background: '#ffffff',
        card: '#ffffff',
        'text-primary': '#1a252f',
        'text-secondary': '#6b7280',
        border: '#e5e7eb',
        'border-default': '#d1d5db',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
