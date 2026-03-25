/**
 * StoreMapPicker – Dialog with Google Map for dropping a pin to set store address.
 * Uses edge functions for autocomplete and reverse-geocode.
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

interface Suggestion {
  place_id: string;
  description: string;
}

export default function StoreMapPicker({ open, onOpenChange, currentAddress, onConfirm }: StoreMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [address, setAddress] = useState(currentAddress);
  const [coords, setCoords] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Reverse geocode
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke("maps-reverse-geocode", {
        body: { lat, lng },
      });
      if (!error && data?.address) {
        setAddress(data.address);
      }
    } catch { /* keep existing */ }
    finally { setGeocoding(false); }
  }, []);

  // Search autocomplete via edge function
  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("maps-autocomplete", {
        body: { input: query, proximity: coords, country: "kh" },
      });
      if (!error && data?.suggestions) {
        setSuggestions(data.suggestions.map((p: any) => ({
          place_id: p.place_id,
          description: p.description || p.main_text || p.text,
        })));
        setShowSuggestions(true);
      }
    } catch { /* ignore */ }
    finally { setSearching(false); }
  }, [coords]);

  const applyLocationSelection = useCallback((nextAddress: string, lat: number, lng: number) => {
    setCoords({ lat, lng });
    setAddress(nextAddress);
    setSearchQuery(nextAddress);
    if (mapInstance.current) {
      mapInstance.current.panTo({ lat, lng });
      mapInstance.current.setZoom(16);
    }
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    }
  }, []);

  const geocodeSearchQuery = useCallback(async (query: string) => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 3) return;

    setShowSuggestions(false);
    setGeocoding(true);
    try {
      const searchAddress = /cambodia/i.test(normalizedQuery)
        ? normalizedQuery
        : `${normalizedQuery}, Phnom Penh, Cambodia`;

      const { data, error } = await supabase.functions.invoke("maps-geocode", {
        body: { address: searchAddress },
      });

      if (!error && data?.lat != null && data?.lng != null) {
        applyLocationSelection(data.address || normalizedQuery, data.lat, data.lng);
      }
    } catch { /* ignore */ }
    finally { setGeocoding(false); }
  }, [applyLocationSelection]);

  // Select a suggestion
  const selectPlace = useCallback(async (placeId: string, description: string) => {
    setShowSuggestions(false);
    setSearchQuery(description);
    setGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke("maps-place-details", {
        body: { place_id: placeId },
      });
      if (!error && data?.lat != null && data?.lng != null) {
        applyLocationSelection(data.address || description, data.lat, data.lng);
      }
    } catch { /* ignore */ }
    finally { setGeocoding(false); }
  }, [applyLocationSelection]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(() => searchPlaces(searchQuery), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, searchPlaces]);

  // Move pin helper
  const movePin = useCallback((lat: number, lng: number) => {
    setCoords({ lat, lng });
    if (markerRef.current) markerRef.current.setPosition({ lat, lng });
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

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

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        movePin(e.latLng.lat(), e.latLng.lng());
      });

      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (!pos) return;
        movePin(pos.lat(), pos.lng());
      });

      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [open, movePin]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-visible">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Pick Store Location
          </DialogTitle>
        </DialogHeader>

        {/* Search bar with custom suggestions */}
        <div className="px-4 pb-2 relative z-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void geocodeSearchQuery(searchQuery);
                }
              }}
              placeholder="Search for a place..."
              className="pl-9"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-background border border-border rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.place_id}
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-start gap-2 border-b border-border/50 last:border-0"
                  onClick={() => selectPlace(s.place_id, s.description)}
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-foreground">{s.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="relative w-full h-[350px] bg-muted">
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
