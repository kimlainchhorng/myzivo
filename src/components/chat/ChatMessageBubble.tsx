/**
 * ChatMessageBubble — Facebook Messenger-style message bubble
 * Features: long-press actions, swipe-to-reply, emoji reactions, image display
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Trash2, Reply, Check, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

interface Reaction {
  emoji: string;
  user_id: string;
  count: number;
}

interface ChatMessageBubbleProps {
  id: string;
  message: string;
  time: string;
  isMe: boolean;
  isRead?: boolean;
  imageUrl?: string | null;
  onReply: (id: string, message: string, isMe: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ChatMessageBubble({
  id, message, time, isMe, isRead, imageUrl, onReply, onDelete,
}: ChatMessageBubbleProps) {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<{ emoji: string; count: number; hasMyReaction: boolean }[]>([]);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const hasMoved = useRef(false);

  // Load reactions
  useEffect(() => {
    if (!id || id.startsWith("opt-")) return;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("message_reactions")
        .select("emoji, user_id")
        .eq("message_id", id);
      if (data) {
        const grouped = data.reduce((acc: Record<string, { count: number; hasMyReaction: boolean }>, r: any) => {
          if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasMyReaction: false };
          acc[r.emoji].count++;
          if (r.user_id === user?.id) acc[r.emoji].hasMyReaction = true;
          return acc;
        }, {} as Record<string, { count: number; hasMyReaction: boolean }>);
        setReactions(Object.entries(grouped).map(([emoji, v]) => ({ emoji, count: (v as any).count, hasMyReaction: (v as any).hasMyReaction })));
      }
    };
    load();
  }, [id, user?.id]);

  const toggleReaction = async (emoji: string) => {
    if (!user?.id || id.startsWith("opt-")) return;
    const existing = reactions.find((r) => r.emoji === emoji && r.hasMyReaction);
    if (existing) {
      await (supabase as any).from("message_reactions").delete()
        .eq("message_id", id).eq("user_id", user.id).eq("emoji", emoji);
      setReactions((prev) =>
        prev.map((r) => r.emoji === emoji ? { ...r, count: r.count - 1, hasMyReaction: false } : r)
            .filter((r) => r.count > 0)
      );
    } else {
      await (supabase as any).from("message_reactions").insert({
        message_id: id, user_id: user.id, emoji,
      });
      setReactions((prev) => {
        const found = prev.find((r) => r.emoji === emoji);
        if (found) return prev.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1, hasMyReaction: true } : r);
        return [...prev, { emoji, count: 1, hasMyReaction: true }];
      });
    }
    setShowReactions(false);
    setShowActions(false);
  };

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false;
    hasMoved.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setShowActions(true);
      setShowReactions(true);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 400);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerMove = useCallback(() => {
    hasMoved.current = true;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (
      (!isMe && info.offset.x > 60) ||
      (isMe && info.offset.x < -60)
    ) {
      onReply(id, message, isMe);
      if (navigator.vibrate) navigator.vibrate(20);
    }
  }, [id, message, isMe, onReply]);

  const handleTap = useCallback(() => {
    if (didLongPress.current || hasMoved.current) return;
    if (showActions) {
      setShowActions(false);
      setShowReactions(false);
    }
  }, [showActions]);

  const isOptimistic = id.startsWith("opt-");

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} relative`}>
      <motion.div
        drag="x"
        dragConstraints={{ left: isMe ? -80 : 0, right: isMe ? 0 : 80 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        dragSnapToOrigin
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerMove={handlePointerMove}
        onClick={handleTap}
        className={`max-w-[75%] select-none touch-pan-y ${isOptimistic ? "opacity-60" : ""}`}
        whileTap={{ scale: 0.98 }}
      >
        {/* Image */}
        {imageUrl && (
          <div className={`rounded-2xl overflow-hidden mb-1 ${isMe ? "rounded-br-md" : "rounded-bl-md"}`}>
            <img src={imageUrl} alt="" className="max-w-full max-h-60 object-cover rounded-2xl" loading="lazy" />
          </div>
        )}

        {/* Message body */}
        {message && (
          <div
            className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
              isMe
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message}</p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <span className={`text-[9px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {time}
              </span>
              {isMe && !isOptimistic && (
                isRead
                  ? <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
                  : <Check className="h-3 w-3 text-primary-foreground/40" />
              )}
            </div>
          </div>
        )}

        {/* Existing reactions display */}
        {reactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
            {reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={(e) => { e.stopPropagation(); toggleReaction(r.emoji); }}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                  r.hasMyReaction
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-background"
                }`}
              >
                <span>{r.emoji}</span>
                {r.count > 1 && <span className="text-[10px] text-muted-foreground">{r.count}</span>}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Long-press popup: emoji picker + actions */}
      <AnimatePresence>
        {showActions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10"
              onClick={() => { setShowActions(false); setShowReactions(false); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className={`absolute z-50 bottom-full mb-2 flex flex-col gap-2 ${isMe ? "right-0" : "left-0"}`}
            >
              {/* Emoji reaction picker */}
              {showReactions && (
                <div className="flex items-center gap-0.5 bg-background shadow-lg border border-border rounded-full px-2 py-1.5">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => { e.stopPropagation(); toggleReaction(emoji); }}
                      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-lg hover:scale-125 active:scale-95 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              {/* Action bar */}
              <div className="flex items-center gap-1 bg-background shadow-lg border border-border rounded-full px-2 py-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onReply(id, message, isMe); setShowActions(false); setShowReactions(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted transition-colors text-xs font-medium text-foreground"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Reply
                </button>
                {isMe && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(id); setShowActions(false); setShowReactions(false); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-destructive/10 transition-colors text-xs font-medium text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
