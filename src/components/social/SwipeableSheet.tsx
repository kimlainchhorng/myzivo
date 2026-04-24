/**
 * SwipeableSheet — bottom sheet primitive used across the social feed.
 *
 * Features:
 *  - Backdrop tap to close
 *  - Drag the header strip down to close (offset > 100px OR velocity > 500)
 *  - Safe-area-aware top padding so the header never hides behind a notch
 *  - Bottom padding for the home-indicator
 *  - Inner content scrolls naturally; only the header strip drives the drag,
 *    so list scrolling and text input never trigger a close
 */
import { type ReactNode, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Optional title shown in the drag header */
  title?: ReactNode;
  /** Optional right-aligned action shown in the header (defaults to a close X) */
  headerAction?: ReactNode;
  /** Aria-label for the sheet dialog */
  ariaLabel?: string;
  /** Max height as vh (default 85). Use 100 for full-height sheets. */
  maxHeightVh?: number;
  /** Add safe-area-aware padding at the top of the sheet (default true) */
  safeAreaTop?: boolean;
  /** Z-index of the overlay (default 100) */
  zIndex?: number;
  /** Extra classes for the inner sheet panel */
  className?: string;
  /** Hide the default close X button in the header */
  hideCloseButton?: boolean;
}

const CLOSE_OFFSET_PX = 100;
const CLOSE_VELOCITY = 500;

export default function SwipeableSheet({
  open,
  onClose,
  children,
  title,
  headerAction,
  ariaLabel,
  maxHeightVh = 85,
  safeAreaTop = true,
  zIndex = 100,
  className,
  hideCloseButton,
}: SwipeableSheetProps) {
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > CLOSE_OFFSET_PX || info.velocity.y > CLOSE_VELOCITY) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={constraintsRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-end justify-center"
          style={{ zIndex }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
        >
          <div className="absolute inset-0 bg-black/40" />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full max-w-md bg-background rounded-t-2xl shadow-2xl flex flex-col overflow-hidden",
              className,
            )}
            style={{
              maxHeight: `${maxHeightVh}vh`,
              paddingTop: safeAreaTop
                ? "max(env(safe-area-inset-top, 0px), 0px)"
                : undefined,
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Drag handle + optional header — this strip is the only drag region */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              style={{ touchAction: "none" }}
              className="shrink-0 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex justify-center pt-2.5 pb-2">
                <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>

              {(title || !hideCloseButton || headerAction) && (
                <div className="flex items-center gap-3 px-4 pb-2 min-h-[44px]">
                  <div className="flex-1 min-w-0">
                    {typeof title === "string" ? (
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {title}
                      </h3>
                    ) : (
                      title
                    )}
                  </div>
                  {headerAction}
                  {!hideCloseButton && !headerAction && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-muted/50 active:bg-muted"
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable content. pan-y so vertical scrolling works without
                fighting the (header-only) drag gesture above. */}
            <div
              style={{ touchAction: "pan-y" }}
              className="flex-1 overflow-y-auto overscroll-contain"
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
