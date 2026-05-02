/**
 * MessageReactionsBar — Aggregated reaction chips under a chat bubble
 */
import { motion, AnimatePresence } from "framer-motion";
import { useReactions } from "@/hooks/useReactions";

interface Props {
  messageId: string;
  align?: "left" | "right";
  initialReactions?: { emoji: string; count: number; reactedByMe: boolean }[];
}

export default function MessageReactionsBar({ messageId, align = "left", initialReactions }: Props) {
  const { reactions, toggle } = useReactions(messageId, initialReactions);

  if (reactions.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 mt-1 ${align === "right" ? "justify-end" : "justify-start"}`}>
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.button
            key={r.emoji}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 18, stiffness: 400 }}
            onClick={() => toggle(r.emoji)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors active:scale-90 ${
              r.reactedByMe
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-muted/60 border-border/50 text-foreground/80"
            }`}
          >
            <span className="text-sm leading-none">{r.emoji}</span>
            <span className="font-medium">{r.count}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
