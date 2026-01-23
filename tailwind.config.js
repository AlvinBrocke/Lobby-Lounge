/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      colors: {
        background: "#0F1419",
        surface: "#1A1F26",
        primary: "#4ECDC4",
        secondary: "#44A08D",
        "tunify-blue": "#0093E9",
        "tunify-dark": "#0F2027",
        "tunify-dark-blue": "#203A43",
      },
    },
    plugins: [],
  },
};
