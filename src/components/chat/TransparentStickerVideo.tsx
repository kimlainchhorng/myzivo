/**
 * TransparentStickerVideo — renders sticker MP4s without the baked white matte.
 * Default mode keeps the lightweight CSS blend behavior.
 * Chroma mode draws video frames to canvas and keys out near-white pixels for
 * reliable floating stickers inside transformed layouts.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TransparentStickerVideoMode = "blend" | "chroma";

const HARD_KEY_BRIGHTNESS = 246;
const SOFT_KEY_BRIGHTNESS = 232;
const MAX_NEUTRAL_VARIANCE = 20;

function applyChromaKey(frame: ImageData, whiteKeyEnabled: boolean) {
  const { data, width, height } = frame;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const maxChannel = Math.max(red, green, blue);
    const minChannel = Math.min(red, green, blue);
    const brightness = (red + green + blue) / 3;
    const variance = maxChannel - minChannel;
    const maxOtherChannel = Math.max(red, blue);
    const greenExcess = green - maxOtherChannel;
    const saturation = maxChannel === 0 ? 0 : variance / maxChannel;

    // --- Green screen keying ---
    if (green > red && green > blue) {
      const greenRatio = green / Math.max(1, maxOtherChannel);
      const isHardGreen = green > 80 && greenExcess > 40 && saturation > 0.18 && greenRatio > 1.2;

      if (isHardGreen) {
        data[index + 3] = 0;
        continue;
      }

      const isSoftGreen = green > 36 && greenExcess > 10 && saturation > 0.08 && greenRatio > 1.05;
      const isLightGreen = brightness > 120 && greenExcess > 8 && blue < green * 0.85 && saturation > 0.06;

      if (isSoftGreen || isLightGreen) {
        const softScore = isSoftGreen
          ? Math.max(
              Math.min(1, (greenExcess - 10) / 35),
              Math.min(1, (greenRatio - 1.05) / 0.25)
            )
          : 0;

        const lightScore = isLightGreen
          ? Math.max(
              Math.min(1, (greenExcess - 8) / 22),
              Math.min(1, (brightness - 120) / 70)
            )
          : 0;

        const fade = Math.max(softScore, lightScore);
        const nextAlpha = Math.round(255 * (1 - Math.min(1, fade)));
        data[index + 3] = Math.min(data[index + 3], Math.max(0, nextAlpha));

        // Despill green on semi-transparent keyed edges
        if (data[index + 3] < 255) {
          const neutralGreen = Math.round((red + blue) / 2);
          data[index + 1] = Math.round(neutralGreen + (green - neutralGreen) * 0.15);
        }
        continue;
      }
    }

    if (!whiteKeyEnabled) continue;

    // --- White key ---
    if (brightness >= HARD_KEY_BRIGHTNESS && variance <= MAX_NEUTRAL_VARIANCE) {
      data[index + 3] = 0;
      continue;
    }

    if (brightness < SOFT_KEY_BRIGHTNESS || variance > MAX_NEUTRAL_VARIANCE) continue;

    const brightnessFade = (brightness - SOFT_KEY_BRIGHTNESS) / (HARD_KEY_BRIGHTNESS - SOFT_KEY_BRIGHTNESS);
    const varianceFade = 1 - variance / MAX_NEUTRAL_VARIANCE;
    const nextAlpha = Math.round(255 * (1 - brightnessFade * varianceFade));
    data[index + 3] = Math.min(data[index + 3], Math.max(0, nextAlpha));
  }

  // --- Two-pass edge erosion to clean fringe ---
  for (let pass = 0; pass < 2; pass++) {
    const alphaMap = new Uint8Array(width * height);
    for (let i = 0; i < alphaMap.length; i++) {
      alphaMap[i] = data[i * 4 + 3];
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const a = alphaMap[idx];
        if (a === 0) continue;

        let transparentCount = 0;
        if (x > 0 && alphaMap[idx - 1] === 0) transparentCount++;
        if (x < width - 1 && alphaMap[idx + 1] === 0) transparentCount++;
        if (y > 0 && alphaMap[idx - width] === 0) transparentCount++;
        if (y < height - 1 && alphaMap[idx + width] === 0) transparentCount++;

        if (transparentCount >= 2) {
          // Corner/edge pixel with 2+ transparent neighbors → fully remove
          data[idx * 4 + 3] = 0;
        } else if (transparentCount === 1) {
          // Single edge pixel → heavily fade
          data[idx * 4 + 3] = Math.round(a * (pass === 0 ? 0.15 : 0.3));
        }
      }
    }
  }
}

interface TransparentStickerVideoProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  preload?: "none" | "metadata" | "auto";
  renderMode?: TransparentStickerVideoMode;
  whiteKeyEnabled?: boolean;
}

export function TransparentStickerVideo({
  src,
  alt = "",
  className,
  fallbackSrc,
  preload = "auto",
  renderMode = "blend",
  whiteKeyEnabled = true,
}: TransparentStickerVideoProps) {
  const [error, setError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(renderMode !== "chroma");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (renderMode !== "chroma") {
      setIsInViewport(true);
      return;
    }

    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") {
      setIsInViewport(true);
      return;
    }

    setIsInViewport(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting && entry.intersectionRatio > 0.08);
      },
      { threshold: [0, 0.08, 0.2] }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [renderMode, src]);

  useEffect(() => {
    if (renderMode !== "chroma") return;

    const video = videoRef.current;
    if (!video) return;

    if (!isInViewport) {
      video.pause();
      return;
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => undefined);
    }
  }, [isInViewport, renderMode, src]);

  useEffect(() => {
    if (error || renderMode !== "chroma" || !isInViewport) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!canvas || !video || !container) return;

    let rafId: number | null = null;
    let frameCallbackId: number | null = null;
    let disposed = false;

    const keyedVideo = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (callback: (now: number, metadata: unknown) => void) => number;
      cancelVideoFrameCallback?: (handle: number) => void;
    };

    const cancelScheduledFrame = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }

      if (frameCallbackId !== null && keyedVideo.cancelVideoFrameCallback) {
        keyedVideo.cancelVideoFrameCallback(frameCallbackId);
        frameCallbackId = null;
      }
    };

    const syncCanvasSize = () => {
      const bounds = container.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width * pixelRatio));
      const height = Math.max(1, Math.round(bounds.height * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const scheduleNextFrame = () => {
      cancelScheduledFrame();
      if (disposed || video.paused || video.ended) return;

      if (keyedVideo.requestVideoFrameCallback) {
        frameCallbackId = keyedVideo.requestVideoFrameCallback(() => renderFrame());
        return;
      }

      rafId = window.requestAnimationFrame(() => renderFrame());
    };

    const renderFrame = () => {
      if (disposed) return;

      syncCanvasSize();
      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        scheduleNextFrame();
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw with object-contain behavior
      const vw = video.videoWidth || canvas.width;
      const vh = video.videoHeight || canvas.height;
      const scale = Math.min(canvas.width / vw, canvas.height / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (canvas.width - dw) / 2;
      const dy = (canvas.height - dh) / 2;
      context.drawImage(video, dx, dy, dw, dh);

      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      applyChromaKey(frame, whiteKeyEnabled);
      context.putImageData(frame, 0, 0);

      scheduleNextFrame();
    };

    const handleStart = () => {
      syncCanvasSize();
      renderFrame();
    };

    const resizeObserver = new ResizeObserver(() => {
      syncCanvasSize();
      if (!video.paused && !video.ended) renderFrame();
    });

    resizeObserver.observe(container);
    video.addEventListener("loadeddata", handleStart);
    video.addEventListener("play", handleStart);
    video.addEventListener("seeked", handleStart);
    video.addEventListener("pause", cancelScheduledFrame);
    video.addEventListener("ended", cancelScheduledFrame);

    syncCanvasSize();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.paused) {
      handleStart();
    }

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      cancelScheduledFrame();
      video.removeEventListener("loadeddata", handleStart);
      video.removeEventListener("play", handleStart);
      video.removeEventListener("seeked", handleStart);
      video.removeEventListener("pause", cancelScheduledFrame);
      video.removeEventListener("ended", cancelScheduledFrame);
    };
  }, [error, isInViewport, renderMode, src, whiteKeyEnabled]);

  if (error && fallbackSrc) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={cn("h-full w-full object-contain pointer-events-none", className)}
        loading="lazy"
      />
    );
  }

  if (renderMode === "chroma") {
    return (
      <div
        ref={containerRef}
        className={cn("relative h-full w-full pointer-events-none", className)}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <canvas ref={canvasRef} className="h-full w-full object-contain" />
        <video
          ref={videoRef}
          src={src}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          loop
          muted
          playsInline
          preload={preload}
          onError={() => setError(true)}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <video
      src={src}
      className={cn(
        "h-full w-full object-contain pointer-events-none mix-blend-multiply dark:mix-blend-screen dark:invert",
        className
      )}
      autoPlay
      loop
      muted
      playsInline
      preload={preload}
      onError={() => setError(true)}
    />
  );
}

export default TransparentStickerVideo;
