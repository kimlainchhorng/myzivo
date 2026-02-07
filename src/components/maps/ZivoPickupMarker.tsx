/**
 * ZivoPickupMarker Component
 * 
 * Custom pulsing pickup marker overlay for premium Uber-style effect.
 * Uses CSS animations for smooth pulsing rings around pickup location.
 */

import { useEffect, useRef } from "react";

interface ZivoPickupMarkerProps {
  position: { lat: number; lng: number };
  map: google.maps.Map;
}

class PulsingOverlay extends google.maps.OverlayView {
  private position: google.maps.LatLng;
  private div: HTMLDivElement | null = null;

  constructor(position: { lat: number; lng: number }) {
    super();
    this.position = new google.maps.LatLng(position.lat, position.lng);
  }

  onAdd() {
    this.div = document.createElement("div");
    this.div.style.position = "absolute";
    this.div.style.transform = "translate(-50%, -50%)";
    this.div.innerHTML = `
      <div class="relative flex items-center justify-center" style="width: 64px; height: 64px;">
        <div class="absolute w-16 h-16 rounded-full bg-blue-500/30 animate-ping-slow"></div>
        <div class="absolute w-12 h-12 rounded-full bg-blue-500/40 animate-ping-medium"></div>
        <div class="w-6 h-6 rounded-full bg-blue-500 border-[3px] border-white shadow-lg relative z-10"></div>
      </div>
    `;

    const panes = this.getPanes();
    panes?.overlayMouseTarget.appendChild(this.div);
  }

  draw() {
    if (!this.div) return;
    const overlayProjection = this.getProjection();
    const pos = overlayProjection.fromLatLngToDivPixel(this.position);
    if (pos) {
      this.div.style.left = `${pos.x}px`;
      this.div.style.top = `${pos.y}px`;
    }
  }

  onRemove() {
    if (this.div?.parentNode) {
      this.div.parentNode.removeChild(this.div);
      this.div = null;
    }
  }

  updatePosition(position: { lat: number; lng: number }) {
    this.position = new google.maps.LatLng(position.lat, position.lng);
    this.draw();
  }
}

export function ZivoPickupMarker({ position, map }: ZivoPickupMarkerProps) {
  const overlayRef = useRef<PulsingOverlay | null>(null);

  useEffect(() => {
    if (!map || !window.google) return;

    // Create and attach the overlay
    overlayRef.current = new PulsingOverlay(position);
    overlayRef.current.setMap(map);

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
    };
  }, [map]);

  // Update position when it changes
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.updatePosition(position);
    }
  }, [position.lat, position.lng]);

  return null; // This component renders via Google Maps overlay, not React DOM
}

export default ZivoPickupMarker;
