/**
 * StoreMapPage — Google Map showing all active store locations
 * Tapping a pin shows store info and links to the store page.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Clock, Star, Navigation, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { STORE_CATEGORY_OPTIONS } from "@/config/groceryStores";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER = { lat: 11.5564, lng: 104.9282 }; // Phnom Penh

interface StorePin {
  id: string;
  name: string;
  slug: string;
  category: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  rating: number | null;
  logo_url: string | null;
  latitude: number;
  longitude: number;
}

async function getApiKey(): Promise<string> {
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  try {
    const { data, error } = await supabase.functions.invoke("maps-api-key");
    if (!error && data?.key) return data.key;
  } catch { /* fallback */ }
  return envKey;
}

async function loadGoogleMaps(apiKey: string): Promise<boolean> {
  if ((window as any).google?.maps) return true;
  const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
  if (existing) {
    await new Promise<void>((res) => {
      if ((window as any).google?.maps) return res();
      existing.addEventListener("load", () => res());
      setTimeout(() => res(), 3000);
    });
    return !!(window as any).google?.maps;
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  "food-market": "#22c55e",
  "restaurant": "#f97316",
  "fashion-market": "#a855f7",
  "drink": "#3b82f6",
  "mall": "#ec4899",
  "supermarket": "#14b8a6",
  "salon": "#f43f5e",
  "electronics": "#6366f1",
  "pharmacy": "#10b981",
  "default": "#6b7280",
};

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
}

function getCategoryLabel(cat: string) {
  return STORE_CATEGORY_OPTIONS.find((o) => o.value === cat)?.label || cat;
}

export default function StoreMapPage() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StorePin | null>(null);

  // Fetch all stores with coordinates
  const { data: stores = [] } = useQuery({
    queryKey: ["store-map-pins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select("id, name, slug, category, address, phone, hours, rating, logo_url, latitude, longitude")
        .eq("is_active", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null);
      if (error) throw error;
      return (data || []) as StorePin[];
    },
    staleTime: 60_000,
  });

  // Init map
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const key = await getApiKey();
      if (!key || cancelled) { setMapError(true); return; }
      const loaded = await loadGoogleMaps(key);
      if (!loaded || cancelled) { setMapError(true); return; }
      if (!mapContainerRef.current) return;

      const map = new google.maps.Map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 13,
        mapId: "store-map-main",
        disableDefaultUI: true,
        zoomControl: false,
        gestureHandling: "greedy",
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });
      mapRef.current = map;
      if (!cancelled) setMapReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Place markers
  useEffect(() => {
    if (!mapReady || !mapRef.current || !stores.length) return;

    // Clear old
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    stores.forEach((store) => {
      const pos = { lat: store.latitude, lng: store.longitude };
      bounds.extend(pos);

      const color = getCategoryColor(store.category);

      // Custom pin element
      const el = document.createElement("div");
      el.style.cssText = `
        width: 36px; height: 36px; border-radius: 50%;
        background: ${color}; border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: transform 0.15s;
      `;
      el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>`;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current!,
        position: pos,
        content: el,
        title: store.name,
      });

      marker.addListener("click", () => {
        setSelectedStore(store);
        mapRef.current?.panTo(pos);
      });

      markersRef.current.push(marker);
    });

    if (stores.length > 1) {
      mapRef.current.fitBounds(bounds, { top: 80, bottom: 160, left: 40, right: 40 });
    } else if (stores.length === 1) {
      mapRef.current.setCenter({ lat: stores[0].latitude, lng: stores[0].longitude });
      mapRef.current.setZoom(15);
    }
  }, [mapReady, stores]);

  const handleRecenter = useCallback(() => {
    if (!mapRef.current || !stores.length) return;
    const bounds = new google.maps.LatLngBounds();
    stores.forEach((s) => bounds.extend({ lat: s.latitude, lng: s.longitude }));
    mapRef.current.fitBounds(bounds, { top: 80, bottom: 160, left: 40, right: 40 });
    setSelectedStore(null);
  }, [stores]);

  return (
    <div className="fixed inset-0 z-0 bg-background">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1100] safe-top">
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <Button
            variant="secondary"
            size="icon"
            className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-xl shadow-lg border-0"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 bg-card/90 backdrop-blur-xl rounded-full px-4 py-2.5 shadow-lg">
            <h1 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Nearby Stores
              {stores.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">
                  ({stores.length})
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      {/* Recenter button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={handleRecenter}
        className="absolute right-3 bottom-48 z-[1500] w-12 h-12 rounded-full bg-card/90 text-foreground shadow-lg border-0 hover:bg-card backdrop-blur-xl"
        aria-label="Recenter"
      >
        <Navigation className="w-5 h-5" />
      </Button>

      {/* Map */}
      <div ref={mapContainerRef} className="absolute inset-0" style={{ touchAction: "none" }} />

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Map unavailable</p>
          </div>
        </div>
      )}

      {/* Selected store card */}
      <AnimatePresence>
        {selectedStore && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-28 left-3 right-3 z-[1200]"
          >
            <div
              className="bg-card/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-border/30 p-4 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/store/${selectedStore.slug}`)}
            >
              <div className="flex items-start gap-3">
                {/* Logo */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: getCategoryColor(selectedStore.category) + "22" }}
                >
                  {selectedStore.logo_url ? (
                    <img src={selectedStore.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Store className="w-6 h-6" style={{ color: getCategoryColor(selectedStore.category) }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-base truncate">{selectedStore.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ background: getCategoryColor(selectedStore.category) }}
                    >
                      {getCategoryLabel(selectedStore.category)}
                    </span>
                    {selectedStore.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-current" />
                        {selectedStore.rating}
                      </span>
                    )}
                  </div>
                  {selectedStore.address && (
                    <p className="text-xs text-muted-foreground mt-1 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {selectedStore.address}
                    </p>
                  )}
                  {selectedStore.hours && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      {selectedStore.hours}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="text-xs font-semibold text-primary">View Store →</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap to dismiss */}
      {selectedStore && (
        <div
          className="absolute inset-0 z-[1100]"
          style={{ pointerEvents: "auto" }}
          onClick={() => setSelectedStore(null)}
        />
      )}

      <ZivoMobileNav />
    </div>
  );
}
