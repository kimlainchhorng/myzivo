/**
 * RealDriverMarkers Component
 * 
 * Shows ONLY real online drivers from the database on the map.
 * Supports debug overlay (localStorage toggle) and bounds-based filtering.
 */

import { OverlayViewF, OverlayView } from "@react-google-maps/api";
import { useOnlineDrivers } from "@/hooks/useOnlineDrivers";
import { useMemo } from "react";

interface RealDriverMarkersProps {
  center?: google.maps.LatLngLiteral;
  radiusMiles?: number;
  bounds?: google.maps.LatLngBoundsLiteral | null;
  filterMode?: "radius" | "bounds";
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

// Calculate distance between two coordinates in miles (Haversine formula)
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

// Check if a point is within bounds
function isWithinBounds(
  lat: number, 
  lng: number, 
  bounds: google.maps.LatLngBoundsLiteral
): boolean {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

// Debug overlay component
function DriverDebugOverlay({
  center,
  radiusMiles,
  totalOnline,
  nearbyCount,
  closestDriver,
  closestDistance,
  filterMode,
  hasBounds,
}: {
  center: google.maps.LatLngLiteral;
  radiusMiles: number;
  totalOnline: number;
  nearbyCount: number;
  closestDriver: { lat: number; lng: number } | null;
  closestDistance: number | null;
  filterMode: "radius" | "bounds";
  hasBounds: boolean;
}) {
  return (
    <div 
      className="absolute top-2 left-2 z-50 bg-black/80 text-white text-xs p-3 rounded-lg font-mono max-w-xs pointer-events-none"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div className="font-bold text-yellow-400 mb-2">🚗 Driver Debug</div>
      <div className="space-y-1">
        <div>Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</div>
        <div>Filter Mode: <span className="text-blue-300">{filterMode}</span></div>
        {filterMode === "radius" && <div>Radius: {radiusMiles} mi</div>}
        {filterMode === "bounds" && <div>Bounds: {hasBounds ? "✓" : "✗ (none)"}</div>}
        <div className="border-t border-white/20 my-2 pt-2">
          <div>Online drivers: <span className="text-green-400">{totalOnline}</span></div>
          <div>Nearby/visible: <span className={nearbyCount > 0 ? "text-green-400" : "text-red-400"}>{nearbyCount}</span></div>
        </div>
        {closestDriver && closestDistance !== null && (
          <div className="border-t border-white/20 my-2 pt-2">
            <div>Closest driver:</div>
            <div className="text-gray-300 pl-2">
              {closestDistance.toFixed(1)} mi away
            </div>
            <div className="text-gray-300 pl-2">
              ({closestDriver.lat.toFixed(4)}, {closestDriver.lng.toFixed(4)})
            </div>
          </div>
        )}
        {totalOnline > 0 && nearbyCount === 0 && (
          <div className="border-t border-white/20 my-2 pt-2 text-yellow-300">
            ⚠️ Driver is far away. Pan/zoom to them or update driver GPS.
          </div>
        )}
      </div>
    </div>
  );
}

export default function RealDriverMarkers({ 
  center, 
  radiusMiles = 10,
  bounds,
  filterMode = "radius",
}: RealDriverMarkersProps) {
  const { data: drivers, isLoading } = useOnlineDrivers(true);
  
  // Check debug mode from localStorage
  const isDebug = typeof window !== "undefined" && 
    localStorage.getItem("zivo_debug_drivers") === "true";

  // Calculate nearby drivers and closest driver
  const { nearbyDrivers, closestDriver, closestDistance, totalOnline } = useMemo(() => {
    if (!drivers || !center) {
      return { nearbyDrivers: [], closestDriver: null, closestDistance: null, totalOnline: 0 };
    }

    const totalOnline = drivers.length;
    let closestDriver: { lat: number; lng: number } | null = null;
    let closestDistance: number | null = null;

    // Find closest driver and compute distances
    drivers.forEach(driver => {
      if (!driver.current_lat || !driver.current_lng) return;
      
      const distance = getDistanceMiles(
        center.lat, center.lng,
        driver.current_lat, driver.current_lng
      );
      
      if (closestDistance === null || distance < closestDistance) {
        closestDistance = distance;
        closestDriver = { lat: driver.current_lat, lng: driver.current_lng };
      }
    });

    // Filter drivers based on mode
    const nearbyDrivers = drivers.filter(driver => {
      if (!driver.current_lat || !driver.current_lng) return false;
      
      if (filterMode === "bounds" && bounds) {
        return isWithinBounds(driver.current_lat, driver.current_lng, bounds);
      }
      
      // Default: radius mode
      const distance = getDistanceMiles(
        center.lat, center.lng,
        driver.current_lat, driver.current_lng
      );
      return distance <= radiusMiles;
    });

    return { nearbyDrivers, closestDriver, closestDistance, totalOnline };
  }, [drivers, center, radiusMiles, bounds, filterMode]);

  if (isLoading || !center) {
    return null;
  }

  return (
    <>
      {/* Debug overlay - only visible when localStorage toggle is on */}
      {isDebug && (
        <DriverDebugOverlay
          center={center}
          radiusMiles={radiusMiles}
          totalOnline={totalOnline}
          nearbyCount={nearbyDrivers.length}
          closestDriver={closestDriver}
          closestDistance={closestDistance}
          filterMode={filterMode}
          hasBounds={!!bounds}
        />
      )}

      {/* Render nearby driver markers */}
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
