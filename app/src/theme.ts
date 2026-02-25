// Japanese Neobrutalism design system
// Muji meets manga ink. Bold structure, quiet restraint.

import { Platform } from "react-native";

export const colors = {
  bg: "#0A0A0A",
  surface: "#FFFFFF",
  surfaceDim: "#F5F5F0", // warm off-white for secondary cards
  ink: "#000000",
  textPrimary: "#FFFFFF",
  textSecondary: "#888888",
  textOnSurface: "#000000",
  border: "#000000",
  // Shadow color adapts to dark bg — white glow on dark, black on light
  shadowOnDark: "#FFFFFF",
  shadowOnLight: "#000000",
  // No UI accent colors — captured colors are the only color
} as const;

export const borders = {
  width: 2.5,
  radius: 12,
} as const;

// Neobrutalist solid offset shadow.
// On iOS: native shadow properties. On Android: simulated with border trick.
export const shadows = {
  // Standard offset for cards on dark backgrounds (white shadow)
  offset: Platform.select({
    ios: {
      shadowColor: colors.shadowOnDark,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 0,
    },
    android: {
      elevation: 4,
      // Android fallback: we simulate offset shadow in BrutCard component
    },
    default: {},
  }),
  // Smaller offset for compact elements
  small: Platform.select({
    ios: {
      shadowColor: colors.shadowOnDark,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 0,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  // Shadow for light-background cards (black shadow, fully visible)
  onLight: Platform.select({
    ios: {
      shadowColor: colors.shadowOnLight,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
} as const;

export const typography = {
  // Monospace for technical data (hex codes, RGB values)
  mono: {
    fontFamily: Platform.select({ ios: "Courier", android: "monospace" }),
    letterSpacing: 0.5,
  },
  // Bold headers
  h1: {
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 11,
    fontWeight: "500" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
