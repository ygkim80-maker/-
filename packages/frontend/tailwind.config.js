/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#1a1a2e',
        sidebarHover: '#16213e',
        accent: '#0f3460',
        brand: '#e94560',
      },
    },
  },
  plugins: [],
};
