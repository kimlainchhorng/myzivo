/**
 * CallPiP — Floating picture-in-picture mini video during active calls
 */
import { useState, useRef, useEffect } from "react";
import { PhoneOff, Maximize2, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { motion } from "framer-motion";

interface CallPiPProps {
  remoteStream: MediaStream | null;
  recipientName: string;
  isMuted: boolean;
  duration: number;
  callType?: "voice" | "video";
  isCameraOff?: boolean;
  onExpand: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleCamera?: () => void;
}

export default function CallPiP({
  remoteStream,
  recipientName,
  isMuted,
  duration,
  callType,
  isCameraOff,
  onExpand,
  onEndCall,
  onToggleMute,
  onToggleCamera,
}: CallPiPProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [position, setPosition] = useState({ x: 16, y: 100 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
      void videoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  const formatDur = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      className="fixed z-[70] shadow-2xl rounded-2xl overflow-hidden border-2 border-primary/30 bg-background"
      style={{ top: position.y, right: position.x, width: 160, height: remoteStream ? 220 : 80 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      {remoteStream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-[140px] object-cover bg-muted"
        />
      )}

      <div className="p-2 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-foreground truncate flex-1">{recipientName}</span>
          <span className="text-[9px] text-primary font-mono">{formatDur(duration)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute call" : "Mute call"}
            title={isMuted ? "Unmute" : "Mute"}
            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${
              isMuted ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
            }`}
          >
            {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          </button>
          {callType === "video" && onToggleCamera && (
            <button
              onClick={onToggleCamera}
              aria-label={isCameraOff ? "Enable camera" : "Disable camera"}
              title={isCameraOff ? "Enable camera" : "Disable camera"}
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${
                isCameraOff ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
              }`}
            >
              {isCameraOff ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
            </button>
          )}
          <button
            onClick={onExpand}
            aria-label="Expand call"
            title="Expand"
            className="h-7 w-7 rounded-full bg-muted text-foreground flex items-center justify-center"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            onClick={onEndCall}
            aria-label="End call"
            title="End call"
            className="h-7 flex-1 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] font-medium gap-1"
          >
            <PhoneOff className="w-3 h-3" /> End
          </button>
        </div>
      </div>
    </motion.div>
  );
}
