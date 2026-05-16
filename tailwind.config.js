/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#FE7743",
          dark: "#273F4F",
        },
        secondary: {
          light: "#EFEEEA",
          dark: "#000000",
        },
        accent: "#FE7743",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        dash: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
