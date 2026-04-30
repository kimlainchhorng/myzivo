/**
 * ReactionPicker — Facebook-style emoji burst. Long-press the heart on a post
 * to open this row of 6 reactions; tap one to record the reaction.
 *
 * Visually anchored above the trigger; auto-dismisses on outside tap.
 */
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ReactionEmoji = "❤️" | "😂" | "😮" | "😢" | "😡" | "🔥";

export const REACTIONS: { emoji: ReactionEmoji; label: string }[] = [
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "🔥", label: "Fire" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: ReactionEmoji) => void;
}

export default function ReactionPicker({ open, onClose, onPick }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const escHandler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ scale: 0.6, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 22, stiffness: 380 }}
          className="absolute -top-16 sm:-top-14 right-0 z-50 flex items-center gap-1 sm:gap-0.5 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-2 sm:px-2 sm:py-1.5 shadow-2xl border border-white/10"
        >
          {REACTIONS.map(({ emoji, label }) => (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                onPick(emoji);
                onClose();
              }}
              className="text-3xl sm:text-2xl px-1.5 py-1 sm:p-0 transition-transform hover:scale-125 active:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
              aria-label={label}
              title={label}
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
