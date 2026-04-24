/**
 * SwipeGrabHandle — visible 36×4 pill affordance shown atop fullscreen
 * viewer headers. Captures pointer events to start the parent overlay's
 * drag-to-dismiss gesture; surrounding scrollable content remains
 * scrollable because dragListener is false on the motion container.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

interface Props {
  onStartDrag: (e: React.PointerEvent) => void;
  className?: string;
  /** Visual variant — light pill on dark/black overlays, dark on light. */
  tone?: "light" | "dark";
  testId?: string;
}

export function SwipeGrabHandle({
  onStartDrag,
  className,
  tone = "light",
  testId = "swipe-grab-handle",
}: Props) {
  return (
    <div
      data-testid={testId}
      data-swipe-grab="true"
      role="button"
      aria-label="Drag down to close"
      tabIndex={-1}
      onPointerDown={(e) => {
        e.stopPropagation();
        onStartDrag(e);
      }}
      style={{ touchAction: "none" }}
      className={cn(
        "mx-auto mb-1 flex h-5 w-full max-w-[120px] cursor-grab items-center justify-center active:cursor-grabbing select-none",
        className,
      )}
    >
      <span
        className={cn(
          "block h-1 w-9 rounded-full transition-colors",
          tone === "light"
            ? "bg-white/40 hover:bg-white/60"
            : "bg-foreground/30 hover:bg-foreground/50",
        )}
      />
    </div>
  );
}
