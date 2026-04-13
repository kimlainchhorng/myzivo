/**
 * VoiceMessagePlayer — 2026-style waveform audio player with speed control
 */
import { useState, useRef, useEffect, useCallback } from "react";
import Play from "lucide-react/dist/esm/icons/play";
import Pause from "lucide-react/dist/esm/icons/pause";
import { motion } from "framer-motion";

interface VoiceMessagePlayerProps {
  url: string;
  duration?: string;
  isMe: boolean;
}

const SPEED_OPTIONS = [1, 1.5, 2] as const;

// Generate deterministic pseudo-random waveform from URL hash
function generateWaveform(url: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }
  return Array.from({ length: count }, (_, i) => {
    const seed = Math.abs(((hash * (i + 1) * 2654435761) >> 16) % 100);
    const positionWeight = 1 - Math.abs((i / count) * 2 - 1) * 0.3;
    return 0.15 + (seed / 100) * 0.85 * positionWeight;
  });
}

export default function VoiceMessagePlayer({ url, duration, isMe }: VoiceMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1);
  const barCount = 32;
  const waveform = generateWaveform(url, barCount);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [url]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.playbackRate = speed;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing, speed]);

  const cycleSpeed = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }, [speed]);

  const handleSeek = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || !isFinite(audio.duration)) return;
    const seekRatio = index / barCount;
    audio.currentTime = seekRatio * audio.duration;
    setProgress(seekRatio);
    setCurrentTime(audio.currentTime);
  }, [barCount]);

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const displayTime = playing || progress > 0
    ? formatTime(currentTime)
    : (duration || formatTime(totalDuration));

  const remaining = totalDuration > 0 && (playing || progress > 0)
    ? formatTime(totalDuration - currentTime)
    : null;

  return (
    <div className="flex items-center gap-2.5 min-w-[220px]">
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Play/Pause button */}
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.85 }}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm ${
          isMe
            ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            : "bg-primary/15 hover:bg-primary/25 text-primary"
        }`}
      >
        {playing ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </motion.button>

      <div className="flex-1 flex flex-col gap-1">
        {/* Waveform bars — tappable for seeking */}
        <div
          className="flex items-center gap-[1.5px] h-7 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const ratio = x / rect.width;
            const idx = Math.round(ratio * barCount);
            handleSeek(idx);
          }}
        >
          {waveform.map((h, i) => {
            const filled = i / barCount <= progress;
            const isActive = playing && filled;
            return (
              <motion.div
                key={i}
                className={`flex-1 rounded-full transition-colors duration-100 ${
                  filled
                    ? isMe ? "bg-primary-foreground" : "bg-primary"
                    : isMe ? "bg-primary-foreground/25" : "bg-primary/20"
                }`}
                style={{
                  height: `${h * 100}%`,
                  minHeight: "3px",
                  maxHeight: "100%",
                }}
                animate={isActive ? { scaleY: [1, 1.15, 1] } : { scaleY: 1 }}
                transition={isActive ? { repeat: Infinity, duration: 0.5, delay: i * 0.02 } : {}}
              />
            );
          })}
        </div>

        {/* Time + Speed */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-medium tabular-nums leading-none ${
            isMe ? "text-primary-foreground/60" : "text-muted-foreground"
          }`}>
            {displayTime}
            {remaining && <span className="ml-1 opacity-50">/ -{remaining}</span>}
          </span>

          {/* Speed toggle */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={cycleSpeed}
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none transition-all ${
              speed !== 1
                ? isMe ? "bg-primary-foreground/30 text-primary-foreground" : "bg-primary/20 text-primary"
                : isMe ? "bg-primary-foreground/15 text-primary-foreground/50" : "bg-primary/10 text-muted-foreground"
            }`}
          >
            {speed}×
          </motion.button>
        </div>
      </div>
    </div>
  );
}
