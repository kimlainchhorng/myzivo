/**
 * VoiceNotePlayer — Bubble player with waveform + transcript toggle
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Play from "lucide-react/dist/esm/icons/play";
import Pause from "lucide-react/dist/esm/icons/pause";
import Languages from "lucide-react/dist/esm/icons/languages";

interface Props {
  audioUrl: string;
  durationMs?: number;
  waveform?: number[];
  transcript?: string | null;
  isSignedPath?: boolean; // if true, audioUrl is a storage path that needs signing
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function VoiceNotePlayer({ audioUrl, durationMs = 0, waveform = [], transcript, isSignedPath }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (isSignedPath) {
        const { data } = await supabase.storage.from("voice-notes").createSignedUrl(audioUrl, 3600);
        if (mounted) setSrc(data?.signedUrl ?? null);
      } else {
        setSrc(audioUrl);
      }
    })();
    return () => { mounted = false; };
  }, [audioUrl, isSignedPath]);

  const toggle = () => {
    if (!audio.current) return;
    if (playing) audio.current.pause(); else audio.current.play();
  };

  const bins = waveform.length > 0 ? waveform : Array(40).fill(0.3);

  return (
    <div className="flex flex-col gap-1 max-w-[280px]">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 flex items-center gap-[2px] h-8">
          {bins.map((h, i) => {
            const active = i / bins.length <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-colors ${active ? "bg-primary" : "bg-muted-foreground/40"}`}
                style={{ height: `${Math.max(15, h * 100)}%` }}
              />
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground font-mono shrink-0">{fmt(durationMs / 1000)}</span>
      </div>
      {transcript && (
        <>
          <button
            onClick={() => setShowTranscript((s) => !s)}
            className="self-start text-xs text-primary flex items-center gap-1 mt-1 hover:underline"
          >
            <Languages className="w-3 h-3" />
            {showTranscript ? "Hide" : "Show"} transcript
          </button>
          {showTranscript && (
            <p className="text-sm text-foreground/90 bg-muted/40 rounded-lg px-2 py-1 mt-1">{transcript}</p>
          )}
        </>
      )}
      {src && (
        <audio
          ref={audio}
          src={src}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setProgress(0); }}
          onTimeUpdate={(e) => {
            const a = e.currentTarget;
            setProgress(a.duration > 0 ? a.currentTime / a.duration : 0);
          }}
          preload="metadata"
        />
      )}
    </div>
  );
}
