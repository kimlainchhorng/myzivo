/**
 * StoreMapPage — Clean white map with store pins
 * Features: light tiles, category filters, user GPS dot, search bar,
 *           expandable nearby sheet, radius filter + map circle,
 *           "search this area", today's hours, check-in counts,
 *           shopping trail planner, live pulse.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import {
  MapPin, Clock, Star, Navigation, Store, ChevronRight, Search, X,
  Locate, Car, Phone, Wrench, List, Heart, Share2, MoreHorizontal,
  Route, Plus, Minus, Flame, Timer, CheckCircle2, ChevronUp, ChevronDown,
  Users, SlidersHorizontal, Layers, Tag, Sparkles, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import NavBar from "@/components/home/NavBar";
import { STORE_CATEGORY_OPTIONS } from "@/config/groceryStores";
import { trackInitiateCheckout } from "@/services/metaConversion";
import { buildShopDeepLink } from "@/lib/deepLinks";
import { isOpenNow } from "@/lib/store/storeHours";
import { openDirections } from "@/lib/maps/openDirections";
import { shareStoreWithCard } from "@/lib/social/storeShareCard";
import { useStoreFavorites } from "@/hooks/useStoreFavorites";
import { distanceMiles } from "@/hooks/useStorePins";
import StoreDetailsDrawer from "@/components/store/StoreDetailsDrawer";

const DEFAULT_CENTER = { lat: 11.5564, lng: 104.9282 };
const RADIUS_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: "All", value: null },
  { label: "500 m", value: 0.5 },
  { label: "1 km", value: 1 },
  { label: "2 km", value: 2 },
  { label: "5 km", value: 5 },
];

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
  created_at?: string;
}

interface StoreProduct {
  id: string;
  name: string;
  price: number;
}

// Cache the resolved API key for the lifetime of the page so navigating away
// and back to the map doesn't re-hit the supabase edge function (cold start
// could add 1–2s of blank screen). The promise itself is cached so concurrent
// map components share the same in-flight request.
let _apiKeyPromise: Promise<string> | null = null;

async function getApiKey(): Promise<string> {
  if (_apiKeyPromise) return _apiKeyPromise;
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  // If the env key is configured, use it directly. The Maps JS key is a
  // public token (it ships in the script URL) so the supabase round-trip
  // adds latency without adding security — referrer/origin restrictions on
  // the GCP side are what protect it.
  if (envKey) {
    _apiKeyPromise = Promise.resolve(envKey);
    return _apiKeyPromise;
  }
  _apiKeyPromise = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("maps-api-key");
      if (!error && data?.key) return data.key as string;
    } catch { /* fallback */ }
    return "";
  })();
  return _apiKeyPromise;
}

// Cache the SDK-load promise too. Without this, two components mounting
// simultaneously can each append their own <script> tag, and rapid back/forward
// navigation re-runs the existing-script-wait branch every time.
let _mapsLoadPromise: Promise<boolean> | null = null;

async function loadGoogleMaps(apiKey: string): Promise<boolean> {
  if ((window as any).google?.maps) return true;
  if (_mapsLoadPromise) return _mapsLoadPromise;

  _mapsLoadPromise = (async () => {
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      await new Promise<void>((res) => {
        if ((window as any).google?.maps) return res();
        existing.addEventListener("load", () => res());
        setTimeout(() => res(), 3000);
      });
      return !!(window as any).google?.maps;
    }
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        // Reset cache so a retry can attempt a fresh load instead of
        // permanently returning a failed promise.
        _mapsLoadPromise = null;
        resolve(false);
      };
      document.head.appendChild(script);
    });
  })();

  return _mapsLoadPromise;
}

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

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b8b8b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d4d4d4" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#636363" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3d3d5c" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1535" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d6398" }] },
];

const CATEGORY_ICONS: Record<string, string> = {
  "food-market": "🛒", "grocery": "🛒", "restaurant": "🍽️", "fashion": "👗",
  "drink": "🥤", "mall": "🏬", "supermarket": "🏪", "salon": "💇",
  "electronics": "📱", "pharmacy": "💊", "car-rental": "🚗", "car-dealership": "🚙",
  "auto-repair": "🔧", "tire-shop": "🛞", "auto-parts": "⚙️",
  "hotel": "🏨", "resort": "🏖️", "guesthouse": "🏠",
  "cafe": "☕", "bakery": "🥐", "convenience": "🏪", "gas-station": "⛽",
  "spa": "💆", "gym": "💪", "laundry": "🧺",
  "hardware": "🔨", "florist": "💐", "bookstore": "📚",
  "jewelry": "💎", "pet-shop": "🐾", "toys": "🧸",
  "furniture": "🛋️", "home-decor": "🏡", "sporting-goods": "⚽",
  "other": "📍", "default": "📍",
};

const CATEGORY_COLORS: Record<string, [string, string]> = {
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
  "hotel":          ["#0ea5e9", "#e0f2fe"],
  "resort":         ["#06b6d4", "#cffafe"],
  "guesthouse":     ["#14b8a6", "#ccfbf1"],
  "cafe":           ["#92400e", "#fef3c7"],
  "bakery":         ["#d97706", "#fef9c3"],
  "convenience":    ["#0d9488", "#ccfbf1"],
  "gas-station":    ["#dc2626", "#fee2e2"],
  "spa":            ["#a855f7", "#f3e8ff"],
  "gym":            ["#f97316", "#fff7ed"],
  "laundry":        ["#3b82f6", "#dbeafe"],
  "hardware":       ["#78716c", "#f5f5f4"],
  "florist":        ["#ec4899", "#fce7f3"],
  "bookstore":      ["#7c3aed", "#ede9fe"],
  "jewelry":        ["#f59e0b", "#fef3c7"],
  "pet-shop":       ["#84cc16", "#f0fdf4"],
  "toys":           ["#ef4444", "#fee2e2"],
  "furniture":      ["#a16207", "#fef9c3"],
  "home-decor":     ["#0891b2", "#cffafe"],
  "sporting-goods": ["#16a34a", "#dcfce7"],
  "other":          ["#6b7280", "#f3f4f6"],
  "default":        ["#6b7280", "#f3f4f6"],
};

function getCategoryIcon(cat: string) { return CATEGORY_ICONS[cat] || CATEGORY_ICONS.default; }
function getCategoryColor(cat: string) { return (CATEGORY_COLORS[cat] || CATEGORY_COLORS.default)[0]; }
function getCategoryBg(cat: string) { return (CATEGORY_COLORS[cat] || CATEGORY_COLORS.default)[1]; }
function getCategoryLabel(cat: string) { return STORE_CATEGORY_OPTIONS.find((o) => o.value === cat)?.label || cat; }

function getDistKm(store: StorePin, ref: { lat: number; lng: number } | null): number | null {
  if (!ref) return null;
  return distanceMiles(ref, { lat: store.latitude, lng: store.longitude }) * 1.609344;
}

function formatDistLabel(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function formatWalkMin(km: number): string {
  const mins = Math.ceil((km / 25) * 60);
  if (mins < 2) return "< 1 min";
  if (mins >= 60) return `~${Math.round(mins / 60)} h`;
  return `~${mins} min`;
}

function totalTripKm(stops: StorePin[], origin: { lat: number; lng: number } | null): number {
  let total = 0;
  const pts: { lat: number; lng: number }[] = [
    ...(origin ? [origin] : []),
    ...stops.map((s) => ({ lat: s.latitude, lng: s.longitude })),
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    total += distanceMiles(pts[i], pts[i + 1]) * 1.609344;
  }
  return total;
}

function formatTripEta(km: number): string {
  const mins = Math.ceil((km / 5) * 60);
  if (mins < 60) return `~${mins} min walk`;
  return `~${Math.round(mins / 60)}h ${mins % 60}min`;
}

function navigateShoppingTrail(stops: StorePin[], origin: { lat: number; lng: number } | null) {
  if (!stops.length) return;
  const parts: string[] = [];
  if (origin) parts.push(`${origin.lat},${origin.lng}`);
  stops.forEach((s) => parts.push(`${s.latitude},${s.longitude}`));
  window.open(`https://www.google.com/maps/dir/${parts.join("/")}`, "_blank");
}

/** Returns minutes until closing if store closes within 60 min, otherwise null */
function getClosingSoonMinutes(hours: string | null): number | null {
  const str = getTodayHours(hours);
  if (!str || /24.?hour|open.?all/i.test(str)) return null;
  const m = str.match(/[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const mn = parseInt(m[2] || "0");
  const ap = (m[3] || "").toLowerCase();
  if (!ap && h < 8) h += 12;
  else if (ap === "pm" && h !== 12) h += 12;
  else if (ap === "am" && h === 12) h = 0;
  const now = new Date();
  const close = new Date(now);
  close.setHours(h, mn, 0, 0);
  const diffMin = (close.getTime() - now.getTime()) / 60000;
  return diffMin > 0 && diffMin <= 60 ? Math.round(diffMin) : null;
}

const RECENT_STORES_KEY = "zivo:map:recent";
const RECENT_SEARCHES_KEY = "zivo:map:searches";
function saveRecentSearch(q: string) {
  try {
    const arr: string[] = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([q, ...arr.filter((x) => x !== q)].slice(0, 5)));
  } catch { /* noop */ }
}
function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]"); }
  catch { return []; }
}
function saveRecentStore(id: string) {
  try {
    const arr: string[] = JSON.parse(localStorage.getItem(RECENT_STORES_KEY) || "[]");
    localStorage.setItem(RECENT_STORES_KEY, JSON.stringify([id, ...arr.filter((x) => x !== id)].slice(0, 8)));
  } catch { /* noop */ }
}
function getRecentStoreIds(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_STORES_KEY) || "[]"); }
  catch { return []; }
}

/** Returns the smart "best for this time of day" category set */
function getBestForNow(): { label: string; emoji: string; categories: string[] } {
  const h = new Date().getHours();
  if (h >= 5 && h < 10)  return { label: "Breakfast", emoji: "☕", categories: ["cafe", "bakery", "restaurant", "drink"] };
  if (h >= 10 && h < 14) return { label: "Lunch", emoji: "🍽️", categories: ["restaurant", "food-market", "grocery", "supermarket"] };
  if (h >= 14 && h < 18) return { label: "Shopping", emoji: "🛍️", categories: ["fashion", "electronics", "mall", "salon", "spa", "jewelry", "home-decor", "sporting-goods", "furniture"] };
  if (h >= 18 && h < 22) return { label: "Dinner & Drinks", emoji: "🍻", categories: ["restaurant", "drink", "cafe", "mall"] };
  return { label: "Night Out", emoji: "🌙", categories: ["drink", "restaurant"] };
}

/** Nearest-neighbour route optimizer for shopping trail stops */
function optimizeTrailStops(stops: StorePin[], origin: { lat: number; lng: number } | null): StorePin[] {
  if (stops.length <= 2) return stops;
  const remaining = [...stops];
  const optimized: StorePin[] = [];
  let cur = origin ?? { lat: stops[0].latitude, lng: stops[0].longitude };
  while (remaining.length > 0) {
    let best = 0;
    let bestD = Infinity;
    remaining.forEach((s, i) => {
      const d = distanceMiles(cur, { lat: s.latitude, lng: s.longitude });
      if (d < bestD) { bestD = d; best = i; }
    });
    optimized.push(remaining[best]);
    cur = { lat: remaining[best].latitude, lng: remaining[best].longitude };
    remaining.splice(best, 1);
  }
  return optimized;
}

/** Parse today's opening hours from a multi-line hours string */
function getTodayHours(hours: string | null): string | null {
  if (!hours) return null;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const short = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const d = new Date().getDay();
  const lines = hours.split(/\n|;/);
  const line = lines.find((l) =>
    l.toLowerCase().startsWith(days[d].toLowerCase()) ||
    l.toLowerCase().startsWith(short[d].toLowerCase())
  );
  if (!line) return null;
  return line.replace(/^[A-Za-z]+:?\s*/i, "").trim();
}

/** Extract opening time from today's hours string, e.g. "8:00 AM – 10:00 PM" → "8:00 AM" */
function getOpensAt(hours: string | null): string | null {
  const today = getTodayHours(hours);
  if (!today) return null;
  const m = today.match(/^(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i);
  return m ? m[1].trim() : null;
}

function isNewStore(store: StorePin): boolean {
  if (!store.created_at) return false;
  return Date.now() - new Date(store.created_at).getTime() < 14 * 24 * 60 * 60 * 1000;
}

/* ── SVG marker factories ── */
function makeMarkerIcon(emoji: string, color: string, bgColor: string, isNew = false, hasDeal = false): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="50" viewBox="0 0 42 50">
      <defs><filter id="ds" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="${color}" flood-opacity="0.3"/>
      </filter></defs>
      <polygon points="21,48 16,36 26,36" fill="${color}"/>
      <circle cx="21" cy="20" r="19" fill="${color}" filter="url(#ds)"/>
      <circle cx="21" cy="20" r="16" fill="${bgColor}"/>
      <text x="21" y="25.5" text-anchor="middle" font-size="14">${emoji}</text>
      ${isNew ? `<circle cx="7" cy="7" r="7" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>
      <text x="7" y="11" text-anchor="middle" font-size="6" fill="#fff" font-weight="bold" font-family="system-ui">NEW</text>` : ""}
      ${hasDeal ? `<circle cx="35" cy="7" r="7" fill="#16a34a" stroke="#fff" stroke-width="1.5"/>
      <text x="35" y="11.5" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold" font-family="system-ui">%</text>` : ""}
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function makeLogoMarkerIcon(color: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="50" viewBox="0 0 42 50">
      <defs><filter id="ds2" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="${color}" flood-opacity="0.3"/>
      </filter></defs>
      <polygon points="21,48 16,36 26,36" fill="${color}"/>
      <circle cx="21" cy="20" r="19" fill="${color}" filter="url(#ds2)"/>
      <circle cx="21" cy="20" r="15" fill="#ffffff"/>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function makeTripStopIcon(num: number): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs><filter id="ts" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#4f46e5" flood-opacity="0.4"/>
      </filter></defs>
      <polygon points="20,46 15,34 25,34" fill="#4f46e5"/>
      <circle cx="20" cy="19" r="18" fill="#4f46e5" filter="url(#ts)"/>
      <circle cx="20" cy="19" r="14" fill="#ffffff"/>
      <text x="20" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#4f46e5" font-family="system-ui">${num}</text>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function createLogoMarkerCanvas(
  logoUrl: string,
  color: string,
  bgColor: string,
  callback: (dataUrl: string) => void
) {
  const W = 42 * 2, H = 50 * 2;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const pinSvg = makeLogoMarkerIcon(color);
  const pinImg = new Image();
  pinImg.onload = () => {
    ctx.drawImage(pinImg, 0, 0, W, H);
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.onload = () => {
      const cx = W / 2, cy = 20 * 2, r = 13 * 2;
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

function getEmptyReason(
  openNowOnly: boolean, trendingOnly: boolean, smartFilterActive: boolean,
  searchQuery: string, activeCategory: string, radiusKm: number | null
): { title: string; hint: string } {
  if (searchQuery.trim()) return { title: `No results for "${searchQuery.trim()}"`, hint: "Try a different search term or clear search" };
  if (openNowOnly) return { title: "No stores open right now", hint: "Turn off 'Open now' to see all stores" };
  if (trendingOnly) return { title: "No trending stores nearby", hint: "Trending updates every 60 seconds" };
  if (smartFilterActive) return { title: `No ${getBestForNow().label} spots nearby`, hint: "Try a different area or disable this filter" };
  if (radiusKm) return { title: `No stores within ${radiusKm < 1 ? radiusKm * 1000 + " m" : radiusKm + " km"}`, hint: "Try a larger radius or move the map" };
  if (activeCategory !== "all") return { title: "No stores in this category", hint: "Try All or a different area" };
  return { title: "No stores found", hint: "Try searching a different area" };
}

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
  const queryClient = useQueryClient();
  const [urlParams, setUrlParams] = useSearchParams();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const pulseCirclesRef = useRef<google.maps.Circle[]>([]);
  const userDotRef = useRef<google.maps.Marker | null>(null);
  const tripMarkersRef = useRef<google.maps.Marker[]>([]);
  const tripPolylineRef = useRef<google.maps.Polyline | null>(null);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StorePin | null>(null);
  const [drawerStore, setDrawerStore] = useState<StorePin | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(urlParams.get("cat") || "all");
  const [searchQuery, setSearchQuery] = useState(urlParams.get("q") || "");
  const [searchOpen, setSearchOpen] = useState<boolean>(!!urlParams.get("q"));
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(urlParams.get("open") === "1");
  const [trendingOnly, setTrendingOnly] = useState(() => localStorage.getItem("zivo:map:trending") === "1");
  const [dealsOnly, setDealsOnly] = useState(false);
  const [smartFilterActive, setSmartFilterActive] = useState(false);
  const [visitedStoreIds, setVisitedStoreIds] = useState<Set<string>>(new Set());
  const [recentIds, setRecentIds] = useState<string[]>(() => getRecentStoreIds());
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [liveStoreMap, setLiveStoreMap] = useState<Record<string, string>>({});
  const [checkInMap, setCheckInMap] = useState<Record<string, number>>({});
  const [mapStyle, setMapStyle] = useState<"light" | "dark" | "satellite">(
    () => (localStorage.getItem("zivo:mapStyle") as "light" | "dark" | "satellite") || "light"
  );
  const [dealStoreIds, setDealStoreIds] = useState<Set<string>>(new Set());

  /* ── Radius + area search ── */
  const [radiusKm, setRadiusKm] = useState<number | null>(() => {
    const v = localStorage.getItem("zivo:map:radius");
    return v ? Number(v) : null;
  });
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [mapIdleCenter, setMapIdleCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  /* ── Shopping Trail ── */
  const [tripMode, setTripMode] = useState(false);
  const [tripStops, setTripStops] = useState<StorePin[]>([]);
  const tripModeRef = useRef(false);
  const tripStopsRef = useRef<StorePin[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isFavorite, toggleFavorite, isAuthed } = useStoreFavorites();

  useEffect(() => { tripModeRef.current = tripMode; }, [tripMode]);
  useEffect(() => { tripStopsRef.current = tripStops; }, [tripStops]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  /* Save recently viewed when a store is selected */
  useEffect(() => {
    if (!selectedStore) return;
    saveRecentStore(selectedStore.id);
    setRecentIds(getRecentStoreIds());
  }, [selectedStore?.id]);

  /* Persist filter prefs */
  useEffect(() => { localStorage.setItem("zivo:map:trending", trendingOnly ? "1" : "0"); }, [trendingOnly]);
  useEffect(() => {
    if (radiusKm !== null) localStorage.setItem("zivo:map:radius", String(radiusKm));
    else localStorage.removeItem("zivo:map:radius");
  }, [radiusKm]);

  /* Load current user's own visited stores */
  useEffect(() => {
    if (!currentUserId) return;
    let active = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("check_ins").select("store_id").eq("user_id", currentUserId);
      if (!active || !data) return;
      const safeId = (v: any) => (v && typeof v === "string" && v !== "null" && v !== "undefined") ? v : typeof v === "number" ? String(v) : null;
      setVisitedStoreIds(new Set<string>(data.map((r: any) => safeId(r.store_id)).filter((id): id is string => !!id)));
    })();
    return () => { active = false; };
  }, [currentUserId]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (activeCategory !== "all") next.set("cat", activeCategory);
    if (searchQuery.trim()) next.set("q", searchQuery.trim());
    if (openNowOnly) next.set("open", "1");
    setUrlParams(next, { replace: true });
  }, [activeCategory, searchQuery, openNowOnly, setUrlParams]);

  const { data: allStores = [] } = useQuery({
    queryKey: ["store-map-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select("id, name, slug, category, address, phone, hours, rating, logo_url, latitude, longitude, created_at")
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as StorePin[];
    },
    staleTime: 60_000,
  });

  const stores = useMemo(() => allStores.filter((s) => s.latitude != null && s.longitude != null), [allStores]);

  /* Live pulse */
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
    return () => { active = false; window.clearInterval(t); };
  }, []);

  /* Recent check-ins (last 2 hours) */
  useEffect(() => {
    let active = true;
    const loadCheckIns = async () => {
      const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data } = await (supabase as any)
        .from("check_ins")
        .select("store_id")
        .gte("created_at", cutoff);
      if (!active) return;
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        if (row?.store_id) counts[String(row.store_id)] = (counts[String(row.store_id)] || 0) + 1;
      }
      setCheckInMap(counts);
    };
    loadCheckIns();
    const t = window.setInterval(loadCheckIns, 120_000);
    return () => { active = false; window.clearInterval(t); };
  }, []);

  /* Active deals */
  useEffect(() => {
    let active = true;
    (async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("promotions")
        .select("merchant_id")
        .eq("is_active", true)
        .or(`ends_at.is.null,ends_at.gt.${now}`);
      if (!active || !data) return;
      setDealStoreIds(new Set<string>(data.map((r: any) => String(r.merchant_id)).filter(Boolean)));
    })();
    return () => { active = false; };
  }, []);

  /* Map style toggle + persist */
  useEffect(() => {
    localStorage.setItem("zivo:mapStyle", mapStyle);
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const g = (window as any).google;
    if (!g?.maps) return;
    if (mapStyle === "satellite") {
      map.setMapTypeId("satellite");
      map.setOptions({ styles: [] });
    } else {
      map.setMapTypeId("roadmap");
      map.setOptions({ styles: mapStyle === "dark" ? DARK_MAP_STYLES : LIGHT_MAP_STYLES });
    }
  }, [mapReady, mapStyle]);

  const usedCategories = useMemo(() => {
    const cats = new Set(allStores.map((s) => s.category));
    return STORE_CATEGORY_OPTIONS.filter((o) => cats.has(o.value));
  }, [allStores]);

  /* Effective search center for distance calculations */
  const effectiveCenter = searchCenter || userLocation;

  const filteredStores = useMemo(() => {
    let result = stores;
    if (activeCategory !== "all") result = result.filter((s) => s.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q));
    }
    if (openNowOnly) result = result.filter((s) => isOpenNow(s.hours) === true);
    if (trendingOnly) result = result.filter((s) => !!liveStoreMap[s.id]);
    if (dealsOnly) result = result.filter((s) => dealStoreIds.has(s.id));
    if (smartFilterActive) {
      const { categories } = getBestForNow();
      result = result.filter((s) => categories.includes(s.category));
    }
    /* Radius filter */
    if (radiusKm && effectiveCenter) {
      result = result.filter((s) => {
        const km = distanceMiles(effectiveCenter, { lat: s.latitude, lng: s.longitude }) * 1.609344;
        return km <= radiusKm;
      });
    }
    return result;
  }, [stores, activeCategory, searchQuery, openNowOnly, trendingOnly, dealsOnly, smartFilterActive, liveStoreMap, dealStoreIds, radiusKm, effectiveCenter]);

  /* Nearby sorted by distance from effectiveCenter */
  const nearbySorted = useMemo(() => {
    if (!effectiveCenter) return filteredStores;
    return [...filteredStores].sort((a, b) => {
      const da = distanceMiles(effectiveCenter, { lat: a.latitude, lng: a.longitude });
      const db = distanceMiles(effectiveCenter, { lat: b.latitude, lng: b.longitude });
      return da - db;
    });
  }, [filteredStores, effectiveCenter]);

  const trendingCount = useMemo(() => stores.filter((s) => !!liveStoreMap[s.id]).length, [stores, liveStoreMap]);
  const openNowCount = useMemo(() => stores.filter((s) => isOpenNow(s.hours) === true).length, [stores]);

  /* Recently viewed stores (resolved from IDs) */
  const recentStores = useMemo(() =>
    recentIds.map((id) => allStores.find((s) => s.id === id)).filter(Boolean) as StorePin[],
    [recentIds, allStores]
  );
  const showRecentRow = recentStores.length > 0 && !searchQuery.trim() && activeCategory === "all"
    && !trendingOnly && !smartFilterActive && !selectedStore && !drawerStore;

  /* Search autocomplete — top 5 matches from already-loaded store list */
  const autoSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 1) return [] as StorePin[];
    return allStores
      .filter((s) => s.name.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q))
      .slice(0, 5);
  }, [allStores, searchQuery]);

  /* "Search this area" — visible when map is panned > 300 m from effectiveCenter */
  const showSearchArea = useMemo(() => {
    if (!mapIdleCenter || !effectiveCenter) return false;
    const km = distanceMiles(effectiveCenter, mapIdleCenter) * 1.609344;
    return km > 0.3;
  }, [mapIdleCenter, effectiveCenter]);

  const { data: selectedStoreGallery = [] } = useQuery<string[]>({
    queryKey: ["store-map-gallery", selectedStore?.id],
    queryFn: async (): Promise<string[]> => {
      if (!selectedStore?.id) return [];
      const { data } = await supabase
        .from("store_profiles")
        .select("gallery_images")
        .eq("id", selectedStore.id)
        .single();
      const raw = (data as any)?.gallery_images;
      if (!Array.isArray(raw)) return [];
      return (raw as unknown[]).filter((v): v is string => typeof v === "string" && v.startsWith("http"));
    },
    enabled: !!selectedStore?.id,
    staleTime: 60_000,
  });

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
    if (selectedStoreProducts.length > 0) setSelectedProductId(selectedStoreProducts[0].id);
    else setSelectedProductId("");
  }, [selectedStoreProducts]);

  /* GPS */
  useEffect(() => {
    if (!("geolocation" in navigator)) { setLocationDenied(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationDenied(false); },
      () => setLocationDenied(true),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  /* Init map */
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
      map.addListener("click", () => { setSelectedStore(null); setSearchOpen(false); setSearchQuery(""); });
      map.addListener("idle", () => {
        const c = map.getCenter();
        if (c) setMapIdleCenter({ lat: c.lat(), lng: c.lng() });
      });
      if (!cancelled) setMapReady(true);
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* User dot */
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

  /* Radius circle */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (radiusCircleRef.current) { radiusCircleRef.current.setMap(null); radiusCircleRef.current = null; }
    if (!radiusKm || !effectiveCenter) return;
    radiusCircleRef.current = new google.maps.Circle({
      map: mapRef.current,
      center: effectiveCenter,
      radius: radiusKm * 1000,
      strokeColor: "#6366f1",
      strokeOpacity: 0.55,
      strokeWeight: 2,
      fillColor: "#6366f1",
      fillOpacity: 0.07,
      zIndex: 10,
    });
  }, [mapReady, radiusKm, effectiveCenter]);

  /* Store markers */
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
      const storeIsNew = isNewStore(store);
      const storeHasDeal = dealStoreIds.has(store.id);

      const marker = new google.maps.Marker({
        map: mapRef.current!,
        position: pos,
        icon: {
          url: makeMarkerIcon(getCategoryIcon(store.category), color, bg, storeIsNew, storeHasDeal),
          scaledSize: new google.maps.Size(36, 43),
          anchor: new google.maps.Point(18, 43),
        },
        title: store.name,
        animation: google.maps.Animation.DROP,
        zIndex: 100,
      });

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
        if (tripModeRef.current) {
          setTripStops((prev) => {
            const exists = prev.find((s) => s.id === store.id);
            if (exists) return prev.filter((s) => s.id !== store.id);
            if (prev.length >= 8) { toast.error("Max 8 stops in one trail"); return prev; }
            toast.success(`Added: ${store.name}`, { duration: 1500 });
            return [...prev, store];
          });
          return;
        }
        setSelectedStore(store);
        setSheetExpanded(false);
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

    let intervalId: any = null;
    if (pulseCirclesRef.current.length) {
      let tick = 0;
      intervalId = window.setInterval(() => {
        tick += 1;
        pulseCirclesRef.current.forEach((c, idx) => {
          const phase = (tick + idx * 4) % 24;
          c.setRadius(30 + phase * 4);
          c.setOptions({ fillOpacity: Math.max(0.04, 0.24 - phase * 0.008) });
        });
      }, 90);
    }

    if (userLocation) bounds.extend(userLocation);
    if (filteredStores.length > 1) {
      mapRef.current.fitBounds(bounds, { top: 140, bottom: 260, left: 30, right: 30 });
    } else if (filteredStores.length === 1) {
      mapRef.current.setCenter({ lat: filteredStores[0].latitude, lng: filteredStores[0].longitude });
      mapRef.current.setZoom(15);
    }

    return () => { if (intervalId !== null) window.clearInterval(intervalId); };
  }, [mapReady, filteredStores, userLocation, liveStoreMap, dealStoreIds]);

  /* Trip stop numbered markers + polyline */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    tripMarkersRef.current.forEach((m) => m.setMap(null));
    tripMarkersRef.current = [];
    if (tripPolylineRef.current) { tripPolylineRef.current.setMap(null); tripPolylineRef.current = null; }

    tripStops.forEach((store, idx) => {
      const marker = new google.maps.Marker({
        map: mapRef.current!,
        position: { lat: store.latitude, lng: store.longitude },
        icon: {
          url: makeTripStopIcon(idx + 1),
          scaledSize: new google.maps.Size(40, 48),
          anchor: new google.maps.Point(20, 48),
        },
        zIndex: 300,
      });
      tripMarkersRef.current.push(marker);
    });

    if (tripStops.length >= 2) {
      const path = [
        ...(userLocation ? [userLocation] : []),
        ...tripStops.map((s) => ({ lat: s.latitude, lng: s.longitude })),
      ];
      tripPolylineRef.current = new google.maps.Polyline({
        map: mapRef.current!,
        path,
        strokeColor: "#4f46e5",
        strokeWeight: 3,
        strokeOpacity: 0.75,
        icons: [{
          icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5 },
          offset: "100%",
          repeat: "80px",
        }],
      });
    }
  }, [mapReady, tripStops, userLocation]);

  /* Auto-focus / auto-trail / shared-trail via deep link */
  const focusId = urlParams.get("focus");
  const trailParam = urlParams.get("trail");
  const stopsParam = urlParams.get("stops");
  useEffect(() => {
    if (!mapReady || !mapRef.current || !filteredStores.length) return;
    /* ?stops=id1,id2,id3 — load a shared shopping trail */
    if (stopsParam) {
      const ids = stopsParam.split(",");
      const stops = ids.map((id) => filteredStores.find((s) => s.id === id)).filter(Boolean) as StorePin[];
      if (stops.length > 0) {
        setTripMode(true);
        setTripStops((prev) => {
          const existing = new Set(prev.map((s) => s.id));
          return [...prev, ...stops.filter((s) => !existing.has(s.id))].slice(0, 8);
        });
        const bounds = new google.maps.LatLngBounds();
        stops.forEach((s) => bounds.extend({ lat: s.latitude, lng: s.longitude }));
        mapRef.current.fitBounds(bounds, { top: 140, bottom: 220, left: 30, right: 30 });
      }
    }
    /* ?focus=id — select or add to trail */
    if (focusId) {
      const target = filteredStores.find((s) => s.id === focusId);
      if (!target) return;
      if (trailParam === "1") {
        setTripMode(true);
        setTripStops((prev) => prev.find((s) => s.id === target.id) ? prev : [...prev, target]);
      } else {
        setSelectedStore(target);
      }
      mapRef.current.panTo({ lat: target.latitude, lng: target.longitude });
      mapRef.current.setZoom(15);
    }
  }, [mapReady, focusId, trailParam, stopsParam, filteredStores]);

  const activeFiltersCount = (openNowOnly ? 1 : 0) + (trendingOnly ? 1 : 0) + (dealsOnly ? 1 : 0) + (smartFilterActive ? 1 : 0) + (activeCategory !== "all" ? 1 : 0);
  const clearAllFilters = useCallback(() => {
    setActiveCategory("all");
    setOpenNowOnly(false);
    setTrendingOnly(false);
    setDealsOnly(false);
    setSmartFilterActive(false);
    setSelectedStore(null);
  }, []);

  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return;
    const center = userLocation || effectiveCenter;
    if (center) { mapRef.current.panTo(center); mapRef.current.setZoom(14); }
    else if (filteredStores.length) {
      const bounds = new google.maps.LatLngBounds();
      filteredStores.forEach((s) => bounds.extend({ lat: s.latitude, lng: s.longitude }));
      mapRef.current.fitBounds(bounds, { top: 140, bottom: 260, left: 30, right: 30 });
    }
    setSelectedStore(null);
  }, [filteredStores, userLocation, effectiveCenter]);

  const handleLocateMe = useCallback(() => {
    if (!("geolocation" in navigator) || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationDenied(false);
        setSearchCenter(null);
        mapRef.current?.panTo(loc);
        mapRef.current?.setZoom(15);
      },
      () => { setLocationDenied(true); toast.error("Location access denied — enable it in your browser settings"); },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const handleSearchArea = useCallback(() => {
    if (!mapIdleCenter) return;
    setSearchCenter(mapIdleCenter);
    setMapIdleCenter(null);
    toast.success("Showing stores in this area");
  }, [mapIdleCenter]);

  const handleShareSelected = useCallback(async (s: StorePin) => {
    const dist = effectiveCenter
      ? distanceMiles(effectiveCenter, { lat: s.latitude, lng: s.longitude })
      : undefined;
    try {
      const result = await shareStoreWithCard(s as any, {
        distanceMi: dist,
        categoryLabel: getCategoryLabel(s.category),
      });
      if (result.mode === "shared-with-image") toast.success("Shared with image");
      else if (result.mode === "shared-link") toast.success("Link shared");
      else if (result.mode === "downloaded") toast.success("Image saved · link copied");
      else if (result.mode === "copied") toast.success("Link copied to clipboard");
      else if (result.mode === "error") toast.error("Couldn't share");
    } catch {
      try {
        await navigator.clipboard.writeText(buildShopDeepLink(s.slug));
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Couldn't share");
      }
    }
  }, [effectiveCenter]);

  const handleToggleFavoriteSelected = useCallback(async (s: StorePin) => {
    const res = await toggleFavorite(s.id, {
      name: s.name, slug: s.slug, category: s.category, logo_url: s.logo_url,
    });
    if (res.needsAuth) { toast.error("Sign in to save favorites"); return; }
    if (res.error) { toast.error("Couldn't update favorites"); return; }
    if (res.queued) { toast.success(res.added ? "Saved offline" : "Removed offline"); return; }
    toast.success(res.added ? "Added to favorites" : "Removed from favorites");
  }, [toggleFavorite]);

  const handleRideSelected = useCallback((s: StorePin, promo?: string | null) => {
    trackInitiateCheckout({
      eventId: `ride-book-${s.id}-${Date.now()}`,
      externalId: currentUserId || undefined,
      sourceType: "ride_book", sourceTable: "store_profiles", sourceId: s.id,
      payload: { destination: s.address || s.name, promo: promo || undefined },
    });
    const qp = new URLSearchParams({
      destination: s.address || s.name,
      destLat: String(s.latitude),
      destLng: String(s.longitude),
    });
    if (promo) qp.set("promo", promo);
    navigate(`/rides/hub?${qp.toString()}`);
  }, [currentUserId, navigate]);

  const handleExitTripMode = () => { setTripMode(false); setTripStops([]); };

  const handleShareTrail = useCallback(() => {
    if (!tripStops.length) return;
    const ids = tripStops.map((s) => s.id).join(",");
    const url = `${window.location.origin}/store-map?trail=1&stops=${encodeURIComponent(ids)}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Trail link copied! Share it with anyone."))
      .catch(() => toast.error("Couldn't copy to clipboard"));
  }, [tripStops]);;

  /* ── Nearby row component (vertical list item) ── */
  const NearbyRow = ({ store, rank }: { store: StorePin; rank: number }) => {
    const km = getDistKm(store, effectiveCenter);
    const isOpen = isOpenNow(store.hours);
    const todayHours = getTodayHours(store.hours);
    const isLive = !!liveStoreMap[store.id];
    const checkins = checkInMap[store.id] || 0;
    const isInTrip = tripStops.some((s) => s.id === store.id);
    const storeIsNew = isNewStore(store);
    const storeHasDeal = dealStoreIds.has(store.id);
    const isVisited = visitedStoreIds.has(store.id);
    const closingSoon = isOpen === true ? getClosingSoonMinutes(store.hours) : null;

    const handleTap = () => {
      if (tripMode) {
        setTripStops((prev) => {
          const exists = prev.find((s) => s.id === store.id);
          if (exists) return prev.filter((s) => s.id !== store.id);
          if (prev.length >= 8) { toast.error("Max 8 stops"); return prev; }
          toast.success(`Added: ${store.name}`, { duration: 1500 });
          return [...prev, store];
        });
        return;
      }
      setSelectedStore(store);
      setSheetExpanded(false);
      mapRef.current?.panTo({ lat: store.latitude, lng: store.longitude });
      const z = mapRef.current?.getZoom() || 14;
      if (z < 14) mapRef.current?.setZoom(14);
    };

    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleTap}
        className={`w-full flex items-center gap-3 px-4 py-2.5 border-t border-border/10 text-left transition-colors ${
          isInTrip ? "bg-indigo-50/80" : "hover:bg-muted/30"
        }`}
      >
        {/* Rank badge */}
        <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
          {rank}
        </span>

        {/* Logo */}
        <div
          className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{ background: getCategoryColor(store.category) + "18" }}
        >
          {store.logo_url
            ? <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
            : <span className="text-base">{getCategoryIcon(store.category)}</span>
          }
          {isLive && <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-pulse" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-bold text-foreground truncate">{store.name}</p>
            {isInTrip && <CheckCircle2 className="w-3.5 h-3.5 text-foreground shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isOpen === true ? "bg-emerald-100 text-emerald-700" :
              isOpen === false ? "bg-red-100 text-red-600" :
              "bg-muted text-muted-foreground"
            }`}>
              {isOpen === true ? "Open" : isOpen === false ? "Closed" : "—"}
            </span>
            {typeof store.rating === "number" && store.rating > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                <Star className="w-2.5 h-2.5 fill-current" />{store.rating.toFixed(1)}
              </span>
            )}
            {isOpen === true && todayHours && (
              <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                {todayHours}
              </span>
            )}
            {isOpen === false && (() => {
              const o = getOpensAt(store.hours);
              return o ? (
                <span className="text-[10px] font-semibold text-amber-600 shrink-0">Opens {o}</span>
              ) : null;
            })()}
            {checkins > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-foreground">
                <Users className="w-2.5 h-2.5" />{checkins} here
              </span>
            )}
            {storeIsNew && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0">
                <Sparkles className="w-2.5 h-2.5" />New
              </span>
            )}
            {storeHasDeal && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Tag className="w-2.5 h-2.5" />Deal
              </span>
            )}
            {closingSoon !== null && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                ⚠ {closingSoon}min left
              </span>
            )}
            {isVisited && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-foreground text-foreground shrink-0">
                ✓ Visited
              </span>
            )}
          </div>
        </div>

        {/* Quick-save heart */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); handleToggleFavoriteSelected(store); }}
          aria-label={isFavorite(store.id) ? "Remove from favorites" : "Save to favorites"}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 hover:bg-muted/50 transition-colors"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorite(store.id) ? "fill-rose-500 text-rose-500" : "text-muted-foreground/30"}`} />
        </motion.button>

        {/* Distance */}
        <div className="text-right shrink-0 min-w-[44px]">
          {km !== null ? (
            <>
              <p className="text-[12px] font-bold" style={{ color: getCategoryColor(store.category) }}>
                {formatDistLabel(km)}
              </p>
              <p className="text-[10px] text-muted-foreground">{formatWalkMin(km)}</p>
            </>
          ) : (
            <p className="text-[12px] text-muted-foreground/40">—</p>
          )}
        </div>
      </motion.button>
    );
  };

  const tripKm = totalTripKm(tripStops, userLocation);
  const showSheet = !selectedStore && !drawerStore && nearbySorted.length > 0 && !(tripMode && tripStops.length > 0);
  const sheetRows = sheetExpanded ? Math.min(nearbySorted.length, 8) : 3;
  /* Sheet height approx: header 44px + each row 56px */
  const sheetHeight = 44 + sheetRows * 56;

  /* FAB bottom offset adapts to what's visible */
  const fabBottom = drawerStore ? 140 : showSheet ? sheetHeight + 88 + 8 : tripStops.length > 0 ? 220 : 140;

  return (
    <div className="fixed inset-0 z-0 bg-background lg:flex lg:flex-col">
      <SEOHead
        title="Store Map – ZIVO"
        description="Find stores, restaurants, and businesses near you on the interactive map. Filter by category, check hours, save favorites, and get directions."
      />
      <div className="hidden lg:block relative z-[1200] shrink-0">
        <NavBar />
      </div>
      <div className="relative lg:flex-1 h-full lg:h-auto">

        {/* ── Header ── */}
        <div className="absolute top-0 left-0 right-0 z-[1100]"
          style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}>
          <div className="px-4 pb-1">
            <AnimatePresence mode="wait">
              {tripMode ? (
                <motion.div key="trail"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 bg-secondary backdrop-blur-xl shadow-lg"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Route className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-white leading-tight">Shopping Trail</p>
                    <p className="text-[11px] text-foreground mt-0.5">
                      {tripStops.length === 0 ? "Tap stores on map to add stops" :
                        `${tripStops.length} stop${tripStops.length > 1 ? "s" : ""} · ${formatDistLabel(tripKm)} total`}
                    </p>
                  </div>
                  <button onClick={handleExitTripMode}
                    className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : searchOpen ? (
                <motion.div key="search"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl overflow-hidden bg-card/95 backdrop-blur-xl shadow-lg border border-border/20"
                >
                  <div className="flex items-center gap-2.5 px-4 py-3">
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
                    <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="p-1.5 rounded-full bg-muted/60 text-muted-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Recent searches — shown when query is empty */}
                  {!searchQuery.trim() && recentSearches.length > 0 && (
                    <div className="border-t border-border/15 px-4 pt-2.5 pb-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent searches</p>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => setSearchQuery(term)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 border border-border/20 text-[12px] font-semibold text-foreground hover:bg-muted transition-colors"
                          >
                            <Search className="w-3 h-3 text-muted-foreground" />{term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Autocomplete suggestions */}
                  {autoSuggestions.length > 0 && (
                    <div className="border-t border-border/15">
                      {autoSuggestions.map((s) => (
                        <button
                          key={s.id}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
                          onClick={() => {
                            if (searchQuery.trim()) {
                              saveRecentSearch(searchQuery.trim());
                              setRecentSearches(getRecentSearches());
                            }
                            setSelectedStore(s);
                            setSearchOpen(false);
                            setSearchQuery("");
                            setSheetExpanded(false);
                            mapRef.current?.panTo({ lat: s.latitude, lng: s.longitude });
                            const z = mapRef.current?.getZoom() || 14;
                            if (z < 14) mapRef.current?.setZoom(14);
                          }}
                        >
                          <span className="text-lg shrink-0">{getCategoryIcon(s.category)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-foreground truncate">{s.name}</p>
                            {s.address && <p className="text-[11px] text-muted-foreground truncate">{s.address}</p>}
                          </div>
                          {dealStoreIds.has(s.id) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">Deal</span>
                          )}
                          {isNewStore(s) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0">New</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="title"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 bg-card/95 backdrop-blur-xl shadow-lg border border-border/20">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-foreground leading-tight truncate">
                        {searchCenter ? "Stores in this area" : "Explore Stores"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {filteredStores.length} {filteredStores.length === 1 ? "store" : "stores"}
                        {radiusKm && ` within ${radiusKm < 1 ? radiusKm * 1000 + " m" : radiusKm + " km"}`}
                        {trendingCount > 0 && <span className="ml-1 text-emerald-600 font-semibold">· {trendingCount} live</span>}
                        {searchCenter && (
                          <button onClick={() => setSearchCenter(null)} className="ml-1.5 text-primary font-semibold underline">reset</button>
                        )}
                      </p>
                    </div>
                    <motion.button whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        const p = new URLSearchParams();
                        if (activeCategory !== "all") p.set("cat", activeCategory);
                        if (searchQuery.trim()) p.set("q", searchQuery.trim());
                        if (openNowOnly) p.set("open", "1");
                        navigate(`/store-map/list${p.toString() ? `?${p.toString()}` : ""}`);
                      }}
                      className="h-10 px-3 inline-flex items-center gap-1 rounded-xl bg-primary text-primary-foreground text-[12px] font-bold shadow-sm"
                    >
                      <List className="w-4 h-4" /> See all
                    </motion.button>
                    <button
                      onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/60 hover:bg-muted"
                    >
                      <Search className="w-[18px] h-[18px] text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category chips */}
          {!tripMode && usedCategories.length > 0 && (
            <div className="px-4 pt-2.5 pb-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 w-max">
                {/* Clear all active filters */}
                {activeFiltersCount > 0 && (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={clearAllFilters}
                    className="px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border backdrop-blur-sm bg-secondary text-foreground border-border shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" /> Clear ({activeFiltersCount})
                  </motion.button>
                )}
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { setActiveCategory("all"); setTrendingOnly(false); setSmartFilterActive(false); setSelectedStore(null); }}
                  className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border backdrop-blur-sm ${
                    activeCategory === "all" && !trendingOnly
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-card/90 text-muted-foreground border-border/30 shadow-sm"
                  }`}
                >
                  All ({allStores.length})
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { setOpenNowOnly((v) => !v); setSelectedStore(null); }}
                  className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border backdrop-blur-sm ${
                    openNowOnly ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-card/90 text-muted-foreground border-border/30 shadow-sm"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> Open now ({openNowCount})
                </motion.button>
                {/* Best for now — time-aware smart filter */}
                {(() => { const { label, emoji } = getBestForNow(); return (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => { setSmartFilterActive((v) => !v); setActiveCategory("all"); setTrendingOnly(false); setSelectedStore(null); }}
                    className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border backdrop-blur-sm ${
                      smartFilterActive ? "bg-violet-600 text-white border-violet-600 shadow-md" : "bg-card/90 text-muted-foreground border-border/30 shadow-sm"
                    }`}
                  >
                    <span className="text-[13px]">{emoji}</span> {label}
                  </motion.button>
                ); })()}
                {trendingCount > 0 && (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => { setTrendingOnly((v) => !v); setActiveCategory("all"); setSelectedStore(null); }}
                    className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border backdrop-blur-sm ${
                      trendingOnly ? "bg-orange-500 text-white border-orange-500 shadow-md" : "bg-card/90 text-muted-foreground border-border/30 shadow-sm"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" /> Trending ({trendingCount})
                  </motion.button>
                )}
                {dealStoreIds.size > 0 && (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => { setDealsOnly((v) => !v); setActiveCategory("all"); setSelectedStore(null); }}
                    className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border backdrop-blur-sm ${
                      dealsOnly ? "bg-rose-500 text-white border-rose-500 shadow-md" : "bg-card/90 text-muted-foreground border-border/30 shadow-sm"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" /> Deals ({dealStoreIds.size})
                  </motion.button>
                )}
                {usedCategories.map((cat) => {
                  const count = allStores.filter((s) => s.category === cat.value).length;
                  const isActive = activeCategory === cat.value;
                  return (
                    <motion.button whileTap={{ scale: 0.95 }} key={cat.value}
                      onClick={() => { setActiveCategory(isActive ? "all" : cat.value); setTrendingOnly(false); setSmartFilterActive(false); setSelectedStore(null); }}
                      className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border backdrop-blur-sm ${
                        isActive ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card/90 text-muted-foreground border-border/30 shadow-sm"
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

        {/* ── FABs ── */}
        {!drawerStore && (
          <div className="absolute right-4 z-[1500] flex flex-col gap-2.5 transition-all duration-300"
            style={{ bottom: `${fabBottom}px` }}>
            {/* Refresh */}
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="secondary" size="icon"
                onClick={() => { queryClient.invalidateQueries({ queryKey: ["store-map-all"] }); toast.success("Stores refreshed"); }}
                className="w-12 h-12 rounded-full shadow-lg border border-border/20 bg-card/95 backdrop-blur-xl text-foreground hover:bg-muted"
                aria-label="Refresh stores">
                <RefreshCw className="w-5 h-5" />
              </Button>
            </motion.div>
            {/* Zoom controls */}
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="secondary" size="icon"
                onClick={() => { const m = mapRef.current; if (m) m.setZoom((m.getZoom() ?? 14) + 1); }}
                className="w-12 h-12 rounded-full shadow-lg border border-border/20 bg-card/95 backdrop-blur-xl text-foreground hover:bg-muted"
                aria-label="Zoom in">
                <Plus className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="secondary" size="icon"
                onClick={() => { const m = mapRef.current; if (m) m.setZoom((m.getZoom() ?? 14) - 1); }}
                className="w-12 h-12 rounded-full shadow-lg border border-border/20 bg-card/95 backdrop-blur-xl text-foreground hover:bg-muted"
                aria-label="Zoom out">
                <Minus className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => {
                  if (tripMode) { handleExitTripMode(); }
                  else { setTripMode(true); setSelectedStore(null); toast("Tap stores to build your shopping trail", { duration: 3000 }); }
                }}
                className={`w-12 h-12 rounded-full shadow-lg border relative ${
                  tripMode
                    ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                    : "border-border/20 bg-card/95 backdrop-blur-xl text-foreground hover:bg-muted"
                }`}
                size="icon" variant="secondary"
                aria-label="Shopping trail"
              >
                <Route className="w-5 h-5" />
                {tripStops.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-foreground text-white text-[10px] font-bold flex items-center justify-center border-2 border-card">
                    {tripStops.length}
                  </span>
                )}
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="secondary" size="icon" onClick={handleLocateMe}
                className="w-12 h-12 rounded-full shadow-lg border border-border/20 bg-card/95 backdrop-blur-xl hover:bg-muted"
                style={{ color: userLocation ? "#4285F4" : undefined }}
                aria-label="My location">
                <Locate className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="secondary" size="icon" onClick={handleRecenter}
                className="w-12 h-12 rounded-full shadow-lg border border-border/20 bg-card/95 backdrop-blur-xl text-foreground hover:bg-muted"
                aria-label="Recenter">
                <Navigation className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="secondary" size="icon"
                onClick={() => setMapStyle((s) => s === "light" ? "dark" : s === "dark" ? "satellite" : "light")}
                className={`w-12 h-12 rounded-full shadow-lg border border-border/20 bg-card/95 backdrop-blur-xl hover:bg-muted relative ${
                  mapStyle !== "light" ? "text-primary border-primary/40" : "text-foreground"
                }`}
                aria-label="Toggle map style"
              >
                <Layers className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold px-1 py-px rounded-full bg-primary text-primary-foreground leading-tight">
                  {mapStyle === "light" ? "L" : mapStyle === "dark" ? "D" : "S"}
                </span>
              </Button>
            </motion.div>
          </div>
        )}

        {/* ── Map ── */}
        <div ref={mapContainerRef} className="absolute inset-0" style={{ touchAction: "none" }} />

        {/* Map loading overlay — visible from first paint so the user
            never sees a blank white screen while the SDK + key resolve. */}
        {!mapReady && !mapError && (
          <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-[#f5f5f5]">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mb-4 animate-pulse">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Loading map…</p>
            <p className="text-[11px] text-muted-foreground mt-1">Finding stores near you</p>
            {/* Indeterminate shimmer bar — sliding-half pattern.
                The Tailwind `shimmer` keyframe (translateX -100% → 100%)
                animates the inner half-width bar across the track. */}
            <div className="mt-4 w-40 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-1/2 bg-primary rounded-full animate-shimmer" />
            </div>
          </div>
        )}

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

        {/* ── Empty state ── */}
        <AnimatePresence>
          {mapReady && filteredStores.length === 0 && !selectedStore && !drawerStore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-[160px] left-1/2 -translate-x-1/2 z-[1400] w-[270px]"
            >
              {(() => {
                const { title, hint } = getEmptyReason(openNowOnly, trendingOnly, smartFilterActive, searchQuery, activeCategory, radiusKm);
                return (
                  <div className="bg-card/96 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-xl border border-border/20 text-center">
                    <p className="text-[15px] font-bold text-foreground">{title}</p>
                    <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{hint}</p>
                    <button
                      onClick={() => { setActiveCategory("all"); setOpenNowOnly(false); setTrendingOnly(false); setSmartFilterActive(false); setRadiusKm(null); setSearchQuery(""); setSearchCenter(null); }}
                      className="mt-3 px-5 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-bold shadow-sm"
                    >
                      Clear all filters
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── "Search this area" floating button ── */}
        <AnimatePresence>
          {showSearchArea && !selectedStore && !drawerStore && !tripMode && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1050]"
            >
              <button
                onClick={handleSearchArea}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 bg-card/95 backdrop-blur-xl shadow-xl border border-border/20 text-[13px] font-bold text-foreground"
              >
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Search this area
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── GPS denied banner ── */}
        <AnimatePresence>
          {locationDenied && !userLocation && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-[72px] left-3 right-3 z-[1600] flex items-center gap-2 rounded-2xl bg-amber-500/95 backdrop-blur-xl shadow-lg px-4 py-2.5 text-white text-[12px] font-semibold"
            >
              <Locate className="w-4 h-4 shrink-0" />
              <span className="flex-1">Location unavailable — distances won't show</span>
              <button
                onClick={() => { handleLocateMe(); }}
                className="text-[11px] font-bold underline underline-offset-2 hover:no-underline"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Expandable nearby sheet ── */}
        <AnimatePresence>
          {showSheet && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute left-3 right-3 z-[1400] rounded-[20px] overflow-hidden bg-card/96 backdrop-blur-xl shadow-2xl border border-border/20"
              style={{ bottom: "88px" }}
            >
              {/* Recently viewed strip */}
              {showRecentRow && (
                <div className="px-3 pt-2.5 pb-1 border-b border-border/10">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Recently viewed</p>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {recentStores.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedStore(s); setSheetExpanded(false); mapRef.current?.panTo({ lat: s.latitude, lng: s.longitude }); const z = mapRef.current?.getZoom() || 14; if (z < 14) mapRef.current?.setZoom(14); }}
                        className="flex-shrink-0 flex items-center gap-1.5 bg-muted/40 hover:bg-muted/70 border border-border/20 rounded-xl px-2.5 py-1.5 transition-colors"
                      >
                        <span className="text-sm">{getCategoryIcon(s.category)}</span>
                        <span className="text-[11px] font-semibold text-foreground whitespace-nowrap max-w-[90px] truncate">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Radius chips row */}
              <div className="px-3 pt-2.5 pb-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setRadiusKm(opt.value)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${
                      radiusKm === opt.value
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-muted/50 text-muted-foreground border-border/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Sheet header */}
              <button
                onClick={() => setSheetExpanded((v) => !v)}
                className="w-full flex items-center gap-2 px-4 py-2 border-t border-border/10"
              >
                <p className="text-[12px] font-bold text-foreground flex-1 text-left">
                  {effectiveCenter
                    ? `${nearbySorted.length} stores${radiusKm ? ` within ${radiusKm < 1 ? radiusKm * 1000 + " m" : radiusKm + " km"}` : " nearby"}`
                    : `${nearbySorted.length} stores`}
                  {tripMode && tripStops.length > 0
                    ? <span className="ml-1.5 text-foreground font-semibold">· {tripStops.length} stops · {formatTripEta(tripKm)}</span>
                    : tripMode
                    ? <span className="ml-1.5 text-foreground font-semibold">· tap to add to trail</span>
                    : null}
                </p>
                {nearbySorted.length > 3 && (
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-primary">
                    {sheetExpanded ? <><ChevronDown className="w-3.5 h-3.5" /> Less</> : <><ChevronUp className="w-3.5 h-3.5" /> {nearbySorted.length - 3} more</>}
                  </span>
                )}
              </button>

              {/* Store rows */}
              <div
                className="overflow-y-auto transition-all duration-300"
                style={{ maxHeight: sheetExpanded ? "320px" : "168px" }}
              >
                {nearbySorted.slice(0, sheetExpanded ? 10 : 3).map((store, idx) => (
                  <NearbyRow key={store.id} store={store} rank={idx + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Shopping Trail panel ── */}
        <AnimatePresence>
          {tripMode && tripStops.length > 0 && !drawerStore && (
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute bottom-[80px] left-3 right-3 z-[1600]"
            >
              <div className="rounded-[20px] overflow-hidden shadow-2xl border border-border bg-white/95 backdrop-blur-xl">
                <div className="px-4 pt-3 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                      <Route className="w-4 h-4 text-foreground" />
                      Your Shopping Trail
                    </p>
                    <span className="text-[11px] text-foreground font-semibold">
                      {formatDistLabel(tripKm)} · {formatTripEta(tripKm)}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {tripStops.map((stop, idx) => (
                      <div key={stop.id} className="flex-shrink-0 flex items-center gap-1.5">
                        {idx > 0 && <ChevronRight className="w-3 h-3 text-foreground shrink-0" />}
                        <div className="flex items-center gap-1.5 bg-foreground border border-border rounded-xl px-2.5 py-1.5">
                          <span className="w-5 h-5 rounded-full bg-foreground text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-[11px] font-semibold text-foreground whitespace-nowrap max-w-[100px] truncate">{stop.name}</p>
                          <button
                            onClick={() => setTripStops((prev) => prev.filter((s) => s.id !== stop.id))}
                            className="text-foreground hover:text-red-500"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex border-t border-border">
                  <button className="flex-1 py-3 text-[12px] font-bold text-red-500 hover:bg-red-50" onClick={handleExitTripMode}>
                    Clear
                  </button>
                  <div className="w-px bg-foreground" />
                  {tripStops.length >= 3 && (
                    <>
                      <button
                        className="flex-1 py-3 text-[12px] font-bold text-foreground hover:bg-foreground flex items-center justify-center gap-1"
                        onClick={() => {
                          const optimized = optimizeTrailStops(tripStops, userLocation);
                          setTripStops(optimized);
                          toast.success("Route optimized for shortest walk");
                        }}
                      >
                        ✦ Optimize
                      </button>
                      <div className="w-px bg-foreground" />
                    </>
                  )}
                  <button
                    className="flex-1 py-3 text-[12px] font-bold text-primary hover:bg-primary/5 flex items-center justify-center gap-1"
                    onClick={handleShareTrail}
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <div className="w-px bg-foreground" />
                  <button
                    className="flex-1 py-3 text-[12px] font-bold text-foreground hover:bg-foreground flex items-center justify-center gap-1.5"
                    onClick={() => navigateShoppingTrail(tripStops, userLocation)}
                  >
                    <Navigation className="w-3.5 h-3.5" /> Navigate
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Selected store card ── */}
        <AnimatePresence>
          {selectedStore && !drawerStore && !tripMode && (
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
                {/* Gallery banner — first photo when available */}
                {selectedStoreGallery.length > 0 && (
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={selectedStoreGallery[0]}
                      alt={selectedStore.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
                    {selectedStoreGallery.length > 1 && (
                      <span className="absolute bottom-2 right-3 text-[10px] font-bold text-white/90 bg-black/40 px-1.5 py-0.5 rounded-full">
                        +{selectedStoreGallery.length - 1} more
                      </span>
                    )}
                  </div>
                )}
                <div className="p-4 flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
                    style={{ background: getCategoryColor(selectedStore.category) + "12" }}>
                    {selectedStore.logo_url
                      ? <img src={selectedStore.logo_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-2xl">{getCategoryIcon(selectedStore.category)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[15px] truncate text-foreground leading-tight">{selectedStore.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ background: getCategoryColor(selectedStore.category) + "15", color: getCategoryColor(selectedStore.category) }}>
                        {getCategoryLabel(selectedStore.category)}
                      </span>
                      {typeof selectedStore.rating === "number" && selectedStore.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                          <Star className="w-3 h-3 fill-current" /> {selectedStore.rating.toFixed(1)}
                        </span>
                      )}
                      {(() => {
                        const km = getDistKm(selectedStore, effectiveCenter);
                        return km !== null ? (
                          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground">
                            <Timer className="w-3 h-3" /> {formatDistLabel(km)} · {formatWalkMin(km)}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    {/* Today's hours */}
                    {(() => {
                      const t = getTodayHours(selectedStore.hours);
                      const isOpen = isOpenNow(selectedStore.hours);
                      if (t) {
                        if (isOpen) {
                          return (
                            <p className="text-[11px] mt-1 font-semibold flex items-center gap-1 text-emerald-600">
                              <Clock className="w-3 h-3 shrink-0" /> Today: {t}
                            </p>
                          );
                        }
                        const opensAt = getOpensAt(selectedStore.hours);
                        return (
                          <p className="text-[11px] mt-1 font-semibold flex items-center gap-1 text-red-500">
                            <Clock className="w-3 h-3 shrink-0" />
                            Closed{opensAt ? ` · Opens at ${opensAt}` : ""}
                          </p>
                        );
                      }
                      return selectedStore.address ? (
                        <p className="text-[11px] mt-1.5 truncate flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" /> {selectedStore.address}
                        </p>
                      ) : null;
                    })()}
                    {/* Closes soon warning */}
                    {(() => {
                      const mins = isOpenNow(selectedStore.hours) === true ? getClosingSoonMinutes(selectedStore.hours) : null;
                      return mins !== null ? (
                        <p className="text-[11px] mt-0.5 font-bold text-amber-600 flex items-center gap-1">
                          ⚠ Closes in {mins} min
                        </p>
                      ) : null;
                    })()}
                    {/* Check-in count */}
                    {checkInMap[selectedStore.id] > 0 && (
                      <p className="text-[11px] mt-0.5 flex items-center gap-1 text-foreground font-semibold">
                        <Users className="w-3 h-3" /> {checkInMap[selectedStore.id]} people here recently
                      </p>
                    )}
                    {/* GPS nudge */}
                    {!effectiveCenter && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLocateMe(); }}
                        className="text-[11px] mt-0.5 text-primary font-semibold flex items-center gap-1"
                      >
                        <Locate className="w-3 h-3" /> Enable location for distance
                      </button>
                    )}
                    {/* Badges */}
                    {(isNewStore(selectedStore) || dealStoreIds.has(selectedStore.id) || visitedStoreIds.has(selectedStore.id)) && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {isNewStore(selectedStore) && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                            <Sparkles className="w-2.5 h-2.5" />New
                          </span>
                        )}
                        {dealStoreIds.has(selectedStore.id) && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            <Tag className="w-2.5 h-2.5" />Deal
                          </span>
                        )}
                        {visitedStoreIds.has(selectedStore.id) && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-foreground text-foreground">
                            ✓ Visited
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </div>
                </div>

                <div className="flex border-t border-border/20 flex-wrap">
                  <button
                    className="flex-1 min-w-[33%] py-3 text-[12px] font-bold text-center text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      trackInitiateCheckout({
                        eventId: `ride-book-${selectedStore.id}-${Date.now()}`,
                        externalId: currentUserId || undefined,
                        sourceType: "ride_book", sourceTable: "store_profiles", sourceId: selectedStore.id,
                        payload: { destination: selectedStore.address || selectedStore.name },
                      });
                      navigate(`/rides/hub?destination=${encodeURIComponent(selectedStore.address || selectedStore.name)}&destLat=${selectedStore.latitude}&destLng=${selectedStore.longitude}`);
                    }}
                  >
                    <Car className="w-3.5 h-3.5" /> Ride There
                  </button>
                  {selectedStore.category !== "auto-repair" && (
                    <>
                      <div className="w-px bg-border/20" />
                      <button
                        className="flex-1 min-w-[33%] py-3 text-[12px] font-bold text-center text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5"
                        onClick={(e) => { e.stopPropagation(); navigate(`/grocery/shop/${selectedStore.slug}`); }}
                      >
                        <Store className="w-3.5 h-3.5" /> View Store
                      </button>
                      <div className="w-px bg-border/20" />
                      <button
                        className="flex-1 min-w-[33%] py-3 text-[12px] font-bold text-center text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5"
                        onClick={(e) => { e.stopPropagation(); handleShareSelected(selectedStore); }}
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      {selectedStore.phone && (
                        <>
                          <div className="w-px bg-border/20" />
                          <button
                            className="flex-1 min-w-[33%] py-3 text-[12px] font-bold text-center text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5"
                            onClick={(e) => { e.stopPropagation(); window.open(`tel:${selectedStore.phone}`, "_self"); }}
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 px-3 py-2 border-t border-border/20 bg-muted/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTripMode(true);
                      setTripStops([selectedStore]);
                      setSelectedStore(null);
                      toast("Trail started! Tap more stores to add stops", { duration: 3000 });
                    }}
                    className="flex-1 h-11 rounded-xl bg-foreground text-white inline-flex items-center justify-center gap-1.5 text-[12px] font-bold"
                  >
                    <Route className="w-4 h-4" /> Add to Trail
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavoriteSelected(selectedStore); }}
                    aria-pressed={isFavorite(selectedStore.id)}
                    className={`flex-1 h-11 rounded-xl inline-flex items-center justify-center gap-1.5 text-[12px] font-bold transition-colors ${
                      isFavorite(selectedStore.id) ? "bg-rose-500 text-white" : "bg-card text-foreground border border-border/40"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(selectedStore.id) ? "fill-current" : ""}`} />
                    {isFavorite(selectedStore.id) ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections({ lat: selectedStore.latitude, lng: selectedStore.longitude, label: selectedStore.name, address: selectedStore.address });
                    }}
                    className="h-11 w-11 rounded-xl bg-card border border-border/40 inline-flex items-center justify-center text-foreground"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDrawerStore(selectedStore); }}
                    className="h-11 w-11 rounded-xl bg-card border border-border/40 inline-flex items-center justify-center text-foreground"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="border-t border-border/20 px-3 py-3 bg-muted/20">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2">
                    {selectedStore.category === "auto-repair" ? "Quick Actions" : "Social-to-Sale"}
                  </p>
                  {liveStoreMap[selectedStore.id] && (
                    <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live — purchase in last 30 min
                    </p>
                  )}
                  {selectedStore.category === "auto-repair" && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        className="h-10 rounded-lg bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                        onClick={(e) => { e.stopPropagation(); navigate(`/book/${selectedStore.slug}`); }}
                      >
                        <Wrench className="w-3.5 h-3.5" /> Book Service
                      </button>
                      <button
                        className="h-10 rounded-lg border border-primary/30 text-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                        disabled={!selectedStore.phone}
                        onClick={(e) => { e.stopPropagation(); if (selectedStore.phone) window.open(`tel:${selectedStore.phone}`, "_self"); }}
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </button>
                    </div>
                  )}
                  {selectedStore.category !== "auto-repair" && selectedStoreProducts.length > 0 ? (
                    <>
                      <select
                        value={selectedProductId}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full h-9 rounded-lg border border-border/40 bg-background px-2 text-xs"
                      >
                        {selectedStoreProducts.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} (${Number(p.price).toFixed(2)})</option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          className="h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/reels", {
                              state: {
                                openCreate: true,
                                commerceLinkDraft: {
                                  linkType: "store_product",
                                  storeId: selectedStore.id, storeProductId: selectedProductId,
                                  checkoutPath: `/grocery/shop/${selectedStore.slug}?buy=${selectedProductId}`,
                                  mapLat: selectedStore.latitude, mapLng: selectedStore.longitude, mapLabel: selectedStore.name,
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
                            trackInitiateCheckout({
                              eventId: `store-buy-${selectedStore.id}-${selectedProductId}-${Date.now()}`,
                              externalId: currentUserId || undefined,
                              sourceType: "store_product", sourceTable: "store_products", sourceId: selectedProductId,
                              payload: { store_id: selectedStore.id },
                            });
                            navigate(`/grocery/shop/${selectedStore.slug}?buy=${selectedProductId}`);
                          }}
                        >
                          Buy Now
                        </button>
                      </div>
                    </>
                  ) : selectedStore.category !== "auto-repair" ? (
                    <p className="text-[11px] text-muted-foreground">Add products to this store to enable Create Reel and Buy Now.</p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {drawerStore && (
          <StoreDetailsDrawer
            store={drawerStore}
            userLoc={userLocation}
            categoryLabel={getCategoryLabel(drawerStore.category)}
            isFavorite={isFavorite(drawerStore.id)}
            isAuthed={isAuthed}
            isLive={!!liveStoreMap[drawerStore.id]}
            onClose={() => setDrawerStore(null)}
            onView={(s) => navigate(`/grocery/shop/${s.slug}`)}
            onRide={(s, promo) => handleRideSelected(s, promo)}
            onDirections={(s) => openDirections({ lat: s.latitude, lng: s.longitude, label: s.name, address: s.address })}
            onShare={(s) => handleShareSelected(s)}
            onToggleFavorite={handleToggleFavoriteSelected}
            onAddToTrail={(s) => {
              setDrawerStore(null);
              setTripMode(true);
              setTripStops((prev) => prev.find((x) => x.id === s.id) ? prev : [...prev, s]);
              toast("Added to trail! Tap more stores to add stops.", { duration: 2500 });
            }}
            onPromoApplied={(code) => toast.success(`Promo ${code} ready for your next ride or order`)}
          />
        )}

        {!drawerStore && <ZivoMobileNav />}
      </div>
    </div>
  );
}
