/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uce: {
          navy: '#1a2332',
          blue: '#0ea5e9',
          purple: '#9b59b6',
          light: '#ecf0f1',
          dark: '#2c3e50',
        }
      }
    },
  },
  plugins: [],
}
