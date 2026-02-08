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

// Top-down car SVG icon
function CarSvg({ rotation }: { rotation: number }) {
  return (
    <svg 
      width="20" 
      height="28" 
      viewBox="0 0 20 28" 
      style={{ transform: `rotate(${rotation}deg)` }}
      className="drop-shadow-md"
    >
      {/* Car body */}
      <rect x="4" y="2" width="12" height="24" rx="3" fill="#1a1a1a" />
      {/* Front windshield */}
      <rect x="5" y="4" width="10" height="6" rx="1" fill="#4a4a4a" />
      {/* Rear window */}
      <rect x="5" y="18" width="10" height="4" rx="1" fill="#4a4a4a" />
      {/* Headlights */}
      <rect x="5" y="2" width="3" height="1.5" rx="0.5" fill="#fef08a" />
      <rect x="12" y="2" width="3" height="1.5" rx="0.5" fill="#fef08a" />
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
            className="-translate-x-1/2 -translate-y-1/2 transition-transform duration-1000 ease-out"
            style={{ zIndex: 50 }}
          >
            <CarSvg rotation={car.rot} />
          </div>
        </OverlayViewF>
      ))}
    </>
  );
}
