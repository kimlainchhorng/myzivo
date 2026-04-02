/**
 * VoiceMessagePlayer — Polished waveform audio player for voice notes
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";

interface VoiceMessagePlayerProps {
  url: string;
  duration?: string;
  isMe: boolean;
}

// Generate deterministic pseudo-random waveform from URL hash
function generateWaveform(url: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }
  return Array.from({ length: count }, (_, i) => {
    const seed = Math.abs(((hash * (i + 1) * 2654435761) >> 16) % 100);
    // Create natural-looking waveform with peaks in middle
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
  const barCount = 28;
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
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing]);

  // Seek on bar tap
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

  return (
    <div className="flex items-center gap-2.5 min-w-[200px]">
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Play/Pause button */}
      <button
        onClick={toggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
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
      </button>

      <div className="flex-1 flex flex-col gap-1.5">
        {/* Waveform bars — tappable for seeking */}
        <div
          className="flex items-center gap-[1.5px] h-6 cursor-pointer"
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
                className={`flex-1 rounded-full transition-all duration-150 ${
                  filled
                    ? isMe ? "bg-primary-foreground" : "bg-primary"
                    : isMe ? "bg-primary-foreground/25" : "bg-primary/20"
                }`}
                style={{
                  height: `${h * 100}%`,
                  minHeight: "3px",
                  maxHeight: "100%",
                }}
              />
            );
          })}
        </div>

        {/* Time */}
        <span className={`text-[10px] font-medium tabular-nums leading-none ${
          isMe ? "text-primary-foreground/60" : "text-muted-foreground"
        }`}>
          {displayTime}
        </span>
      </div>
    </div>
  );
}
