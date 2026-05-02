/**
 * MessageReactionsBar — Aggregated reaction chips under a chat bubble.
 *
 * Tap a chip to toggle your own reaction. Long-press (or right-click) to open
 * the "who reacted" sheet.
 */
import { lazy, Suspense, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReactions } from "@/hooks/useReactions";

const MessageReactionsPopover = lazy(() => import("./MessageReactionsPopover"));

interface Props {
  messageId: string;
  align?: "left" | "right";
  initialReactions?: { emoji: string; count: number; reactedByMe: boolean }[];
}

const LONG_PRESS_MS = 350;

export default function MessageReactionsBar({ messageId, align = "left", initialReactions }: Props) {
  const { reactions, toggle } = useReactions(messageId, initialReactions);
  const [popoverEmoji, setPopoverEmoji] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  if (reactions.length === 0) return null;

  return (
    <>
      <div className={`flex flex-wrap gap-1 mt-1 ${align === "right" ? "justify-end" : "justify-start"}`}>
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.button
              key={r.emoji}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 18, stiffness: 400 }}
              onClick={() => {
                // Suppress the toggle if a long-press just fired.
                if (longPressFired.current) {
                  longPressFired.current = false;
                  return;
                }
                toggle(r.emoji);
              }}
              onPointerDown={() => {
                longPressFired.current = false;
                cancelLongPress();
                longPressTimer.current = setTimeout(() => {
                  longPressFired.current = true;
                  setPopoverEmoji(r.emoji);
                }, LONG_PRESS_MS);
              }}
              onPointerUp={cancelLongPress}
              onPointerLeave={cancelLongPress}
              onPointerCancel={cancelLongPress}
              onContextMenu={(e) => {
                e.preventDefault();
                setPopoverEmoji(r.emoji);
              }}
              aria-label={`${r.count} reacted with ${r.emoji}. Long-press to see who.`}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors active:scale-90 ${
                r.reactedByMe
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-muted/60 border-border/50 text-foreground/80"
              }`}
              style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
            >
              <span className="text-sm leading-none">{r.emoji}</span>
              <span className="font-medium">{r.count}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {popoverEmoji !== null && (
        <Suspense fallback={null}>
          <MessageReactionsPopover
            open
            onClose={() => setPopoverEmoji(null)}
            initialEmoji={popoverEmoji}
            reactions={reactions.map((r) => ({ emoji: r.emoji, users: r.users }))}
          />
        </Suspense>
      )}
    </>
  );
}
