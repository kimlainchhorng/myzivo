/**
 * TransparentStickerVideo — renders sticker MP4s without the baked white matte.
 * Default mode keeps the lightweight CSS blend behavior.
 * Chroma mode draws video frames to canvas and keys out near-white pixels for
 * reliable floating stickers inside transformed layouts.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TransparentStickerVideoMode = "blend" | "chroma";

const HARD_KEY_BRIGHTNESS = 244;
const SOFT_KEY_BRIGHTNESS = 228;
const MAX_NEUTRAL_VARIANCE = 22;

function applyChromaKey(frame: ImageData, whiteKeyEnabled: boolean) {
  const { data, width, height } = frame;

  // Track which pixels were keyed out (green/white) vs original transparent
  const keyedMask = new Uint8Array(width * height);

  for (let index = 0; index < data.length; index += 4) {
    const pixelIdx = index >> 2;
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const maxChannel = Math.max(red, green, blue);
    const brightness = (red + green + blue) / 3;
    const variance = maxChannel - Math.min(red, green, blue);
    const maxOtherChannel = Math.max(red, blue);
    const greenExcess = green - maxOtherChannel;
    const saturation = maxChannel === 0 ? 0 : variance / maxChannel;

    // --- Green screen keying ---
    if (green > red && green > blue) {
      const greenRatio = green / Math.max(1, maxOtherChannel);
      const isHardGreen = green > 85 && greenExcess > 45 && saturation > 0.2 && greenRatio > 1.25;

      if (isHardGreen) {
        data[index + 3] = 0;
        keyedMask[pixelIdx] = 1;
        continue;
      }

      const isSoftGreen = green > 40 && greenExcess > 14 && saturation > 0.1 && greenRatio > 1.06;
      const isLightGreen = brightness > 125 && greenExcess > 10 && blue < green * 0.84 && saturation > 0.07;

      if (isSoftGreen || isLightGreen) {
        const softScore = isSoftGreen
          ? Math.max(
              Math.min(1, (greenExcess - 14) / 38),
              Math.min(1, (greenRatio - 1.06) / 0.28)
            )
          : 0;

        const lightScore = isLightGreen
          ? Math.max(
              Math.min(1, (greenExcess - 10) / 24),
              Math.min(1, (brightness - 125) / 75)
            )
          : 0;

        const fade = Math.max(softScore, lightScore);
        const nextAlpha = Math.round(255 * (1 - Math.min(1, fade)));
        const newAlpha = Math.min(data[index + 3], Math.max(0, nextAlpha));
        if (newAlpha < 255) keyedMask[pixelIdx] = 1;
        data[index + 3] = newAlpha;

        // Despill green on semi-transparent keyed edges
        if (data[index + 3] < 255 && data[index + 3] > 0) {
          const neutralGreen = Math.round((red + blue) / 2);
          data[index + 1] = Math.round(neutralGreen + (green - neutralGreen) * 0.2);
        }
        continue;
      }
    }

    if (!whiteKeyEnabled) continue;

    // --- White key ---
    if (brightness >= HARD_KEY_BRIGHTNESS && variance <= MAX_NEUTRAL_VARIANCE) {
      data[index + 3] = 0;
      keyedMask[pixelIdx] = 1;
      continue;
    }

    if (brightness >= SOFT_KEY_BRIGHTNESS && variance <= MAX_NEUTRAL_VARIANCE) {
      const brightnessFade = (brightness - SOFT_KEY_BRIGHTNESS) / (HARD_KEY_BRIGHTNESS - SOFT_KEY_BRIGHTNESS);
      const varianceFade = 1 - variance / MAX_NEUTRAL_VARIANCE;
      const nextAlpha = Math.round(255 * (1 - Math.min(1, brightnessFade * varianceFade)));
      const newAlpha = Math.min(data[index + 3], Math.max(0, nextAlpha));
      if (newAlpha < data[index + 3]) keyedMask[pixelIdx] = 1;
      data[index + 3] = newAlpha;
    }
  }

  // --- Single-pass edge cleanup: only erode pixels adjacent to KEYED pixels ---
  // This prevents eating into legitimate sticker content
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const a = data[idx * 4 + 3];
      if (a === 0 || keyedMask[idx] === 1) continue;

      // Count how many keyed neighbors this pixel has
      let keyedNeighborCount = 0;
      if (x > 0 && keyedMask[idx - 1] === 1) keyedNeighborCount++;
      if (x < width - 1 && keyedMask[idx + 1] === 1) keyedNeighborCount++;
      if (y > 0 && keyedMask[idx - width] === 1) keyedNeighborCount++;
      if (y < height - 1 && keyedMask[idx + width] === 1) keyedNeighborCount++;

      if (keyedNeighborCount >= 2) {
        // Surrounded by keyed pixels — likely fringe, fade strongly
        data[idx * 4 + 3] = Math.round(a * 0.2);
      } else if (keyedNeighborCount === 1) {
        // Edge pixel next to one keyed pixel — gentle fade
        data[idx * 4 + 3] = Math.round(a * 0.6);
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
