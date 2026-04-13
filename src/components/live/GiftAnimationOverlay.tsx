/**
 * GiftAnimationOverlay — Full-screen video animation when a gift is sent
 * Plays a dramatic video overlay like BIGO Live gift effects
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { giftAnimationVideos } from "@/config/giftAnimations";
import { giftImages } from "@/config/giftIcons";

interface GiftAnimationOverlayProps {
  activeGift: { name: string; coins: number; senderName?: string } | null;
  onComplete: () => void;
}

export default function GiftAnimationOverlay({ activeGift, onComplete }: GiftAnimationOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFallback, setShowFallback] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const videoUrl = activeGift ? giftAnimationVideos[activeGift.name] : null;
  const hasVideo = !!videoUrl;

  const handleEnd = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!activeGift) {
      setShowFallback(false);
      return;
    }

    if (hasVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // If video fails to play, use fallback
        setShowFallback(true);
      });
    } else {
      // No video for this gift — show icon fallback animation
      setShowFallback(true);
    }

    // Safety timeout: auto-dismiss after 6 seconds
    timeoutRef.current = setTimeout(handleEnd, 6000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeGift, hasVideo, handleEnd]);

  return (
    <AnimatePresence>
      {activeGift && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center"
          onClick={handleEnd}
        >
          {/* Video animation */}
          {hasVideo && !showFallback && (
            <video
              ref={videoRef}
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              onEnded={handleEnd}
              onError={() => setShowFallback(true)}
              style={{ mixBlendMode: "screen" }}
            />
          )}

          {/* Fallback: large icon animation (for gifts without videos) */}
          {showFallback && (
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 150 }}
              className="flex flex-col items-center gap-3"
            >
              {giftImages[activeGift.name] ? (
                <motion.img
                  src={giftImages[activeGift.name]}
                  alt={activeGift.name}
                  className="w-40 h-40 object-contain drop-shadow-2xl"
                  animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 1.5, repeat: 2 }}
                />
              ) : (
                <motion.span
                  className="text-[120px]"
                  animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: 2 }}
                >
                  🎁
                </motion.span>
              )}
            </motion.div>
          )}

          {/* Gift info banner */}
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ delay: 0.3, type: "spring", damping: 20 }}
            className="absolute bottom-32 left-0 right-0 flex justify-center"
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 border border-white/10">
              {giftImages[activeGift.name] && (
                <img src={giftImages[activeGift.name]} alt="" className="w-10 h-10 object-contain" />
              )}
              <div>
                <p className="text-white text-sm font-bold">
                  {activeGift.senderName || "Someone"} sent
                </p>
                <p className="text-amber-400 text-xs font-semibold">
                  {activeGift.name} • {activeGift.coins.toLocaleString()} coins
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sparkle particles */}
          <GiftSparkles />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Floating sparkle particles that appear with every gift */
function GiftSparkles() {
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    size: 4 + Math.random() * 8,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          initial={{ y: "110%", x: `${s.x}%`, opacity: 0, scale: 0 }}
          animate={{
            y: "-10%",
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            ease: "easeOut",
          }}
          className="absolute"
          style={{
            width: s.size,
            height: s.size,
            background: `hsl(${40 + Math.random() * 20}, 100%, ${70 + Math.random() * 20}%)`,
            borderRadius: "50%",
            boxShadow: `0 0 ${s.size * 2}px hsl(40, 100%, 70%)`,
          }}
        />
      ))}
    </div>
  );
}
