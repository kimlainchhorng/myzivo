/**
 * ZIVO BRAND TOKENS
 * Central configuration for brand colors, typography, and design tokens
 * Import this file to ensure consistency across the application
 */

// ============================================
// COLOR SYSTEM
// ============================================

export const brandColors = {
  // Primary Brand
  primary: {
    DEFAULT: "hsl(198 93% 59%)",  // Electric Teal
    light: "hsl(199 95% 73%)",
    dark: "hsl(200 98% 39%)",
    muted: "hsl(198 93% 59% / 0.1)",
  },
  
  // Product Colors
  flights: {
    DEFAULT: "hsl(199 89% 48%)",  // Sky Blue
    light: "hsl(199 95% 73%)",
    dark: "hsl(200 98% 39%)",
    muted: "hsl(199 89% 48% / 0.1)",
    gradient: "from-sky-500 to-blue-600",
    hoverGradient: "from-sky-600 to-blue-700",
    shadow: "shadow-sky-500/25",
    text: "text-sky-500",
    bg: "bg-sky-500",
    border: "border-sky-500/30",
  },
  
  hotels: {
    DEFAULT: "hsl(38 92% 50%)",  // Warm Amber
    light: "hsl(45 93% 58%)",
    dark: "hsl(32 95% 44%)",
    muted: "hsl(38 92% 50% / 0.1)",
    gradient: "from-amber-500 to-orange-600",
    hoverGradient: "from-amber-600 to-orange-700",
    shadow: "shadow-amber-500/25",
    text: "text-amber-500",
    bg: "bg-amber-500",
    border: "border-amber-500/30",
  },
  
  cars: {
    DEFAULT: "hsl(263 70% 58%)",  // Purple Indigo
    light: "hsl(270 95% 75%)",
    dark: "hsl(256 77% 51%)",
    muted: "hsl(263 70% 58% / 0.1)",
    gradient: "from-violet-500 to-purple-600",
    hoverGradient: "from-violet-600 to-purple-700",
    shadow: "shadow-violet-500/25",
    text: "text-violet-500",
    bg: "bg-violet-500",
    border: "border-violet-500/30",
  },
  
  // Semantic Colors
  success: "hsl(142 72% 45%)",
  warning: "hsl(38 92% 50%)",
  destructive: "hsl(0 84% 60%)",
  
  // Neutrals
  background: "hsl(222 47% 11%)",
  foreground: "hsl(210 40% 98%)",
  muted: "hsl(215 16% 46%)",
  border: "hsl(215 19% 34%)",
  card: "hsl(217 32% 17%)",
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  fonts: {
    display: "'Outfit', system-ui, sans-serif",
    sans: "'Inter', system-ui, sans-serif",
    mono: "'Space Mono', monospace",
  },
  
  sizes: {
    h1: "text-4xl sm:text-5xl",
    h2: "text-2xl sm:text-3xl",
    h3: "text-xl",
    body: "text-base",
    small: "text-sm",
    caption: "text-xs",
  },
  
  weights: {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  },
  
  lineHeights: {
    tight: "leading-tight",
    snug: "leading-snug",
    normal: "leading-normal",
    relaxed: "leading-relaxed",
  },
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
  container: "container mx-auto px-4",
  section: "py-12 sm:py-16",
  sectionLarge: "py-16 sm:py-24",
  cardPadding: "p-4 sm:p-6",
  gap: {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  },
} as const;

// ============================================
// COMPONENT SIZES
// ============================================

export const componentSizes = {
  button: {
    sm: "h-9 px-4 text-sm",
    default: "h-11 px-6 text-base",
    lg: "h-12 px-8 text-base",
    xl: "h-14 px-10 text-lg",
  },
  input: {
    sm: "h-9",
    default: "h-11",
    lg: "h-12",
  },
  icon: {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    default: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  },
} as const;

// ============================================
// ANIMATIONS
// ============================================

export const animations = {
  duration: {
    fast: "duration-200",
    normal: "duration-300",
    slow: "duration-500",
  },
  easing: {
    default: "ease-out",
    bounce: "ease-in-out",
  },
  transitions: {
    default: "transition-all duration-200 ease-out",
    colors: "transition-colors duration-200",
    transform: "transition-transform duration-200",
  },
} as const;

// ============================================
// CTA TEXT STANDARDS
// ============================================

export const ctaText = {
  flights: {
    search: "Search Flights",
    view: "View Deal",
    book: "Book Flight",
  },
  hotels: {
    search: "Search Hotels",
    view: "View Hotel",
    book: "Book Hotel",
  },
  cars: {
    search: "Search Cars",
    view: "View Details",
    book: "Rent a Car",
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

export type ServiceType = "flights" | "hotels" | "cars";

export function getServiceColors(service: ServiceType) {
  return brandColors[service];
}

export function getServiceGradient(service: ServiceType) {
  return `bg-gradient-to-r ${brandColors[service].gradient}`;
}

export function getServiceHoverGradient(service: ServiceType) {
  return `hover:bg-gradient-to-r ${brandColors[service].hoverGradient}`;
}

export function getCtaText(service: ServiceType, action: "search" | "view" | "book") {
  return ctaText[service][action];
}
