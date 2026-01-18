/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F1419",
        surface: "#1A1F26",
        primary: "#4ECDC4",
        secondary: "#44A08D",
      },
    },
    plugins: [],
  },
};
