/**
 * Framer Motion presets for the Viscous Flow design system.
 * Elements streak in, not fade in — mass and momentum.
 */
import type { Variants } from "framer-motion";

export const EASE_VISCOUS = [0.23, 1, 0.32, 1] as const;
export const EASE_KINETIC = [0.16, 1, 0.3, 1] as const;

/** Standard reveal: slide up + fade in */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_VISCOUS },
  },
};

/** Stagger container */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/** Blur → sharp on load (KineticHeadline effect) */
export const meltIn: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_KINETIC },
  },
};

/** Scale from 0.96 — card entrance */
export const cardEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_VISCOUS },
  },
};

/** Ghost border hover state (to use in JS-driven hovers) */
export const ghostBorderHover = {
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
};
