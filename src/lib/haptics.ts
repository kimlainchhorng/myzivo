/**
 * Haptic Feedback Utility
 * Wraps navigator.vibrate() for key user actions
 */

export const haptics = {
  /** Light tap - button press, selection */
  light: () => {
    try {
      navigator?.vibrate?.(10);
    } catch {}
  },

  /** Medium tap - confirmation, toggle */
  medium: () => {
    try {
      navigator?.vibrate?.(25);
    } catch {}
  },

  /** Heavy tap - booking confirmed, payment success */
  heavy: () => {
    try {
      navigator?.vibrate?.(50);
    } catch {}
  },

  /** Success pattern - double pulse */
  success: () => {
    try {
      navigator?.vibrate?.([30, 50, 30]);
    } catch {}
  },

  /** Error pattern - triple short */
  error: () => {
    try {
      navigator?.vibrate?.([20, 30, 20, 30, 20]);
    } catch {}
  },

  /** Warning - single long */
  warning: () => {
    try {
      navigator?.vibrate?.(100);
    } catch {}
  },
};
