import type { Config } from "tailwindcss";
import { designTokens } from "./src/styles/designTokens";

export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Cluster designer design tokens
        space: designTokens.colors.background.deepSpace,
        surface: designTokens.colors.background.primarySurface,
        "surface-elevated": designTokens.colors.background.elevatedSurface,
        gridline: designTokens.colors.background.gridDivider,
        border: designTokens.colors.background.subtleBorder,
        canvas: designTokens.colors.background.deepSpace,
        panel: designTokens.colors.background.primarySurface,
        "panel-2": designTokens.colors.background.elevatedSurface,
        line: designTokens.colors.background.subtleBorder,
        ink: designTokens.colors.text.primary,
        muted: designTokens.colors.text.secondary,
        label: designTokens.colors.text.muted,
        sapphire: designTokens.colors.accents.sapphire,
        amethyst: designTokens.colors.accents.amethyst,
        indigo: designTokens.colors.accents.indigo,
        ember: designTokens.colors.accents.ember,
        cyan: designTokens.colors.accents.cyan,
        emerald: designTokens.colors.accents.emerald,
        "hover-blue": designTokens.colors.interaction.hoverBlue,
        "highlight-emerald": designTokens.colors.interaction.highlightEmerald,
        "soft-violet": designTokens.colors.interaction.softViolet,
        accent: designTokens.colors.accents.sapphire,
        success: designTokens.colors.accents.emerald,
        warning: designTokens.colors.accents.ember,
        // Root app tokens
        slate: {
          850: "#1e293b",
          950: "#020617",
        },
        arista: {
          blue: "#003366",
          light: "#005596",
          accent: "#4DB848",
        },
      },
      boxShadow: {
        surface: designTokens.shadow.surface,
        elevated: designTokens.shadow.elevated,
        "glow-sapphire": `0 0 0 1px ${designTokens.colors.glow.sapphire}, 0 12px 28px rgba(0, 0, 0, 0.22)`,
        "glow-amethyst": `0 0 0 1px ${designTokens.colors.glow.amethyst}, 0 12px 28px rgba(0, 0, 0, 0.22)`,
        "glow-emerald": `0 0 0 1px ${designTokens.colors.glow.emerald}, 0 12px 28px rgba(0, 0, 0, 0.22)`,
        "glow-ember": `0 0 0 1px ${designTokens.colors.glow.ember}, 0 12px 28px rgba(0, 0, 0, 0.22)`,
        "glow-cyan": `0 0 0 1px ${designTokens.colors.glow.cyan}, 0 12px 28px rgba(0, 0, 0, 0.22)`,
        "glow-indigo": `0 0 0 1px ${designTokens.colors.glow.indigo}, 0 12px 28px rgba(0, 0, 0, 0.22)`,
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(34,49,74,0.36) 1px, transparent 1px), linear-gradient(90deg, rgba(34,49,74,0.36) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.05em",
        widest: "0.2em",
      },
      lineHeight: {
        "extra-tight": "1.1",
        "relaxed-plus": "1.75",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
