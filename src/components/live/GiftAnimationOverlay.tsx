/**
 * GiftAnimationOverlay — Cinematic gift animation over live stream
 * Premium full-screen experience with rich golden glow, particles & video
 */
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { giftImages } from "@/config/giftIcons";
import { giftAnimationVideos } from "@/config/giftAnimations";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameLoopRef = useRef<number>();
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

  // Video → canvas chroma-key pipeline
  useEffect(() => {
    if (!activeGift || !hasVideo || !videoReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true, willReadFrequently: true });
    if (!video || !canvas || !ctx) return;

    const syncCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const cssW = Math.max(container.clientWidth, 1);
      const cssH = Math.max(container.clientHeight, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nw = Math.max(1, Math.round(cssW * dpr));
      const nh = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== nw || canvas.height !== nh) {
        canvas.width = nw;
        canvas.height = nh;
      }
    };

    const renderFrame = () => {
      if (!videoRef.current || !canvasRef.current) return;
      if (video.readyState < 2) { frameLoopRef.current = requestAnimationFrame(renderFrame); return; }

      const w = canvas.width, h = canvas.height;
      if (w === 0 || h === 0) { frameLoopRef.current = requestAnimationFrame(renderFrame); return; }
      const sw = video.videoWidth || w, sh = video.videoHeight || h;
      const cs = Math.max(w / sw, h / sh);
      const dw = sw * cs, dh = sh * cs;
      try {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);

        const frame = ctx.getImageData(0, 0, w, h);
        const px = frame.data;
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i], g = px[i + 1], b = px[i + 2];
          const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const chroma = Math.max(r, g, b) - Math.min(r, g, b);
          if (luma < 18 && chroma < 22) { px[i + 3] = 0; continue; }
          if (luma < 48 && chroma < 36) {
            px[i + 3] = Math.min(px[i + 3], Math.max(0, Math.min(255, Math.round(((luma - 18) / 30) * 255))));
          }
          px[i] = Math.min(255, Math.round(r * 1.08));
          px[i + 1] = Math.min(255, Math.round(g * 1.05));
          px[i + 2] = Math.min(255, Math.round(b * 1.08));
        }
        ctx.putImageData(frame, 0, 0);
      } catch {
        // Canvas tainted or security error — show video directly without chroma-key
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
      }
      if (!canvasReadyRef.current) { canvasReadyRef.current = true; setCanvasReady(true); }
      frameLoopRef.current = requestAnimationFrame(renderFrame);
    };

    syncCanvasSize();
    if (video.paused) video.play().catch(() => {});
    frameLoopRef.current = requestAnimationFrame(renderFrame);
    window.addEventListener("resize", syncCanvasSize);
    return () => {
      window.removeEventListener("resize", syncCanvasSize);
      if (frameLoopRef.current) { cancelAnimationFrame(frameLoopRef.current); frameLoopRef.current = undefined; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [activeGift, hasVideo, videoReady, animKey]);

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
          animate={{ opacity: hasVideo ? 0.92 : isPremium ? 0.65 : 0.4 }}
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

        {/* ── Video animation — full-screen cinematic ── */}
        {hasVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: canvasReady ? 1 : 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 z-[2] flex items-center justify-center"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: "cover" }}
            />
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay muted loop playsInline preload="auto"
              className="absolute left-0 top-0 h-px w-px opacity-0 pointer-events-none"
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

        {/* ── Sender banner — premium glassmorphic ── */}
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 160, delay: 0.15 }}
          className="absolute left-0 z-[3]"
          style={{ top: giftPanelOpen ? "10%" : "22%" }}
        >
          <div
            className="flex items-center gap-2.5 pl-2.5 pr-8 py-2.5 rounded-r-full"
            style={{
              background: isUltra
                ? "linear-gradient(95deg, rgba(160,60,0,0.97) 0%, rgba(200,110,10,0.9) 20%, rgba(255,160,40,0.65) 55%, transparent 100%)"
                : isPremium
                ? "linear-gradient(95deg, rgba(180,80,0,0.95) 0%, rgba(220,130,20,0.85) 25%, rgba(255,170,50,0.55) 60%, transparent 100%)"
                : "linear-gradient(95deg, rgba(100,70,10,0.9) 0%, rgba(160,110,20,0.75) 30%, rgba(200,150,40,0.45) 65%, transparent 100%)",
              backdropFilter: "blur(16px)",
              boxShadow: isUltra
                ? "0 4px 40px rgba(255,120,0,0.5), 0 0 60px rgba(255,80,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)"
                : isPremium
                ? "0 4px 30px rgba(255,130,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2)"
                : "0 4px 20px rgba(255,170,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
              borderTop: "1px solid rgba(255,220,100,0.25)",
              borderBottom: "1px solid rgba(100,60,0,0.3)",
            }}
          >
            {/* Sender avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3, stiffness: 300 }}
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-amber-300/40"
              style={{
                background: isUltra
                  ? "linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FF4500 100%)"
                  : "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
                boxShadow: isUltra
                  ? "0 2px 16px rgba(255,150,0,0.6), 0 0 20px rgba(255,100,0,0.2)"
                  : "0 2px 10px rgba(255,150,0,0.4)",
              }}
            >
              {(activeGift.senderName || "S")[0]}
            </motion.div>

            {/* Mini gift icon overlapping avatar */}
            {giftImg && (
              <motion.img
                src={giftImg}
                alt=""
                className="w-9 h-9 object-contain -ml-6 mb-[-12px] relative z-10"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.4, stiffness: 250 }}
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}
              />
            )}

            {/* Text */}
            <motion.div
              className="min-w-0"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <p className="text-white text-[13px] font-bold leading-tight truncate" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}>
                {activeGift.senderName || "Someone"}
              </p>
              <p className="text-amber-100/90 text-[11px] font-medium leading-tight">
                sent <span className="text-white font-semibold">{activeGift.name}</span>
              </p>
            </motion.div>

            {/* Coin badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.45, stiffness: 280 }}
              className="flex items-center gap-0.5 rounded-full px-2.5 py-1 ml-1"
              style={{
                background: isUltra
                  ? "linear-gradient(135deg, rgba(255,150,0,0.5), rgba(255,80,0,0.3))"
                  : "rgba(0,0,0,0.3)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,200,50,0.3)",
                boxShadow: isUltra ? "0 0 12px rgba(255,150,0,0.3)" : "none",
              }}
            >
              <img src={goldCoinIcon} alt="" className="w-3.5 h-3.5" />
              <span className="text-amber-200 text-[12px] font-extrabold" style={{ textShadow: "0 0 6px rgba(255,200,0,0.4)" }}>
                {activeGift.coins.toLocaleString()}
              </span>
            </motion.div>
          </div>
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
