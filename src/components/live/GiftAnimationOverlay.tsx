/**
 * GiftAnimationOverlay — Floating gift animation over live stream
 * Shows gift effects WITHOUT blocking the live stream view
 * Like BIGO Live / TikTok Live style — gift floats in center then fades
 */
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { giftImages } from "@/config/giftIcons";

interface GiftAnimationOverlayProps {
  activeGift: { name: string; coins: number; senderName?: string } | null;
  onComplete: () => void;
}

export default function GiftAnimationOverlay({ activeGift, onComplete }: GiftAnimationOverlayProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");

  const handleEnd = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPhase("enter");
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!activeGift) {
      setPhase("enter");
      return;
    }

    setPhase("enter");

    // Phase timeline: enter(0.4s) -> show(2.5s) -> exit(0.5s) -> done
    const t1 = setTimeout(() => setPhase("show"), 400);
    const t2 = setTimeout(() => setPhase("exit"), 2900);
    const t3 = setTimeout(handleEnd, 3500);
    timeoutRef.current = t3;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeGift, handleEnd]);

  const sparkles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 40,
      delay: Math.random() * 0.8,
      size: 3 + Math.random() * 6,
      duration: 1.2 + Math.random() * 1.5,
      color: [
        "hsl(45, 100%, 70%)",
        "hsl(35, 100%, 75%)",
        "hsl(280, 80%, 70%)",
        "hsl(200, 90%, 70%)",
        "hsl(350, 90%, 70%)",
      ][Math.floor(Math.random() * 5)],
    })), []);

  return (
    <AnimatePresence>
      {activeGift && (
        <motion.div
          key={activeGift.name + Date.now()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] pointer-events-none"
        >
          {/* Semi-transparent pulse flash on enter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 bg-amber-500/20"
          />

          {/* Main gift animation — centered, floating, see-through */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 60 }}
              animate={
                phase === "exit"
                  ? { scale: 0.5, opacity: 0, y: -100 }
                  : { scale: 1, opacity: 1, y: 0 }
              }
              transition={
                phase === "exit"
                  ? { duration: 0.5, ease: "easeIn" }
                  : { type: "spring", damping: 12, stiffness: 200 }
              }
              className="relative flex flex-col items-center"
            >
              {/* Glow ring behind gift */}
              <motion.div
                className="absolute w-44 h-44 rounded-full"
                style={{
                  background: "radial-gradient(circle, hsla(45, 100%, 60%, 0.25) 0%, transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              {/* Gift image */}
              {giftImages[activeGift.name] ? (
                <motion.img
                  src={giftImages[activeGift.name]}
                  alt={activeGift.name}
                  className="w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(255,200,0,0.5)] relative z-10"
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, 3, -3, 0],
                    scale: [1, 1.08, 1],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : (
                <motion.span
                  className="text-[90px] relative z-10"
                  animate={{ y: [0, -12, 0], scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  🎁
                </motion.span>
              )}
            </motion.div>
          </div>

          {/* Sender banner — slides in from left like BIGO */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.15 }}
            className="absolute top-1/3 left-0"
          >
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-black/70 via-black/50 to-transparent pl-3 pr-8 py-2.5 rounded-r-full backdrop-blur-sm">
              {giftImages[activeGift.name] && (
                <img
                  src={giftImages[activeGift.name]}
                  alt=""
                  className="w-9 h-9 object-contain"
                />
              )}
              <div>
                <p className="text-white text-xs font-bold leading-tight">
                  {activeGift.senderName || "Someone"}
                </p>
                <p className="text-amber-400 text-[11px] font-semibold leading-tight">
                  sent {activeGift.name} 💎 {activeGift.coins.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Floating sparkles — scattered around the gift */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {sparkles.map((s) => (
              <motion.div
                key={s.id}
                initial={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.2, 0.8, 0],
                  y: [0, -40 - Math.random() * 60],
                  x: [-10 + Math.random() * 20],
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
                  background: s.color,
                  borderRadius: "50%",
                  boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                }}
              />
            ))}
          </div>

          {/* Combo counter effect (appears briefly) */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute top-[45%] right-8"
          >
            <span className="text-amber-400 text-4xl font-black drop-shadow-[0_0_10px_rgba(255,200,0,0.6)]"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}
            >
              ×1
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
