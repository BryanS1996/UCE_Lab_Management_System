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
          navy: '#1e3a5f',
          blue: '#3498db',
          purple: '#9b59b6',
          light: '#ecf0f1',
          dark: '#2c3e50',
        }
      }
    },
  },
  plugins: [],
}
