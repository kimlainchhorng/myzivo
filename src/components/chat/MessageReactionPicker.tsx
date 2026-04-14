/**
 * MessageReactionPicker — Icon picker for message reactions
 */
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Heart from "lucide-react/dist/esm/icons/heart";
import Laugh from "lucide-react/dist/esm/icons/laugh";
import ThumbsUp from "lucide-react/dist/esm/icons/thumbs-up";
import ThumbsDown from "lucide-react/dist/esm/icons/thumbs-down";
import Flame from "lucide-react/dist/esm/icons/flame";
import PartyPopper from "lucide-react/dist/esm/icons/party-popper";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Star from "lucide-react/dist/esm/icons/star";

const QUICK_REACTIONS = [
  { key: "heart", Icon: Heart, color: "text-red-400" },
  { key: "laugh", Icon: Laugh, color: "text-amber-300" },
  { key: "thumbsup", Icon: ThumbsUp, color: "text-blue-400" },
  { key: "thumbsdown", Icon: ThumbsDown, color: "text-white/60" },
  { key: "fire", Icon: Flame, color: "text-orange-400" },
  { key: "party", Icon: PartyPopper, color: "text-pink-400" },
  { key: "sparkle", Icon: Sparkles, color: "text-purple-300" },
  { key: "star", Icon: Star, color: "text-yellow-400" },
];

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
      {QUICK_REACTIONS.map((r) => (
        <button
          key={r.key}
          onClick={() => addReaction(r.key)}
          className="hover:scale-125 transition-transform p-1"
        >
          <r.Icon className={`h-4 w-4 ${r.color}`} />
        </button>
      ))}
    </motion.div>
  );
}
