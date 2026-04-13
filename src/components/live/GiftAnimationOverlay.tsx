/**
 * GiftAnimationOverlay — Full-screen gift video animation over live stream
 * Plays MP4 video with screen blend mode so live stream shows through
 * Falls back to static image + sparkles for gifts without video
 * Auto-dismisses after video ends or 5s timeout
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { giftImages } from "@/config/giftIcons";
import { giftAnimationVideos } from "@/config/giftAnimations";

interface GiftAnimationOverlayProps {
  activeGift: { name: string; coins: number; senderName?: string } | null;
  onComplete: () => void;
}

export default function GiftAnimationOverlay({ activeGift, onComplete }: GiftAnimationOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [showVideo, setShowVideo] = useState(false);

  const handleEnd = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowVideo(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!activeGift) {
      setShowVideo(false);
      return;
    }

    const videoUrl = giftAnimationVideos[activeGift.name];
    
    if (videoUrl && videoRef.current) {
      // Has video — play it
      setShowVideo(true);
      const vid = videoRef.current;
      vid.src = videoUrl;
      vid.currentTime = 0;
      vid.play().catch(() => {
        // Autoplay blocked — fall back to timeout
      });

      // Safety timeout: dismiss after 6s even if video doesn't fire ended
      timeoutRef.current = setTimeout(handleEnd, 6000);
    } else {
      // No video — show static animation for 4s
      setShowVideo(false);
      timeoutRef.current = setTimeout(handleEnd, 4000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeGift, handleEnd]);

  const handleVideoEnded = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const videoUrl = activeGift ? giftAnimationVideos[activeGift.name] : null;
  const hasVideo = !!videoUrl;

  return (
    <AnimatePresence>
      {activeGift && (
        <motion.div
          key={activeGift.name + "-" + Date.now()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center"
        >
          {/* Video layer — full screen, blended so stream shows through */}
          {hasVideo && (
            <video
              ref={videoRef}
              onEnded={handleVideoEnded}
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ mixBlendMode: "screen" }}
            />
          )}

          {/* Fallback: static gift image animation (only when no video) */}
          {!hasVideo && giftImages[activeGift.name] && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -80 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-8 rounded-full"
                style={{
                  background: "radial-gradient(circle, hsla(45, 100%, 60%, 0.3) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.img
                src={giftImages[activeGift.name]}
                alt={activeGift.name}
                className="w-36 h-36 object-contain drop-shadow-[0_0_30px_rgba(255,200,0,0.6)] relative z-10"
                animate={{
                  y: [0, -14, 0],
                  rotate: [0, 4, -4, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          )}

          {/* Sender banner — slides in from left */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.2 }}
            className="absolute top-1/3 left-0"
          >
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-black/80 via-black/50 to-transparent pl-3 pr-10 py-3 rounded-r-full backdrop-blur-md">
              {giftImages[activeGift.name] && (
                <img
                  src={giftImages[activeGift.name]}
                  alt=""
                  className="w-10 h-10 object-contain"
                />
              )}
              <div>
                <p className="text-white text-sm font-bold leading-tight">
                  {activeGift.senderName || "Someone"}
                </p>
                <p className="text-amber-400 text-xs font-semibold leading-tight">
                  sent {activeGift.name} 💎 {activeGift.coins.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Combo counter */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute top-[42%] right-8"
          >
            <span
              className="text-amber-400 text-5xl font-black drop-shadow-[0_0_15px_rgba(255,200,0,0.7)]"
              style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.3)" }}
            >
              ×1
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
