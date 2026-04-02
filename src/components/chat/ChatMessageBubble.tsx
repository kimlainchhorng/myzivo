/**
 * ChatMessageBubble — Facebook Messenger-style message bubble
 * Features: long-press actions (reply/delete/copy/forward/pin), swipe-to-reply, emoji reactions, image/video display
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Trash2, Reply, Check, CheckCheck, Copy, Forward, Pin, Timer, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const REACTION_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🔥", "🎉", "😍"];

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
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} relative px-1`}>
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
        className={`max-w-[78%] select-none touch-pan-y ${isOptimistic ? "opacity-60" : ""}`}
        whileTap={{ scale: 0.97 }}
      >
        {/* Pin indicator */}
        {isPinned && (
          <div className={`flex items-center gap-1 mb-0.5 text-[9px] text-primary ${isMe ? "justify-end" : "justify-start"}`}>
            <Pin className="w-2.5 h-2.5" />
            <span className="font-medium">Pinned</span>
          </div>
        )}

        {/* Video — thumbnail preview with play button overlay */}
        {videoUrl && (
          <div className={`rounded-2xl overflow-hidden mb-1 shadow-sm relative ${isMe ? "rounded-br-[6px]" : "rounded-bl-[6px]"}`}>
            <video
              src={videoUrl}
              className="max-w-full max-h-60 rounded-2xl object-cover w-full"
              playsInline
              preload="metadata"
              muted
              style={{ pointerEvents: "none" }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
              <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Play className="h-5 w-5 text-foreground/80 ml-0.5" fill="currentColor" />
              </div>
            </div>
            <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${isMe ? "bg-black/40 text-white" : "bg-black/40 text-white"}`}>
              Video
            </div>
          </div>
        )}

        {/* Image */}
        {imageUrl && !videoUrl && (
          <div className={`rounded-2xl overflow-hidden mb-1 shadow-sm ${isMe ? "rounded-br-[6px]" : "rounded-bl-[6px]"}`}>
            <img src={imageUrl} alt="" className="max-w-full max-h-60 object-cover rounded-2xl" loading="lazy" />
          </div>
        )}

        {/* Message body */}
        {message && (
          <div
            className={`px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm ${
              isMe
                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-[6px]"
                : "bg-muted text-foreground rounded-2xl rounded-bl-[6px]"
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message}</p>
            <div className="flex items-center gap-1 justify-end mt-1 -mb-0.5">
              {isDisappearing && <Timer className={`h-2.5 w-2.5 ${isMe ? "text-primary-foreground/40" : "text-muted-foreground/40"}`} />}
              <span className={`text-[10px] font-medium ${isMe ? "text-primary-foreground/50" : "text-muted-foreground/60"}`}>
                {time}
              </span>
              {isMe && !isOptimistic && (
                isRead
                  ? <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                  : isDelivered
                  ? <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/35" />
                  : <Check className="h-3.5 w-3.5 text-primary-foreground/35" />
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
                className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs border shadow-sm transition-all active:scale-90 ${
                  r.hasMyReaction ? "border-primary/30 bg-primary/10" : "border-border/40 bg-background"
                }`}
              >
                <span className="text-[13px]">{r.emoji}</span>
                {r.count > 1 && <span className="text-[10px] font-medium text-muted-foreground">{r.count}</span>}
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
              initial={{ opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 12 }}
              transition={{ type: "spring", damping: 20, stiffness: 380 }}
              className={`absolute z-50 bottom-full mb-2.5 flex flex-col gap-2 ${isMe ? "right-0 items-end" : "left-0 items-start"}`}
            >
              {/* Emoji reactions row */}
              {showReactions && (
                <div className="bg-background/98 backdrop-blur-2xl shadow-2xl shadow-black/12 border border-border/30 rounded-[20px] px-1.5 py-1.5 flex items-center max-w-[calc(100vw-32px)]">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => { e.stopPropagation(); toggleReaction(emoji); }}
                      className="h-[38px] w-[38px] flex items-center justify-center rounded-xl hover:bg-muted/60 transition-all text-[22px] hover:scale-[1.35] active:scale-90 duration-150"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="bg-background/98 backdrop-blur-2xl shadow-2xl shadow-black/12 border border-border/30 rounded-[18px] flex items-stretch overflow-hidden">
                <ActionBtn icon={Reply} label="Reply" onClick={() => { onReply(id, message, isMe); setShowActions(false); setShowReactions(false); }} />
                <div className="w-px bg-border/20 my-2" />
                <ActionBtn icon={Copy} label="Copy" onClick={handleCopy} />
                <div className="w-px bg-border/20 my-2" />
                <ActionBtn icon={Forward} label="Forward" onClick={handleForward} />
                <div className="w-px bg-border/20 my-2" />
                <ActionBtn icon={Pin} label={isPinned ? "Unpin" : "Pin"} onClick={handlePin} active={isPinned} />
                {isMe && (
                  <>
                    <div className="w-px bg-border/20 my-2" />
                    <ActionBtn icon={Trash2} label="Delete" onClick={() => { onDelete(id); setShowActions(false); setShowReactions(false); }} destructive />
                  </>
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
      className={`flex flex-col items-center justify-center gap-1 min-w-[56px] px-3 py-2.5 transition-colors active:scale-95 ${
        destructive
          ? "hover:bg-red-50 dark:hover:bg-red-500/5 text-red-500"
          : active
          ? "bg-primary/5 text-primary"
          : "hover:bg-muted/40 text-foreground/70"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span className="text-[10px] font-semibold leading-none">{label}</span>
    </button>
  );
}
