/**
 * StoreMapPage — Uber/Lyft-style dark map showing all active store locations
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, Star, Navigation, Store, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { STORE_CATEGORY_OPTIONS } from "@/config/groceryStores";

const DEFAULT_CENTER = { lat: 11.5564, lng: 104.9282 };

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

/* ── Uber/Lyft dark map style ── */
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#b0b0b0" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1d1d1d" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a3a3a" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1d1d1d" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6a6a6a" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e0e" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

const CATEGORY_ICONS: Record<string, string> = {
  "food-market": "🛒",
  "restaurant": "🍽️",
  "fashion-market": "👗",
  "drink": "🥤",
  "mall": "🏬",
  "supermarket": "🛒",
  "salon": "💇",
  "electronics": "📱",
  "pharmacy": "💊",
  "default": "🏪",
};

function getCategoryIcon(cat: string) {
  return CATEGORY_ICONS[cat] || CATEGORY_ICONS.default;
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

  // Init dark map
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
        backgroundColor: "#1d1d1d",
        styles: DARK_MAP_STYLES,
      });
      mapRef.current = map;

      // Dismiss card on map tap
      map.addListener("click", () => setSelectedStore(null));

      if (!cancelled) setMapReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Place markers — Uber-style pins
  useEffect(() => {
    if (!mapReady || !mapRef.current || !stores.length) return;

    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    stores.forEach((store) => {
      const pos = { lat: store.latitude, lng: store.longitude };
      bounds.extend(pos);

      const icon = getCategoryIcon(store.category);

      // Uber-style pill marker
      const el = document.createElement("div");
      el.style.cssText = `
        display: flex; align-items: center; gap: 4px;
        background: #fff; border-radius: 20px;
        padding: 5px 10px 5px 6px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        white-space: nowrap; max-width: 160px;
      `;
      el.innerHTML = `
        <span style="font-size: 16px; line-height: 1;">${icon}</span>
        <span style="font-size: 11px; font-weight: 600; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis;">${store.name}</span>
      `;
      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.08)"; el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.45)"; });
      el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; el.style.boxShadow = "0 4px 14px rgba(0,0,0,0.35)"; });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current!,
        position: pos,
        content: el,
        title: store.name,
      });

      marker.addListener("click", () => {
        setSelectedStore(store);
        mapRef.current?.panTo(pos);
        mapRef.current?.setZoom(Math.max(mapRef.current.getZoom() || 14, 14));
      });

      markersRef.current.push(marker);
    });

    if (stores.length > 1) {
      mapRef.current.fitBounds(bounds, { top: 100, bottom: 180, left: 30, right: 30 });
    } else if (stores.length === 1) {
      mapRef.current.setCenter({ lat: stores[0].latitude, lng: stores[0].longitude });
      mapRef.current.setZoom(15);
    }
  }, [mapReady, stores]);

  const handleRecenter = useCallback(() => {
    if (!mapRef.current || !stores.length) return;
    const bounds = new google.maps.LatLngBounds();
    stores.forEach((s) => bounds.extend({ lat: s.latitude, lng: s.longitude }));
    mapRef.current.fitBounds(bounds, { top: 100, bottom: 180, left: 30, right: 30 });
    setSelectedStore(null);
  }, [stores]);

  return (
    <div className="fixed inset-0 z-0" style={{ background: "#1d1d1d" }}>
      {/* Floating search-style header — Uber style */}
      <div className="absolute top-0 left-0 right-0 z-[1100]" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}>
        <div className="flex items-center gap-2.5 px-4 pb-2">
          <div className="flex-1 flex items-center gap-3 bg-[#2a2a2a] rounded-xl px-4 py-3 shadow-lg">
            <Store className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-[#f5f5f5]">Explore Stores</p>
              <p className="text-[11px] text-[#888]">
                {stores.length > 0 ? `${stores.length} nearby` : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recenter FAB */}
      <Button
        variant="secondary"
        size="icon"
        onClick={handleRecenter}
        className="absolute right-4 bottom-[140px] z-[1500] w-11 h-11 rounded-full shadow-lg border-0 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#f5f5f5]"
        aria-label="Recenter"
      >
        <Navigation className="w-4.5 h-4.5" />
      </Button>

      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0" style={{ touchAction: "none" }} />

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#1d1d1dcc" }}>
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: "#555" }} />
            <p style={{ color: "#888" }}>Map unavailable</p>
          </div>
        </div>
      )}

      {/* Selected store — Uber-style bottom card */}
      <AnimatePresence>
        {selectedStore && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="absolute bottom-[100px] left-3 right-3 z-[1200]"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl cursor-pointer active:scale-[0.98] transition-transform"
              style={{ background: "#2a2a2a" }}
              onClick={() => navigate(`/store/${selectedStore.slug}`)}
            >
              {/* Card content */}
              <div className="p-4 flex items-center gap-3">
                {/* Icon/Logo */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: "#3a3a3a" }}
                >
                  {selectedStore.logo_url ? (
                    <img src={selectedStore.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-2xl">{getCategoryIcon(selectedStore.category)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[15px] truncate" style={{ color: "#f5f5f5" }}>
                    {selectedStore.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ background: "#3a3a3a", color: "#aaa" }}>
                      {getCategoryLabel(selectedStore.category)}
                    </span>
                    {selectedStore.rating && (
                      <span className="flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: "#fbbf24" }}>
                        <Star className="w-3 h-3 fill-current" />
                        {selectedStore.rating}
                      </span>
                    )}
                  </div>
                  {selectedStore.address && (
                    <p className="text-[11px] mt-1 truncate flex items-center gap-1" style={{ color: "#777" }}>
                      <MapPin className="w-3 h-3 shrink-0" />
                      {selectedStore.address}
                    </p>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 shrink-0" style={{ color: "#555" }} />
              </div>

              {/* Bottom action strip */}
              <div className="flex border-t" style={{ borderColor: "#3a3a3a" }}>
                <button
                  className="flex-1 py-3 text-[12px] font-semibold text-center transition-colors"
                  style={{ color: "#22c55e" }}
                  onClick={(e) => { e.stopPropagation(); navigate(`/store/${selectedStore.slug}`); }}
                >
                  View Store
                </button>
                {selectedStore.hours && (
                  <>
                    <div className="w-px" style={{ background: "#3a3a3a" }} />
                    <div className="flex-1 py-3 flex items-center justify-center gap-1.5">
                      <Clock className="w-3 h-3" style={{ color: "#777" }} />
                      <span className="text-[11px]" style={{ color: "#888" }}>{selectedStore.hours}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ZivoMobileNav />
    </div>
  );
}
