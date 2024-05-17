/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: "#C1C2C5",
          100: "#A6A7AB",
          200: "#909296",
          300: "#5C5F66",
          400: "#373A40",
          500: "#2C2E33",
          600: "#25262B",
          700: "#1A1B1E",
          800: "#141517",
          900: "#101113",
        },
        green: {
          50: "#EBFBEE",
          100: "#D3F9D8",
          200: "#B2F2BB",
          300: "#8CE99A",
          400: "#69DB7C",
          500: "#51CF66",
          600: "#40C057",
          700: "#37B24D",
          800: "#2F9E44",
          900: "#2B8A3E",
        },
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        "inter-tight": ["var(--font-inter-tight)", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5715" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.017em" }],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.017em" }],
        xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.017em" }],
        "2xl": ["1.5rem", { lineHeight: "1.415", letterSpacing: "-0.017em" }],
        "3xl": ["2rem", { lineHeight: "1.3125", letterSpacing: "-0.017em" }],
        "4xl": ["2.5rem", { lineHeight: "1.25", letterSpacing: "-0.017em" }],
        "5xl": ["3.25rem", { lineHeight: "1.2", letterSpacing: "-0.017em" }],
        "6xl": ["3.75rem", { lineHeight: "1.1666", letterSpacing: "-0.017em" }],
        "7xl": ["4.5rem", { lineHeight: "1.1666", letterSpacing: "-0.017em" }],
      },
      animation: {
        "infinite-scroll": "infinite-scroll 60s linear infinite",
        "infinite-scroll-inverse":
          "infinite-scroll-inverse 60s linear infinite",
        heartbeat: "heartbeat 2s linear infinite both",
      },
      keyframes: {
        "infinite-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        "infinite-scroll-inverse": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        heartbeat: {
          "0%, 100%": {
            transform: "scale(1)",
            animationTimingFunction: "ease-out",
          },
          "10%": {
            transform: "scale(0.91)",
            animationTimingFunction: "ease-in",
          },
          "17%": {
            transform: "scale(0.98)",
            animationTimingFunction: "ease-out",
          },
          "33%": {
            transform: "scale(0.87)",
            animationTimingFunction: "ease-in",
          },
          "45%": { transform: "scale(1)", animationTimingFunction: "ease-out" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
