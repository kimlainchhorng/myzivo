/**
 * useSwipeDownClose — shared drag-to-dismiss for fullscreen post viewers.
 *
 * Provides a Framer Motion `dragControls` instance plus matching
 * motion props so the overlay translates with the user's finger and
 * closes when the gesture passes a downward offset/velocity threshold.
 *
 * The drag is started by the caller from a dedicated header / grab
 * zone via `dragControls.start(event)`, so scrollable content beneath
 * keeps its native pan-y behavior.
 */
import { useDragControls, type PanInfo } from "framer-motion";
import { useCallback } from "react";

const CLOSE_OFFSET_PX = 120;
const CLOSE_VELOCITY = 600;

export function useSwipeDownClose(onClose: () => void) {
  const dragControls = useDragControls();

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > CLOSE_OFFSET_PX || info.velocity.y > CLOSE_VELOCITY) {
        onClose();
      }
    },
    [onClose],
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

  return { dragControls, motionProps, startDrag };
}
