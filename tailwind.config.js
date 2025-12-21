/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // These match your DGA Brand specs exactly
        'dga-navy': '#041c24',
        'dga-gold': '#d6b27d',
        'dga-slate': '#1f333c',
        'dga-bronze': '#846434',
        'dga-gray-light': '#7c8c89',
      },
    },
  },
  plugins: [],
}