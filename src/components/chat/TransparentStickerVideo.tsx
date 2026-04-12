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
 * Per-video BG color detection with very wide tolerances.
 */

const bgColorCache = new Map<string, Array<[number, number, number]>>();

function sampleBgColors(data: Uint8ClampedArray, w: number, h: number): Array<[number, number, number]> {
  const samples: Array<[number, number, number]> = [];
  
  const addPx = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = (y * w + x) * 4;
    if (idx + 2 < data.length) samples.push([data[idx], data[idx + 1], data[idx + 2]]);
  };

  // Sample outer 8-pixel border on all sides
  const border = Math.min(8, Math.floor(Math.min(w, h) / 4));
  for (let row = 0; row < border; row++) {
    for (let x = 0; x < w; x++) { addPx(x, row); addPx(x, h - 1 - row); }
  }
  for (let col = 0; col < border; col++) {
    for (let y = border; y < h - border; y++) { addPx(col, y); addPx(w - 1 - col, y); }
  }

  // Cluster
  const clusters: Array<[number, number, number, number]> = [];
  for (const [r, g, b] of samples) {
    let matched = false;
    for (const c of clusters) {
      if (Math.abs(r - c[0]) + Math.abs(g - c[1]) + Math.abs(b - c[2]) < 100) {
        c[0] = Math.round((c[0] * c[3] + r) / (c[3] + 1));
        c[1] = Math.round((c[1] * c[3] + g) / (c[3] + 1));
        c[2] = Math.round((c[2] * c[3] + b) / (c[3] + 1));
        c[3]++;
        matched = true;
        break;
      }
    }
    if (!matched && clusters.length < 12) clusters.push([r, g, b, 1]);
  }

  const minCount = Math.max(3, samples.length * 0.005);
  return clusters.filter(c => c[3] >= minCount).map(c => [c[0], c[1], c[2]] as [number, number, number]);
}

function applyChromaKey(frame: ImageData, videoSrc?: string) {
  const { data } = frame;
  const w = frame.width;
  const h = frame.height;
  const key = videoSrc || "__default__";

  if (!bgColorCache.has(key)) {
    bgColorCache.set(key, sampleBgColors(data, w, h));
  }
  const bgList = bgColorCache.get(key)!;

  const cx = w / 2;
  const cy = h / 2;
  const maxEdgeDist = Math.sqrt(cx * cx + cy * cy);

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    // Pixel position — center pixels are protected more
    const pixelIdx = index / 4;
    const px = pixelIdx % w;
    const py = Math.floor(pixelIdx / w);
    const edgeDist = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
    const edgeFactor = Math.min(1, edgeDist / (maxEdgeDist * 0.55)); // 0 at center, 1 at edges

    // --- Adaptive BG removal with center protection ---
    let removed = false;
    for (const bg of bgList) {
      const dr = red - bg[0], dg = green - bg[1], db = blue - bg[2];
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      // Thresholds scale by edge proximity: aggressive at edges, conservative at center
      const hardDist = 50 + edgeFactor * 40; // 50 center → 90 edges
      const softDist = 90 + edgeFactor * 50; // 90 center → 140 edges

      if (dist < hardDist) {
        data[index + 3] = 0;
        removed = true;
        break;
      }
      if (dist < softDist) {
        const t = (dist - hardDist) / (softDist - hardDist);
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * t * t));
        removed = true;
        break;
      }
    }
    if (removed) continue;

    const maxC = Math.max(red, green, blue);
    const minC = Math.min(red, green, blue);
    const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
    const brightness = (red + green + blue) / 3;

    // Green-dominant — only at edges or very strong green
    const greenThreshold = 1.15 + (1 - edgeFactor) * 0.2; // stricter at center
    if (green > 60 && green > red * 1.2 && green > blue * 1.15 && sat > 0.3) {
      const gd = green / Math.max(1, (red + blue) / 2);
      if (gd > greenThreshold + 0.2) { data[index + 3] = 0; continue; }
      if (gd > greenThreshold) {
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - (gd - greenThreshold) / 0.2)));
        continue;
      }
    }

    // Blue/Cyan-dominant — only at edges or very strong blue
    if (blue > 60 && blue > red * 1.2 && sat > 0.3) {
      const bd = blue / Math.max(1, (red + green) / 2);
      if (bd > greenThreshold + 0.2) { data[index + 3] = 0; continue; }
      if (bd > greenThreshold) {
        data[index + 3] = Math.min(data[index + 3], Math.round(255 * (1 - (bd - greenThreshold) / 0.2)));
        continue;
      }
    }

    // White / light key
    const variance = maxC - minC;
    if (brightness >= 238 && variance <= 20) {
      data[index + 3] = 0;
      continue;
    }
    if (brightness >= 220 && variance <= 20) {
      const bf = (brightness - 220) / 18;
      const vf = 1 - variance / 20;
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
      applyChromaKey(frame, src);
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
