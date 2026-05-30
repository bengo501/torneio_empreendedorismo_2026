/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zippi: {
          50: '#f0fff6', 100: '#ccffe0', 300: '#6effa0',
          400: '#3DED7A', 500: '#1AD460', 600: '#14AA4C',
          700: '#0E7F39', 800: '#094F24', 900: '#041A0D',
        },
        dark: {
          50: '#F8F8F8', 100: '#E8E8E8', 200: '#CCCCCC',
          300: '#AAAAAA', 400: '#888888', 500: '#555555',
          600: '#333333', 700: '#222222', 800: '#1A1A1A',
          900: '#111111', 950: '#0A0A0A',
        },
      },
      borderRadius: {
        '4xl': '2rem', '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
