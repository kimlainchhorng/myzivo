/**
 * ZivoDropoffMarker Component
 * 
 * Uber-style black square destination marker with pin stem.
 * Uses OverlayViewF from @react-google-maps/api for precise positioning.
 */

import { OverlayViewF, OverlayView } from "@react-google-maps/api";

interface ZivoDropoffMarkerProps {
  position: google.maps.LatLngLiteral;
}

export default function ZivoDropoffMarker({ position }: ZivoDropoffMarkerProps) {
  return (
    <OverlayViewF position={position} mapPaneName={OverlayView.OVERLAY_LAYER}>
      <div 
        className="flex flex-col items-center -translate-x-1/2 -translate-y-full"
        style={{ zIndex: 90 }}
      >
        {/* Black square destination marker (Uber style) */}
        <div className="w-5 h-5 bg-black rounded-sm shadow-lg border-2 border-white" />
        {/* Pin stem */}
        <div className="w-0.5 h-3 bg-black" />
      </div>
    </OverlayViewF>
  );
}
