/**
 * GiftAnimationOverlay — Transparent gift animation over live stream
 * Like Bigo/TikTok: gift effects float ON TOP of the stream, never blocking it
 * Video plays centered at contained size with screen blend
 * Fallback uses floating image + sparkle particles
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { giftImages } from "@/config/giftIcons";
import { giftAnimationVideos } from "@/config/giftAnimations";

interface GiftAnimationOverlayProps {
  activeGift: { name: string; coins: number; senderName?: string } | null;
  onComplete: () => void;
}

/* Sparkle particle positions */
const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.cos((i / 12) * Math.PI * 2) * 120 + (Math.random() - 0.5) * 40,
  y: Math.sin((i / 12) * Math.PI * 2) * 120 + (Math.random() - 0.5) * 40,
  size: 4 + Math.random() * 6,
  delay: i * 0.08,
  color: ["#FFD700", "#FF6B6B", "#A78BFA", "#34D399", "#F472B6", "#60A5FA"][i % 6],
}));

export default function GiftAnimationOverlay({ activeGift, onComplete }: GiftAnimationOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const onCompleteRef = useRef(onComplete);
  const [animKey, setAnimKey] = useState(0);

  onCompleteRef.current = onComplete;

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    if (activeGift) setAnimKey((k) => k + 1);
  }, [activeGift]);

  useEffect(() => {
    if (!activeGift) return;

    const videoUrl = giftAnimationVideos[activeGift.name];

    if (videoUrl) {
      requestAnimationFrame(() => {
        const vid = videoRef.current;
        if (vid) {
          vid.src = videoUrl;
          vid.currentTime = 0;
          vid.play().catch(() => {});
        }
      });
      timeoutRef.current = setTimeout(dismiss, 6000);
    } else {
      timeoutRef.current = setTimeout(dismiss, 4000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [animKey, dismiss]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeGift) return null;

  const videoUrl = giftAnimationVideos[activeGift.name];
  const hasVideo = !!videoUrl;

  return (
    <AnimatePresence>
      <motion.div
        key={animKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[60] pointer-events-none overflow-hidden"
      >
        {/* Subtle darkening vignette — stream still visible */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%)",
          }}
        />

        {/* Video layer — contained center, NOT full-screen cover */}
        {hasVideo && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 18, stiffness: 180 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <video
              ref={videoRef}
              onEnded={dismiss}
              muted
              playsInline
              className="w-[85%] max-w-[340px] aspect-square object-contain rounded-2xl"
              style={{ mixBlendMode: "screen" }}
            />
          </motion.div>
        )}

        {/* Fallback: floating gift image + sparkles */}
        {!hasVideo && giftImages[activeGift.name] && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Sparkle particles */}
            {SPARKLES.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: s.x,
                  y: s.y,
                  scale: [0, 1.2, 0.8, 0],
                }}
                transition={{ duration: 2, delay: s.delay, ease: "easeOut" }}
                className="absolute"
                style={{ width: s.size, height: s.size }}
              >
                <svg viewBox="0 0 24 24" fill={s.color} className="w-full h-full drop-shadow-sm">
                  <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
                </svg>
              </motion.div>
            ))}

            {/* Glow ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 200,
                height: 200,
                background: "radial-gradient(circle, hsla(45, 100%, 60%, 0.25) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Gift image */}
            <motion.img
              src={giftImages[activeGift.name]}
              alt={activeGift.name}
              initial={{ scale: 0.2, opacity: 0, y: 80 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -60 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="w-32 h-32 object-contain relative z-10 drop-shadow-[0_0_25px_rgba(255,200,0,0.5)]"
            />

            {/* Floating bob on the image */}
            <motion.div
              className="absolute z-10"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.img
                src={giftImages[activeGift.name]}
                alt=""
                className="w-32 h-32 object-contain opacity-0"
              />
            </motion.div>
          </div>
        )}

        {/* ── Sender banner — Bigo-style golden gradient ── */}
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 220, delay: 0.15 }}
          className="absolute left-0"
          style={{ top: "28%" }}
        >
          <div
            className="flex items-center gap-2 pl-2.5 pr-8 py-2 rounded-r-full"
            style={{
              background: "linear-gradient(90deg, rgba(180,130,30,0.85) 0%, rgba(220,170,50,0.7) 40%, rgba(255,200,80,0.4) 80%, transparent 100%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 2px 20px rgba(255,180,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {/* Sender avatar with gift icon */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {(activeGift.senderName || "S")[0]}
              </div>
              {giftImages[activeGift.name] && (
                <img
                  src={giftImages[activeGift.name]}
                  alt=""
                  className="absolute -bottom-1 -right-1 w-5 h-5 object-contain"
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-white text-[13px] font-bold leading-tight truncate drop-shadow-sm">
                {activeGift.senderName || "Someone"}
              </p>
              <p className="text-yellow-100/90 text-[11px] font-medium leading-tight">
                sent <span className="text-white font-semibold">{activeGift.name}</span>
              </p>
            </div>

            {/* Coin badge */}
            <div className="flex items-center gap-0.5 ml-1 bg-black/20 rounded-full px-2 py-0.5">
              <span className="text-[10px]">💎</span>
              <span className="text-yellow-200 text-[11px] font-bold">{activeGift.coins.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Combo counter — animated ×1 ── */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.6, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute right-6"
          style={{ top: "38%" }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.8, repeat: 3, ease: "easeInOut" }}
          >
            <span
              className="text-5xl font-black"
              style={{
                color: "#FFD700",
                textShadow: "0 0 20px rgba(255,200,0,0.6), 0 0 40px rgba(255,150,0,0.3), 0 2px 4px rgba(0,0,0,0.5)",
                WebkitTextStroke: "1px rgba(255,255,255,0.3)",
              }}
            >
              ×1
            </span>
          </motion.div>
        </motion.div>

        {/* ── Trailing sparkle trail at bottom ── */}
        <motion.div
          initial={{ opacity: 0, x: -200 }}
          animate={{ opacity: [0, 0.8, 0], x: 500 }}
          transition={{ duration: 2, delay: 0.3 }}
          className="absolute bottom-32 left-0"
        >
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#FFD700",
                  boxShadow: "0 0 6px #FFD700",
                  opacity: 1 - i * 0.15,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
