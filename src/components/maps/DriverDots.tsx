/**
 * DriverDots Component
 * 
 * Animated overlay showing simulated nearby drivers around pickup location.
 * Creates Uber-style "cars around you" effect with drifting dots.
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { OverlayViewF, OverlayView } from "@react-google-maps/api";

interface DriverDotsProps {
  center: google.maps.LatLngLiteral;
  count?: number;
  radiusMeters?: number;
}

interface DriverDot {
  id: number;
  position: google.maps.LatLngLiteral;
  rotation: number;
}

// Convert meters to degrees (approximate)
const metersToLat = (meters: number) => meters / 111320;
const metersToLng = (meters: number, lat: number) => 
  meters / (111320 * Math.cos(lat * (Math.PI / 180)));

// Generate random position within radius
function randomPositionInRadius(
  center: google.maps.LatLngLiteral,
  radiusMeters: number
): google.maps.LatLngLiteral {
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusMeters;
  
  const latOffset = metersToLat(distance * Math.cos(angle));
  const lngOffset = metersToLng(distance * Math.sin(angle), center.lat);
  
  return {
    lat: center.lat + latOffset,
    lng: center.lng + lngOffset,
  };
}

// Generate initial dots
function generateDots(
  center: google.maps.LatLngLiteral,
  count: number,
  radiusMeters: number
): DriverDot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    position: randomPositionInRadius(center, radiusMeters),
    rotation: Math.random() * 360,
  }));
}

export default function DriverDots({ 
  center, 
  count = 20, 
  radiusMeters = 1000 
}: DriverDotsProps) {
  // Memoize initial positions based on center
  const initialDots = useMemo(
    () => generateDots(center, count, radiusMeters),
    // Only regenerate when center changes significantly (round to 3 decimals)
    [Math.round(center.lat * 1000), Math.round(center.lng * 1000), count, radiusMeters]
  );

  const [dots, setDots] = useState<DriverDot[]>(initialDots);

  // Drift dots slowly every 2-3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => 
        prevDots.map(dot => {
          // Small random drift
          const driftMeters = 20 + Math.random() * 30; // 20-50 meters
          const angle = Math.random() * 2 * Math.PI;
          
          const latOffset = metersToLat(driftMeters * Math.cos(angle));
          const lngOffset = metersToLng(driftMeters * Math.sin(angle), dot.position.lat);
          
          // Keep within radius of center
          const newPos = {
            lat: dot.position.lat + latOffset,
            lng: dot.position.lng + lngOffset,
          };
          
          // Check if still within radius
          const distLat = (newPos.lat - center.lat) * 111320;
          const distLng = (newPos.lng - center.lng) * 111320 * Math.cos(center.lat * (Math.PI / 180));
          const dist = Math.sqrt(distLat * distLat + distLng * distLng);
          
          // If outside radius, reset to random position in radius
          if (dist > radiusMeters) {
            return {
              ...dot,
              position: randomPositionInRadius(center, radiusMeters),
              rotation: Math.random() * 360,
            };
          }
          
          return {
            ...dot,
            position: newPos,
            rotation: dot.rotation + (Math.random() - 0.5) * 30, // Slight rotation change
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [center, radiusMeters]);

  // Update dots when center changes
  useEffect(() => {
    setDots(generateDots(center, count, radiusMeters));
  }, [Math.round(center.lat * 1000), Math.round(center.lng * 1000), count, radiusMeters]);

  return (
    <>
      {dots.map(dot => (
        <OverlayViewF
          key={dot.id}
          position={dot.position}
          mapPaneName={OverlayView.OVERLAY_LAYER}
        >
          <div 
            className="w-4 h-4 bg-white/90 rounded shadow-md flex items-center justify-center transition-transform duration-1000 ease-out"
            style={{ 
              transform: `translate(-50%, -50%) rotate(${dot.rotation}deg)`,
            }}
          >
            {/* Car indicator */}
            <div className="w-2 h-1.5 bg-zinc-700 rounded-sm" />
          </div>
        </OverlayViewF>
      ))}
    </>
  );
}
