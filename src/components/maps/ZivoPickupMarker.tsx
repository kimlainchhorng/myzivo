/**
 * ZivoPickupMarker Component
 * 
 * ZIVO Brand pickup marker with emerald rings.
 * Premium pulsing animation using OverlayViewF.
 */

import { OverlayViewF, OverlayView } from "@react-google-maps/api";

interface ZivoPickupMarkerProps {
  position: google.maps.LatLngLiteral;
}

export function ZivoPickupMarker({ position }: ZivoPickupMarkerProps) {
  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_LAYER}
    >
      {/* Direct DOM child for ref safety */}
      <div 
        className="relative flex items-center justify-center w-16 h-16 -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 100 }}
      >
        {/* Outer ping ring - ZIVO emerald */}
        <div className="absolute w-16 h-16 rounded-full bg-emerald-400/40 animate-ping" />
        
        {/* Inner pulse ring */}
        <div className="absolute w-10 h-10 rounded-full bg-emerald-400/30 animate-pulse" />
        
        {/* Center pin - emerald with white border */}
        <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-10 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white/90 rounded-full" />
        </div>
      </div>
    </OverlayViewF>
  );
}

export default ZivoPickupMarker;
