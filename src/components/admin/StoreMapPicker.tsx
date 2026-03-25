/**
 * StoreMapPicker – Dialog with Google Map for dropping a pin to set store address.
 * Uses reverse-geocode edge function to resolve coordinates to an address string.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StoreMapPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAddress: string;
  onConfirm: (address: string, lat: number, lng: number) => void;
}

// Default to Phnom Penh
const DEFAULT_CENTER = { lat: 11.5564, lng: 104.9282 };

async function getApiKey(): Promise<string> {
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  try {
    const { data, error } = await supabase.functions.invoke("maps-api-key");
    if (!error && data?.key) return data.key;
  } catch { /* fallback */ }
  return envKey;
}

async function loadGoogleMaps(apiKey: string): Promise<boolean> {
  if (window.google?.maps) return true;
  const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
  if (existing) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (window.google?.maps) { clearInterval(check); resolve(true); }
      }, 200);
      setTimeout(() => { clearInterval(check); resolve(!!window.google?.maps); }, 8000);
    });
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function StoreMapPicker({ open, onOpenChange, currentAddress, onConfirm }: StoreMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [address, setAddress] = useState(currentAddress);
  const [coords, setCoords] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);

  // Reverse geocode via edge function
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke("maps-reverse-geocode", {
        body: { lat, lng },
      });
      if (!error && data?.address) {
        setAddress(data.address);
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    } finally {
      setGeocoding(false);
    }
  }, []);

  // Init map
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const key = await getApiKey();
      if (!key || cancelled) { setLoading(false); return; }
      const loaded = await loadGoogleMaps(key);
      if (!loaded || cancelled) { setLoading(false); return; }

      // Wait for DOM
      await new Promise((r) => setTimeout(r, 100));
      if (!mapRef.current || cancelled) { setLoading(false); return; }

      const map = new google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapInstance.current = map;

      const marker = new google.maps.Marker({
        map,
        position: DEFAULT_CENTER,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });
      markerRef.current = marker;

      // Click to move pin
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition(e.latLng);
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // Drag end
      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (!pos) return;
        const lat = pos.lat();
        const lng = pos.lng();
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // Setup Places Autocomplete on search input
      if (searchInputRef.current && window.google?.maps?.places) {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ["geometry", "formatted_address"],
        });
        autocomplete.bindTo("bounds", map);
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            map.panTo({ lat, lng });
            map.setZoom(16);
            marker.setPosition({ lat, lng });
            setCoords({ lat, lng });
            setAddress(place.formatted_address || "");
          }
        });
      }

      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [open, reverseGeocode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Pick Store Location
          </DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search for a place..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Map */}
        <div className="relative w-full h-[400px] bg-muted">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Address preview + confirm */}
        <div className="p-4 space-y-3 border-t border-border">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div className="min-w-0">
              {geocoding ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Getting address…
                </p>
              ) : (
                <p className="text-sm font-medium text-foreground">{address || "Tap the map to drop a pin"}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={() => { onConfirm(address, coords.lat, coords.lng); onOpenChange(false); }}
              disabled={!address || geocoding}
              className="gap-1.5"
            >
              <MapPin className="h-4 w-4" /> Confirm Location
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
