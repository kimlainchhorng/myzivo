/**
 * GiftAnimationOverlay — Cinematic gift animation over live stream
 * Premium full-screen experience with rich golden glow, particles & video
 */
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { giftImages, preloadGiftImages } from "@/config/giftIcons";
import { giftAnimationVideos, preloadGiftAnimations } from "@/config/giftAnimations";
import goldCoinIcon from "@/assets/gifts/gold-coin.png";

interface GiftAnimationOverlayProps {
  activeGift: { name: string; coins: number; senderName?: string } | null;
  onComplete: () => void;
  giftPanelOpen?: boolean;
  comboCount?: number;
}

function GiftAnimationOverlay({ activeGift, onComplete, giftPanelOpen, comboCount = 1 }: GiftAnimationOverlayProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const onCompleteRef = useRef(onComplete);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasReadyRef = useRef(false);
  const [animKey, setAnimKey] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  onCompleteRef.current = onComplete;

  const giftImg = activeGift ? giftImages[activeGift.name] : undefined;
  const videoUrl = activeGift ? giftAnimationVideos[activeGift.name] : undefined;
  const isPremium = activeGift ? activeGift.coins >= 100 : false;
  const isUltra = activeGift ? activeGift.coins >= 5000 : false;
  const isLegendary = activeGift ? activeGift.coins >= 20000 : false;
  const hasVideo = Boolean(videoUrl) && !videoError;

  // Derive color theme from gift name
  const giftTheme = useMemo(() => {
    if (!activeGift) return { h: 30, s: 90, name: "gold" }; // default gold
    const n = activeGift.name.toLowerCase();
    if (n.includes("dragon") || n.includes("emerald") || n.includes("eagle")) return { h: 145, s: 80, name: "emerald" };
    if (n.includes("fire") || n.includes("phoenix") || n.includes("ferrari")) return { h: 15, s: 95, name: "fire" };
    if (n.includes("ice") || n.includes("penguin") || n.includes("crystal") || n.includes("diamond")) return { h: 200, s: 85, name: "ice" };
    if (n.includes("sapphire") || n.includes("swan") || n.includes("galaxy")) return { h: 225, s: 80, name: "sapphire" };
    if (n.includes("gold") || n.includes("crown") || n.includes("treasure") || n.includes("castle") || n.includes("throne")) return { h: 42, s: 95, name: "gold" };
    if (n.includes("neon") || n.includes("rocket")) return { h: 280, s: 85, name: "neon" };
    if (n.includes("panther") || n.includes("bugatti") || n.includes("lambo") || n.includes("royce") || n.includes("yacht")) return { h: 0, s: 0, name: "luxury" };
    if (n.includes("panda") || n.includes("platinum")) return { h: 260, s: 30, name: "platinum" };
    if (n.includes("cosmic") || n.includes("celestial")) return { h: 270, s: 75, name: "cosmic" };
    if (n.includes("rainbow") || n.includes("butterfly")) return { h: 300, s: 70, name: "rainbow" };
    if (n.includes("cobra") || n.includes("snake")) return { h: 85, s: 70, name: "venom" };
    if (n.includes("wolf") || n.includes("shadow")) return { h: 220, s: 20, name: "shadow" };
    if (n.includes("cat") || n.includes("lucky")) return { h: 50, s: 90, name: "gold" };
    return { h: 30, s: 90, name: "gold" };
  }, [activeGift]);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    onCompleteRef.current();
  }, []);

  // Sparkle particles — more for expensive gifts
  const particleCount = isLegendary ? 24 : isUltra ? 18 : isPremium ? 14 : 10;
  const sparkles = useMemo(() =>
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
      dist: 50 + Math.random() * 100,
      size: 3 + Math.random() * 6,
      delay: i * 0.03,
      dur: 1.4 + Math.random() * 1,
      color: ["#FFD700", "#FF6B6B", "#A78BFA", "#34D399", "#F472B6", "#FBBF24", "#60A5FA", "#FB923C", "#E879F9", "#FCD34D", "#FF9500", "#00D4FF"][i % 12],
    })),
  [animKey, particleCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Expanding rings
  const ringCount = isUltra ? 6 : isPremium ? 5 : 3;
  const rings = useMemo(() =>
    Array.from({ length: ringCount }, (_, i) => ({
      id: i,
      delay: 0.1 + i * 0.12,
      size: 40 + i * 22,
    })),
  [animKey, ringCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Floating embers for premium
  const embers = useMemo(() =>
    isUltra ? Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      delay: Math.random() * 2,
      dur: 2.5 + Math.random() * 2,
      size: 2 + Math.random() * 3,
    })) : [],
  [animKey, isUltra]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeGift) return;
    setAnimKey((k) => k + 1);
    setVideoReady(false);
    setVideoError(false);
    setCanvasReady(false);
    canvasReadyRef.current = false;
    // Reset video element for new gift
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }, [activeGift]);

  useEffect(() => {
    if (!activeGift) return;
    const dur = activeGift.coins >= 9999 ? 12000 : isUltra ? 9000 : isPremium ? 8000 : 6000;
    timeoutRef.current = setTimeout(dismiss, dur);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [activeGift, dismiss, isPremium, isUltra, isLegendary]);

  // Video ready → mark canvas ready (no chroma-key needed, using CSS blend mode)
  useEffect(() => {
    if (!activeGift || !hasVideo || !videoReady) return;
    setCanvasReady(true);
  }, [activeGift, hasVideo, videoReady]);

  if (!activeGift) return null;

  const comboIntensity = Math.min(comboCount, 20);
  const comboColor = comboCount >= 10 ? "#FF4500" : comboCount >= 5 ? "#FF6B6B" : "#FFD700";
  const comboScale = 1 + Math.min(comboCount * 0.05, 0.6);

  // Gift size tiers
  const giftSizeClass = isLegendary
    ? "w-44 h-44"
    : isUltra
    ? "w-36 h-36"
    : isPremium
    ? "w-28 h-28"
    : "w-20 h-20";

  return (
    <AnimatePresence>
      <motion.div
        key={animKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[99998] pointer-events-auto overflow-hidden"
        onClick={dismiss}
      >
        {/* Solid dark backdrop to hide stream content behind animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hasVideo ? 0.85 : isPremium ? 0.65 : 0.4 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black z-[0]"
        />
        {/* ── Cinematic backdrop ── */}
        {isPremium && (
          <>
            {/* Dark vignette */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isUltra ? 0.7 : 0.4 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-[0]"
              style={{
                background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.6) 100%)",
              }}
            />
            {/* Rich warm glow center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 z-[1]"
              style={{
                background: isLegendary
                  ? "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,170,0,0.35) 0%, rgba(255,100,0,0.15) 30%, rgba(180,50,0,0.05) 60%, transparent 80%)"
                  : isUltra
                  ? "radial-gradient(ellipse 55% 45% at 50% 40%, rgba(255,150,0,0.28) 0%, rgba(255,100,0,0.1) 35%, transparent 75%)"
                  : "radial-gradient(ellipse 50% 40% at 50% 40%, rgba(255,150,0,0.18) 0%, rgba(255,100,0,0.06) 40%, transparent 70%)",
              }}
            />
            {/* Animated golden pulse */}
            <motion.div
              className="absolute inset-0 z-[1]"
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "radial-gradient(circle at 50% 38%, rgba(255,200,50,0.2) 0%, transparent 50%)",
              }}
            />
          </>
        )}

        {/* ── Video animation — full-screen with blend mode ── */}
        {hasVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: canvasReady ? 1 : 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 z-[2] flex items-center justify-center"
            style={{ mixBlendMode: "screen" }}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay muted loop playsInline preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              onLoadedData={() => setVideoReady(true)}
              onError={() => setVideoError(true)}
            />
          </motion.div>
        )}

        {/* ── Fallback: icon animation ── */}
        {!hasVideo && giftImg && (
          <div
            className="absolute inset-0 flex items-center justify-center z-[2]"
            style={{ marginTop: giftPanelOpen ? "-40%" : "-5%" }}
          >
            {/* Expanding ring pulses */}
            {rings.map((r) => (
              <motion.div
                key={`ring-${r.id}`}
                className="absolute rounded-full"
                style={{
                  width: r.size,
                  height: r.size,
                  border: `${isUltra ? 2 : 1}px solid`,
                  borderColor: isLegendary
                    ? "rgba(255,200,50,0.5)"
                    : isPremium
                    ? "rgba(255,150,0,0.4)"
                    : "rgba(255,200,0,0.25)",
                }}
                initial={{ scale: 0, opacity: 0.9 }}
                animate={{ scale: [0, 3], opacity: [0.7, 0] }}
                transition={{ duration: 1.8, delay: r.delay, ease: "easeOut" }}
              />
            ))}

            {/* Sparkle particles */}
            {sparkles.map((s) => (
              <motion.div
                key={s.id}
                className="absolute"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0.7, 0],
                  x: Math.cos(s.angle) * s.dist * (isUltra ? 1.5 : isPremium ? 1.3 : 1),
                  y: Math.sin(s.angle) * s.dist * (isUltra ? 1.5 : isPremium ? 1.3 : 1),
                  scale: [0, 1.8, 0.4, 0],
                  rotate: [0, 240],
                }}
                transition={{ duration: s.dur, delay: s.delay, ease: "easeOut" }}
              >
                <svg viewBox="0 0 24 24" fill={s.color} style={{
                  width: s.size * (isUltra ? 1.5 : isPremium ? 1.3 : 1),
                  height: s.size * (isUltra ? 1.5 : isPremium ? 1.3 : 1),
                  filter: `drop-shadow(0 0 6px ${s.color})`,
                }}>
                  <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
                </svg>
              </motion.div>
            ))}

            {/* Multi-layer glow */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: isUltra ? 220 : isPremium ? 160 : 110,
                height: isUltra ? 220 : isPremium ? 160 : 110,
                background: isLegendary
                  ? "radial-gradient(circle, rgba(255,200,50,0.45) 0%, rgba(255,130,0,0.15) 40%, transparent 70%)"
                  : isUltra
                  ? "radial-gradient(circle, rgba(255,170,30,0.4) 0%, rgba(255,120,0,0.12) 40%, transparent 70%)"
                  : isPremium
                  ? "radial-gradient(circle, rgba(255,150,0,0.3) 0%, rgba(255,100,0,0.08) 50%, transparent 70%)"
                  : "radial-gradient(circle, rgba(255,200,0,0.2) 0%, rgba(255,180,0,0.05) 50%, transparent 70%)",
              }}
              animate={{ scale: [0.8, 1.4, 1, 1.2], opacity: [0.3, 0.8, 0.5, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Second glow layer for ultra */}
            {isUltra && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 280,
                  height: 280,
                  background: "radial-gradient(circle, rgba(255,100,0,0.15) 0%, transparent 60%)",
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            )}

            {/* Gift icon — bigger, more dramatic entrance */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 100, rotate: -20 }}
              animate={{ scale: [0, 1.2, 0.88, 1.05, 1], opacity: 1, y: 0, rotate: [-20, 8, -3, 0] }}
              transition={{ type: "spring", damping: 9, stiffness: 140, mass: 0.7, delay: 0.05 }}
              className="relative z-10"
            >
              <motion.img
                src={giftImg}
                alt={activeGift.name}
                className={`${giftSizeClass} object-contain`}
                style={{
                  filter: isLegendary
                    ? "drop-shadow(0 0 40px rgba(255,170,0,0.7)) drop-shadow(0 0 80px rgba(255,100,0,0.3)) drop-shadow(0 6px 16px rgba(0,0,0,0.5))"
                    : isUltra
                    ? "drop-shadow(0 0 30px rgba(255,150,0,0.6)) drop-shadow(0 0 60px rgba(255,100,0,0.2)) drop-shadow(0 5px 14px rgba(0,0,0,0.45))"
                    : isPremium
                    ? "drop-shadow(0 0 22px rgba(255,150,0,0.5)) drop-shadow(0 4px 12px rgba(0,0,0,0.4))"
                    : "drop-shadow(0 0 14px rgba(255,200,0,0.4)) drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
                }}
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.06, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        )}

        {/* ── Floating embers (ultra+ gifts) ── */}
        {embers.map((e) => (
          <motion.div
            key={`ember-${e.id}`}
            className="absolute z-[2] rounded-full"
            style={{
              left: `${e.x}%`,
              bottom: "10%",
              width: e.size,
              height: e.size,
              background: "radial-gradient(circle, rgba(255,180,0,0.9), rgba(255,100,0,0.4))",
              boxShadow: "0 0 6px rgba(255,150,0,0.6)",
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 0.8, 0.5, 0],
              y: [-20, -300 - Math.random() * 200],
              x: [0, (Math.random() - 0.5) * 60],
            }}
            transition={{ duration: e.dur, delay: e.delay, ease: "easeOut", repeat: Infinity, repeatDelay: 1 }}
          />
        ))}

        {/* ── Sender banner — 3D gift-themed ── */}
        <motion.div
          initial={{ x: -400, opacity: 0, rotateY: -15 }}
          animate={{ x: 0, opacity: 1, rotateY: 0 }}
          exit={{ x: -400, opacity: 0, rotateY: -15 }}
          transition={{ type: "spring", damping: 16, stiffness: 140, delay: 0.15 }}
          className="absolute left-0 z-[3]"
          style={{ top: giftPanelOpen ? "10%" : "22%", perspective: "800px" }}
        >
          <motion.div
            className="relative"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* 3D shadow */}
            <div className="absolute inset-0 rounded-r-[28px]" style={{ transform: "translateZ(-8px) translateY(4px)", background: `hsla(${giftTheme.h},40%,8%,0.7)`, filter: "blur(14px)" }} />

            {/* Main card — colors from gift theme */}
            <div
              className="relative flex items-center gap-3 pl-3 pr-10 py-3 rounded-r-[28px] overflow-hidden"
              style={{
                background: giftTheme.name === "luxury"
                  ? `linear-gradient(110deg, rgba(20,20,25,0.98) 0%, rgba(50,50,60,0.95) 20%, rgba(80,80,95,0.8) 50%, rgba(120,120,140,0.4) 75%, transparent 100%)`
                  : `linear-gradient(110deg, hsla(${giftTheme.h},${giftTheme.s}%,12%,0.98) 0%, hsla(${giftTheme.h},${giftTheme.s}%,25%,0.95) 15%, hsla(${giftTheme.h},${giftTheme.s - 10}%,40%,0.85) 40%, hsla(${giftTheme.h},${giftTheme.s - 15}%,55%,0.6) 65%, hsla(${giftTheme.h},${giftTheme.s - 20}%,65%,0.25) 85%, transparent 100%)`,
                backdropFilter: "blur(20px) saturate(1.5)",
                boxShadow: giftTheme.name === "luxury"
                  ? `0 6px 40px rgba(180,180,200,0.3), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.4)`
                  : isLegendary
                  ? `0 8px 50px hsla(${giftTheme.h},${giftTheme.s}%,50%,0.5), 0 2px 20px hsla(${giftTheme.h},${giftTheme.s}%,40%,0.25), inset 0 1px 0 hsla(${giftTheme.h},30%,90%,0.5), inset 0 -2px 0 hsla(${giftTheme.h},${giftTheme.s}%,10%,0.4)`
                  : isUltra
                  ? `0 6px 40px hsla(${giftTheme.h},${giftTheme.s}%,45%,0.4), inset 0 1px 0 hsla(${giftTheme.h},30%,85%,0.4), inset 0 -2px 0 hsla(${giftTheme.h},${giftTheme.s}%,10%,0.3)`
                  : `0 4px 25px hsla(${giftTheme.h},${giftTheme.s}%,40%,0.3), inset 0 1px 0 hsla(${giftTheme.h},30%,80%,0.25)`,
                borderTop: giftTheme.name === "luxury" ? "1px solid rgba(200,200,220,0.3)" : `1px solid hsla(${giftTheme.h},${giftTheme.s}%,70%,0.35)`,
                borderRight: giftTheme.name === "luxury" ? "1px solid rgba(150,150,170,0.15)" : `1px solid hsla(${giftTheme.h},${giftTheme.s}%,60%,0.15)`,
                transform: "translateZ(4px)",
              }}
            >
              {/* Shine sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.12) 55%, transparent 60%)", width: "50%" }}
              />

              {/* Avatar */}
              <motion.div
                initial={{ scale: 0, rotateZ: -20 }}
                animate={{ scale: 1, rotateZ: 0 }}
                transition={{ type: "spring", delay: 0.3, stiffness: 300 }}
                className="relative shrink-0"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    background: giftTheme.name === "luxury"
                      ? "linear-gradient(145deg, #888 0%, #555 50%, #333 100%)"
                      : `linear-gradient(145deg, hsla(${giftTheme.h},${giftTheme.s}%,70%,1) 0%, hsla(${giftTheme.h},${giftTheme.s}%,45%,1) 50%, hsla(${giftTheme.h},${giftTheme.s}%,25%,1) 100%)`,
                    boxShadow: `0 3px 16px hsla(${giftTheme.h},${giftTheme.s}%,40%,0.6), inset 0 -2px 4px rgba(0,0,0,0.25), inset 0 2px 3px hsla(${giftTheme.h},30%,85%,0.4)`,
                    border: `2px solid hsla(${giftTheme.h},${giftTheme.s}%,65%,0.5)`,
                  }}
                >
                  {(activeGift.senderName || "S")[0]}
                </div>
                {giftImg && (
                  <motion.img
                    src={giftImg} alt=""
                    className="absolute -bottom-1 -right-2 w-9 h-9 object-contain z-10"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.4, stiffness: 250 }}
                    style={{ filter: `drop-shadow(0 3px 8px rgba(0,0,0,0.6)) drop-shadow(0 0 6px hsla(${giftTheme.h},${giftTheme.s}%,50%,0.4))` }}
                  />
                )}
              </motion.div>

              {/* Text */}
              <motion.div className="min-w-0 flex-1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                <p className="text-white text-[14px] font-extrabold leading-tight truncate" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                  {activeGift.senderName || "Someone"}
                </p>
                <p style={{ color: giftTheme.name === "luxury" ? "rgba(220,220,230,0.9)" : `hsla(${giftTheme.h},60%,85%,0.95)` }} className="text-[11px] font-semibold leading-tight mt-0.5">
                  sent <span className="text-white font-bold">{activeGift.name}</span>
                </p>
              </motion.div>

              {/* Coin badge */}
              <motion.div
                initial={{ scale: 0, rotateZ: 20 }}
                animate={{ scale: 1, rotateZ: 0 }}
                transition={{ type: "spring", delay: 0.45, stiffness: 280 }}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 ml-1 shrink-0"
                style={{
                  background: giftTheme.name === "luxury"
                    ? "linear-gradient(135deg, rgba(180,180,200,0.35), rgba(100,100,120,0.25))"
                    : `linear-gradient(135deg, hsla(${giftTheme.h},${giftTheme.s}%,55%,0.4), hsla(${giftTheme.h},${giftTheme.s}%,35%,0.25))`,
                  backdropFilter: "blur(8px)",
                  border: `1px solid hsla(${giftTheme.h},${giftTheme.s}%,65%,0.35)`,
                  boxShadow: `0 2px 12px hsla(${giftTheme.h},${giftTheme.s}%,45%,0.3), inset 0 1px 0 hsla(${giftTheme.h},30%,85%,0.2)`,
                }}
              >
                <img src={goldCoinIcon} alt="" className="w-4 h-4" style={{ filter: "drop-shadow(0 0 4px rgba(255,200,0,0.5))" }} />
                <span className="text-amber-100 text-[13px] font-black tabular-nums" style={{ textShadow: "0 0 8px rgba(255,200,0,0.5), 0 1px 4px rgba(0,0,0,0.6)" }}>
                  {activeGift.coins.toLocaleString()}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Combo counter ── */}
        {comboCount >= 2 && (
          <motion.div
            key={`combo-${comboCount}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2.2, 1], opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute right-5 z-[3]"
            style={{ top: giftPanelOpen ? "18%" : "35%" }}
          >
            {comboCount >= 3 && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  width: 90, height: 90, top: "50%", left: "50%", marginTop: -45, marginLeft: -45,
                  background: `radial-gradient(circle, ${comboColor}44, transparent 70%)`,
                }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
            <motion.div className="flex flex-col items-center">
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-black uppercase tracking-[0.2em] mb-[-2px]"
                style={{ color: comboColor, textShadow: `0 0 12px ${comboColor}90` }}
              >
                combo
              </motion.span>
              <motion.span
                key={comboCount}
                animate={{
                  scale: [comboScale + 0.4, comboScale - 0.1, comboScale],
                  rotate: comboCount >= 5 ? [0, -6, 6, -3, 0] : [0],
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-black block"
                style={{
                  fontSize: `${Math.min(52 + comboIntensity * 2, 78)}px`,
                  color: comboColor,
                  textShadow: `0 0 ${12 + comboIntensity * 2}px ${comboColor}90, 0 0 ${35 + comboIntensity * 3}px ${comboColor}50, 0 3px 10px rgba(0,0,0,0.8)`,
                  WebkitTextStroke: comboCount >= 5 ? "2px rgba(255,255,255,0.35)" : "1px rgba(255,255,255,0.2)",
                }}
              >
                ×{comboCount}
              </motion.span>
            </motion.div>
          </motion.div>
        )}

        {/* ── Rising light streaks ── */}
        {[...Array(isPremium ? 7 : 5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{ left: `${8 + i * (isPremium ? 13 : 18)}%` }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, isPremium ? 0.7 : 0.4, 0], y: -800 }}
            transition={{ duration: 2, delay: 0.15 + i * 0.12, ease: "easeOut" }}
          >
            <div
              className="h-48"
              style={{
                width: isPremium ? 2 : 1,
                background: `linear-gradient(to top, ${
                  ["rgba(255,200,0,0.7)", "rgba(255,120,50,0.5)", "rgba(167,139,250,0.5)", "rgba(255,180,0,0.6)", "rgba(251,191,36,0.6)", "rgba(255,100,0,0.4)", "rgba(255,220,100,0.5)"][i % 7]
                }, transparent)`,
              }}
            />
          </motion.div>
        ))}

        {/* ── Bottom shimmer wave ── */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-[1]"
          style={{
            height: isPremium ? 3 : 1,
            background: isPremium
              ? "linear-gradient(90deg, transparent, rgba(255,200,0,0.8), rgba(255,150,0,0.6), transparent)"
              : "linear-gradient(90deg, transparent, rgba(255,200,0,0.5), transparent)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
        />

        {/* ── Edge glow for ultra ── */}
        {isUltra && (
          <>
            <motion.div
              className="absolute top-0 left-0 right-0 h-24 z-[1]"
              style={{ background: "linear-gradient(to bottom, rgba(255,100,0,0.1), transparent)" }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-24 z-[1]"
              style={{ background: "linear-gradient(to top, rgba(255,100,0,0.12), transparent)" }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </>
        )}

        {/* ── Tap to skip hint ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute bottom-8 left-0 right-0 text-center text-white/40 text-[11px] font-medium z-[4]"
        >
          Tap to skip
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

export default GiftAnimationOverlay;
