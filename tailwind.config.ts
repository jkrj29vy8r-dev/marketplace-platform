import type { Config } from "tailwindcss";

// Design tokens for the Nexar brand: ultra-dark glassmorphic surfaces
// with restrained neon accents. Kept centralized so every screen
// (landing, admin, client, provider, match) stays visually consistent.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#05060a",
          900: "#0a0c14",
          800: "#11141f",
          700: "#1a1e2c",
          600: "#262b3d",
        },
        accent: {
          cyan: "#4DF0FF",
          violet: "#8B5CF6",
          green: "#39FFB0",
          amber: "#FFB454",
          danger: "#FF5C7A",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(77, 240, 255, 0.35)",
        "glow-violet": "0 0 40px -10px rgba(139, 92, 246, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      animation: {
        "pulse-slow": "pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
