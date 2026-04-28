import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10131f",
        mist: "#f5f7fb",
        coral: "#ff6b6b",
        mint: "#2ec4b6",
        lemon: "#ffd166",
        violet: "#6554e8"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(101, 84, 232, 0.22)",
        soft: "0 20px 60px rgba(16, 19, 31, 0.12)"
      },
      borderRadius: {
        "2xl": "0.5rem",
        "3xl": "0.5rem"
      },
      spacing: {
        "13": "3.25rem",
        "18": "4.5rem"
      }
    }
  },
  plugins: []
};

export default config;
