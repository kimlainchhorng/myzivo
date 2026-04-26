/**
 * CallPiP — Floating picture-in-picture mini call overlay (FaceTime 2026 style)
 * Draggable but constrained to the device safe-area (notch / status bar /
 * home indicator / bottom nav / keyboard). Snaps to nearest horizontal edge.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import PhoneOff from "lucide-react/dist/esm/icons/phone-off";
import Maximize2 from "lucide-react/dist/esm/icons/maximize-2";
import Mic from "lucide-react/dist/esm/icons/mic";
import MicOff from "lucide-react/dist/esm/icons/mic-off";
import Video from "lucide-react/dist/esm/icons/video";
import VideoOff from "lucide-react/dist/esm/icons/video-off";
import { motion, useAnimation, type PanInfo } from "framer-motion";

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

const PADDING = 8;
// Reserve room for the bottom mobile nav (matches ZivoMobileNav height ~64px)
const BOTTOM_NAV_RESERVE = 72;

function readInset(name: string): number {
  if (typeof window === "undefined") return 0;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!v) return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
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
  const controls = useAnimation();
  const hasVideo = Boolean(remoteStream && callType === "video");

  const W = 168;
  const H = hasVideo ? 230 : 88;

  // Compute the safe drag area in viewport coordinates.
  const getBounds = useCallback(() => {
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const safeTop = Math.max(readInset("--safe-top"), 12);
    const safeBottom = Math.max(readInset("--safe-bottom"), 12);
    const safeLeft = Math.max(readInset("--safe-left"), 0);
    const safeRight = Math.max(readInset("--safe-right"), 0);
    return {
      minX: safeLeft + PADDING,
      maxX: vw - safeRight - PADDING - W,
      minY: safeTop + PADDING,
      maxY: vh - safeBottom - BOTTOM_NAV_RESERVE - PADDING - H,
    };
  }, [W, H]);

  const clamp = useCallback(
    (x: number, y: number) => {
      const b = getBounds();
      return {
        x: Math.min(Math.max(x, b.minX), Math.max(b.minX, b.maxX)),
        y: Math.min(Math.max(y, b.minY), Math.max(b.minY, b.maxY)),
      };
    },
    [getBounds]
  );

  // Initial position: top-right inside the safe area.
  const [pos, setPos] = useState(() => {
    if (typeof window === "undefined") return { x: 16, y: 100 };
    const b = getBounds();
    return { x: b.maxX, y: Math.max(b.minY, 100) };
  });

  // Re-clamp on viewport / orientation / keyboard changes.
  useEffect(() => {
    const reclamp = () => {
      setPos((p) => {
        const c = clamp(p.x, p.y);
        controls.start({ x: c.x, y: c.y, transition: { type: "spring", damping: 22, stiffness: 260 } });
        return c;
      });
    };
    window.addEventListener("resize", reclamp);
    window.addEventListener("orientationchange", reclamp);
    window.visualViewport?.addEventListener("resize", reclamp);
    return () => {
      window.removeEventListener("resize", reclamp);
      window.removeEventListener("orientationchange", reclamp);
      window.visualViewport?.removeEventListener("resize", reclamp);
    };
  }, [clamp, controls]);

  // Snap to nearest horizontal edge after drag end (iMessage-style magnet).
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const b = getBounds();
    const releasedX = info.point.x - W / 2;
    const releasedY = info.point.y - H / 2;
    const midX = (b.minX + b.maxX) / 2;
    const targetX = releasedX < midX ? b.minX : b.maxX;
    const c = clamp(targetX, releasedY);
    setPos(c);
    controls.start({ x: c.x, y: c.y, transition: { type: "spring", damping: 22, stiffness: 260 } });
  };

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
      void videoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Animate to the initial position once mounted.
  useEffect(() => {
    controls.start({ x: pos.x, y: pos.y, transition: { duration: 0 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDur = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.15}
      dragConstraints={{
        top: getBounds().minY,
        bottom: getBounds().maxY,
        left: getBounds().minX,
        right: getBounds().maxX,
      }}
      onDragEnd={handleDragEnd}
      animate={controls}
      className="fixed top-0 left-0 z-[70] shadow-2xl rounded-[22px] overflow-hidden border border-primary/20 bg-background/90 backdrop-blur-xl touch-none"
      style={{ width: W, height: H }}
      initial={{ opacity: 0, scale: 0.5 }}
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
