/**
 * RealDriverMarkers Component
 * 
 * Shows ONLY real online drivers from the database on the map.
 * Replaces the fake NearbyCars animation with actual driver positions.
 */

import { OverlayViewF, OverlayView } from "@react-google-maps/api";
import { useOnlineDrivers } from "@/hooks/useOnlineDrivers";

interface RealDriverMarkersProps {
  center?: google.maps.LatLngLiteral;
  radiusMiles?: number;
}

// Uber-style white car SVG
function CarSvg({ rotation = 0 }: { rotation?: number }) {
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

// Calculate distance between two coordinates in miles
function getDistanceMiles(
  lat1: number, lng1: number, 
  lat2: number, lng2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function RealDriverMarkers({ 
  center, 
  radiusMiles = 10 
}: RealDriverMarkersProps) {
  const { data: drivers, isLoading } = useOnlineDrivers(true);

  if (isLoading || !drivers || !center) {
    return null;
  }

  // Filter drivers within radius of center
  const nearbyDrivers = drivers.filter(driver => {
    if (!driver.current_lat || !driver.current_lng) return false;
    const distance = getDistanceMiles(
      center.lat, center.lng,
      driver.current_lat, driver.current_lng
    );
    return distance <= radiusMiles;
  });

  if (nearbyDrivers.length === 0) {
    return null;
  }

  return (
    <>
      {nearbyDrivers.map((driver) => {
        if (!driver.current_lat || !driver.current_lng) return null;
        
        // Random rotation for visual variety (stable per driver)
        const rotation = (driver.id.charCodeAt(0) * 137) % 360;
        
        return (
          <OverlayViewF
            key={driver.id}
            position={{ lat: driver.current_lat, lng: driver.current_lng }}
            mapPaneName={OverlayView.OVERLAY_LAYER}
          >
            <div 
              className="-translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 50 }}
              title={driver.full_name}
            >
              <CarSvg rotation={rotation} />
            </div>
          </OverlayViewF>
        );
      })}
    </>
  );
}
