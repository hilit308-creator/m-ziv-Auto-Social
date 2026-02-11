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
          primary: '#F28C28',
          secondary: '#E67E22',
          light: 'rgba(242,140,40,0.1)',
          lighter: 'rgba(242,140,40,0.15)',
        },
        mziv: {
          bg: '#FFFFFF',
          section: '#F9F9F9',
          text: '#222222',
          'text-secondary': '#666666',
          border: '#EAEAEA',
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
      borderRadius: {
        'btn': '10px',
        'card': '12px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'btn': '0 2px 4px rgba(242, 140, 40, 0.2)',
      },
    },
  },
  plugins: [],
}
