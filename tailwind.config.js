/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        accent: {
          DEFAULT: "var(--accent)",
        },
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "border-line": "var(--border)",
        "muted-surface": "var(--muted-surface)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Space Grotesk'", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(23, 35, 29, 0.04), 0 1px 2px -1px rgba(23, 35, 29, 0.04)",
        card: "0 4px 16px -2px rgba(23, 35, 29, 0.04), 0 2px 6px -1px rgba(23, 35, 29, 0.02)",
        dropdown: "0 10px 25px -5px rgba(23, 35, 29, 0.08), 0 8px 10px -6px rgba(23, 35, 29, 0.04)",
      },
      transitionDuration: {
        fast: "150ms",
      },
    },
  },
  plugins: [],
}
