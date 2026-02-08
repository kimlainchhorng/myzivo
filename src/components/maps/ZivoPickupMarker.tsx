/**
 * ZivoPickupMarker Component
 * 
 * Premium pulsing pickup marker using OverlayViewF from @react-google-maps/api.
 * Creates an Uber-style animated pickup indicator with expanding rings.
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
        {/* Outer ping ring - slow */}
        <div className="absolute w-16 h-16 rounded-full bg-primary/30 animate-ping" />
        
        {/* Inner pulse ring */}
        <div className="absolute w-10 h-10 rounded-full bg-primary/20 animate-pulse" />
        
        {/* Center pin - using blue for better visibility */}
        <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white/80 rounded-full" />
        </div>
      </div>
    </OverlayViewF>
  );
}

export default ZivoPickupMarker;
