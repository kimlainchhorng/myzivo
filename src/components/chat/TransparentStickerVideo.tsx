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
  const w = frame.width;
  const h = frame.height;

  // --- Dense edge sampling: top/bottom rows fully + left/right cols ---
  const edgePixels: number[] = [];
  // Top 3 rows & bottom 3 rows (full width)
  for (let row = 0; row < 3; row++) {
    for (let x = 0; x < w; x += 2) {
      edgePixels.push((row * w + x) * 4);
      edgePixels.push(((h - 1 - row) * w + x) * 4);
    }
  }
  // Left 3 cols & right 3 cols
  for (let col = 0; col < 3; col++) {
    for (let y = 0; y < h; y += 2) {
      edgePixels.push((y * w + col) * 4);
      edgePixels.push((y * w + w - 1 - col) * 4);
    }
  }

  // Cluster BG colors
  const bgColors: Array<[number, number, number, number]> = [];
  for (const idx of edgePixels) {
    if (idx < 0 || idx + 2 >= data.length) continue;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    let matched = false;
    for (const c of bgColors) {
      const d = Math.abs(r - c[0]) + Math.abs(g - c[1]) + Math.abs(b - c[2]);
      if (d < 80) {
        c[0] = Math.round((c[0] * c[3] + r) / (c[3] + 1));
        c[1] = Math.round((c[1] * c[3] + g) / (c[3] + 1));
        c[2] = Math.round((c[2] * c[3] + b) / (c[3] + 1));
        c[3]++;
        matched = true;
        break;
      }
    }
    if (!matched && bgColors.length < 10) bgColors.push([r, g, b, 1]);
  }

  // Valid BG clusters (minimum 5 edge pixels)
  const validBg = bgColors.filter(c => c[3] >= 5);

  // Hard/soft distance thresholds — aggressive to catch sparkles/particles
  const HARD_DIST = 72;
  const SOFT_DIST = 130;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const maxC = Math.max(red, green, blue);
    const variance = maxC - Math.min(red, green, blue);
    const brightness = (red + green + blue) / 3;

    // --- Adaptive BG color removal ---
    let removed = false;
    for (const bg of validBg) {
      const dr = red - bg[0], dg = green - bg[1], db = blue - bg[2];
      const colorDist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (colorDist < HARD_DIST) {
        data[index + 3] = 0;
        removed = true;
        break;
      }
      if (colorDist < SOFT_DIST) {
        const fade = 1 - (colorDist - HARD_DIST) / (SOFT_DIST - HARD_DIST);
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - fade * fade)));
        removed = true;
        break;
      }
    }
    if (removed) continue;

    // --- Green screen keying ---
    if (green > 60 && green > red * 1.2 && green > blue * 1.15) {
      const gd = green / Math.max(1, (red + blue) / 2);
      if (gd > 1.35) { data[index + 3] = 0; continue; }
      if (gd > 1.1) {
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - (gd - 1.1) / 0.25)));
        continue;
      }
    }

    // --- Blue / Cyan keying ---
    if (blue > 60 && blue > red * 1.2 && blue >= green * 0.8) {
      const bd = blue / Math.max(1, (red + green) / 2);
      if (bd > 1.35) { data[index + 3] = 0; continue; }
      if (bd > 1.1) {
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - (bd - 1.1) / 0.25)));
        continue;
      }
    }

    // --- White / light gray key ---
    if (brightness >= HARD_KEY_BRIGHTNESS && variance <= MAX_NEUTRAL_VARIANCE) {
      data[index + 3] = 0;
      continue;
    }
    if (brightness < SOFT_KEY_BRIGHTNESS || variance > MAX_NEUTRAL_VARIANCE) continue;

    const bf = (brightness - SOFT_KEY_BRIGHTNESS) / (HARD_KEY_BRIGHTNESS - SOFT_KEY_BRIGHTNESS);
    const vf = 1 - variance / MAX_NEUTRAL_VARIANCE;
    data[index + 3] = Math.min(data[index + 3], Math.max(0, Math.round(255 * (1 - bf * vf))));
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
