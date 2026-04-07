/**
 * StoreMapPage — Clean white Uber/Lyft-style map with store pins
 * Features: light tiles, category filters, user GPS dot, search bar
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, Star, Navigation, Store, ChevronRight, Search, X, Locate, Car, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { STORE_CATEGORY_OPTIONS } from "@/config/groceryStores";
import { trackInitiateCheckout } from "@/services/metaConversion";
import { buildShopDeepLink } from "@/lib/deepLinks";

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

interface StoreProduct {
  id: string;
  name: string;
  price: number;
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
  "food-market": "🛒", "grocery": "🛒", "restaurant": "🍽️", "fashion": "👗",
  "drink": "🥤", "mall": "🏬", "supermarket": "🏪", "salon": "💇",
  "electronics": "📱", "pharmacy": "💊", "car-rental": "🚗", "car-dealership": "🚙",
  "auto-repair": "🔧", "tire-shop": "🛞", "auto-parts": "⚙️", "other": "📍", "default": "📍",
};

const CATEGORY_COLORS: Record<string, [string, string]> = {
  // [main color, light bg]
  "food-market":    ["#16a34a", "#dcfce7"],
  "grocery":        ["#16a34a", "#dcfce7"],
  "restaurant":     ["#ea580c", "#fff7ed"],
  "fashion":        ["#9333ea", "#f3e8ff"],
  "drink":          ["#2563eb", "#dbeafe"],
  "mall":           ["#db2777", "#fce7f3"],
  "supermarket":    ["#0d9488", "#ccfbf1"],
  "salon":          ["#e11d48", "#ffe4e6"],
  "electronics":    ["#4f46e5", "#e0e7ff"],
  "pharmacy":       ["#059669", "#d1fae5"],
  "car-rental":     ["#7c3aed", "#ede9fe"],
  "car-dealership": ["#1d4ed8", "#dbeafe"],
  "auto-repair":    ["#b45309", "#fef3c7"],
  "tire-shop":      ["#374151", "#f3f4f6"],
  "auto-parts":     ["#64748b", "#f1f5f9"],
  "other":          ["#6b7280", "#f3f4f6"],
  "default":        ["#6b7280", "#f3f4f6"],
};

function getCategoryIcon(cat: string) {
  return CATEGORY_ICONS[cat] || CATEGORY_ICONS.default;
}

function getCategoryColor(cat: string) {
  return (CATEGORY_COLORS[cat] || CATEGORY_COLORS.default)[0];
}

function getCategoryBg(cat: string) {
  return (CATEGORY_COLORS[cat] || CATEGORY_COLORS.default)[1];
}

function getCategoryLabel(cat: string) {
  return STORE_CATEGORY_OPTIONS.find((o) => o.value === cat)?.label || cat;
}

/** Small rounded category marker — compact & distinct per category */
function makeMarkerIcon(emoji: string, color: string, bgColor: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="50" viewBox="0 0 42 50">
      <defs>
        <filter id="ds" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="${color}" flood-opacity="0.3"/>
        </filter>
      </defs>
      <!-- Pin tail -->
      <polygon points="21,48 16,36 26,36" fill="${color}"/>
      <!-- Circle body -->
      <circle cx="21" cy="20" r="19" fill="${color}" filter="url(#ds)"/>
      <circle cx="21" cy="20" r="16" fill="${bgColor}"/>
      <!-- Emoji -->
      <text x="21" y="25.5" text-anchor="middle" font-size="14">${emoji}</text>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

/** Small category marker with store logo inside */
function makeLogoMarkerIcon(color: string, bgColor: string): string {
  // Return pin SVG without emoji — logo overlay via canvas
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="50" viewBox="0 0 42 50">
      <defs>
        <filter id="ds2" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="${color}" flood-opacity="0.3"/>
        </filter>
      </defs>
      <polygon points="21,48 16,36 26,36" fill="${color}"/>
      <circle cx="21" cy="20" r="19" fill="${color}" filter="url(#ds2)"/>
      <circle cx="21" cy="20" r="15" fill="#ffffff"/>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

/** Create a logo marker as canvas (logo inside colored circle pin) */
function createLogoMarkerCanvas(
  logoUrl: string,
  color: string,
  bgColor: string,
  callback: (dataUrl: string) => void
) {
  const W = 42 * 2, H = 50 * 2; // 2x for retina
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  
  // Draw the base pin SVG first
  const pinSvg = makeLogoMarkerIcon(color, bgColor);
  const pinImg = new Image();
  pinImg.onload = () => {
    ctx.drawImage(pinImg, 0, 0, W, H);
    
    // Now load and draw the logo
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.onload = () => {
      const cx = W / 2, cy = 20 * 2; // center of circle
      const r = 13 * 2; // logo radius
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      callback(canvas.toDataURL());
    };
    logo.onerror = () => callback(canvas.toDataURL());
    logo.src = logoUrl;
  };
  pinImg.src = pinSvg;
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
  const pulseCirclesRef = useRef<google.maps.Circle[]>([]);
  const userDotRef = useRef<google.maps.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StorePin | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [liveStoreMap, setLiveStoreMap] = useState<Record<string, string>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  const { data: allStores = [] } = useQuery({
    queryKey: ["store-map-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select("id, name, slug, category, address, phone, hours, rating, logo_url, latitude, longitude")
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as StorePin[];
    },
    staleTime: 60_000,
  });

  const stores = useMemo(() => allStores.filter(s => s.latitude != null && s.longitude != null), [allStores]);

  useEffect(() => {
    let active = true;

    const loadPulse = async () => {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data } = await (supabase as any)
        .from("shop_live_pulse")
        .select("store_id, last_purchase_at")
        .gte("last_purchase_at", cutoff);

      if (!active) return;

      const next: Record<string, string> = {};
      for (const row of data || []) {
        if (row?.store_id) next[String(row.store_id)] = String(row.last_purchase_at || "");
      }
      setLiveStoreMap(next);
    };

    loadPulse();
    const t = window.setInterval(loadPulse, 60_000);
    return () => {
      active = false;
      window.clearInterval(t);
    };
  }, []);

  const usedCategories = useMemo(() => {
    const cats = new Set(allStores.map((s) => s.category));
    return STORE_CATEGORY_OPTIONS.filter((o) => cats.has(o.value));
  }, [allStores]);

  const filteredStores = useMemo(() => {
    let result = stores;
    if (activeCategory !== "all") result = result.filter((s) => s.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q));
    }
    return result;
  }, [stores, activeCategory, searchQuery]);

  const { data: selectedStoreProducts = [] } = useQuery({
    queryKey: ["store-map-products", selectedStore?.id],
    queryFn: async () => {
      if (!selectedStore?.id) return [] as StoreProduct[];
      const { data, error } = await (supabase as any)
        .from("store_products")
        .select("id, name, price")
        .eq("store_id", selectedStore.id)
        .eq("in_stock", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) return [] as StoreProduct[];
      return (data || []) as StoreProduct[];
    },
    enabled: !!selectedStore?.id,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (selectedStoreProducts.length > 0) {
      setSelectedProductId(selectedStoreProducts[0].id);
    } else {
      setSelectedProductId("");
    }
  }, [selectedStoreProducts]);

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
    pulseCirclesRef.current.forEach((c) => c.setMap(null));
    pulseCirclesRef.current = [];
    if (!filteredStores.length) return;

    const bounds = new google.maps.LatLngBounds();
    filteredStores.forEach((store) => {
      const pos = { lat: store.latitude, lng: store.longitude };
      bounds.extend(pos);
      const color = getCategoryColor(store.category);
      const bg = getCategoryBg(store.category);

      // Create marker with category-styled icon
      const marker = new google.maps.Marker({
        map: mapRef.current!,
        position: pos,
        icon: {
          url: makeMarkerIcon(getCategoryIcon(store.category), color, bg),
          scaledSize: new google.maps.Size(36, 43),
          anchor: new google.maps.Point(18, 43),
        },
        title: store.name,
        animation: google.maps.Animation.DROP,
        zIndex: 100,
      });

      // If store has a logo, replace with logo marker
      if (store.logo_url) {
        createLogoMarkerCanvas(store.logo_url, color, bg, (dataUrl) => {
          marker.setIcon({
            url: dataUrl,
            scaledSize: new google.maps.Size(36, 43),
            anchor: new google.maps.Point(18, 43),
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

      if (liveStoreMap[store.id]) {
        const pulse = new google.maps.Circle({
          map: mapRef.current!,
          center: pos,
          radius: 40,
          strokeOpacity: 0,
          fillColor: "#10b981",
          fillOpacity: 0.2,
          zIndex: 50,
        });
        pulseCirclesRef.current.push(pulse);
      }
    });

    if (pulseCirclesRef.current.length) {
      let tick = 0;
      const animate = window.setInterval(() => {
        tick += 1;
        pulseCirclesRef.current.forEach((c, idx) => {
          const phase = (tick + idx * 4) % 24;
          const radius = 30 + phase * 4;
          const opacity = Math.max(0.04, 0.24 - phase * 0.008);
          c.setRadius(radius);
          c.setOptions({ fillOpacity: opacity });
        });
      }, 90);

      return () => {
        window.clearInterval(animate);
      };
    }
    if (userLocation) bounds.extend(userLocation);
    if (filteredStores.length > 1) {
      mapRef.current.fitBounds(bounds, { top: 140, bottom: 180, left: 30, right: 30 });
    } else {
      mapRef.current.setCenter({ lat: filteredStores[0].latitude, lng: filteredStores[0].longitude });
      mapRef.current.setZoom(15);
    }
  }, [mapReady, filteredStores, userLocation, liveStoreMap]);

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
                All ({allStores.length})
              </motion.button>
              {usedCategories.map((cat) => {
                const count = allStores.filter((s) => s.category === cat.value).length;
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
              onClick={() => navigate(`/grocery/shop/${selectedStore.slug}`)}
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
                  className="flex-1 py-3 text-[12px] font-bold text-center text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackInitiateCheckout({
                      eventId: `ride-book-${selectedStore.id}-${Date.now()}`,
                      externalId: currentUserId || undefined,
                      sourceType: "ride_book",
                      sourceTable: "store_profiles",
                      sourceId: selectedStore.id,
                      payload: { destination: selectedStore.address || selectedStore.name },
                    });
                    navigate(`/rides/hub?destination=${encodeURIComponent(selectedStore.address || selectedStore.name)}&destLat=${selectedStore.latitude}&destLng=${selectedStore.longitude}`);
                  }}
                >
                  <Car className="w-3.5 h-3.5" /> Ride There
                </button>
                <div className="w-px bg-border/20" />
                <button
                  className="flex-1 py-3 text-[12px] font-bold text-center text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
                  onClick={(e) => { e.stopPropagation(); navigate(`/grocery/shop/${selectedStore.slug}`); }}
                >
                  <Store className="w-3.5 h-3.5" /> View Store
                </button>
                <div className="w-px bg-border/20" />
                <button
                  className="flex-1 py-3 text-[12px] font-bold text-center text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const shareUrl = buildShopDeepLink(selectedStore.slug);
                    const shareText = `Check out ${selectedStore.name} on ZiVo`;

                    try {
                      if (navigator.share) {
                        await navigator.share({ title: selectedStore.name, text: shareText, url: shareUrl });
                      } else {
                        await navigator.clipboard.writeText(shareUrl);
                      }
                    } catch {
                      await navigator.clipboard.writeText(shareUrl);
                    }
                  }}
                >
                  Share
                </button>
                {selectedStore.phone && (
                  <>
                    <div className="w-px bg-border/20" />
                    <button
                      className="flex-1 py-3 text-[12px] font-bold text-center text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
                      onClick={(e) => { e.stopPropagation(); window.open(`tel:${selectedStore.phone}`, "_self"); }}
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </button>
                  </>
                )}
              </div>

              <div className="border-t border-border/20 px-3 py-3 bg-muted/20">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2">Social-to-Sale</p>
                {liveStoreMap[selectedStore.id] && (
                  <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live now: purchase in last 30 minutes
                  </p>
                )}
                {selectedStoreProducts.length > 0 ? (
                  <>
                    <select
                      value={selectedProductId}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full h-9 rounded-lg border border-border/40 bg-background px-2 text-xs"
                    >
                      {selectedStoreProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (${Number(product.price).toFixed(2)})
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        className="h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          const checkoutPath = `/grocery/shop/${selectedStore.slug}?buy=${selectedProductId}`;
                          navigate("/reels", {
                            state: {
                              openCreate: true,
                              commerceLinkDraft: {
                                linkType: "store_product",
                                storeId: selectedStore.id,
                                storeProductId: selectedProductId,
                                checkoutPath,
                                mapLat: selectedStore.latitude,
                                mapLng: selectedStore.longitude,
                                mapLabel: selectedStore.name,
                              },
                            },
                          });
                        }}
                      >
                        Create Reel
                      </button>
                      <button
                        className="h-9 rounded-lg border border-primary/30 text-primary text-xs font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          const checkoutPath = `/grocery/shop/${selectedStore.slug}?buy=${selectedProductId}`;
                          trackInitiateCheckout({
                            eventId: `store-buy-${selectedStore.id}-${selectedProductId}-${Date.now()}`,
                            externalId: currentUserId || undefined,
                            sourceType: "store_product",
                            sourceTable: "store_products",
                            sourceId: selectedProductId,
                            payload: { store_id: selectedStore.id },
                          });
                          navigate(checkoutPath);
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Add products to this store to enable Create Reel and Buy Now links.</p>
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