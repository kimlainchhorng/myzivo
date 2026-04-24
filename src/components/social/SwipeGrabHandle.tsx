/**
 * SwipeGrabHandle — visible pill affordance shown atop fullscreen
 * viewer headers. Captures pointer events to start the parent overlay's
 * drag-to-dismiss gesture; surrounding scrollable content remains
 * scrollable because dragListener is false on the motion container.
 *
 * v2026: enlarged tap target, soft glow, and a one-time intro pulse so
 * users discover the gesture on first open.
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
  const [pulsing, setPulsing] = React.useState(true);

  React.useEffect(() => {
    // Stop the discovery pulse after ~1.4s so it teaches without distracting.
    const t = window.setTimeout(() => setPulsing(false), 1400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      data-testid={testId}
      data-swipe-grab="true"
      role="button"
      aria-label="Drag down to close"
      tabIndex={-1}
      onPointerDown={(e) => {
        e.stopPropagation();
        setPulsing(false);
        onStartDrag(e);
      }}
      style={{ touchAction: "none" }}
      className={cn(
        "mx-auto flex h-8 w-full max-w-[160px] cursor-grab items-center justify-center active:cursor-grabbing select-none",
        className,
      )}
    >
      <span
        className={cn(
          "block h-1.5 w-12 rounded-full transition-all duration-300",
          pulsing && "animate-pulse",
          tone === "light"
            ? "bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.35)] hover:bg-white"
            : "bg-foreground/40 shadow-[0_0_8px_hsl(var(--foreground)/0.15)] hover:bg-foreground/70",
        )}
      />
    </div>
  );
}
