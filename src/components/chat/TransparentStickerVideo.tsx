/**
 * TransparentStickerVideo — removes white background from sticker MP4s
 * Uses CSS mix-blend-mode: multiply (GPU-accelerated, zero CPU cost).
 * White pixels become transparent against any background.
 * No backing div needed — the blend works against the natural parent background.
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
      preload="auto"
      onError={() => setError(true)}
    />
  );
}

export default TransparentStickerVideo;
