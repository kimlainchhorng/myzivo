/**
 * MessageReactionPicker — Emoji picker for message reactions
 */
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const QUICK_REACTIONS = ["❤️", "😂", "👍", "😮", "😢", "🔥", "🎉", "😍"];

interface MessageReactionPickerProps {
  messageId: string;
  onClose: () => void;
  onReacted?: () => void;
}

export default function MessageReactionPicker({ messageId, onClose, onReacted }: MessageReactionPickerProps) {
  const { user } = useAuth();

  const addReaction = async (emoji: string) => {
    if (!user) return;
    try {
      await (supabase as any).from("message_reactions").upsert({
        message_id: messageId,
        user_id: user.id,
        emoji,
      }, { onConflict: "message_id,user_id,emoji" });
      onReacted?.();
    } catch {
      toast.error("Could not add reaction");
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      className="flex gap-1 bg-card border border-border/60 rounded-full px-2 py-1.5 shadow-lg"
    >
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => addReaction(emoji)}
          className="text-lg hover:scale-125 transition-transform p-0.5"
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
}
