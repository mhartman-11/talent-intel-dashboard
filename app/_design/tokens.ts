/**
 * Viscous Flow design tokens — single source of truth.
 * Use these in className strings or inline styles.
 */

export const COLORS = {
  // The Void
  void: "#0e0e0e",
  black: "#000000",

  // Surface tiers (higher = visually closer)
  surfaceLow: "#141414",
  surface: "#1a1a1a",
  surfaceHigh: "#212121",
  surfaceHigher: "#2a2a2a",
  surfaceHighest: "#333333",

  // Outline (ghost border)
  outlineVariant: "rgba(255,255,255,0.08)",

  // The Currents — signal colors
  cyan: "#81ecff",      // layoffs / negative
  cyanDim: "#4db8cc",
  cyanGlow: "rgba(129,236,255,0.12)",

  orange: "#ff734a",    // hiring / growth
  orangeDim: "#cc5c3b",
  orangeGlow: "rgba(255,115,74,0.12)",

  violet: "#d277ff",    // org / exec / money
  violetDim: "#a85fcc",
  violetGlow: "rgba(210,119,255,0.12)",

  // Text
  textPrimary: "#ffffff",
  textSecondary: "rgba(255,255,255,0.6)",
  textTertiary: "rgba(255,255,255,0.35)",
} as const;

/** Map event type → accent color */
export const EVENT_COLOR: Record<string, string> = {
  layoff: COLORS.cyan,
  posting: COLORS.orange,
  exec_move: COLORS.violet,
  funding: COLORS.violet,
  m_and_a: COLORS.violet,
  comp: COLORS.orange,
  macro: COLORS.cyanDim,
};

export const EVENT_COLOR_GLOW: Record<string, string> = {
  layoff: COLORS.cyanGlow,
  posting: COLORS.orangeGlow,
  exec_move: COLORS.violetGlow,
  funding: COLORS.violetGlow,
  m_and_a: COLORS.violetGlow,
  comp: COLORS.orangeGlow,
  macro: COLORS.cyanGlow,
};

export const EVENT_LABEL: Record<string, string> = {
  layoff: "Layoff",
  posting: "Hiring",
  exec_move: "Exec Move",
  funding: "Funding",
  m_and_a: "M&A",
  comp: "Comp",
  macro: "Macro",
};

export const SECTOR_ORDER = [
  "Technology",
  "Finance",
  "Healthcare",
  "CPG",
  "Manufacturing",
  "Retail",
  "Media",
] as const;

export const SIGNAL_ORDER = [
  "layoff",
  "posting",
  "exec_move",
  "funding",
  "macro",
] as const;
