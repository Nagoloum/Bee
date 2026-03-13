import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        // BEE brand colors — warm honey palette
        honey: {
          50:  "#FFF8EC",
          100: "#FFEFC7",
          200: "#FFD98A",
          300: "#FFBE4D",
          400: "#FFA424",
          500: "#F6861A",  // primary brand
          600: "#DA5F0A",
          700: "#B54209",
          800: "#92340D",
          900: "#782D0E",
          950: "#451408",
        },
        // Deep navy for text/surfaces
        ink: {
          50:  "#F0F0F5",
          100: "#E1E1EB",
          200: "#C3C3D7",
          300: "#9A9AB8",
          400: "#747499",
          500: "#56567E",
          600: "#434368",
          700: "#373756",
          800: "#2D2D47",
          900: "#1A1A2E",  // primary dark
          950: "#0F0F1A",
        },
        // Warm off-white backgrounds
        cream: {
          50:  "#FDFCF9",
          100: "#FAF8F2",
          200: "#F5F0E6",
          300: "#EDE5D4",
          400: "#E0D5BE",
          500: "#CFBE9F",
        },
        // Semantic
        primary: {
          DEFAULT: "#F6861A",
          foreground: "#FFFFFF",
          hover: "#DA5F0A",
          light: "#FFF8EC",
        },
        secondary: {
          DEFAULT: "#1A1A2E",
          foreground: "#FFFFFF",
          hover: "#2D2D47",
          light: "#F0F0F5",
        },
        success: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
          light: "#ECFDF5",
          dark: "#065F46",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
          light: "#FFFBEB",
          dark: "#92400E",
        },
        error: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
          light: "#FEF2F2",
          dark: "#991B1B",
        },
        info: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
          light: "#EFF6FF",
          dark: "#1E3A8A",
        },
        // Layout
        background: "#FDFCF9",
        surface: "#FFFFFF",
        border: "#EDE5D4",
        "border-strong": "#CFBE9F",
        muted: "#F5F0E6",
        "muted-foreground": "#74748A",
        foreground: "#1A1A2E",
        "foreground-secondary": "#56567E",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "soft-sm": "0 1px 3px 0 rgba(26, 26, 46, 0.06), 0 1px 2px -1px rgba(26, 26, 46, 0.06)",
        "soft":    "0 4px 6px -1px rgba(26, 26, 46, 0.07), 0 2px 4px -2px rgba(26, 26, 46, 0.07)",
        "soft-md": "0 10px 15px -3px rgba(26, 26, 46, 0.08), 0 4px 6px -4px rgba(26, 26, 46, 0.08)",
        "soft-lg": "0 20px 25px -5px rgba(26, 26, 46, 0.09), 0 8px 10px -6px rgba(26, 26, 46, 0.09)",
        "soft-xl": "0 25px 50px -12px rgba(26, 26, 46, 0.15)",
        "honey":   "0 4px 14px 0 rgba(246, 134, 26, 0.25)",
        "honey-lg":"0 8px 30px 0 rgba(246, 134, 26, 0.35)",
        "glow":    "0 0 20px rgba(246, 134, 26, 0.15), 0 4px 14px 0 rgba(246, 134, 26, 0.2)",
        "inner-soft": "inset 0 2px 4px 0 rgba(26, 26, 46, 0.06)",
      },
      animation: {
        "fade-in":     "fadeIn 0.3s ease-out",
        "fade-up":     "fadeUp 0.4s ease-out",
        "fade-down":   "fadeDown 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left":  "slideInLeft 0.3s ease-out",
        "scale-in":    "scaleIn 0.2s ease-out",
        "buzz":        "buzz 0.3s ease-in-out",
        "pulse-honey": "pulseHoney 2s ease-in-out infinite",
        "shimmer":     "shimmer 1.5s infinite",
        "spin-slow":   "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        buzz: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
        },
        pulseHoney: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(246, 134, 26, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(246, 134, 26, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      backgroundImage: {
        "honey-gradient": "linear-gradient(135deg, #F6861A 0%, #FFBE4D 100%)",
        "ink-gradient":   "linear-gradient(135deg, #1A1A2E 0%, #373756 100%)",
        "warm-gradient":  "linear-gradient(135deg, #FFF8EC 0%, #FAF8F2 100%)",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
        "card-gradient":  "linear-gradient(145deg, #FFFFFF 0%, #FAF8F2 100%)",
        "hero-pattern":   "radial-gradient(circle at 20% 50%, rgba(246, 134, 26, 0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255, 190, 77, 0.06) 0%, transparent 50%)",
      },
      transitionTimingFunction: {
        "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "68": "17rem",
        "84": "21rem",
        "88": "22rem",
        "92": "23rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },
    },
  },
  plugins: [],
};

export default config;
