import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        earth: {
          50: "#f7f5f0",
          100: "#e8e4d9",
          200: "#d4ccb8",
          300: "#bcae92",
          400: "#a89573",
          500: "#9a8466",
          600: "#8a6f58",
          700: "#73584a",
          800: "#5f4a41",
          900: "#503f38",
        },
        wander: {
          teal: "#0d9488",
          amber: "#d97706",
          rose: "#e11d48",
          indigo: "#4f46e5",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      transitionDuration: {
        "400": "400ms",
      },
      boxShadow: {
        "soft": "0 4px 14px 0 rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
