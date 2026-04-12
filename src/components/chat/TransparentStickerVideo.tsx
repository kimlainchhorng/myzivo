/**
 * TransparentStickerVideo — renders sticker MP4s without the baked white matte.
 * Default mode keeps the lightweight CSS blend behavior.
 * Chroma mode draws video frames to canvas and keys out near-white pixels for
 * reliable floating stickers inside transformed layouts.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TransparentStickerVideoMode = "blend" | "chroma";

/**
 * Aggressive chroma keyer for AI-generated sticker videos.
 * 
 * Strategy: Sample the first frame's edges to learn BG colors, then cache
 * and reuse for all subsequent frames. Very wide tolerance to handle
 * gradients, sparkles, and particles in AI-generated backgrounds.
 */

let cachedBgColors: Array<[number, number, number]> | null = null;
let cachedSrc = "";

function sampleBgColors(data: Uint8ClampedArray, w: number, h: number): Array<[number, number, number]> {
  const samples: Array<[number, number, number]> = [];
  
  // Sample top 5 rows, bottom 5 rows, left 5 cols, right 5 cols — very dense
  const addSample = (x: number, y: number) => {
    const idx = (y * w + x) * 4;
    if (idx >= 0 && idx + 2 < data.length) {
      samples.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
  };

  for (let row = 0; row < Math.min(5, h); row++) {
    for (let x = 0; x < w; x++) { addSample(x, row); addSample(x, h - 1 - row); }
  }
  for (let col = 0; col < Math.min(5, w); col++) {
    for (let y = 5; y < h - 5; y++) { addSample(col, y); addSample(w - 1 - col, y); }
  }

  // Cluster into up to 8 BG colors
  const clusters: Array<[number, number, number, number]> = []; // r,g,b,count
  for (const [r, g, b] of samples) {
    let matched = false;
    for (const c of clusters) {
      const d = Math.abs(r - c[0]) + Math.abs(g - c[1]) + Math.abs(b - c[2]);
      if (d < 90) {
        c[0] = Math.round((c[0] * c[3] + r) / (c[3] + 1));
        c[1] = Math.round((c[1] * c[3] + g) / (c[3] + 1));
        c[2] = Math.round((c[2] * c[3] + b) / (c[3] + 1));
        c[3]++;
        matched = true;
        break;
      }
    }
    if (!matched && clusters.length < 8) clusters.push([r, g, b, 1]);
  }

  // Only keep clusters seen in at least 1% of edge pixels
  const minCount = Math.max(5, samples.length * 0.01);
  return clusters.filter(c => c[3] >= minCount).map(c => [c[0], c[1], c[2]]);
}

function applyChromaKey(frame: ImageData, videoSrc?: string) {
  const { data } = frame;
  const w = frame.width;
  const h = frame.height;

  // Cache BG colors per video source
  if (!cachedBgColors || (videoSrc && videoSrc !== cachedSrc)) {
    cachedBgColors = sampleBgColors(data, w, h);
    cachedSrc = videoSrc || "";
  }

  const bgList = cachedBgColors;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    // --- Adaptive BG removal with wide tolerance ---
    let removed = false;
    for (const bg of bgList) {
      const dr = red - bg[0], dg = green - bg[1], db = blue - bg[2];
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist < 80) {
        data[index + 3] = 0;
        removed = true;
        break;
      }
      if (dist < 140) {
        const t = (dist - 80) / 60; // 0..1
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * t * t));
        removed = true;
        break;
      }
    }
    if (removed) continue;

    // --- Saturation-aware: any very vivid non-brown/non-skin pixel ---
    const maxC = Math.max(red, green, blue);
    const minC = Math.min(red, green, blue);
    const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
    const brightness = (red + green + blue) / 3;

    // Green-dominant
    if (green > 55 && green > red * 1.15 && green > blue * 1.1 && sat > 0.3) {
      const gd = green / Math.max(1, (red + blue) / 2);
      if (gd > 1.3) { data[index + 3] = 0; continue; }
      if (gd > 1.05) {
        const t = (gd - 1.05) / 0.25;
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - t)));
        continue;
      }
    }

    // Blue/Cyan-dominant
    if (blue > 55 && blue > red * 1.15 && sat > 0.3) {
      const bd = blue / Math.max(1, (red + green) / 2);
      if (bd > 1.3) { data[index + 3] = 0; continue; }
      if (bd > 1.05) {
        const t = (bd - 1.05) / 0.25;
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - t)));
        continue;
      }
    }

    // --- White / light key ---
    const variance = maxC - minC;
    if (brightness >= 235 && variance <= 22) {
      data[index + 3] = 0;
      continue;
    }
    if (brightness >= 215 && variance <= 22) {
      const bf = (brightness - 215) / 20;
      const vf = 1 - variance / 22;
      data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - bf * vf)));
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
