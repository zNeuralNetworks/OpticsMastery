export const designTokens = {
  colors: {
    background: {
      deepSpace: "#0B1220",
      primarySurface: "#111A2B",
      elevatedSurface: "#162338",
      gridDivider: "#22314A",
      subtleBorder: "#2C3D5B",
    },
    text: {
      primary: "#E6EDF6",
      secondary: "#9FB2CC",
      muted: "#6F87A6",
    },
    accents: {
      sapphire: "#3B82F6",
      amethyst: "#8B5CF6",
      indigo: "#6366F1",
      ember: "#EF4444",
      cyan: "#06B6D4",
      emerald: "#10B981",
    },
    interaction: {
      hoverBlue: "#60A5FA",
      highlightEmerald: "#34D399",
      softViolet: "#A78BFA",
    },
    glow: {
      sapphire: "rgba(59,130,246,0.25)",
      amethyst: "rgba(139,92,246,0.25)",
      emerald: "rgba(16,185,129,0.25)",
      ember: "rgba(239,68,68,0.22)",
      cyan: "rgba(6,182,212,0.22)",
      indigo: "rgba(99,102,241,0.22)",
    },
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    6: "24px",
    8: "32px",
    12: "48px",
  },
  radius: {
    card: "24px",
    panel: "20px",
    pill: "999px",
  },
  shadow: {
    surface: "0 18px 36px rgba(0, 0, 0, 0.24)",
    elevated: "0 22px 44px rgba(0, 0, 0, 0.28)",
  },
} as const;

export type AccentTone = keyof typeof designTokens.colors.accents;
