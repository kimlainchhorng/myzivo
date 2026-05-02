/**
 * VideoTile — single participant tile inside the call grid.
 * Shows the camera track (or initials placeholder), name, mute/host badges,
 * a hand-raised indicator, and a "screen sharing" badge.
 */
import { useEffect, useRef } from "react";
import { Mic, MicOff, Crown, Hand, MonitorUp } from "lucide-react";
import type { LKParticipant } from "@/hooks/useLiveKitCall";

interface Props {
  participant: LKParticipant;
  emphasized?: boolean;
  /** When true, every tile shows a small pulsing red dot for privacy disclosure */
  isRecording?: boolean;
}

export default function VideoTile({ participant, emphasized = false, isRecording = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (participant.cameraTrack && participant.camEnabled) {
      const stream = new MediaStream([participant.cameraTrack]);
      el.srcObject = stream;
      void el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [participant.cameraTrack, participant.camEnabled]);

  const initials = (participant.name || "?")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 ${
        emphasized ? "ring-2 ring-emerald-400/70" : ""
      }`}
    >
      {participant.camEnabled && participant.cameraTrack ? (
        <video
          ref={videoRef}
          muted={participant.isLocal}
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-20 w-20 place-items-center rounded-full bg-zinc-700 text-2xl font-semibold text-white">
          {initials}
        </div>
      )}

      {/* Top-left: REC privacy indicator */}
      {isRecording && (
        <div
          className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow"
          title="This call is being recorded"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          REC
        </div>
      )}

      {/* Top-right: badges */}
      <div className="absolute right-2 top-2 flex items-center gap-1">
        {participant.isHost && (
          <span className="rounded-full bg-amber-500/90 p-1 text-white" title="Host">
            <Crown className="h-3 w-3" />
          </span>
        )}
        {participant.isScreenSharing && (
          <span className="rounded-full bg-blue-500/90 p-1 text-white" title="Screen sharing">
            <MonitorUp className="h-3 w-3" />
          </span>
        )}
      </div>

      {/* Bottom-left: name + mic */}
      <div className="absolute bottom-2 left-2 flex max-w-[80%] items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
        {participant.micEnabled ? (
          <Mic className="h-3 w-3" />
        ) : (
          <MicOff className="h-3 w-3 text-rose-400" />
        )}
        <span className="truncate">{participant.isLocal ? "You" : participant.name}</span>
      </div>

      {/* Hand raise */}
      {participant.handRaised && (
        <div className="absolute left-1/2 top-3 -translate-x-1/2 animate-bounce rounded-full bg-amber-400 p-2 text-amber-900 shadow-lg">
          <Hand className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
