/**
 * Airline Logo Component with Fallback Chain
 * Tries multiple sources before showing default icon
 */

import { useState, useCallback, memo, useEffect, forwardRef } from 'react';
import { Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLogoFallbackChain, type AirHexSize } from '@/lib/airlineLogo';

interface AirlineLogoProps {
  iataCode: string;
  airlineName?: string;
  size?: number;
  className?: string;
  showFallbackIcon?: boolean;
}

const AirlineLogoComponent = forwardRef<HTMLDivElement, AirlineLogoProps>(function AirlineLogoComponent({
  iataCode,
  airlineName,
  size = 48,
  className,
  showFallbackIcon = true,
}, ref) {
  const normalizedCode = iataCode?.trim().toUpperCase() || '';

  const getAirHexSize = (displaySize: number): AirHexSize => {
    if (displaySize <= 32) return 32;
    if (displaySize <= 64) return 64;
    if (displaySize <= 100) return 100;
    return 200;
  };

  const airHexSize = getAirHexSize(size);
  const fallbackChain = normalizedCode ? getLogoFallbackChain(normalizedCode, airHexSize) : [];

  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [showIcon, setShowIcon] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setFallbackIndex(0);
    setShowIcon(!normalizedCode);
    setImageLoaded(false);
  }, [normalizedCode]);

  const currentSrc = fallbackChain[fallbackIndex];

  const handleError = useCallback(() => {
    setImageLoaded(false);

    if (fallbackIndex < fallbackChain.length - 1) {
      setFallbackIndex((prev) => prev + 1);
      return;
    }

    setShowIcon(true);
  }, [fallbackIndex, fallbackChain.length]);

  const fallbackContent = showFallbackIcon ? (
    <Plane
      className="text-[hsl(var(--flights))]"
      style={{ width: size * 0.5, height: size * 0.5 }}
    />
  ) : (
    <span
      className="font-bold text-[hsl(var(--flights))]"
      style={{ fontSize: size * 0.35 }}
    >
      {normalizedCode || 'FL'}
    </span>
  );

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-lg border border-border/20 bg-card',
        className
      )}
      style={{ width: size, height: size }}
      title={airlineName || normalizedCode}
      aria-label={airlineName || `${normalizedCode} airline logo`}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-card">
        {fallbackContent}
      </div>

      {!showIcon && currentSrc && (
        <img
          src={currentSrc}
          alt={airlineName || `${normalizedCode} airline logo`}
          className={cn(
            'relative z-10 h-full w-full object-contain p-0.5 transition-opacity duration-200',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={handleError}
        />
      )}
    </div>
  );
});

export const AirlineLogo = memo(AirlineLogoComponent);

export default AirlineLogo;
