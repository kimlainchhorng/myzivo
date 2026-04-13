/**
 * CallPiP — Floating picture-in-picture mini call overlay (FaceTime 2026 style)
 */
import { useState, useRef, useEffect } from "react";
import PhoneOff from "lucide-react/dist/esm/icons/phone-off";
import Maximize2 from "lucide-react/dist/esm/icons/maximize-2";
import Mic from "lucide-react/dist/esm/icons/mic";
import MicOff from "lucide-react/dist/esm/icons/mic-off";
import Video from "lucide-react/dist/esm/icons/video";
import VideoOff from "lucide-react/dist/esm/icons/video-off";
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

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
      void videoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  const formatDur = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const hasVideo = remoteStream && callType === "video";

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed z-[70] shadow-2xl rounded-[22px] overflow-hidden border border-primary/20 bg-background/90 backdrop-blur-xl"
      style={{ top: 100, right: 16, width: 168, height: hasVideo ? 230 : 88 }}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 20 }}
      transition={{ type: "spring", damping: 20 }}
    >
      {hasVideo && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-[142px] object-cover bg-muted"
        />
      )}

      <div className="p-2.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-foreground truncate flex-1">{recipientName}</span>
          <span className="text-[9px] text-primary font-mono tabular-nums bg-primary/5 px-1.5 py-0.5 rounded-full">{formatDur(duration)}</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute call" : "Mute call"}
            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs transition-colors ${
              isMuted ? "bg-destructive/15 text-destructive" : "bg-foreground/[0.06] text-foreground/60"
            }`}
          >
            {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          </motion.button>
          {callType === "video" && onToggleCamera && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onToggleCamera}
              aria-label={isCameraOff ? "Enable camera" : "Disable camera"}
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                isCameraOff ? "bg-destructive/15 text-destructive" : "bg-foreground/[0.06] text-foreground/60"
              }`}
            >
              {isCameraOff ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onExpand}
            aria-label="Expand call"
            className="h-7 w-7 rounded-full bg-foreground/[0.06] text-foreground/60 flex items-center justify-center"
          >
            <Maximize2 className="w-3 h-3" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onEndCall}
            aria-label="End call"
            className="h-7 flex-1 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] font-medium gap-1"
          >
            <PhoneOff className="w-3 h-3" /> End
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
