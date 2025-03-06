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
        primary: '#00df9a', // Neon green used in the design
        darkBlue: '#000337', // The dark blue used in the background
        lightBlue: '#2460ff', // The blue used in buttons and highlights
        offWhite: '#f4f4f4',  // Light color for the text
        customDark: '#1E1E1E',
        highLight: '#00FFC0',
        buttonBlue: '#2826FF'

      },
      borderWidth: {
        '1': '1px', // Define border-b-1
      },
      fontFamily: {
        // Custom fonts if needed
        luloCleanOne: ['LuloCleanOne', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
