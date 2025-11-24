import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F9FA", // Soft off-white
        foreground: "#212529", // Dark charcoal
        card: "#FFFFFF", // Pure white for cards
        sidebar: "#F0F2F5", // Slightly darker for sidebar
        border: "#E9ECEF",
        primary: {
          DEFAULT: "#FF6B35", // Emollient Orange
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#6C757D", // Soft gray
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8F9FA",
          foreground: "#6C757D",
        },
        accent: {
          DEFAULT: "#FF6B35",
          foreground: "#FFFFFF",
        },
        status: {
          processing: "#FF6B35",
          completed: "#28A745",
          failed: "#DC3545",
        },
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-orange": "0 4px 20px rgba(255, 107, 53, 0.4)",
        "glow-orange-lg": "0 8px 30px rgba(255, 107, 53, 0.5)",
        "card": "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.12)",
      },
      animation: {
        "pulse-orange": "pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-orange": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 0 0 rgba(255, 107, 53, 0.4)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 0 8px rgba(255, 107, 53, 0)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;

