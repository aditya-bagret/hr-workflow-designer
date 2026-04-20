/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#0a0b0f",
          900: "#0f1117",
          800: "#161820",
          700: "#1e2130",
          600: "#252840",
        },
        accent: {
          orange: "#f97316",
          blue: "#3b82f6",
          green: "#22c55e",
          purple: "#a855f7",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

