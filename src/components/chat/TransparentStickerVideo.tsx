/**
 * TransparentStickerVideo — removes white background from sticker MP4s
 * Uses CSS mix-blend-mode (GPU-accelerated, zero CPU cost) instead of canvas pixel processing.
 * On light themes: multiply blend hides white naturally.
 * On dark themes: a white backing container + multiply blend achieves the same effect.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TransparentStickerVideoProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
}

export function TransparentStickerVideo({
  src,
  alt = "",
  className,
  fallbackSrc,
}: TransparentStickerVideoProps) {
  const [error, setError] = useState(false);

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

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {/* White backing for dark mode — multiply blend needs a white base */}
      <div className="absolute inset-[4%] rounded-2xl bg-white dark:bg-white" />
      <video
        src={src}
        className={cn(
          "relative h-full w-full object-contain pointer-events-none mix-blend-multiply",
          className
        )}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onError={() => setError(true)}
      />
    </div>
  );
}

export default TransparentStickerVideo;
