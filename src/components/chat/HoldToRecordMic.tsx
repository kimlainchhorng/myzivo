/**
 * HoldToRecordMic — Telegram/WhatsApp-style press-and-hold voice recorder
 *
 * Gestures (single pointer):
 *   • Press & hold → start recording (after 120ms guard against accidental taps)
 *   • Release      → send
 *   • Slide left   → cancel (with red trash animation)
 *   • Slide up     → lock recording (hands-free toolbar appears)
 *
 * Drives an external `useVoiceRecorder` hook instance so existing upload
 * effects (which watch `voice.audioBlob`) keep working unchanged.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Mic from "lucide-react/dist/esm/icons/mic";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Send from "lucide-react/dist/esm/icons/send";
import Lock from "lucide-react/dist/esm/icons/lock";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import Pause from "lucide-react/dist/esm/icons/pause";
import Play from "lucide-react/dist/esm/icons/play";
import { toast } from "sonner";
import type { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

const CANCEL_THRESHOLD = 90;   // px slide-left to cancel
const LOCK_THRESHOLD = 90;     // px slide-up to lock
const HOLD_GUARD_MS = 120;     // ignore < this as accidental tap
const MIN_RECORD_MS = 500;     // discard < this as too-short

type Voice = ReturnType<typeof useVoiceRecorder>;

interface Props {
  voice: Voice;
  className?: string;
}

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const haptic = (pattern: number | number[] = 12) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(pattern); } catch { /* noop */ }
  }
};

export default function HoldToRecordMic({ voice, className }: Props) {
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [locked, setLocked] = useState(false);
  const [paused, setPaused] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);
  const guardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStart = useRef(false);
  const willCancel = dragX < -CANCEL_THRESHOLD;
  const willLock = dragY < -LOCK_THRESHOLD;
  const isRecording = voice.isRecording;

  // Reset transient state whenever recording stops externally
  useEffect(() => {
    if (!voice.isRecording) {
      setDragX(0);
      setDragY(0);
      setLocked(false);
      setPaused(false);
    }
  }, [voice.isRecording]);

  const clearGuard = () => {
    if (guardTimer.current) {
      clearTimeout(guardTimer.current);
      guardTimer.current = null;
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    startPos.current = { x: e.clientX, y: e.clientY };
    startTime.current = Date.now();
    pendingStart.current = true;
    clearGuard();
    guardTimer.current = setTimeout(async () => {
      if (!pendingStart.current) return;
      haptic(15);
      await voice.startRecording();
    }, HOLD_GUARD_MS);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (locked) return;
    const dx = Math.min(0, e.clientX - startPos.current.x);
    const dy = Math.min(0, e.clientY - startPos.current.y);
    // rubber-band easing past thresholds
    setDragX(dx < -CANCEL_THRESHOLD ? -CANCEL_THRESHOLD + (dx + CANCEL_THRESHOLD) * 0.35 : dx);
    setDragY(dy < -LOCK_THRESHOLD ? -LOCK_THRESHOLD + (dy + LOCK_THRESHOLD) * 0.35 : dy);

    if (isRecording) {
      if (dx < -CANCEL_THRESHOLD && dragX >= -CANCEL_THRESHOLD) haptic(20);
      if (dy < -LOCK_THRESHOLD && dragY >= -LOCK_THRESHOLD) {
        haptic([10, 40, 10]);
        setLocked(true);
      }
    }
  };

  const onPointerUp = async () => {
    clearGuard();
    const heldMs = Date.now() - startTime.current;
    const wasPending = pendingStart.current;
    pendingStart.current = false;

    // If recording never actually started (released before guard fired)
    if (wasPending && !isRecording) {
      toast("Hold to record", { duration: 1500 });
      return;
    }

    if (locked) return; // locked mode — release does nothing

    if (willCancel || heldMs < MIN_RECORD_MS) {
      await voice.cancelRecording();
      if (heldMs < MIN_RECORD_MS && !willCancel) {
        toast("Hold to record", { duration: 1500 });
      }
      haptic(10);
    } else {
      // Stop = send (PersonalChat's effect uploads when audioBlob lands)
      haptic(8);
      await voice.stopRecording();
    }
    setDragX(0);
    setDragY(0);
  };

  // Locked-mode actions
  const handleLockedSend = async () => {
    haptic(8);
    await voice.stopRecording();
  };
  const handleLockedCancel = async () => {
    haptic(20);
    await voice.cancelRecording();
  };
  const togglePause = () => {
    setPaused((p) => !p);
    haptic(6);
    // Hook may expose pause/resume; fall back silently
    const v = voice as unknown as { pauseRecording?: () => void; resumeRecording?: () => void };
    if (paused) v.resumeRecording?.();
    else v.pauseRecording?.();
  };

  const dragRatio = Math.min(1, Math.abs(dragX) / CANCEL_THRESHOLD);

  return (
    <>
      {/* The mic button itself */}
      <motion.button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        animate={{
          scale: isRecording && !locked ? 1.15 : 1,
          x: isRecording && !locked ? dragX : 0,
          y: isRecording && !locked ? dragY : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className={`relative h-11 w-11 rounded-full flex items-center justify-center shrink-0 select-none touch-none transition-colors ${
          isRecording
            ? willCancel
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground shadow-lg"
            : "bg-primary/10 text-primary hover:bg-primary/15 active:scale-95"
        } ${className ?? ""}`}
        aria-label={isRecording ? "Recording — slide left to cancel, up to lock" : "Hold to record voice"}
      >
        <Mic className="h-5 w-5" />
        {isRecording && !locked && (
          <motion.span
            className="absolute inset-0 rounded-full bg-primary/40"
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          />
        )}
      </motion.button>

      {/* Recording overlay — covers the composer with iMessage-style hint UI */}
      <AnimatePresence>
        {isRecording && !locked && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="absolute inset-x-0 bottom-0 z-40 pointer-events-none"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}
          >
            {/* Lock hint pill — floats above the mic */}
            <motion.div
              animate={{ y: -Math.abs(dragY) * 0.6, opacity: 0.7 + dragRatio * 0.3 }}
              className="absolute right-4 -top-24 bg-card/90 backdrop-blur-xl border border-border/40 rounded-full px-2 py-3 flex flex-col items-center gap-1 shadow-lg"
            >
              <Lock className={`h-4 w-4 ${willLock ? "text-primary" : "text-muted-foreground"}`} />
              <ChevronUp className="h-3 w-3 text-muted-foreground/60" />
            </motion.div>

            {/* Bottom recording bar */}
            <div
              className={`mx-2 mb-1 px-4 py-3 rounded-2xl backdrop-blur-2xl border flex items-center gap-3 shadow-xl transition-colors ${
                willCancel
                  ? "bg-destructive/15 border-destructive/40"
                  : "bg-card/85 border-border/40"
              }`}
            >
              <motion.div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${willCancel ? "bg-destructive" : "bg-destructive"}`}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-xs font-mono font-semibold tabular-nums shrink-0 text-foreground">
                {fmt(voice.elapsedMs ?? voice.duration * 1000)}
              </span>

              {/* Slide-to-cancel hint */}
              <motion.div
                className="flex-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
                animate={{ x: dragX * 0.4, opacity: willCancel ? 0 : 1 - dragRatio * 0.5 }}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Slide to cancel</span>
              </motion.div>

              {willCancel && (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5 text-xs font-medium text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Release to cancel
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked-mode floating toolbar */}
      <AnimatePresence>
        {isRecording && locked && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="absolute inset-x-0 bottom-0 z-40"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}
          >
            <div className="mx-2 mb-1 px-3 py-2.5 rounded-2xl bg-card/90 backdrop-blur-2xl border border-border/40 shadow-xl flex items-center gap-2">
              <button
                onClick={handleLockedCancel}
                className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Cancel recording"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="flex-1 flex items-center gap-2 px-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-destructive"
                  animate={{ opacity: paused ? 0.3 : [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
                <span className="text-xs font-mono font-semibold tabular-nums">
                  {fmt(voice.elapsedMs ?? voice.duration * 1000)}
                </span>
                <div className="flex-1 flex items-center gap-[2px] h-5 overflow-hidden">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-full bg-primary/50"
                      animate={paused ? { height: "20%" } : { height: ["20%", `${30 + Math.random() * 70}%`, "20%"] }}
                      transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.4, delay: i * 0.02 }}
                      style={{ minHeight: 2 }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={togglePause}
                className="h-10 w-10 rounded-full bg-muted text-foreground flex items-center justify-center active:scale-90 transition-transform"
                aria-label={paused ? "Resume" : "Pause"}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                onClick={handleLockedSend}
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform shadow-md"
                aria-label="Send voice note"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
