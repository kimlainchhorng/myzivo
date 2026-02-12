/**
 * AnimatedDriverMarker Component
 * 
 * Smoothly animates driver position between GPS updates using CSS transitions.
 * Uses OverlayViewF for pixel-perfect positioning with heading rotation.
 * Includes teleport detection (>1 mile jump skips animation).
 */

import { useRef, useEffect, useState, memo } from "react";
import { OverlayViewF, OverlayView } from "@react-google-maps/api";
import { haversineMiles } from "@/services/mapsApi";

interface AnimatedDriverMarkerProps {
  position: google.maps.LatLngLiteral;
  heading?: number | null;
  isStale?: boolean;
  label?: string;
}

const TELEPORT_THRESHOLD_MILES = 1;

const AnimatedDriverMarker = memo(function AnimatedDriverMarker({
  position,
  heading = 0,
  isStale = false,
  label,
}: AnimatedDriverMarkerProps) {
  const prevPosition = useRef(position);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const prev = prevPosition.current;
    const dist = haversineMiles(prev.lat, prev.lng, position.lat, position.lng);

    // Skip animation for teleport (>1 mile) or first render
    setShouldAnimate(dist < TELEPORT_THRESHOLD_MILES && dist > 0.001);
    prevPosition.current = position;
  }, [position.lat, position.lng]);

  const rotation = heading ?? 0;

  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2"
        style={{
          transition: shouldAnimate
            ? "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)"
            : "none",
          zIndex: 200,
        }}
      >
        {/* Outer glow ring */}
        <div className="relative flex items-center justify-center w-14 h-14">
          {!isStale && (
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
          )}

          {/* Car icon container with heading rotation */}
          <div
            className="relative w-10 h-10 flex items-center justify-center"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 0.6s ease-out",
            }}
          >
            {/* Car SVG */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="4" width="20" height="24" rx="6" fill="white" />
              <rect x="8" y="6" width="16" height="8" rx="3" fill="#0b1220" />
              <rect x="8" y="20" width="16" height="4" rx="2" fill="#0b1220" opacity="0.5" />
              {/* Headlights */}
              <circle cx="10" cy="7" r="1.5" fill="#fbbf24" />
              <circle cx="22" cy="7" r="1.5" fill="#fbbf24" />
            </svg>
          </div>

          {/* Stale indicator */}
          {isStale && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 border-2 border-background flex items-center justify-center">
              <span className="text-[8px] font-bold text-black">!</span>
            </div>
          )}
        </div>

        {/* Optional label */}
        {label && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] font-medium bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-foreground border border-border/50">
              {label}
            </span>
          </div>
        )}
      </div>
    </OverlayViewF>
  );
});

export default AnimatedDriverMarker;
