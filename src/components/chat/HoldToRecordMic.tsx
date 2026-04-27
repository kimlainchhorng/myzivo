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
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Mic from "lucide-react/dist/esm/icons/mic";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Send from "lucide-react/dist/esm/icons/send";
import Lock from "lucide-react/dist/esm/icons/lock";

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

  // Smooth springed motion values for the overlay visuals (decouples render
  // from the raw pointer values so the slide hint glides instead of stuttering).
  const dragXMV = useMotionValue(0);
  const dragYMV = useMotionValue(0);
  const SPRING = { stiffness: 320, damping: 28, mass: 0.4 };
  const dragXSpring = useSpring(dragXMV, SPRING);
  const dragYSpring = useSpring(dragYMV, SPRING);
  const slideHintX = useTransform(dragXSpring, (v) => v * 0.45);
  const slideHintOpacity = useTransform(dragXSpring, (v) => 1 - Math.min(1, Math.abs(v) / CANCEL_THRESHOLD) * 0.6);
  const lockChipY = useTransform(dragYSpring, (v) => Math.max(-LOCK_THRESHOLD * 0.7, v * 0.7));
  const lockChipOpacity = useTransform(dragYSpring, (v) => 0.85 + Math.min(1, Math.abs(v) / LOCK_THRESHOLD) * 0.15);
  const cancelGlowWidth = useTransform(dragXSpring, (v) => `${Math.min(1, Math.abs(v) / CANCEL_THRESHOLD) * 100}%`);

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
      dragXMV.set(0);
      dragYMV.set(0);
      setLocked(false);
      setPaused(false);
    }
  }, [voice.isRecording, dragXMV, dragYMV]);

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
    const easedX = dx < -CANCEL_THRESHOLD ? -CANCEL_THRESHOLD + (dx + CANCEL_THRESHOLD) * 0.35 : dx;
    const easedY = dy < -LOCK_THRESHOLD ? -LOCK_THRESHOLD + (dy + LOCK_THRESHOLD) * 0.35 : dy;
    setDragX(easedX);
    setDragY(easedY);
    // Push to springed motion values for the overlay (decoupled from React render).
    dragXMV.set(easedX);
    dragYMV.set(easedY);

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
    dragXMV.set(0);
    dragYMV.set(0);
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

      {/* Recording overlay — Telegram-style single pill at the bottom */}
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
            {/* Lock hint chip — small, sits just above the mic */}
            <motion.div
              animate={{
                y: -Math.abs(dragY) * 0.6,
                opacity: 0.85 + Math.min(1, Math.abs(dragY) / LOCK_THRESHOLD) * 0.15,
                scale: willLock ? 1.1 : 1,
              }}
              className="absolute right-5 -top-14 bg-card/95 backdrop-blur-xl border border-border/40 rounded-full p-2 shadow-lg"
            >
              <Lock className={`h-4 w-4 ${willLock ? "text-primary" : "text-muted-foreground"}`} />
            </motion.div>

            {/* Bottom recording pill */}
            <div
              className="mx-2 mb-1 pl-4 pr-2 py-2 rounded-full backdrop-blur-2xl border border-border/40 bg-card/90 flex items-center gap-3 shadow-xl relative overflow-hidden"
            >
              {/* Subtle progress glow that grows with slide-to-cancel */}
              <motion.div
                className="absolute inset-y-0 left-0 bg-destructive/10 pointer-events-none"
                animate={{ width: `${dragRatio * 100}%` }}
                transition={{ type: "tween", duration: 0.1 }}
              />

              {/* Left: red dot + time */}
              <div className="flex items-center gap-2 shrink-0 relative">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full bg-destructive"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
                <span className="text-sm font-mono font-medium tabular-nums text-foreground">
                  {fmt(voice.elapsedMs ?? voice.duration * 1000)}
                </span>
              </div>

              {/* Center: slide-to-cancel hint */}
              <motion.div
                className="flex-1 flex items-center justify-center gap-1 text-sm text-muted-foreground relative"
                animate={{ x: dragX * 0.45, opacity: 1 - dragRatio * 0.6 }}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Slide to cancel</span>
              </motion.div>

              {willCancel && (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center gap-1.5 text-sm font-medium text-destructive bg-card/95 rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                  Release to cancel
                </motion.div>
              )}

              {/* Right: spacer to balance the visual since the actual mic button sits over the composer */}
              <div className="w-11 h-9 shrink-0" aria-hidden />
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
