/**
 * ChatMessageBubble — Facebook Messenger-style message bubble
 * Features: long-press actions (reply/delete/copy/forward/pin), swipe-to-reply, emoji reactions, image/video display
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Trash2, Reply, Check, CheckCheck, Copy, Forward, Pin, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉", "💯", "🤔", "😍", "💀"];

interface ChatMessageBubbleProps {
  id: string;
  message: string;
  time: string;
  isMe: boolean;
  isRead?: boolean;
  isDelivered?: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isPinned?: boolean;
  expiresAt?: string | null;
  onReply: (id: string, message: string, isMe: boolean) => void;
  onDelete: (id: string) => void;
  onForward?: (id: string, message: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
}

export default function ChatMessageBubble({
  id, message, time, isMe, isRead, isDelivered, imageUrl, videoUrl, isPinned, expiresAt,
  onReply, onDelete, onForward, onPin,
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
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handlePointerMove = useCallback(() => {
    hasMoved.current = true;
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if ((!isMe && info.offset.x > 60) || (isMe && info.offset.x < -60)) {
      onReply(id, message, isMe);
      if (navigator.vibrate) navigator.vibrate(20);
    }
  }, [id, message, isMe, onReply]);

  const handleTap = useCallback(() => {
    if (didLongPress.current || hasMoved.current) return;
    if (showActions) { setShowActions(false); setShowReactions(false); }
  }, [showActions]);

  const handleCopy = () => {
    if (message) {
      navigator.clipboard.writeText(message);
      toast.success("Copied to clipboard");
    }
    setShowActions(false);
    setShowReactions(false);
  };

  const handleForward = () => {
    onForward?.(id, message);
    setShowActions(false);
    setShowReactions(false);
  };

  const handlePin = () => {
    onPin?.(id, !isPinned);
    setShowActions(false);
    setShowReactions(false);
  };

  const isOptimistic = id.startsWith("opt-");
  const isDisappearing = !!expiresAt;

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
        {/* Pin indicator */}
        {isPinned && (
          <div className={`flex items-center gap-1 mb-0.5 text-[9px] text-primary ${isMe ? "justify-end" : "justify-start"}`}>
            <Pin className="w-2.5 h-2.5" />
            <span>Pinned</span>
          </div>
        )}

        {/* Video */}
        {videoUrl && (
          <div className={`rounded-2xl overflow-hidden mb-1 ${isMe ? "rounded-br-md" : "rounded-bl-md"}`}>
            <video
              src={videoUrl}
              className="max-w-full max-h-60 rounded-2xl"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        )}

        {/* Image */}
        {imageUrl && !videoUrl && (
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
              {isDisappearing && <Timer className={`h-2.5 w-2.5 ${isMe ? "text-primary-foreground/50" : "text-muted-foreground/50"}`} />}
              <span className={`text-[9px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {time}
              </span>
              {isMe && !isOptimistic && (
                isRead
                  ? <CheckCheck className="h-3 w-3 text-blue-400" />
                  : isDelivered
                  ? <CheckCheck className="h-3 w-3 text-primary-foreground/40" />
                  : <Check className="h-3 w-3 text-primary-foreground/40" />
              )}
            </div>
          </div>
        )}

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
            {reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={(e) => { e.stopPropagation(); toggleReaction(r.emoji); }}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                  r.hasMyReaction ? "border-primary/40 bg-primary/10" : "border-border bg-background"
                }`}
              >
                <span>{r.emoji}</span>
                {r.count > 1 && <span className="text-[10px] text-muted-foreground">{r.count}</span>}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Long-press popup */}
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
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 8 }}
              transition={{ type: "spring", damping: 22, stiffness: 400 }}
              className={`absolute z-50 bottom-full mb-2 flex flex-col gap-1.5 ${isMe ? "right-0 items-end" : "left-0 items-start"}`}
            >
              {/* Emoji picker */}
              {showReactions && (
                <div className="flex items-center gap-1 bg-background/95 backdrop-blur-xl shadow-xl shadow-black/10 border border-border/40 rounded-2xl px-2.5 py-2">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => { e.stopPropagation(); toggleReaction(emoji); }}
                      className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted/80 transition-all text-xl hover:scale-[1.3] active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Action bar */}
              <div className={`flex items-center bg-background/95 backdrop-blur-xl shadow-xl shadow-black/10 border border-border/40 rounded-2xl overflow-hidden divide-x divide-border/30`}>
                <ActionBtn icon={Reply} label="Reply" onClick={() => { onReply(id, message, isMe); setShowActions(false); setShowReactions(false); }} />
                <ActionBtn icon={Copy} label="Copy" onClick={handleCopy} />
                <ActionBtn icon={Forward} label="Forward" onClick={handleForward} />
                <ActionBtn icon={Pin} label={isPinned ? "Unpin" : "Pin"} onClick={handlePin} active={isPinned} />
                {isMe && (
                  <ActionBtn icon={Trash2} label="Delete" onClick={() => { onDelete(id); setShowActions(false); setShowReactions(false); }} destructive />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, destructive, active }: {
  icon: any; label: string; onClick: () => void; destructive?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${
        destructive
          ? "hover:bg-destructive/10 text-destructive"
          : active
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
