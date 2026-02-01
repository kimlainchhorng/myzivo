/**
 * PerformantHeroImage
 * Optimized hero image component for above-the-fold content
 * - Preloads image via link injection
 * - Uses eager loading + fetchpriority="high"
 * - Prevents CLS with explicit dimensions
 * - Blur placeholder while loading
 */

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useImagePreload } from "@/hooks/useImagePreload";

interface PerformantHeroImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Additional CSS classes for the image */
  className?: string;
  /** Container CSS classes */
  containerClassName?: string;
  /** Aspect ratio - defaults to 16:9 */
  aspectRatio?: "16:9" | "21:9" | "4:3" | "3:2";
  /** Whether to preload (default: true for hero images) */
  preload?: boolean;
  /** Overlay gradient class */
  overlayClassName?: string;
  /** Callback when image loads */
  onLoad?: () => void;
}

const aspectRatioClasses = {
  "16:9": "aspect-video",
  "21:9": "aspect-[21/9]",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
};

const aspectRatioDimensions = {
  "16:9": { width: 1920, height: 1080 },
  "21:9": { width: 1920, height: 823 },
  "4:3": { width: 1920, height: 1440 },
  "3:2": { width: 1920, height: 1280 },
};

export function PerformantHeroImage({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = "16:9",
  preload = true,
  overlayClassName,
  onLoad,
}: PerformantHeroImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const dimensions = aspectRatioDimensions[aspectRatio];

  // Preload hero image for LCP optimization
  useImagePreload({ src, enabled: preload });

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Blur placeholder / loading state */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Hero Image - always eager load with high priority */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={{
          aspectRatio: `${dimensions.width}/${dimensions.height}`,
        }}
      />

      {/* Optional overlay */}
      {overlayClassName && (
        <div 
          className={cn("absolute inset-0", overlayClassName)}
          aria-hidden="true"
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
}

export default PerformantHeroImage;
