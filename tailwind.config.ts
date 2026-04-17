import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Viscous Flow palette ─────────────────────────────────────────
      colors: {
        // The Void (base layers)
        void: {
          DEFAULT: "#0e0e0e",
          black: "#000000",
        },
        // Surface container tiers (light → dark = closer to viewer)
        surface: {
          low: "#141414",
          DEFAULT: "#1a1a1a",
          high: "#212121",
          higher: "#2a2a2a",
          highest: "#333333",
        },
        // The Currents (accent colors)
        cyan: {
          DEFAULT: "#81ecff",    // layoffs / negative signal
          dim: "#4db8cc",
          glow: "rgba(129,236,255,0.15)",
        },
        orange: {
          DEFAULT: "#ff734a",    // hiring / growth signal
          dim: "#cc5c3b",
          glow: "rgba(255,115,74,0.15)",
        },
        violet: {
          DEFAULT: "#d277ff",    // org/exec/money moves
          dim: "#a85fcc",
          glow: "rgba(210,119,255,0.15)",
        },
        // Neutral text
        ghost: {
          DEFAULT: "rgba(255,255,255,0.5)",
          dim: "rgba(255,255,255,0.25)",
          faint: "rgba(255,255,255,0.1)",
        },
      },

      // ─── Typography ───────────────────────────────────────────────────
      fontFamily: {
        display: ["Epilogue", "system-ui", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },

      // ─── Motion ───────────────────────────────────────────────────────
      transitionTimingFunction: {
        viscous: "cubic-bezier(0.23, 1, 0.32, 1)",
        kinetic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        DEFAULT: "300ms",
        slow: "600ms",
        fast: "150ms",
      },

      // ─── Shadows (tinted, diffused) ───────────────────────────────────
      boxShadow: {
        "cyan-glow": "0 0 40px 8px rgba(129,236,255,0.07)",
        "orange-glow": "0 0 40px 8px rgba(255,115,74,0.07)",
        "violet-glow": "0 0 40px 8px rgba(210,119,255,0.07)",
        "float": "0 8px 48px rgba(0,0,0,0.6)",
        "card": "0 2px 24px rgba(0,0,0,0.5)",
      },

      // ─── Blur ─────────────────────────────────────────────────────────
      backdropBlur: {
        glass: "12px",
      },

      // ─── Border radius ────────────────────────────────────────────────
      borderRadius: {
        pill: "9999px",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
