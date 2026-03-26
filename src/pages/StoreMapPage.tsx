/**
 * StoreMapPage — Uber/Lyft-style dark map with store pins
 * Features: dark tiles, category filters, user GPS dot, search bar
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, Star, Navigation, Store, ChevronRight, Search, X, Locate } from "lucide-react";
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

/* ── Uber-style dark map JSON styles ── */
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }, { visibility: "off" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
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
  const userDotRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StorePin | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Categories used by stores
  const usedCategories = useMemo(() => {
    const cats = new Set(stores.map((s) => s.category));
    return STORE_CATEGORY_OPTIONS.filter((o) => cats.has(o.value));
  }, [stores]);

  // Filtered stores
  const filteredStores = useMemo(() => {
    let result = stores;
    if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q));
    }
    return result;
  }, [stores, activeCategory, searchQuery]);

  // Get user location
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  // Init map — NO mapId so JSON styles work
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const key = await getApiKey();
      if (!key || cancelled) { setMapError(true); return; }
      const loaded = await loadGoogleMaps(key);
      if (!loaded || cancelled) { setMapError(true); return; }
      if (!mapContainerRef.current) return;

      const map = new google.maps.Map(mapContainerRef.current, {
        center: userLocation || DEFAULT_CENTER,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: false,
        gestureHandling: "greedy",
        backgroundColor: "#212121",
        styles: DARK_MAP_STYLES,
      });
      mapRef.current = map;
      map.addListener("click", () => setSelectedStore(null));
      if (!cancelled) setMapReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // User location blue dot
  useEffect(() => {
    if (!mapReady || !mapRef.current || !userLocation) return;

    if (userDotRef.current) userDotRef.current.map = null;

    const dot = document.createElement("div");
    dot.style.cssText = `
      width: 18px; height: 18px; border-radius: 50%;
      background: #4285F4; border: 3px solid #fff;
      box-shadow: 0 0 0 6px rgba(66, 133, 244, 0.25), 0 2px 6px rgba(0,0,0,0.3);
    `;

    userDotRef.current = new google.maps.marker.AdvancedMarkerElement({
      map: mapRef.current,
      position: userLocation,
      content: dot,
      title: "You",
      zIndex: 999,
    });
  }, [mapReady, userLocation]);

  // Place store markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    if (!filteredStores.length) return;

    const bounds = new google.maps.LatLngBounds();

    filteredStores.forEach((store) => {
      const pos = { lat: store.latitude, lng: store.longitude };
      bounds.extend(pos);

      const icon = getCategoryIcon(store.category);

      const el = document.createElement("div");
      el.style.cssText = `
        display: flex; align-items: center; gap: 4px;
        background: #fff; border-radius: 20px;
        padding: 5px 10px 5px 6px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.4);
        cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        white-space: nowrap; max-width: 160px;
      `;
      el.innerHTML = `
        <span style="font-size: 16px; line-height: 1;">${icon}</span>
        <span style="font-size: 11px; font-weight: 600; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis;">${store.name}</span>
      `;
      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.08)"; });
      el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });

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

    if (userLocation) bounds.extend(userLocation);

    if (filteredStores.length > 1) {
      mapRef.current.fitBounds(bounds, { top: 140, bottom: 180, left: 30, right: 30 });
    } else {
      mapRef.current.setCenter({ lat: filteredStores[0].latitude, lng: filteredStores[0].longitude });
      mapRef.current.setZoom(15);
    }
  }, [mapReady, filteredStores, userLocation]);

  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return;
    if (userLocation) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(14);
    } else if (filteredStores.length) {
      const bounds = new google.maps.LatLngBounds();
      filteredStores.forEach((s) => bounds.extend({ lat: s.latitude, lng: s.longitude }));
      mapRef.current.fitBounds(bounds, { top: 140, bottom: 180, left: 30, right: 30 });
    }
    setSelectedStore(null);
  }, [filteredStores, userLocation]);

  const handleLocateMe = useCallback(() => {
    if (!("geolocation" in navigator) || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        mapRef.current?.panTo(loc);
        mapRef.current?.setZoom(15);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  return (
    <div className="fixed inset-0 z-0" style={{ background: "#212121" }}>

      {/* ── Header: Search + title ── */}
      <div className="absolute top-0 left-0 right-0 z-[1100]" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}>
        <div className="px-4 pb-1">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-xl"
                style={{ background: "#2a2a2a" }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: "#666" }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stores..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#555]"
                  style={{ color: "#f5f5f5" }}
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="p-1 rounded-full"
                  style={{ color: "#888" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="title"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2"
              >
                <div
                  className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl"
                  style={{ background: "#2a2a2a" }}
                >
                  <Store className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold" style={{ color: "#f5f5f5" }}>Explore Stores</p>
                    <p className="text-[11px]" style={{ color: "#777" }}>
                      {filteredStores.length} {filteredStores.length === 1 ? "store" : "stores"} nearby
                    </p>
                  </div>
                  <button
                    onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "#3a3a3a" }}
                  >
                    <Search className="w-4 h-4" style={{ color: "#aaa" }} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Category filter chips ── */}
        {usedCategories.length > 0 && (
          <div className="px-4 pt-2 pb-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 w-max">
              <button
                onClick={() => { setActiveCategory("all"); setSelectedStore(null); }}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap"
                style={{
                  background: activeCategory === "all" ? "#fff" : "#2a2a2a",
                  color: activeCategory === "all" ? "#1a1a1a" : "#999",
                  boxShadow: activeCategory === "all" ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                }}
              >
                All ({stores.length})
              </button>
              {usedCategories.map((cat) => {
                const count = stores.filter((s) => s.category === cat.value).length;
                const isActive = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => { setActiveCategory(isActive ? "all" : cat.value); setSelectedStore(null); }}
                    className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5"
                    style={{
                      background: isActive ? "#fff" : "#2a2a2a",
                      color: isActive ? "#1a1a1a" : "#999",
                      boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                    }}
                  >
                    <span>{getCategoryIcon(cat.value)}</span>
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Right-side FABs ── */}
      <div className="absolute right-4 bottom-[140px] z-[1500] flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleLocateMe}
          className="w-11 h-11 rounded-full shadow-lg border-0"
          style={{ background: "#2a2a2a", color: userLocation ? "#4285F4" : "#888" }}
          aria-label="My location"
        >
          <Locate className="w-4.5 h-4.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleRecenter}
          className="w-11 h-11 rounded-full shadow-lg border-0"
          style={{ background: "#2a2a2a", color: "#f5f5f5" }}
          aria-label="Recenter"
        >
          <Navigation className="w-4.5 h-4.5" />
        </Button>
      </div>

      {/* ── Map ── */}
      <div ref={mapContainerRef} className="absolute inset-0" style={{ touchAction: "none" }} />

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#212121ee" }}>
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: "#555" }} />
            <p style={{ color: "#888" }}>Map unavailable</p>
          </div>
        </div>
      )}

      {/* ── Selected store card ── */}
      <AnimatePresence>
        {selectedStore && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="absolute bottom-[100px] left-3 right-3 z-[1600]"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl cursor-pointer active:scale-[0.98] transition-transform"
              style={{ background: "#2a2a2a" }}
              onClick={() => navigate(`/store/${selectedStore.slug}`)}
            >
              <div className="p-4 flex items-center gap-3">
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

              <div className="flex border-t" style={{ borderColor: "#3a3a3a" }}>
                <button
                  className="flex-1 py-3 text-[12px] font-semibold text-center"
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
