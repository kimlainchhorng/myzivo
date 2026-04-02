/**
 * ChatMessageBubble — Facebook Messenger-style message with long-press actions
 * Long-press or swipe to reveal Reply / Delete actions
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Trash2, Reply, X, Check, CheckCheck } from "lucide-react";

interface ChatMessageBubbleProps {
  id: string;
  message: string;
  time: string;
  isMe: boolean;
  isRead?: boolean;
  replyToText?: string | null;
  replyToSender?: string | null;
  onReply: (id: string, message: string, isMe: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ChatMessageBubble({
  id, message, time, isMe, isRead, replyToText, replyToSender, onReply, onDelete,
}: ChatMessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const hasMoved = useRef(false);

  // Long-press to show actions
  const handlePointerDown = useCallback(() => {
    didLongPress.current = false;
    hasMoved.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setShowActions(true);
      // Haptic feedback if available
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

  // Swipe to reply (like WhatsApp)
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const swipeThreshold = 60;
    // Swipe right on received messages or left on sent messages to reply
    if (
      (!isMe && info.offset.x > swipeThreshold) ||
      (isMe && info.offset.x < -swipeThreshold)
    ) {
      onReply(id, message, isMe);
      if (navigator.vibrate) navigator.vibrate(20);
    }
  }, [id, message, isMe, onReply]);

  const handleTap = useCallback(() => {
    if (didLongPress.current || hasMoved.current) return;
    // Tap dismisses actions if showing
    if (showActions) {
      setShowActions(false);
    }
  }, [showActions]);

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} relative`}>
      {/* Swipe hint icon */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 transition-opacity ${
          isMe ? "left-2" : "right-2"
        } opacity-0 group-hover:opacity-30 pointer-events-none`}
      >
        <Reply className="h-4 w-4 text-muted-foreground" />
      </div>

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
        className="max-w-[75%] cursor-pointer select-none touch-pan-y"
        whileTap={{ scale: 0.98 }}
      >
        {/* Reply quote */}
        {replyToText && (
          <div
            className={`text-[10px] px-3 py-1.5 rounded-t-2xl border-l-2 ${
              isMe
                ? "bg-primary/20 border-primary/40 text-primary-foreground/70 rounded-tr-sm"
                : "bg-muted border-muted-foreground/30 text-muted-foreground rounded-tl-sm"
            }`}
          >
            <span className="font-semibold">{replyToSender || "..."}</span>
            <p className="truncate mt-0.5">{replyToText}</p>
          </div>
        )}

        {/* Message body */}
        <div
          className={`px-3.5 py-2 text-sm leading-relaxed ${
            replyToText ? "rounded-b-2xl" : "rounded-2xl"
          } ${
            isMe
              ? `bg-primary text-primary-foreground ${replyToText ? "rounded-br-md" : "rounded-br-md"}`
              : `bg-muted text-foreground ${replyToText ? "rounded-bl-md" : "rounded-bl-md"}`
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message}</p>
          <div className={`flex items-center gap-1 justify-end mt-0.5`}>
            <span className={`text-[9px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
              {time}
            </span>
            {isMe && (
              isRead
                ? <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
                : <Check className="h-3 w-3 text-primary-foreground/40" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Action popup on long-press */}
      <AnimatePresence>
        {showActions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowActions(false)}
            />
            {/* Action bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className={`absolute z-50 bottom-full mb-2 flex items-center gap-1 bg-background shadow-lg border border-border rounded-full px-2 py-1.5 ${
                isMe ? "right-0" : "left-0"
              }`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onReply(id, message, isMe); setShowActions(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted transition-colors text-xs font-medium text-foreground"
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </button>
              {isMe && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(id); setShowActions(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-destructive/10 transition-colors text-xs font-medium text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
