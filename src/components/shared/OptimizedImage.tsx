import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type AspectRatio = "16:9" | "4:3" | "1:1" | "3:2" | "21:9";

interface OptimizedImageProps {
  src: string;
  alt: string;
  /** Aspect ratio for container */
  aspectRatio?: AspectRatio;
  /** Explicit width for CLS prevention */
  width?: number;
  /** Explicit height for CLS prevention */
  height?: number;
  /** Loading strategy */
  loading?: "lazy" | "eager";
  /** Image container className */
  className?: string;
  /** Outer container className */
  containerClassName?: string;
  /** Fallback image on error */
  fallback?: string;
  /** Priority loading (preload + eager) */
  priority?: boolean;
  /** Responsive sizes attribute */
  sizes?: string;
  /** For Unsplash images - generates optimized srcset */
  generateSrcSet?: boolean;
  /** Custom srcset */
  srcSet?: string;
}

const aspectRatioMap: Record<AspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
  "21:9": "aspect-[21/9]",
};

const aspectRatioDimensions: Record<AspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "4:3": { width: 800, height: 600 },
  "1:1": { width: 400, height: 400 },
  "3:2": { width: 900, height: 600 },
  "21:9": { width: 1920, height: 823 },
};

/**
 * Generates optimized srcset for Unsplash images
 */
function generateUnsplashSrcSet(baseUrl: string, aspectRatio: AspectRatio): string {
  const widths = [320, 640, 800, 1024, 1440];
  const dims = aspectRatioDimensions[aspectRatio];
  const aspectValue = dims.width / dims.height;

  try {
    const url = new URL(baseUrl);
    const baseWithoutParams = `${url.origin}${url.pathname}`;

    return widths
      .map((w) => {
        const h = Math.round(w / aspectValue);
        return `${baseWithoutParams}?w=${w}&h=${h}&fit=crop&q=75&fm=webp&auto=format ${w}w`;
      })
      .join(", ");
  } catch {
    return "";
  }
}

/**
 * Optimizes Unsplash URL with WebP and quality settings
 */
function optimizeUnsplashUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    
    // Keep existing params but optimize
    if (!parsedUrl.searchParams.has("q")) {
      parsedUrl.searchParams.set("q", "75");
    }
    parsedUrl.searchParams.set("fm", "webp");
    parsedUrl.searchParams.set("auto", "format");
    
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

/**
 * OptimizedImage - Reusable image component with:
 * - Lazy loading with IntersectionObserver
 * - Aspect ratio enforcement (prevents CLS)
 * - Explicit width/height for layout stability
 * - WebP optimization for Unsplash images
 * - Responsive srcset generation
 * - Graceful error handling
 * 
 * @example
 * <OptimizedImage 
 *   src="https://images.unsplash.com/..." 
 *   alt="Travel destination"
 *   aspectRatio="4:3"
 *   width={400}
 *   height={300}
 *   generateSrcSet
 *   sizes="(max-width: 640px) 50vw, 300px"
 * />
 */
export function OptimizedImage({
  src,
  alt,
  aspectRatio = "16:9",
  width,
  height,
  loading = "lazy",
  className,
  containerClassName,
  fallback,
  priority = false,
  sizes,
  generateSrcSet = false,
  srcSet,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Compute dimensions
  const dims = aspectRatioDimensions[aspectRatio];
  const computedWidth = width || dims.width;
  const computedHeight = height || dims.height;

  // Optimize Unsplash URLs
  const isUnsplash = src.includes("images.unsplash.com");
  const optimizedSrc = isUnsplash ? optimizeUnsplashUrl(src) : src;
  
  // Generate srcset for Unsplash images
  const computedSrcSet = srcSet || (generateSrcSet && isUnsplash 
    ? generateUnsplashSrcSet(src, aspectRatio) 
    : undefined);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // IntersectionObserver for lazy loading optimization
  useEffect(() => {
    if (!priority && imgRef.current && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && imgRef.current) {
              imgRef.current.src = optimizedSrc;
              if (computedSrcSet) {
                imgRef.current.srcset = computedSrcSet;
              }
              observer.disconnect();
            }
          });
        },
        { rootMargin: "100px" }
      );

      if (loading === "lazy") {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }
  }, [optimizedSrc, priority, loading, computedSrcSet]);

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
      style={{
        aspectRatio: `${computedWidth}/${computedHeight}`,
      }}
    >
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      <img
        ref={imgRef}
        src={priority ? optimizedSrc : undefined}
        data-src={!priority ? optimizedSrc : undefined}
        srcSet={priority ? computedSrcSet : undefined}
        sizes={sizes}
        width={computedWidth}
        height={computedHeight}
        alt={alt}
        loading={priority ? "eager" : loading}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={{
          aspectRatio: `${computedWidth}/${computedHeight}`,
        }}
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
