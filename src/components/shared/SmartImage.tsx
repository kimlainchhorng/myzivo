/**
 * SmartImage — wraps <img> with a skeleton, lazy/async loading,
 * and a branded fallback when the source fails or is missing.
 *
 * Replaces raw <img> in card grids so broken URLs render a clean
 * gradient placeholder instead of the browser's "?" icon.
 */
import { useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "loading" | "decoding"> {
  src?: string | null;
  alt: string;
  /** Element rendered when the image is missing or fails to load. */
  fallback?: ReactNode;
  /** Hide the shimmer skeleton (e.g. for already-cached avatars). */
  noSkeleton?: boolean;
  /** Force eager loading for above-the-fold LCP images. */
  eager?: boolean;
  className?: string;
  wrapperClassName?: string;
}

export function SmartImage({
  src,
  alt,
  fallback,
  noSkeleton,
  eager,
  className,
  wrapperClassName,
  ...rest
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const showFallback = !src || errored;

  return (
    <div className={cn("absolute inset-0 w-full h-full overflow-hidden bg-muted", wrapperClassName)}>
      {!loaded && !showFallback && !noSkeleton && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/60 to-muted animate-pulse" />
      )}
      {showFallback ? (
        fallback ?? (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />
        )
      ) : (
        <img
          {...rest}
          src={src!}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
        />
      )}
    </div>
  );
}

export default SmartImage;
