/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        urgent: '#F97316',
        success: '#10B981',
      },
    },
  },
  plugins: [],
};
