/**
 * GiftAnimationOverlay — Premium gift animation over live stream
 * Uses MP4 video animations for premium gifts, icon fallback for others
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

export default function GiftAnimationOverlay({ activeGift, onComplete, giftPanelOpen, comboCount = 1 }: GiftAnimationOverlayProps) {
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
  const isLegendary = activeGift ? activeGift.coins >= 20000 : false;
  const hasVideoAsset = Boolean(videoUrl);
  const hasVideo = hasVideoAsset && !videoError;
  const showFallbackVisual = Boolean(giftImg) && (!hasVideo || !canvasReady);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    onCompleteRef.current();
  }, []);

  // Generate sparkle particles
  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * Math.PI * 2,
      dist: 40 + Math.random() * 60,
      size: 2 + Math.random() * 5,
      delay: i * 0.04,
      dur: 1.2 + Math.random() * 0.8,
      color: ["#FFD700", "#FF6B6B", "#A78BFA", "#34D399", "#F472B6", "#FBBF24", "#60A5FA", "#FB923C", "#E879F9", "#FCD34D"][i % 10],
    })),
  [animKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate floating ring particles
  const rings = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      delay: 0.2 + i * 0.15,
      size: 30 + i * 18,
    })),
  [animKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeGift) return;
    setAnimKey((k) => k + 1);
    setVideoReady(false);
    setVideoError(false);
    setCanvasReady(false);
    canvasReadyRef.current = false;
  }, [activeGift]);

  useEffect(() => {
    if (!activeGift) return;
    const isPremiumGift = activeGift.coins >= 100;
    timeoutRef.current = setTimeout(dismiss, isPremiumGift || hasVideoAsset ? 5000 : 4000);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [activeGift, dismiss, hasVideoAsset]);

  useEffect(() => {
    if (!activeGift || !hasVideo) return;

    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      setVideoReady(true);
    }
  }, [activeGift, hasVideo, animKey]);

  useEffect(() => {
    if (!activeGift || !hasVideo || !videoReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true, willReadFrequently: true });

    if (!video || !canvas || !ctx) return;

    const syncCanvasSize = () => {
      const cssWidth = Math.max(window.innerWidth, 1);
      const cssHeight = Math.max(window.innerHeight, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rawWidth = cssWidth * dpr;
      const rawHeight = cssHeight * dpr;
      const scale = Math.min(1, 960 / Math.max(rawWidth, rawHeight));
      const nextWidth = Math.max(1, Math.round(rawWidth * scale));
      const nextHeight = Math.max(1, Math.round(rawHeight * scale));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
    };

    const renderFrame = () => {
      if (!videoRef.current || !canvasRef.current) return;
      if (video.readyState < 2) {
        frameLoopRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const sourceWidth = video.videoWidth || width;
      const sourceHeight = video.videoHeight || height;
      const coverScale = Math.max(width / sourceWidth, height / sourceHeight);
      const drawWidth = sourceWidth * coverScale;
      const drawHeight = sourceHeight * coverScale;
      const drawX = (width - drawWidth) / 2;
      const drawY = (height - drawHeight) / 2;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

      try {
        const frame = ctx.getImageData(0, 0, width, height);
        const pixels = frame.data;

        for (let i = 0; i < pixels.length; i += 4) {
          const red = pixels[i];
          const green = pixels[i + 1];
          const blue = pixels[i + 2];
          const max = Math.max(red, green, blue);
          const min = Math.min(red, green, blue);
          const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
          const chroma = max - min;

          if (luma < 18 && chroma < 22) {
            pixels[i + 3] = 0;
            continue;
          }

          if (luma < 48 && chroma < 36) {
            const softAlpha = Math.max(0, Math.min(255, Math.round(((luma - 18) / 30) * 255)));
            pixels[i + 3] = Math.min(pixels[i + 3], softAlpha);
          }

          pixels[i] = Math.min(255, Math.round(red * 1.08));
          pixels[i + 1] = Math.min(255, Math.round(green * 1.05));
          pixels[i + 2] = Math.min(255, Math.round(blue * 1.08));
        }

        ctx.putImageData(frame, 0, 0);
      } catch {
        setVideoError(true);
        setCanvasReady(false);
        canvasReadyRef.current = false;
        return;
      }

      if (!canvasReadyRef.current) {
        canvasReadyRef.current = true;
        setCanvasReady(true);
      }

      frameLoopRef.current = requestAnimationFrame(renderFrame);
    };

    syncCanvasSize();
    if (video.paused) {
      video.play().catch(() => {});
    }
    frameLoopRef.current = requestAnimationFrame(renderFrame);
    window.addEventListener("resize", syncCanvasSize);

    return () => {
      window.removeEventListener("resize", syncCanvasSize);
      if (frameLoopRef.current) {
        cancelAnimationFrame(frameLoopRef.current);
        frameLoopRef.current = undefined;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [activeGift, hasVideo, videoReady, animKey]);

  if (!activeGift) return null;

  // Combo intensity scales with count
  const comboIntensity = Math.min(comboCount, 20);
  const comboColor = comboCount >= 10 ? "#FF4500" : comboCount >= 5 ? "#FF6B6B" : "#FFD700";
  const comboScale = 1 + Math.min(comboCount * 0.05, 0.6);

  return (
    <AnimatePresence>
      <motion.div
        key={animKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      >
        {/* ── Premium backdrop glow ── */}
        {isPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-[1]"
            style={{
              background: "radial-gradient(circle at 50% 45%, rgba(255,150,0,0.15) 0%, rgba(255,100,0,0.05) 40%, transparent 70%)",
            }}
          />
        )}

        {/* ── Video animation with real black-key transparency ── */}
        {hasVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: canvasReady ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[2]"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full"
            />
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              
              className="absolute left-0 top-0 h-px w-px opacity-0"
              onLoadedData={() => setVideoReady(true)}
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoError(true)}
            />
          </motion.div>
        )}

        {/* ── Fallback: icon animation (when no video or video failed) ── */}
        {showFallbackVisual && giftImg && (
          <div className="absolute inset-0 flex items-center justify-center z-[2]" style={{ marginTop: giftPanelOpen ? "-45%" : "-5%" }}>
            {/* Expanding ring pulses */}
            {rings.map((r) => (
              <motion.div
                key={`ring-${r.id}`}
                className="absolute rounded-full border"
                style={{ width: r.size, height: r.size, borderColor: isPremium ? "rgba(255,150,0,0.4)" : "rgba(255,200,0,0.3)" }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: [0, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, delay: r.delay, ease: "easeOut" }}
              />
            ))}

            {/* Sparkle particles */}
            {sparkles.map((s) => (
              <motion.div
                key={s.id}
                className="absolute"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0.6, 0],
                  x: Math.cos(s.angle) * s.dist * (isPremium ? 1.3 : 1),
                  y: Math.sin(s.angle) * s.dist * (isPremium ? 1.3 : 1),
                  scale: [0, 1.5, 0.5, 0],
                  rotate: [0, 180],
                }}
                transition={{ duration: s.dur, delay: s.delay, ease: "easeOut" }}
              >
                <svg viewBox="0 0 24 24" fill={s.color} style={{ width: s.size * (isPremium ? 1.3 : 1), height: s.size * (isPremium ? 1.3 : 1), filter: `drop-shadow(0 0 4px ${s.color})` }}>
                  <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
                </svg>
              </motion.div>
            ))}

            {/* Soft glow */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: isPremium ? 140 : 100,
                height: isPremium ? 140 : 100,
                background: isPremium
                  ? "radial-gradient(circle, hsla(30, 100%, 55%, 0.35) 0%, hsla(30, 100%, 55%, 0.08) 50%, transparent 70%)"
                  : "radial-gradient(circle, hsla(42, 100%, 55%, 0.25) 0%, hsla(42, 100%, 55%, 0.06) 50%, transparent 70%)",
              }}
              animate={{ scale: [0.7, 1.3, 0.9, 1.1], opacity: [0.2, 0.7, 0.4, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Gift icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 80, rotate: -15 }}
              animate={{ scale: [0, 1.15, 0.9, 1.02, 1], opacity: 1, y: 0, rotate: [-15, 5, -2, 0] }}
              transition={{ type: "spring", damping: 10, stiffness: 160, mass: 0.6, delay: 0.05 }}
              className="relative z-10"
            >
              <motion.img
                src={giftImg}
                alt={activeGift.name}
                className={isLegendary ? "w-28 h-28 sm:w-32 sm:h-32 object-contain" : isPremium ? "w-24 h-24 object-contain" : "w-20 h-20 object-contain"}
                style={{
                  filter: isPremium
                    ? "drop-shadow(0 0 20px rgba(255,150,0,0.6)) drop-shadow(0 4px 12px rgba(0,0,0,0.4))"
                    : "drop-shadow(0 0 16px rgba(255,200,0,0.5)) drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
                }}
                animate={{
                  y: [0, -6, 0],
                  scale: [1, 1.04, 1],
                  rotate: [0, 1.5, -1.5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        )}

        {/* ── Sender banner ── */}
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 180, delay: 0.15 }}
          className="absolute left-0 z-[3]"
          style={{ top: giftPanelOpen ? "10%" : "25%" }}
        >
          <div
            className="flex items-center gap-2.5 pl-2.5 pr-7 py-2.5 rounded-r-full"
            style={{
              background: isPremium
                ? "linear-gradient(95deg, rgba(180,80,0,0.95) 0%, rgba(220,130,20,0.85) 25%, rgba(255,170,50,0.6) 60%, transparent 100%)"
                : "linear-gradient(95deg, rgba(120,80,10,0.92) 0%, rgba(180,130,30,0.8) 25%, rgba(220,170,50,0.55) 60%, transparent 100%)",
              backdropFilter: "blur(12px)",
              boxShadow: isPremium
                ? "0 4px 30px rgba(255,130,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2)"
                : "0 4px 24px rgba(255,170,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)",
              borderTop: "1px solid rgba(255,220,100,0.2)",
              borderBottom: "1px solid rgba(100,60,0,0.3)",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3, stiffness: 300 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-amber-300/40"
              style={{ boxShadow: "0 2px 10px rgba(255,150,0,0.4)" }}
            >
              {(activeGift.senderName || "S")[0]}
            </motion.div>

            {giftImg && (
              <motion.img
                src={giftImg}
                alt=""
                className="w-8 h-8 object-contain -ml-5 mb-[-10px] relative z-10"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.4, stiffness: 250 }}
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}
              />
            )}

            <motion.div
              className="min-w-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <p className="text-white text-[13px] font-bold leading-tight truncate" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                {activeGift.senderName || "Someone"}
              </p>
              <p className="text-amber-100/90 text-[11px] font-medium leading-tight">
                sent <span className="text-white font-semibold">{activeGift.name}</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.45, stiffness: 280 }}
              className="flex items-center gap-0.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 ml-1 border border-amber-400/25"
            >
              <img src={goldCoinIcon} alt="" className="w-3.5 h-3.5" />
              <span className="text-amber-200 text-[11px] font-bold">{activeGift.coins.toLocaleString()}</span>
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
            style={{ top: giftPanelOpen ? "18%" : "38%" }}
          >
            {comboCount >= 3 && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  width: 80, height: 80, top: "50%", left: "50%", marginTop: -40, marginLeft: -40,
                  background: `radial-gradient(circle, ${comboColor}33, transparent 70%)`,
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
            <motion.div className="flex flex-col items-center">
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-bold uppercase tracking-widest mb-[-2px]"
                style={{ color: comboColor, textShadow: `0 0 8px ${comboColor}80` }}
              >
                combo
              </motion.span>
              <motion.span
                key={comboCount}
                animate={{
                  scale: [comboScale + 0.3, comboScale - 0.1, comboScale],
                  rotate: comboCount >= 5 ? [0, -5, 5, -3, 0] : [0],
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-black block"
                style={{
                  fontSize: `${Math.min(48 + comboIntensity * 1.5, 72)}px`,
                  color: comboColor,
                  textShadow: `0 0 ${10 + comboIntensity * 2}px ${comboColor}90, 0 0 ${30 + comboIntensity * 3}px ${comboColor}40, 0 3px 8px rgba(0,0,0,0.7)`,
                  WebkitTextStroke: comboCount >= 5 ? "2px rgba(255,255,255,0.3)" : "1px rgba(255,255,255,0.2)",
                }}
              >
                ×{comboCount}
              </motion.span>
            </motion.div>
          </motion.div>
        )}

        {/* ── Rising light streaks ── */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{ left: `${10 + i * 20}%` }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.5, 0], y: -700 }}
            transition={{ duration: 1.8, delay: 0.2 + i * 0.15, ease: "easeOut" }}
          >
            <div
              className="w-px h-40"
              style={{
                background: `linear-gradient(to top, ${["rgba(255,200,0,0.6)", "rgba(255,100,100,0.4)", "rgba(167,139,250,0.4)", "rgba(52,211,153,0.3)", "rgba(251,191,36,0.5)"][i]}, transparent)`,
              }}
            />
          </motion.div>
        ))}

        {/* ── Bottom shimmer wave ── */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,200,0,0.6), transparent)" }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
