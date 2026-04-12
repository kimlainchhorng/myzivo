/**
 * TransparentStickerVideo — renders sticker MP4s without the baked white matte.
 * Default mode keeps the lightweight CSS blend behavior.
 * Chroma mode draws video frames to canvas and keys out near-white pixels for
 * reliable floating stickers inside transformed layouts.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TransparentStickerVideoMode = "blend" | "chroma";

const HARD_KEY_BRIGHTNESS = 242;
const SOFT_KEY_BRIGHTNESS = 228;
const MAX_NEUTRAL_VARIANCE = 20;

/**
 * Chroma keyer — removes green, blue/cyan, and white backgrounds.
 * Carefully tuned to preserve colorful sticker art while removing solid BG.
 */
function applyChromaKey(frame: ImageData) {
  const { data } = frame;

  // --- Edge-aware: sample corners to detect dominant BG color ---
  const w = frame.width;
  const h = frame.height;
  const cornerSamples = [
    0, // top-left
    (w - 1) * 4, // top-right
    (h - 1) * w * 4, // bottom-left
    ((h - 1) * w + (w - 1)) * 4, // bottom-right
    Math.floor(w / 2) * 4, // top-center
    ((h - 1) * w + Math.floor(w / 2)) * 4, // bottom-center
  ];

  let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
  for (const idx of cornerSamples) {
    if (idx >= 0 && idx + 2 < data.length) {
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
      bgCount++;
    }
  }
  if (bgCount > 0) {
    bgR = Math.round(bgR / bgCount);
    bgG = Math.round(bgG / bgCount);
    bgB = Math.round(bgB / bgCount);
  }

  const bgBrightness = (bgR + bgG + bgB) / 3;
  const bgMaxC = Math.max(bgR, bgG, bgB);
  const bgMinC = Math.min(bgR, bgG, bgB);
  const bgSaturation = bgMaxC > 0 ? (bgMaxC - bgMinC) / bgMaxC : 0;
  const hasBgColor = bgSaturation > 0.25 && bgBrightness > 40;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    const maxC = Math.max(red, green, blue);
    const minC = Math.min(red, green, blue);
    const variance = maxC - minC;
    const brightness = (red + green + blue) / 3;

    // --- Detected BG color keying (adaptive) ---
    if (hasBgColor) {
      const distR = Math.abs(red - bgR);
      const distG = Math.abs(green - bgG);
      const distB = Math.abs(blue - bgB);
      const colorDist = Math.sqrt(distR * distR + distG * distG + distB * distB);

      if (colorDist < 45) {
        data[index + 3] = 0;
        continue;
      }
      if (colorDist < 80) {
        const fade = 1 - (colorDist - 45) / (80 - 45);
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - fade)));
        continue;
      }
    }

    // --- Green screen keying ---
    if (green > 70 && green > red * 1.35 && green > blue * 1.3) {
      const greenDominance = green / Math.max(1, (red + blue) / 2);
      if (greenDominance > 1.5) {
        data[index + 3] = 0;
        continue;
      }
      if (greenDominance > 1.2) {
        const fade = (greenDominance - 1.2) / (1.5 - 1.2);
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - fade)));
        continue;
      }
    }

    // --- Blue / Cyan screen keying ---
    if (blue > 70 && blue > red * 1.35 && blue >= green * 0.9) {
      const blueDominance = blue / Math.max(1, (red + green) / 2);
      if (blueDominance > 1.5) {
        data[index + 3] = 0;
        continue;
      }
      if (blueDominance > 1.2) {
        const fade = (blueDominance - 1.2) / (1.5 - 1.2);
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - fade)));
        continue;
      }
    }

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
}

interface TransparentStickerVideoProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  preload?: "none" | "metadata" | "auto";
  renderMode?: TransparentStickerVideoMode;
}

export function TransparentStickerVideo({
  src,
  alt = "",
  className,
  fallbackSrc,
  preload = "auto",
  renderMode = "blend",
}: TransparentStickerVideoProps) {
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error || renderMode !== "chroma") return;

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
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      applyChromaKey(frame);
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
  }, [error, renderMode, src]);

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
          autoPlay
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
