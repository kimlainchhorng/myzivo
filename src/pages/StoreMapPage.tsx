/**
 * StoreMapPage — Clean white Uber/Lyft-style map with store pins
 * Features: light tiles, category filters, user GPS dot, search bar
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/* ── Clean light map style ── */
const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#333333" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e8e8e8" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#d6d6d6" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e8fc" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#7eadd4" }] },
];

const CATEGORY_ICONS: Record<string, string> = {
  "food-market": "🛒", "restaurant": "🍽️", "fashion-market": "👗",
  "drink": "🥤", "mall": "🏬", "supermarket": "🛒", "salon": "💇",
  "electronics": "📱", "pharmacy": "💊", "default": "🏪",
};

const CATEGORY_COLORS: Record<string, string> = {
  "food-market": "#16a34a", "restaurant": "#ea580c", "fashion-market": "#9333ea",
  "drink": "#2563eb", "mall": "#db2777", "supermarket": "#0d9488", "salon": "#e11d48",
  "electronics": "#4f46e5", "pharmacy": "#059669", "default": "#6b7280",
};

function getCategoryIcon(cat: string) {
  return CATEGORY_ICONS[cat] || CATEGORY_ICONS.default;
}

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
}

function getCategoryLabel(cat: string) {
  return STORE_CATEGORY_OPTIONS.find((o) => o.value === cat)?.label || cat;
}

/** Colored pin marker with emoji fallback */
function makeMarkerIcon(emoji: string, color: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54">
      <defs>
        <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path d="M22 50 C22 50, 5 31, 5 19 A17 17 0 1 1 39 19 C39 31, 22 50, 22 50Z" fill="${color}" filter="url(#s)"/>
      <circle cx="22" cy="19" r="12" fill="#fff"/>
      <text x="22" y="24" text-anchor="middle" font-size="15">${emoji}</text>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

/** Create a logo marker as a canvas-rendered image URL */
function createLogoMarkerCanvas(
  logoUrl: string,
  color: string,
  callback: (dataUrl: string) => void
) {
  const canvas = document.createElement("canvas");
  const size = 56;
  const pinH = 68;
  canvas.width = size;
  canvas.height = pinH;
  const ctx = canvas.getContext("2d")!;

  // Draw pin shape
  ctx.beginPath();
  const cx = size / 2, topR = 24;
  ctx.arc(cx, topR + 2, topR, Math.PI * 0.85, Math.PI * 0.15);
  ctx.quadraticCurveTo(cx + 6, pinH - 14, cx, pinH - 2);
  ctx.quadraticCurveTo(cx - 6, pinH - 14, cx - topR * Math.cos(Math.PI * 0.15), topR + 2 - topR * Math.sin(Math.PI * 0.15));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fill();
  ctx.shadowColor = "transparent";

  // White circle bg for logo
  const logoR = 16;
  ctx.beginPath();
  ctx.arc(cx, topR + 2, logoR, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // Load and draw logo
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, topR + 2, logoR - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, cx - logoR + 2, topR + 2 - logoR + 2, (logoR - 2) * 2, (logoR - 2) * 2);
    ctx.restore();
    callback(canvas.toDataURL());
  };
  img.onerror = () => {
    // If logo fails, just use pin as-is (white circle, no image)
    callback(canvas.toDataURL());
  };
  img.src = logoUrl;
}

/** Blue dot for user location */
function makeUserDotIcon(): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="13" fill="rgba(66,133,244,0.15)" stroke="none"/>
      <circle cx="14" cy="14" r="8" fill="#4285F4" stroke="#fff" stroke-width="3"/>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

export default function StoreMapPage() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userDotRef = useRef<google.maps.Marker | null>(null);
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

  const usedCategories = useMemo(() => {
    const cats = new Set(stores.map((s) => s.category));
    return STORE_CATEGORY_OPTIONS.filter((o) => cats.has(o.value));
  }, [stores]);

  const filteredStores = useMemo(() => {
    let result = stores;
    if (activeCategory !== "all") result = result.filter((s) => s.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q));
    }
    return result;
  }, [stores, activeCategory, searchQuery]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

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
        center: userLocation || DEFAULT_CENTER,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: false,
        gestureHandling: "greedy",
        backgroundColor: "#f5f5f5",
        styles: LIGHT_MAP_STYLES,
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
    if (userDotRef.current) userDotRef.current.setMap(null);
    userDotRef.current = new google.maps.Marker({
      map: mapRef.current,
      position: userLocation,
      icon: { url: makeUserDotIcon(), scaledSize: new google.maps.Size(28, 28), anchor: new google.maps.Point(14, 14) },
      title: "You",
      zIndex: 999,
    });
  }, [mapReady, userLocation]);

  // Store markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (!filteredStores.length) return;

    const bounds = new google.maps.LatLngBounds();
    filteredStores.forEach((store) => {
      const pos = { lat: store.latitude, lng: store.longitude };
      bounds.extend(pos);
      const color = getCategoryColor(store.category);

      // Create marker with fallback icon first
      const marker = new google.maps.Marker({
        map: mapRef.current!,
        position: pos,
        icon: {
          url: makeMarkerIcon(getCategoryIcon(store.category), color),
          scaledSize: new google.maps.Size(40, 49),
          anchor: new google.maps.Point(20, 49),
        },
        title: store.name,
        animation: google.maps.Animation.DROP,
        zIndex: 100,
      });

      // If store has a logo, replace with logo marker
      if (store.logo_url) {
        createLogoMarkerCanvas(store.logo_url, color, (dataUrl) => {
          marker.setIcon({
            url: dataUrl,
            scaledSize: new google.maps.Size(44, 54),
            anchor: new google.maps.Point(22, 54),
          });
        });
      }

      marker.addListener("click", () => {
        setSelectedStore(store);
        mapRef.current?.panTo(pos);
        const z = mapRef.current?.getZoom() || 14;
        if (z < 14) mapRef.current?.setZoom(14);
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
    if (userLocation) { mapRef.current.panTo(userLocation); mapRef.current.setZoom(14); }
    else if (filteredStores.length) {
      const bounds = new google.maps.LatLngBounds();
      filteredStores.forEach((s) => bounds.extend({ lat: s.latitude, lng: s.longitude }));
      mapRef.current.fitBounds(bounds, { top: 140, bottom: 180, left: 30, right: 30 });
    }
    setSelectedStore(null);
  }, [filteredStores, userLocation]);

  const handleLocateMe = useCallback(() => {
    if (!("geolocation" in navigator) || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLocation(loc); mapRef.current?.panTo(loc); mapRef.current?.setZoom(15); },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-background">

      {/* ── Header ── */}
      <div className="absolute top-0 left-0 right-0 z-[1100]" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}>
        <div className="px-4 pb-1">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2.5 rounded-2xl px-4 py-3 bg-card/95 backdrop-blur-xl shadow-lg border border-border/20"
              >
                <Search className="w-4 h-4 shrink-0 text-primary" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stores..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/60"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="p-1.5 rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="title"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-card/95 backdrop-blur-xl shadow-lg border border-border/20">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-foreground leading-tight">Explore Stores</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {filteredStores.length} {filteredStores.length === 1 ? "store" : "stores"} nearby
                    </p>
                  </div>
                  <button
                    onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/60 hover:bg-muted transition-colors"
                  >
                    <Search className="w-[18px] h-[18px] text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Category chips ── */}
        {usedCategories.length > 0 && (
          <div className="px-4 pt-2.5 pb-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 w-max">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveCategory("all"); setSelectedStore(null); }}
                className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border backdrop-blur-sm ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card/90 text-muted-foreground border-border/30 shadow-sm"
                }`}
              >
                All ({stores.length})
              </motion.button>
              {usedCategories.map((cat) => {
                const count = stores.filter((s) => s.category === cat.value).length;
                const isActive = activeCategory === cat.value;
                return (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    key={cat.value}
                    onClick={() => { setActiveCategory(isActive ? "all" : cat.value); setSelectedStore(null); }}
                    className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border backdrop-blur-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card/90 text-muted-foreground border-border/30 shadow-sm"
                    }`}
                  >
                    <span className="text-[13px]">{getCategoryIcon(cat.value)}</span>
                    {cat.label} ({count})
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Right FABs ── */}
      <div className="absolute right-4 bottom-[140px] z-[1500] flex flex-col gap-2.5">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="secondary" size="icon" onClick={handleLocateMe}
            className="w-12 h-12 rounded-full shadow-lg border border-border/20 bg-card/95 backdrop-blur-xl hover:bg-muted transition-colors"
            style={{ color: userLocation ? "#4285F4" : undefined }}
            aria-label="My location"
          >
            <Locate className="w-5 h-5" />
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="secondary" size="icon" onClick={handleRecenter}
            className="w-12 h-12 rounded-full shadow-lg border border-border/20 bg-card/95 backdrop-blur-xl text-foreground hover:bg-muted transition-colors"
            aria-label="Recenter"
          >
            <Navigation className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* ── Map ── */}
      <div ref={mapContainerRef} className="absolute inset-0" style={{ touchAction: "none" }} />

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Map unavailable</p>
          </div>
        </div>
      )}

      {/* ── Selected store card ── */}
      <AnimatePresence>
        {selectedStore && (
          <motion.div
            initial={{ y: 140, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 140, opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="absolute bottom-[100px] left-3 right-3 z-[1600]"
          >
            <div
              className="rounded-[20px] overflow-hidden shadow-2xl border border-border/20 bg-card/95 backdrop-blur-xl cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/store/${selectedStore.slug}`)}
            >
              <div className="p-4 flex items-center gap-3.5">
                {/* Store logo / icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
                  style={{ background: getCategoryColor(selectedStore.category) + "12" }}
                >
                  {selectedStore.logo_url ? (
                    <img src={selectedStore.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{getCategoryIcon(selectedStore.category)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[15px] truncate text-foreground leading-tight">{selectedStore.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ background: getCategoryColor(selectedStore.category) + "15", color: getCategoryColor(selectedStore.category) }}
                    >
                      {getCategoryLabel(selectedStore.category)}
                    </span>
                    {selectedStore.rating && (
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        {selectedStore.rating}
                      </span>
                    )}
                  </div>
                  {selectedStore.address && (
                    <p className="text-[11px] mt-1.5 truncate flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {selectedStore.address}
                    </p>
                  )}
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex border-t border-border/20">
                <button
                  className="flex-1 py-3.5 text-[12px] font-bold text-center text-primary hover:bg-primary/5 transition-colors"
                  onClick={(e) => { e.stopPropagation(); navigate(`/store/${selectedStore.slug}`); }}
                >
                  View Store
                </button>
                {selectedStore.hours && (
                  <>
                    <div className="w-px bg-border/20" />
                    <div className="flex-1 py-3.5 flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-medium text-muted-foreground">{selectedStore.hours}</span>
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