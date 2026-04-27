/**
 * VoiceMessagePlayer — Telegram-style waveform audio player with speed control
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
    return 0.2 + (seed / 100) * 0.8 * positionWeight;
  });
}

export default function VoiceMessagePlayer({ url, duration, isMe }: VoiceMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1);
  const [hasPlayed, setHasPlayed] = useState(false);
  const barCount = 48;
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
      audio.play().then(() => {
        setPlaying(true);
        setHasPlayed(true);
      }).catch(() => {});
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

  // Telegram shows a tiny dot for unheard incoming voice notes
  const showUnheardDot = !isMe && !hasPlayed && progress === 0 && !playing;

  return (
    <div className="flex items-center gap-2.5 min-w-[200px] max-w-[260px]">
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
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </motion.button>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Waveform bars — tappable for seeking */}
        <div
          className="flex items-center gap-[1px] h-7 cursor-pointer"
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
            return (
              <div
                key={i}
                className={`flex-1 min-w-[1.5px] rounded-full transition-colors duration-150 ${
                  filled
                    ? isMe ? "bg-primary-foreground" : "bg-primary"
                    : isMe ? "bg-primary-foreground/30" : "bg-primary/25"
                }`}
                style={{
                  height: `${h * 100}%`,
                  minHeight: "3px",
                }}
              />
            );
          })}
        </div>

        {/* Time + Speed row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-medium tabular-nums leading-none ${
              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}>
              {displayTime}
            </span>
            {showUnheardDot && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" aria-label="Unheard" />
            )}
          </div>

          {/* Speed pill */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={cycleSpeed}
            className={`text-[10px] font-bold px-1.5 py-[2px] rounded-full leading-none transition-all ${
              speed !== 1
                ? isMe ? "bg-primary-foreground/30 text-primary-foreground" : "bg-primary/20 text-primary"
                : isMe ? "bg-primary-foreground/15 text-primary-foreground/60" : "bg-muted text-muted-foreground"
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
