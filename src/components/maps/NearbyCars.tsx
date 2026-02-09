/**
 * NearbyCars Component
 * 
 * Uber-style animated car markers around pickup location.
 * Replaces DriverDots with realistic top-down car SVG icons.
 */

import { useState, useEffect, useMemo } from "react";
import { OverlayViewF, OverlayView } from "@react-google-maps/api";

interface NearbyCarsProps {
  center: google.maps.LatLngLiteral;
  count?: number;
  radiusMeters?: number;
}

interface CarPosition extends google.maps.LatLngLiteral {
  rot: number;
}

// Uber-style white car SVG with shadow
function CarSvg({ rotation }: { rotation: number }) {
  return (
    <svg 
      width="24" 
      height="36" 
      viewBox="0 0 24 36" 
      style={{ 
        transform: `rotate(${rotation}deg)`,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
      }}
    >
      {/* Shadow base */}
      <ellipse cx="12" cy="34" rx="8" ry="2" fill="rgba(0,0,0,0.15)" />
      {/* Car body - white like Uber */}
      <rect x="4" y="4" width="16" height="26" rx="5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
      {/* Front windshield */}
      <rect x="6" y="8" width="12" height="7" rx="2" fill="#94a3b8" />
      {/* Rear window */}
      <rect x="6" y="22" width="12" height="5" rx="1.5" fill="#94a3b8" />
      {/* Headlights */}
      <rect x="6" y="4" width="4" height="2" rx="1" fill="#fef08a" />
      <rect x="14" y="4" width="4" height="2" rx="1" fill="#fef08a" />
    </svg>
  );
}

// Generate random position within radius of center
function randomAround(center: google.maps.LatLngLiteral, radiusMeters: number): CarPosition {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radiusMeters;
  
  const dLat = (distance / 111320) * Math.cos(angle);
  const dLng = (distance / (111320 * Math.cos((center.lat * Math.PI) / 180))) * Math.sin(angle);
  
  return {
    lat: center.lat + dLat,
    lng: center.lng + dLng,
    rot: Math.random() * 360,
  };
}

// Generate initial car positions
function generateCars(center: google.maps.LatLngLiteral, count: number, radiusMeters: number): CarPosition[] {
  return Array.from({ length: count }, () => randomAround(center, radiusMeters));
}

export default function NearbyCars({ 
  center, 
  count = 12, 
  radiusMeters = 900 
}: NearbyCarsProps) {
  // Generate initial positions memoized by rounded center
  const initialCars = useMemo(
    () => generateCars(center, count, radiusMeters),
    [Math.round(center.lat * 1000), Math.round(center.lng * 1000), count, radiusMeters]
  );

  const [cars, setCars] = useState<CarPosition[]>(initialCars);

  // Animate cars drifting slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setCars(prevCars => 
        prevCars.map(car => {
          // Small random drift (30-60 meters)
          const driftMeters = 30 + Math.random() * 30;
          const angle = Math.random() * Math.PI * 2;
          
          const dLat = (driftMeters / 111320) * Math.cos(angle);
          const dLng = (driftMeters / (111320 * Math.cos((car.lat * Math.PI) / 180))) * Math.sin(angle);
          
          const newPos = {
            lat: car.lat + dLat,
            lng: car.lng + dLng,
            rot: car.rot + (Math.random() * 40 - 20), // Slight rotation change
          };
          
          // Check if still within radius of center
          const distLat = (newPos.lat - center.lat) * 111320;
          const distLng = (newPos.lng - center.lng) * 111320 * Math.cos(center.lat * (Math.PI / 180));
          const dist = Math.sqrt(distLat * distLat + distLng * distLng);
          
          // If outside radius, respawn at random position in radius
          if (dist > radiusMeters) {
            return randomAround(center, radiusMeters);
          }
          
          return newPos;
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, [center.lat, center.lng, radiusMeters]);

  // Regenerate cars when center changes significantly
  useEffect(() => {
    setCars(generateCars(center, count, radiusMeters));
  }, [Math.round(center.lat * 1000), Math.round(center.lng * 1000), count, radiusMeters]);

  return (
    <>
      {cars.map((car, i) => (
        <OverlayViewF
          key={i}
          position={{ lat: car.lat, lng: car.lng }}
          mapPaneName={OverlayView.OVERLAY_LAYER}
        >
          <div 
            className="-translate-x-1/2 -translate-y-1/2 transition-all ease-out [transition-duration:1800ms]"
            style={{ zIndex: 50 }}
          >
            <CarSvg rotation={car.rot} />
          </div>
        </OverlayViewF>
      ))}
    </>
  );
}
