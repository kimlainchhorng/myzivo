/**
 * VoiceMessagePlayer — Telegram-style waveform player with RAF-smoothed progress.
 *
 * Performance design:
 *  - The 48 bars are rendered ONCE (memoized JSX list).
 *  - Progress lives in a ref + a single CSS variable on the waveform container;
 *    the boundary bar shows a partial fill via a CSS linear-gradient driven by
 *    `--p` so the playhead glides smoothly between bars (no per-bar React
 *    re-renders 60x/sec).
 *  - `timeupdate` only syncs absolute time; a `requestAnimationFrame` loop
 *    interpolates between events using `performance.now()` + `playbackRate`.
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Play from "lucide-react/dist/esm/icons/play";
import Pause from "lucide-react/dist/esm/icons/pause";
import { motion } from "framer-motion";

interface VoiceMessagePlayerProps {
  url: string;
  duration?: string;
  isMe: boolean;
}

const SPEED_OPTIONS = [1, 1.5, 2] as const;
const BAR_COUNT = 48;

// Generate deterministic pseudo-random waveform from URL hash
function generateWaveform(url: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }
  return Array.from({ length: count }, (_, i) => {
    const seed = Math.abs(((hash * (i + 1) * 2654435761) >> 16) % 100);
    const positionWeight = 1 - Math.abs((i / count) * 2 - 1) * 0.3;
    return 0.2 + (seed / 100) * 0.8 * positionWeight;
  });
}

export default function VoiceMessagePlayer({ url, duration, isMe }: VoiceMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveContainerRef = useRef<HTMLDivElement>(null);
  const timeLabelRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastSyncRef = useRef({ at: 0, time: 0 });

  const [playing, setPlaying] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1);
  const [hasPlayed, setHasPlayed] = useState(false);

  const waveform = useMemo(() => generateWaveform(url, BAR_COUNT), [url]);

  // Smoothly interpolated progress via single CSS variable on the waveform.
  const writeProgress = useCallback((p: number) => {
    const clamped = Math.max(0, Math.min(1, p));
    if (waveContainerRef.current) {
      waveContainerRef.current.style.setProperty("--p", String(clamped));
    }
    if (timeLabelRef.current) {
      const audio = audioRef.current;
      const total = audio?.duration && isFinite(audio.duration) ? audio.duration : 0;
      const cur = clamped * total;
      const m = Math.floor(cur / 60);
      const s = Math.floor(cur % 60);
      timeLabelRef.current.textContent = `${m}:${s.toString().padStart(2, "0")}`;
    }
  }, []);

  // RAF loop: interpolate between timeupdate events for buttery smoothness.
  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const tick = () => {
      const audio = audioRef.current;
      if (!audio || !audio.duration || !isFinite(audio.duration)) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const now = performance.now();
      const elapsed = (now - lastSyncRef.current.at) / 1000;
      const interpolated = lastSyncRef.current.time + elapsed * audio.playbackRate;
      const safe = Math.min(audio.duration, Math.max(0, interpolated));
      writeProgress(safe / audio.duration);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, writeProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!audio.duration || !isFinite(audio.duration)) return;
      lastSyncRef.current = { at: performance.now(), time: audio.currentTime };
      // When paused/seeking, write directly so the user sees the jump.
      if (!playing) writeProgress(audio.currentTime / audio.duration);
    };
    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      writeProgress(0);
      lastSyncRef.current = { at: performance.now(), time: 0 };
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playing, writeProgress]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.playbackRate = speed;
      lastSyncRef.current = { at: performance.now(), time: audio.currentTime };
      audio
        .play()
        .then(() => {
          setPlaying(true);
          setHasPlayed(true);
        })
        .catch(() => {});
    }
  }, [playing, speed]);

  const cycleSpeed = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
      lastSyncRef.current = { at: performance.now(), time: audioRef.current.currentTime };
    }
  }, [speed]);

  const handleSeekToRatio = useCallback((ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || !isFinite(audio.duration)) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    audio.currentTime = clamped * audio.duration;
    lastSyncRef.current = { at: performance.now(), time: audio.currentTime };
    writeProgress(clamped);
  }, [writeProgress]);

  // Initial label fallback (before audio metadata loads, while paused).
  const fallbackLabel = duration || (totalDuration > 0
    ? `${Math.floor(totalDuration / 60)}:${String(Math.floor(totalDuration % 60)).padStart(2, "0")}`
    : "0:00");

  // Telegram shows a tiny dot for unheard incoming voice notes
  const showUnheardDot = !isMe && !hasPlayed && !playing;

  // Static bar list — rendered once. Each bar declares its position so the
  // container's CSS var `--p` can drive a partial fill on the boundary bar.
  const bars = useMemo(() => {
    const filledClass = isMe ? "bg-primary-foreground" : "bg-primary";
    const unfilledClass = isMe ? "bg-primary-foreground/30" : "bg-primary/25";
    return waveform.map((h, i) => {
      const start = i / BAR_COUNT;
      const end = (i + 1) / BAR_COUNT;
      // CSS: clamp((p - start) / (end - start), 0, 1) → fraction filled in this bar
      const fillExpr = `clamp(0, calc((var(--p) - ${start}) / ${(end - start).toFixed(6)}), 1)`;
      return (
        <div
          key={i}
          className={`relative flex-1 min-w-[1.5px] rounded-full ${unfilledClass}`}
          style={{
            height: `${h * 100}%`,
            minHeight: "3px",
          }}
        >
          {/* Foreground "filled" overlay — width driven by container CSS var */}
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${filledClass}`}
            style={{ width: `calc(${fillExpr} * 100%)` }}
          />
        </div>
      );
    });
  }, [waveform, isMe]);

  return (
    <div className="flex items-center gap-2.5 min-w-[200px] max-w-[260px]">
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Play/Pause button */}
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.85 }}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isMe
            ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            : "bg-primary/15 hover:bg-primary/25 text-primary"
        }`}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </motion.button>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Waveform bars — tap/drag to seek */}
        <div
          ref={waveContainerRef}
          className="flex items-center gap-[1px] h-7 cursor-pointer touch-none"
          style={{ ["--p" as any]: 0 }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            const rect = e.currentTarget.getBoundingClientRect();
            handleSeekToRatio((e.clientX - rect.left) / rect.width);
          }}
          onPointerMove={(e) => {
            if (e.buttons !== 1 && e.pointerType !== "touch") return;
            const rect = e.currentTarget.getBoundingClientRect();
            handleSeekToRatio((e.clientX - rect.left) / rect.width);
          }}
        >
          {bars}
        </div>

        {/* Time + Speed row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              ref={timeLabelRef}
              className={`text-[11px] font-medium tabular-nums leading-none ${
                isMe ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}
            >
              {fallbackLabel}
            </span>
            {showUnheardDot && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary inline-block"
                aria-label="Unheard"
              />
            )}
          </div>

          {/* Speed pill */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={cycleSpeed}
            className={`text-[10px] font-bold px-1.5 py-[2px] rounded-full leading-none ${
              speed !== 1
                ? isMe
                  ? "bg-primary-foreground/30 text-primary-foreground"
                  : "bg-primary/20 text-primary"
                : isMe
                ? "bg-primary-foreground/15 text-primary-foreground/60"
                : "bg-muted text-muted-foreground"
            }`}
            aria-label={`Playback speed ${speed}x`}
          >
            {speed}x
          </motion.button>
        </div>
      </div>
    </div>
  );
}
