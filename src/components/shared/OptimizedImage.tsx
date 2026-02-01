import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type AspectRatio = "16:9" | "4:3" | "1:1" | "3:2" | "21:9";

interface OptimizedImageProps {
  src: string;
  alt: string;
  aspectRatio?: AspectRatio;
  loading?: "lazy" | "eager";
  className?: string;
  containerClassName?: string;
  fallback?: string;
  priority?: boolean;
}

const aspectRatioMap: Record<AspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
  "21:9": "aspect-[21/9]",
};

/**
 * OptimizedImage - Reusable image component with lazy loading,
 * aspect ratio enforcement, and graceful error handling.
 * 
 * @example
 * <OptimizedImage 
 *   src={heroImage} 
 *   alt="ZIVO Flights - Airplane at sunset"
 *   aspectRatio="16:9"
 *   priority
 * />
 */
export function OptimizedImage({
  src,
  alt,
  aspectRatio = "16:9",
  loading = "lazy",
  className,
  containerClassName,
  fallback,
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Handle intersection observer for lazy loading optimization
  useEffect(() => {
    if (!priority && imgRef.current && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && imgRef.current) {
              imgRef.current.src = src;
              observer.disconnect();
            }
          });
        },
        { rootMargin: "50px" }
      );

      if (loading === "lazy") {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }
  }, [src, priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    if (fallback && imgRef.current) {
      imgRef.current.src = fallback;
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatioMap[aspectRatio],
        containerClassName
      )}
    >
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      <img
        ref={imgRef}
        src={priority ? src : undefined}
        data-src={!priority ? src : undefined}
        alt={alt}
        loading={priority ? "eager" : loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
      />

      {/* Error state */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
