/**
 * VoiceMessagePlayer — Inline waveform-style audio player for voice notes
 */
import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceMessagePlayerProps {
  url: string;
  duration?: string;
  isMe: boolean;
}

export default function VoiceMessagePlayer({ url, duration, isMe }: VoiceMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => setTotalDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setProgress(0); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Generate fake waveform bars
  const bars = 20;
  const waveform = Array.from({ length: bars }, (_, i) => {
    const seed = (i * 7 + 3) % 11;
    return 0.3 + (seed / 11) * 0.7;
  });

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <audio ref={audioRef} src={url} preload="metadata" />

      <button
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isMe ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary"
        }`}
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        {/* Waveform bars */}
        <div className="flex items-end gap-[2px] h-5">
          {waveform.map((h, i) => {
            const filled = i / bars <= progress;
            return (
              <motion.div
                key={i}
                className={`w-[3px] rounded-full transition-colors ${
                  filled
                    ? isMe ? "bg-primary-foreground" : "bg-primary"
                    : isMe ? "bg-primary-foreground/30" : "bg-primary/25"
                }`}
                style={{ height: `${h * 100}%` }}
                animate={playing && filled ? { scaleY: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </div>

        <span className={`text-[9px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {playing || progress > 0 ? formatTime(currentTime) : (duration || formatTime(totalDuration || 0))}
        </span>
      </div>
    </div>
  );
}
