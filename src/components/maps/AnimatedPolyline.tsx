/**
 * AnimatedPolyline Component
 * 
 * Progressively draws a route polyline from start to end using
 * requestAnimationFrame with easeOutCubic easing.
 */

import { useState, useEffect, useRef } from "react";
import { PolylineF } from "@react-google-maps/api";

interface AnimatedPolylineProps {
  path: google.maps.LatLngLiteral[];
  duration?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  geodesic?: boolean;
  showShadow?: boolean;
}

const AnimatedPolyline = ({
  path,
  duration = 800,
  strokeColor = "#10B981",
  strokeOpacity = 0.9,
  strokeWeight = 5,
  geodesic = true,
  showShadow = true,
}: AnimatedPolylineProps) => {
  const [visibleCount, setVisibleCount] = useState(2);
  const rafRef = useRef<number>();
  const pathRef = useRef(path);

  useEffect(() => {
    pathRef.current = path;
    setVisibleCount(2);

    const startTime = performance.now();
    const totalPoints = path.length;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const count = Math.max(2, Math.floor(eased * totalPoints));
      setVisibleCount(count);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [path, duration]);

  return (
    <>
      {/* Faint shadow of full path */}
      {showShadow && (
        <PolylineF
          path={path}
          options={{
            strokeColor,
            strokeOpacity: 0.15,
            strokeWeight: strokeWeight + 2,
            geodesic,
          }}
        />
      )}
      {/* Animated visible portion */}
      <PolylineF
        path={path.slice(0, visibleCount)}
        options={{
          strokeColor,
          strokeOpacity,
          strokeWeight,
          geodesic,
        }}
      />
    </>
  );
};

export default AnimatedPolyline;
