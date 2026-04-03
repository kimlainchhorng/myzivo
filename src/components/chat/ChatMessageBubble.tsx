/**
 * ChatMessageBubble — Facebook Messenger-style message bubble
 * Features: long-press actions (reply/delete/copy/forward/pin), swipe-to-reply, emoji reactions, image/video display
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Trash2, Reply, Check, CheckCheck, Copy, Forward, Pin, Timer, Play, X, Volume2, VolumeX, Heart, MessageCircle, Share2, Pause, ChevronRight } from "lucide-react";
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
  const [showDeleteSub, setShowDeleteSub] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
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

        {/* Video — compact reel-style thumbnail */}
        {videoUrl && (
          <div
            onClick={(e) => { e.stopPropagation(); if (!didLongPress.current) setShowVideoPlayer(true); }}
            className={`overflow-hidden mb-1 relative cursor-pointer w-[180px] ${isMe ? "ml-auto" : ""}`}
          >
            <div className={`rounded-2xl overflow-hidden relative bg-muted ${isMe ? "rounded-br-[6px]" : "rounded-bl-[6px]"}`}>
              {/* Use video with #t=0.1 to force first frame thumbnail */}
              <video
                src={`${videoUrl}#t=0.1`}
                className="w-full aspect-[4/5] object-cover"
                playsInline
                preload="auto"
                muted
                crossOrigin="anonymous"
                style={{ pointerEvents: "none" }}
                onLoadedData={(e) => {
                  // Seek to 0.1s to ensure a frame is rendered as thumbnail
                  const v = e.currentTarget;
                  if (v.readyState >= 2) v.currentTime = 0.1;
                }}
              />
              {/* Subtle gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Centered play icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play className="h-4.5 w-4.5 text-foreground ml-0.5" fill="currentColor" />
                </div>
              </div>

              {/* Bottom info bar */}
              <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <svg viewBox="0 0 10 10" className="w-2 h-2"><circle cx="5" cy="5" r="4" fill="#ef4444" /></svg>
                  <span className="text-[10px] font-bold text-white tracking-wide">Video</span>
                </div>
                <div className="flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5">
                  <Play className="h-2.5 w-2.5 text-white" fill="white" />
                  <span className="text-[9px] font-semibold text-white">Play</span>
                </div>
              </div>
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
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
              onClick={() => { setShowActions(false); setShowReactions(false); setShowDeleteSub(false); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 6 }}
              transition={{ type: "spring", damping: 26, stiffness: 420 }}
              className={`absolute z-50 bottom-full mb-3 flex flex-col gap-2 ${isMe ? "right-0 items-end" : "left-0 items-start"}`}
            >
              {/* Emoji reactions row */}
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 }}
                  className="bg-background shadow-lg shadow-black/10 border border-border/30 rounded-full px-1.5 py-1 flex items-center gap-0 max-w-[calc(100vw-32px)]"
                >
                  {REACTION_EMOJIS.map((emoji, i) => (
                    <motion.button
                      key={emoji}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.025 * i, type: "spring", stiffness: 500 }}
                      onClick={(e) => { e.stopPropagation(); toggleReaction(emoji); }}
                      className="h-[36px] w-[36px] flex items-center justify-center rounded-full hover:bg-muted/50 transition-all text-[20px] hover:scale-110 active:scale-90 duration-150"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="bg-background shadow-lg shadow-black/10 border border-border/30 rounded-xl overflow-hidden min-w-[190px]"
              >
                <AnimatePresence mode="wait">
                  {!showDeleteSub ? (
                    <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                      <MsgMenuItem icon={Reply} label="Reply" onClick={() => { onReply(id, message, isMe); setShowActions(false); setShowReactions(false); }} />
                      <MsgMenuItem icon={Copy} label="Copy" onClick={handleCopy} />
                      <MsgMenuItem icon={Forward} label="Forward" onClick={handleForward} />
                      <MsgMenuItem icon={Pin} label={isPinned ? "Unpin" : "Pin"} onClick={handlePin} active={isPinned} />
                      <MsgMenuItem icon={Trash2} label="Delete" onClick={() => setShowDeleteSub(true)} destructive chevron />
                    </motion.div>
                  ) : (
                    <motion.div key="delete" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.1 }}>
                      {isMe && (
                        <MsgMenuItem icon={Trash2} label="Delete for everyone" onClick={() => { onDelete(id); setShowActions(false); setShowReactions(false); setShowDeleteSub(false); }} destructive />
                      )}
                      <MsgMenuItem icon={Trash2} label="Delete for me" onClick={() => { onDelete(id); setShowActions(false); setShowReactions(false); setShowDeleteSub(false); }} destructive />
                      <div className="border-t border-border/30">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDeleteSub(false); }}
                          className="w-full py-2.5 text-center text-[13px] font-medium text-muted-foreground hover:bg-muted/30 active:bg-muted/50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fullscreen Reel-style video player */}
      <AnimatePresence>
        {showVideoPlayer && videoUrl && (
          <ReelVideoPlayer videoUrl={videoUrl} onClose={() => setShowVideoPlayer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Reel-style fullscreen video player */
function ReelVideoPlayer({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideControlsAfterDelay = useCallback(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setShowControls(true);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    hideControlsAfterDelay();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [hideControlsAfterDelay]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    hideControlsAfterDelay();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress((videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
      onClick={togglePlay}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        loop
        onTimeUpdate={handleTimeUpdate}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Top bar */}
      <motion.div
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent pt-[max(env(safe-area-inset-top),12px)] px-4 pb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-[15px] font-bold">Reels</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Center play/pause indicator */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right-side action buttons (Reel-style) */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${liked ? "bg-red-500/20" : "bg-white/10"}`}>
            <Heart className={`w-6 h-6 ${liked ? "text-red-500 fill-red-500" : "text-white"}`} />
          </div>
          <span className="text-white text-[10px] font-semibold">Like</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-[10px] font-semibold">Reply</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-[10px] font-semibold">Share</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={toggleMute}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
          </div>
          <span className="text-white text-[10px] font-semibold">{isMuted ? "Unmute" : "Mute"}</span>
        </motion.button>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent pb-[max(env(safe-area-inset-bottom),8px)] px-4 pt-6">
        <div
          className="w-full h-1 rounded-full bg-white/20 cursor-pointer mb-3"
          onClick={handleSeek}
        >
          <motion.div
            className="h-full rounded-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}


function ActionBtn({ icon: Icon, label, onClick, destructive, active }: {
  icon: any; label: string; onClick: () => void; destructive?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors active:scale-[0.98] ${
        destructive
          ? "hover:bg-red-50 dark:hover:bg-red-500/5 text-red-500"
          : active
          ? "bg-primary/5 text-primary"
          : "hover:bg-muted/40 text-foreground"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 opacity-70" />
      <span className="text-[13px] font-medium">{label}</span>
    </button>
  );
}

function MenuBtn({ icon: Icon, label, onClick, destructive, active, chevron }: {
  icon: any; label: string; onClick: () => void; destructive?: boolean; active?: boolean; chevron?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-3.5 w-full px-4 py-3.5 text-left transition-colors active:scale-[0.97] ${
        destructive
          ? "hover:bg-destructive/5 text-destructive"
          : active
          ? "bg-primary/5 text-primary"
          : "hover:bg-muted/50 text-foreground"
      }`}
    >
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
        destructive ? "bg-destructive/10" : active ? "bg-primary/10" : "bg-muted/60"
      }`}>
        <Icon className={`h-4 w-4 ${destructive ? "" : active ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <span className="text-[14px] font-medium flex-1">{label}</span>
      {chevron && <ChevronRight className="h-4 w-4 opacity-40" />}
    </button>
  );
}
