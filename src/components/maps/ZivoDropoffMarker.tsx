/**
 * ZivoDropoffMarker Component
 * 
 * ZIVO Brand teal destination pin marker.
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
        style={{ 
          zIndex: 90,
          animation: "markerDropIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both",
        }}
      >
        {/* ZIVO teal destination pin */}
        <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
        {/* Pin stem - teal */}
        <div className="w-0.5 h-3 bg-teal-600" />
      </div>
    </OverlayViewF>
  );
}
