/**
 * CallReactions — Floating emoji reactions during active calls (FaceTime-style)
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";

const REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "👍", label: "Like" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "🎉", label: "Party" },
  { emoji: "👋", label: "Wave" },
];

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

interface CallReactionsProps {
  variant?: "light" | "dark";
}

let reactionIdCounter = 0;

export default function CallReactions({ variant = "dark" }: CallReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [floating, setFloating] = useState<FloatingReaction[]>([]);

  const sendReaction = useCallback((emoji: string) => {
    const id = ++reactionIdCounter;
    const x = 30 + Math.random() * 40; // random horizontal %
    setFloating((prev) => [...prev, { id, emoji, x }]);
    setShowPicker(false);

    // Remove after animation
    setTimeout(() => {
      setFloating((prev) => prev.filter((r) => r.id !== id));
    }, 2200);
  }, []);

  const isDark = variant === "dark";
  const btnBg = isDark ? "bg-white/10 hover:bg-white/20 text-white/80" : "bg-foreground/[0.06] hover:bg-foreground/10 text-foreground/60";
  const pickerBg = isDark ? "bg-black/60 backdrop-blur-2xl border-white/10" : "bg-background/80 backdrop-blur-2xl border-border/20";

  return (
    <>
      {/* Floating reaction emojis */}
      <AnimatePresence>
        {floating.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -280, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="fixed z-[80] text-4xl pointer-events-none"
            style={{ bottom: "25%", left: `${r.x}%` }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Trigger button */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowPicker(!showPicker)}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${btnBg}`}
        >
          <Heart className="h-5 w-5" />
        </motion.button>

        {/* Picker popup */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 rounded-2xl border shadow-2xl ${pickerBg}`}
            >
              {REACTIONS.map((r) => (
                <motion.button
                  key={r.emoji}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => sendReaction(r.emoji)}
                  className="text-2xl hover:bg-white/10 rounded-lg p-1 transition-colors"
                  title={r.label}
                >
                  {r.emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
