/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Programme Insights Brand Colors
        primary: '#0055A5', // Deep blue
        'primary-dark': '#003d7a',
        accent: '#FF5722', // Bright orange
        'accent-light': '#FF7043',
        secondary: '#0088FF', // Light blue
        success: '#00703c',
        warning: '#f47738',
        error: '#d4351c',
        'rag-green': '#00703c',
        'rag-amber': '#f47738',
        'rag-red': '#d4351c',
        background: '#f8f9fa',
        card: '#ffffff',
        'text-primary': '#1a1a1a',
        'text-secondary': '#6c757d',
        border: '#dee2e6',
      },
    },
  },
  plugins: [],
}
