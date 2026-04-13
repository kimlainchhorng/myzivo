/**
 * GiftAnimationOverlay — Transparent gift animation over live stream
 * Like Bigo/TikTok: gift effects float ON TOP of the stream, never blocking it
 * Uses gift images with rich sparkle/glow effects — stream always visible
 */
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { giftImages } from "@/config/giftIcons";
import { giftAnimationVideos } from "@/config/giftAnimations";

interface GiftAnimationOverlayProps {
  activeGift: { name: string; coins: number; senderName?: string } | null;
  onComplete: () => void;
  giftPanelOpen?: boolean;
}

export default function GiftAnimationOverlay({ activeGift, onComplete, giftPanelOpen }: GiftAnimationOverlayProps) {
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

  const sparkles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      angle: (i / 16) * Math.PI * 2,
      dist: 80 + Math.random() * 100,
      size: 3 + Math.random() * 7,
      delay: i * 0.06,
      dur: 1.5 + Math.random() * 1,
      color: ["#FFD700", "#FF6B6B", "#A78BFA", "#34D399", "#F472B6", "#FBBF24", "#60A5FA", "#FB923C"][i % 8],
    })),
  [animKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeGift) setAnimKey((k) => k + 1);
  }, [activeGift]);

  useEffect(() => {
    if (!activeGift) return;
    const isPremium = !!giftAnimationVideos[activeGift.name];
    timeoutRef.current = setTimeout(dismiss, isPremium ? 4500 : 3500);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [animKey, dismiss]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeGift) return null;

  const giftImg = giftImages[activeGift.name];
  const isPremium = !!giftAnimationVideos[activeGift.name];

  return (
    <AnimatePresence>
      <motion.div
        key={animKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      >
        {/* ── Central gift image with effects ── */}
        {giftImg && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: giftPanelOpen ? "-45%" : "-5%" }}>
            {/* Sparkle particles */}
            {sparkles.map((s) => (
              <motion.div
                key={s.id}
                className="absolute"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0.8, 0],
                  x: Math.cos(s.angle) * s.dist,
                  y: Math.sin(s.angle) * s.dist,
                  scale: [0, 1.3, 0.6, 0],
                }}
                transition={{ duration: s.dur, delay: s.delay, ease: "easeOut" }}
              >
                <svg viewBox="0 0 24 24" fill={s.color} style={{ width: s.size, height: s.size, filter: `drop-shadow(0 0 3px ${s.color})` }}>
                  <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
                </svg>
              </motion.div>
            ))}

            {/* Golden glow */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: isPremium ? 260 : 200,
                height: isPremium ? 260 : 200,
                background: "radial-gradient(circle, hsla(42, 100%, 55%, 0.25) 0%, hsla(42, 100%, 55%, 0.08) 50%, transparent 70%)",
              }}
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Gift image */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 100, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 160, delay: 0.1 }}
              className="relative z-10"
            >
              <motion.img
                src={giftImg}
                alt={activeGift.name}
                className={isPremium ? "w-44 h-44 object-contain" : "w-36 h-36 object-contain"}
                style={{
                  filter: "drop-shadow(0 0 30px rgba(255,200,0,0.5)) drop-shadow(0 8px 20px rgba(0,0,0,0.4))",
                }}
                animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        )}

        {/* ── Sender banner — golden gradient from left ── */}
        <motion.div
          initial={{ x: -350, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -350, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 200, delay: 0.2 }}
          className="absolute left-0"
          style={{ top: giftPanelOpen ? "10%" : "25%" }}
        >
          <div
            className="flex items-center gap-2 pl-2 pr-6 py-2 rounded-r-full"
            style={{
              background: "linear-gradient(90deg, rgba(140,100,20,0.9) 0%, rgba(200,155,40,0.75) 30%, rgba(255,200,60,0.5) 65%, transparent 100%)",
              boxShadow: "0 3px 20px rgba(255,170,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0 border border-amber-300/30">
              {(activeGift.senderName || "S")[0]}
            </div>
            {giftImg && (
              <img src={giftImg} alt="" className="w-8 h-8 object-contain -ml-4 mb-[-8px] relative z-10" />
            )}
            <div className="min-w-0">
              <p className="text-white text-[13px] font-bold leading-tight truncate" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                {activeGift.senderName || "Someone"}
              </p>
              <p className="text-amber-100/90 text-[11px] font-medium leading-tight">
                sent <span className="text-white font-semibold">{activeGift.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-0.5 bg-black/25 rounded-full px-2 py-0.5 ml-1 border border-amber-400/20">
              <span className="text-[10px]">💎</span>
              <span className="text-amber-200 text-[11px] font-bold">{activeGift.coins.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Combo counter ── */}
        <motion.div
          initial={{ scale: 0, opacity: 0, x: 30 }}
          animate={{ scale: [0, 1.8, 1], opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="absolute right-5"
          style={{ top: giftPanelOpen ? "18%" : "38%" }}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.7, repeat: 4, ease: "easeInOut" }}
            className="text-5xl font-black block"
            style={{
              color: "#FFD700",
              textShadow: "0 0 15px rgba(255,200,0,0.7), 0 0 40px rgba(255,150,0,0.3), 0 3px 6px rgba(0,0,0,0.6)",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.25)",
            }}
          >
            ×1
          </motion.span>
        </motion.div>

        {/* ── Rising light streaks ── */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{ left: `${15 + i * 22}%` }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.4, 0], y: -600 }}
            transition={{ duration: 2, delay: 0.3 + i * 0.2, ease: "easeOut" }}
          >
            <div className="w-0.5 h-32" style={{ background: "linear-gradient(to top, rgba(255,200,0,0.5), transparent)" }} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
