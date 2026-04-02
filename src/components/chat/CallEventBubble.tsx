/**
 * CallEventBubble — Sleek inline call event in chat timeline (right-aligned)
 * Supports long-press to show delete action
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneMissed, Video, ArrowUpRight, ArrowDownLeft, Trash2, Info } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

interface CallEventBubbleProps {
  id?: string;
  callType: "voice" | "video";
  status: string;
  isOutgoing: boolean;
  durationSeconds: number;
  createdAt: string;
  onCallback?: () => void;
  onDelete?: (id: string) => void;
}

function fmtTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function fmtDur(s: number) {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function CallEventBubble({
  id,
  callType,
  status,
  isOutgoing,
  durationSeconds,
  createdAt,
  onCallback,
  onDelete,
}: CallEventBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const isMissed = status === "missed" || status === "no_answer" || status === "declined";
  const isVideo = callType === "video";

  const label = isMissed
    ? (status === "declined" ? "Declined" : isOutgoing ? "No answer" : "Missed")
    : isVideo ? "Video call" : "Voice call";

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setShowActions(true);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 400);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handlePointerMove = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handleClick = () => {
    if (didLongPress.current) return;
    if (showActions) { setShowActions(false); return; }
    onCallback?.();
  };

  return (
    <div className="flex justify-end my-1 relative">
      <div
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerMove={handlePointerMove}
        className={`inline-flex items-center gap-2.5 pl-3.5 pr-2 py-2 rounded-2xl rounded-br-[6px] cursor-pointer active:scale-[0.97] transition-all select-none shadow-sm ${
          isMissed
            ? "bg-red-50 dark:bg-red-500/8 border border-red-200/30 dark:border-red-500/15"
            : "bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200/30 dark:border-emerald-500/15"
        }`}
      >
        {/* Direction arrow */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          isMissed ? "bg-red-100 dark:bg-red-500/15" : "bg-emerald-100 dark:bg-emerald-500/15"
        }`}>
          {isMissed ? (
            <PhoneMissed className="w-3 h-3 text-red-500" />
          ) : isOutgoing ? (
            <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>

        {/* Label + time */}
        <div className="flex flex-col">
          <span className={`text-[12px] font-semibold leading-tight ${
            isMissed ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"
          }`}>
            {label}
          </span>
          <span className="text-[10px] text-muted-foreground/50 tabular-nums leading-tight mt-0.5">
            {fmtTime(createdAt)}{durationSeconds > 0 ? ` · ${fmtDur(durationSeconds)}` : ""}
          </span>
        </div>

        {/* Callback icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-0.5 ${
          isMissed
            ? "bg-red-100 dark:bg-red-500/15 text-red-500"
            : "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        }`}>
          {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Long-press action menu */}
      <AnimatePresence>
        {showActions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
              onClick={() => setShowActions(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 10 }}
              transition={{ type: "spring", damping: 22, stiffness: 400 }}
              className="absolute z-50 bottom-full mb-2 right-0 items-end"
            >
              <div className="bg-background shadow-xl shadow-black/8 border border-border/20 rounded-2xl overflow-hidden min-w-[160px]">
                <button
                  onClick={(e) => { e.stopPropagation(); onCallback?.(); setShowActions(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/40 transition-colors active:scale-[0.98] text-foreground"
                >
                  {isVideo ? <Video className="h-[18px] w-[18px] opacity-70" /> : <Phone className="h-[18px] w-[18px] opacity-70" />}
                  <span className="text-[13px] font-medium">Call back</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/40 transition-colors active:scale-[0.98] text-foreground"
                >
                  <Info className="h-[18px] w-[18px] opacity-70" />
                  <span className="text-[13px] font-medium">Call info</span>
                </button>
                {id && onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(id); setShowActions(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors active:scale-[0.98] text-red-500"
                  >
                    <Trash2 className="h-[18px] w-[18px] opacity-70" />
                    <span className="text-[13px] font-medium">Delete</span>
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
