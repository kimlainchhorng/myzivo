/**
 * Airline Logo Component with Fallback Chain
 * Tries multiple sources before showing default icon
 */

import { useState, useCallback, memo, useEffect } from 'react';
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

function AirlineLogoComponent({
  iataCode,
  airlineName,
  size = 48,
  className,
  showFallbackIcon = true,
}: AirlineLogoProps) {
  const getAirHexSize = (displaySize: number): AirHexSize => {
    if (displaySize <= 32) return 32;
    if (displaySize <= 64) return 64;
    if (displaySize <= 100) return 100;
    return 200;
  };

  const airHexSize = getAirHexSize(size);
  const fallbackChain = getLogoFallbackChain(iataCode, airHexSize);
  
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [showIcon, setShowIcon] = useState(false);

  // Reset state when iataCode changes
  useEffect(() => {
    setFallbackIndex(0);
    setShowIcon(false);
  }, [iataCode]);
  
  const currentSrc = fallbackChain[fallbackIndex];
  
  const handleError = useCallback(() => {
    if (fallbackIndex < fallbackChain.length - 1) {
      setFallbackIndex((prev) => prev + 1);
    } else {
      setShowIcon(true);
    }
  }, [fallbackIndex, fallbackChain.length]);

  if (showIcon) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-white border border-border/20',
          className
        )}
        style={{ width: size, height: size }}
        title={airlineName || iataCode}
      >
        {showFallbackIcon ? (
          <Plane 
            className="text-[hsl(var(--flights))]" 
            style={{ width: size * 0.5, height: size * 0.5 }} 
          />
        ) : (
          <span 
            className="font-bold text-[hsl(var(--flights))]"
            style={{ fontSize: size * 0.35 }}
          >
            {iataCode}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-lg bg-white',
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={currentSrc}
        alt={airlineName || `${iataCode} airline logo`}
        className="w-full h-full object-contain p-0.5"
        loading="lazy"
        onError={handleError}
      />
    </div>
  );
}

export const AirlineLogo = memo(AirlineLogoComponent);

export default AirlineLogo;
