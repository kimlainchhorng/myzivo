import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: (now: number, metadata: unknown) => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

interface TransparentStickerVideoProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  threshold?: number;
  softness?: number;
}

export function TransparentStickerVideo({
  src,
  alt = "",
  className,
  fallbackSrc,
  threshold = 224,
  softness = 20,
}: TransparentStickerVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameHandleRef = useRef<number | null>(null);
  const rafHandleRef = useRef<number | null>(null);
  const [shouldFallback, setShouldFallback] = useState(false);

  useEffect(() => {
    setShouldFallback(false);
  }, [src, fallbackSrc]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current as VideoWithFrameCallback | null;

    if (!container || !canvas || !video || shouldFallback) {
      return;
    }

    let disposed = false;
    const context = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });

    if (!context) {
      setShouldFallback(true);
      return;
    }

    context.imageSmoothingEnabled = true;

    const stopRendering = () => {
      if (frameHandleRef.current !== null && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(frameHandleRef.current);
      }

      if (rafHandleRef.current !== null) {
        cancelAnimationFrame(rafHandleRef.current);
      }

      frameHandleRef.current = null;
      rafHandleRef.current = null;
    };

    const syncCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const nextWidth = Math.max(1, Math.round(container.clientWidth * dpr));
      const nextHeight = Math.max(1, Math.round(container.clientHeight * dpr));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
    };

    const processFrame = () => {
      if (disposed || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      syncCanvasSize();
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      let frame: ImageData;

      try {
        frame = context.getImageData(0, 0, canvas.width, canvas.height);
      } catch {
        stopRendering();
        setShouldFallback(true);
        return;
      }

      const { data } = frame;
      const width = canvas.width;
      const height = canvas.height;
      const totalPixels = width * height;
      const visited = new Uint8Array(totalPixels);
      const queue: number[] = [];

      const enqueueIfBackground = (pixelIndex: number) => {
        if (pixelIndex < 0 || pixelIndex >= totalPixels || visited[pixelIndex]) {
          return;
        }

        const offset = pixelIndex * 4;
        const alpha = data[offset + 3];
        if (alpha === 0) {
          return;
        }

        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        if (min < threshold || max - min > 42) {
          return;
        }

        visited[pixelIndex] = 1;
        queue.push(pixelIndex);
      };

      for (let x = 0; x < width; x += 1) {
        enqueueIfBackground(x);
        enqueueIfBackground((height - 1) * width + x);
      }

      for (let y = 0; y < height; y += 1) {
        enqueueIfBackground(y * width);
        enqueueIfBackground(y * width + (width - 1));
      }

      while (queue.length > 0) {
        const pixelIndex = queue.pop()!;
        const offset = pixelIndex * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const distanceFromWhite = Math.max(255 - r, 255 - g, 255 - b);
        const nextAlpha = Math.round(Math.min(255, (distanceFromWhite / softness) * 255));
        data[offset + 3] = Math.min(data[offset + 3], nextAlpha);

        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);

        if (x > 0) enqueueIfBackground(pixelIndex - 1);
        if (x < width - 1) enqueueIfBackground(pixelIndex + 1);
        if (y > 0) enqueueIfBackground(pixelIndex - width);
        if (y < height - 1) enqueueIfBackground(pixelIndex + width);
      }

      context.putImageData(frame, 0, 0);
    };

    const scheduleNextFrame = () => {
      if (disposed) {
        return;
      }

      if (video.requestVideoFrameCallback) {
        frameHandleRef.current = video.requestVideoFrameCallback(() => {
          processFrame();
          scheduleNextFrame();
        });
        return;
      }

      rafHandleRef.current = requestAnimationFrame(() => {
        processFrame();
        scheduleNextFrame();
      });
    };

    const startRendering = () => {
      stopRendering();
      processFrame();
      scheduleNextFrame();
    };

    const handleLoadedData = () => {
      syncCanvasSize();
      processFrame();
    };

    const handlePlay = () => {
      startRendering();
    };

    const handleError = () => {
      stopRendering();
      setShouldFallback(true);
    };

    syncCanvasSize();
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("play", handlePlay);
    video.addEventListener("error", handleError);

    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          processFrame();
        })
      : null;

    resizeObserver?.observe(container);

    if (video.paused) {
      void video.play().catch(() => {
        // Ignore autoplay rejections; the fallback image still covers failures.
      });
    } else {
      startRendering();
    }

    return () => {
      disposed = true;
      stopRendering();
      resizeObserver?.disconnect();
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("error", handleError);
    };
  }, [shouldFallback, softness, src, threshold]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {shouldFallback ? (
        fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt={alt}
            className={cn("h-full w-full object-contain pointer-events-none", className)}
            loading="lazy"
          />
        ) : (
          <video
            src={src}
            className={cn("h-full w-full object-contain pointer-events-none", className)}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        )
      ) : (
        <>
          <video
            ref={videoRef}
            src={src}
            className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            crossOrigin="anonymous"
          />
          <canvas
            ref={canvasRef}
            className={cn("block h-full w-full pointer-events-none", className)}
          />
        </>
      )}
    </div>
  );
}

export default TransparentStickerVideo;
