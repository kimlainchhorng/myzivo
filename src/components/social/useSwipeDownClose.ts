/**
 * useSwipeDownClose — shared drag-to-dismiss for fullscreen post viewers.
 *
 * Per-platform thresholds keep the gesture from triggering accidentally on
 * iOS rubber-band scrolls while still feeling responsive on Android's
 * stiffer touch scrollers. The drag is started by the caller from a
 * dedicated header / grab zone via `dragControls.start(event)`, so
 * scrollable content beneath keeps its native pan-y behavior.
 */
import { useDragControls, type PanInfo } from "framer-motion";
import { useCallback, useMemo } from "react";

export type SwipePlatform = "ios" | "android" | "default";

export interface SwipeThresholds {
  /** Minimum downward offset (px) needed to trigger close on drag end. */
  offset: number;
  /** Minimum downward velocity (px/s) needed to trigger close on drag end. */
  velocity: number;
  /** Minimum drag distance before the gesture activates at all. */
  minDragDistance: number;
}

const THRESHOLDS: Record<SwipePlatform, SwipeThresholds> = {
  ios: { offset: 110, velocity: 750, minDragDistance: 8 },
  android: { offset: 90, velocity: 550, minDragDistance: 8 },
  default: { offset: 100, velocity: 650, minDragDistance: 8 },
};

/** Detect runtime platform for swipe tuning. Pure + SSR-safe. */
export function detectPlatform(): SwipePlatform {
  if (typeof navigator === "undefined") return "default";
  // Capacitor native bridge takes precedence when present.
  const cap = (globalThis as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const native = cap?.getPlatform?.();
  if (native === "ios") return "ios";
  if (native === "android") return "android";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "default";
}

export function getSwipeThresholds(
  platform: SwipePlatform = detectPlatform(),
): SwipeThresholds {
  return THRESHOLDS[platform] ?? THRESHOLDS.default;
}

/** Pure decision used by the hook + tested directly in unit tests. */
export function shouldDismiss(
  info: Pick<PanInfo, "offset" | "velocity">,
  thresholds: SwipeThresholds,
): boolean {
  // Reject horizontal-dominant or upward gestures.
  if (info.offset.y < thresholds.minDragDistance) return false;
  if (Math.abs(info.offset.x) > info.offset.y * 1.2) return false;
  return info.offset.y >= thresholds.offset || info.velocity.y >= thresholds.velocity;
}

export function useSwipeDownClose(onClose: () => void) {
  const dragControls = useDragControls();
  const thresholds = useMemo(() => getSwipeThresholds(), []);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (shouldDismiss(info, thresholds)) onClose();
    },
    [onClose, thresholds],
  );

  const motionProps = {
    drag: "y" as const,
    dragControls,
    dragListener: false,
    dragConstraints: { top: 0, bottom: 0 },
    dragElastic: { top: 0, bottom: 0.4 },
    onDragEnd: handleDragEnd,
  };

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      dragControls.start(e);
    },
    [dragControls],
  );

  return { dragControls, motionProps, startDrag, thresholds };
}
