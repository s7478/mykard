import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",      // For App Router
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",    // If using Pages Router
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // If you have a separate components folder
    "./src/**/*.{js,ts,jsx,tsx,mdx}",      // If you are using the src directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;