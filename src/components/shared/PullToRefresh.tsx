/**
 * PullToRefresh — Instagram-style pull-to-refresh with spinning loader
 * Wrap scrollable content; fires onRefresh when user pulls down from top.
 */
import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

const THRESHOLD = 80;
const MAX_PULL = 120;

export default function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useMotionValue(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const spinnerY = useTransform(pullY, [0, MAX_PULL], [0, MAX_PULL]);
  const spinnerOpacity = useTransform(pullY, [0, THRESHOLD * 0.4, THRESHOLD], [0, 0.5, 1]);
  const spinnerScale = useTransform(pullY, [0, THRESHOLD], [0.5, 1]);
  const spinnerRotate = useTransform(pullY, [0, MAX_PULL], [0, 360]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || refreshing) return;
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) {
      isPulling.current = false;
      pullY.set(0);
      return;
    }
    const delta = Math.max(0, e.touches[0].clientY - touchStartY.current);
    // Rubber band effect
    const dampened = Math.min(MAX_PULL, delta * 0.45);
    pullY.set(dampened);
  }, [refreshing, pullY]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    const currentPull = pullY.get();

    if (currentPull >= THRESHOLD && !refreshing) {
      // Snap to loading position
      animate(pullY, 60, { type: "spring", stiffness: 300, damping: 30 });
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        animate(pullY, 0, { type: "spring", stiffness: 300, damping: 30 });
      }
    } else {
      animate(pullY, 0, { type: "spring", stiffness: 300, damping: 25 });
    }
  }, [pullY, refreshing, onRefresh]);

  return (
    <div className={className} style={{ position: "relative", overflow: "hidden" }}>
      {/* Spinner indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
        style={{
          y: spinnerY,
          opacity: spinnerOpacity,
          scale: spinnerScale,
          top: -40,
        }}
      >
        <div className="w-9 h-9 rounded-full bg-background shadow-lg border border-border/40 flex items-center justify-center">
          {refreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
          ) : (
            <motion.div style={{ rotate: spinnerRotate }}>
              <Loader2 className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Scrollable content */}
      <motion.div
        ref={containerRef}
        style={{ y: refreshing ? 60 : spinnerY }}
        className="h-full overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
