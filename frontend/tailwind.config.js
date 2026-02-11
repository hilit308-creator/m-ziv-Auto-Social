/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        brand: {
          purple: '#7c3aed',
          pink: '#ec4899',
          blue: '#3b82f6',
          gradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
        },
        social: {
          instagram: '#E4405F',
          facebook: '#1877F2',
          twitter: '#1DA1F2',
          linkedin: '#0A66C2',
          tiktok: '#000000',
          youtube: '#FF0000',
        },
      },
    },
  },
  plugins: [],
}
