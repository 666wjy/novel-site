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
        ink: {
          50: "#f7f6f4",
          100: "#eceae4",
          200: "#d8d4c8",
          300: "#bdb7a5",
          400: "#9f9783",
          500: "#877e6b",
          600: "#6d6556",
          700: "#585247",
          800: "#4a453c",
          900: "#3f3b34",
          950: "#221f1b",
        },
        accent: {
          DEFAULT: "#c45c26",
          light: "#e8783a",
          dark: "#9a4518",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Noto Serif SC", "serif"],
        sans: ["system-ui", "Segoe UI", "PingFang SC", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
