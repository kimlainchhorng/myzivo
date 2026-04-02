/**
 * ChatMessageBubble — Individual message with swipe-to-delete and tap-to-reply
 * Facebook Messenger-style interactions
 */
import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Trash2, Reply, X } from "lucide-react";

interface ChatMessageBubbleProps {
  id: string;
  message: string;
  time: string;
  isMe: boolean;
  replyTo?: { message: string; isMe: boolean } | null;
  onReply: (id: string, message: string, isMe: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ChatMessageBubble({
  id, message, time, isMe, replyTo, onReply, onDelete,
}: ChatMessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const x = useMotionValue(0);

  // Swipe reveals delete (swipe left for own messages, swipe right for others)
  const swipeDir = isMe ? -1 : 1;
  const deleteOpacity = useTransform(x, [0, swipeDir * 80], [0, 1]);
  const deleteScale = useTransform(x, [0, swipeDir * 80], [0.5, 1]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 80;
    if (Math.abs(info.offset.x) > threshold) {
      // Show action buttons
      setShowActions(true);
    }
  }, []);

  const handleTouchStart = useCallback(() => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setShowActions(true);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTap = useCallback(() => {
    if (didLongPress.current) return;
    if (showActions) {
      setShowActions(false);
      return;
    }
    // Tap to reply
    onReply(id, message, isMe);
  }, [showActions, id, message, isMe, onReply]);

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} relative group`}>
      {/* Delete button behind the message */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute top-1/2 -translate-y-1/2 flex gap-2 ${isMe ? "left-0" : "right-0"}`}
        >
          <button
            onClick={() => { onReply(id, message, isMe); setShowActions(false); }}
            className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Reply className="h-4 w-4 text-primary" />
          </button>
          {isMe && (
            <button
              onClick={() => { onDelete(id); setShowActions(false); }}
              className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          )}
          <button
            onClick={() => setShowActions(false)}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </motion.div>
      )}

      <motion.div
        drag="x"
        dragConstraints={{ left: isMe ? -100 : 0, right: isMe ? 0 : 100 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        dragSnapToOrigin
        onPointerDown={handleTouchStart}
        onPointerUp={handleTouchEnd}
        onClick={handleTap}
        className={`max-w-[75%] cursor-pointer select-none ${showActions ? (isMe ? "mr-28" : "ml-28") : ""}`}
        style={{ x }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Reply preview */}
        {replyTo && (
          <div
            className={`text-[10px] px-3 py-1 mb-0.5 rounded-t-xl border-l-2 ${
              isMe
                ? "bg-primary/5 border-primary/30 text-primary-foreground/60"
                : "bg-muted/80 border-muted-foreground/30 text-muted-foreground"
            }`}
          >
            <span className="font-semibold">{replyTo.isMe ? "You" : "Them"}</span>
            <p className="truncate">{replyTo.message}</p>
          </div>
        )}
        <div
          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          }`}
        >
          <p>{message}</p>
          <p className={`text-[9px] mt-0.5 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            {time}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
