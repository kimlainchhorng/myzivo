/**
 * HotelsLandingPage
 * Booking-style discovery: tighter hero, dates+guests, quick filters,
 * price/amenities/rating on cards, "Near me" sort.
 *
 * Route: /hotels
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Heart from "lucide-react/dist/esm/icons/heart";
import CalendarIcon from "lucide-react/dist/esm/icons/calendar";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Coffee from "lucide-react/dist/esm/icons/coffee";
import Dog from "lucide-react/dist/esm/icons/dog";
import HotelIcon from "lucide-react/dist/esm/icons/hotel";
import LocateFixed from "lucide-react/dist/esm/icons/locate-fixed";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Search from "lucide-react/dist/esm/icons/search";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Star from "lucide-react/dist/esm/icons/star";
import Users from "lucide-react/dist/esm/icons/users";
import Waves from "lucide-react/dist/esm/icons/waves";
import Wifi from "lucide-react/dist/esm/icons/wifi";

import { useQuery, useQueryClient } from "@tanstack/react-query";

const HotelsMapView = lazy(() => import("@/components/lodging/HotelsMapView"));
const HotelConciergeSheet = lazy(() => import("@/components/lodging/HotelConciergeSheet"));
const GOOGLE_MAPS_KEY: string =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY || "";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { LODGING_STORE_CATEGORIES, normalizeStoreCategory } from "@/hooks/useOwnerStoreProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/SmartImage";

import tabHotelsBg from "@/assets/tab-hotels-bg.jpg";
import destPhnomPenh from "@/assets/destinations/phnom-penh.jpg";
import destSiemReap from "@/assets/destinations/siem-reap.jpg";
import destSihanoukville from "@/assets/destinations/sihanoukville.jpg";
import destKep from "@/assets/destinations/kep.jpg";
import destKampot from "@/assets/destinations/kampot.jpg";
import destBattambang from "@/assets/destinations/battambang.jpg";

interface DirectoryStore {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  setup_complete: boolean | null;
  is_verified?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
}

const FILTERS: Array<{ id: string; label: string; match: (cat: string) => boolean }> = [
  { id: "all", label: "All", match: () => true },
  { id: "hotel", label: "Hotels", match: (c) => c.includes("hotel") },
  { id: "resort", label: "Resorts", match: (c) => c.includes("resort") },
  { id: "guesthouse", label: "Guesthouses", match: (c) => c.includes("guest") || c.includes("bed and breakfast") },
];

const QUICK_TAGS: Array<{ id: string; label: string; keywords: string[] }> = [
  { id: "beach", label: "Beachfront", keywords: ["beach", "beachfront", "sea"] },
  { id: "pool", label: "Pool", keywords: ["pool", "swimming"] },
  { id: "breakfast", label: "Breakfast", keywords: ["breakfast"] },
  { id: "wifi", label: "Free Wi-Fi", keywords: ["wifi", "wi-fi"] },
  { id: "family", label: "Family", keywords: ["family", "kids", "children"] },
  { id: "pet", label: "Pet-friendly", keywords: ["pet"] },
];

const POPULAR_DESTINATIONS: Array<{ id: string; label: string; city: string; img: string }> = [
  { id: "pp", label: "Phnom Penh", city: "phnom penh", img: destPhnomPenh },
  { id: "sr", label: "Siem Reap", city: "siem reap", img: destSiemReap },
  { id: "sv", label: "Sihanoukville", city: "sihanoukville", img: destSihanoukville },
  { id: "kep", label: "Kep", city: "kep", img: destKep },
  { id: "kampot", label: "Kampot", city: "kampot", img: destKampot },
  { id: "btb", label: "Battambang", city: "battambang", img: destBattambang },
];

const todayUTC = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

function haversineDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HotelsLandingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { format: fmtPrice } = useCurrency();

  // Honor share-card / deep-link query params on mount: ?city=&ci=&co=&adults=&children=
  // Matches the params built by ZivoCardPicker's hotel composer.
  const initial = useMemo(() => {
    const parseDate = (raw: string | null): Date | null => {
      if (!raw) return null;
      const d = new Date(raw + "T00:00:00");
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const parseInt10 = (raw: string | null): number | null => {
      if (!raw) return null;
      const n = parseInt(raw, 10);
      return Number.isFinite(n) && n >= 0 ? n : null;
    };
    return {
      city: searchParams.get("city") || "",
      ci: parseDate(searchParams.get("ci")),
      co: parseDate(searchParams.get("co")),
      adults: parseInt10(searchParams.get("adults")),
      children: parseInt10(searchParams.get("children")),
      filter: searchParams.get("filter") || "all",
      tags: (searchParams.get("tags") || "").split(",").filter(Boolean),
    };
    // We compute this once at mount; subsequent in-page changes shouldn't
    // re-overwrite the user's edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [search, setSearch] = useState(initial.city);
  const [activeFilter, setActiveFilter] = useState<string>(initial.filter);
  const [activeTags, setActiveTags] = useState<string[]>(initial.tags);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("hotel_recent_searches") || "[]") as string[]; }
    catch { return []; }
  });
  const [checkIn, setCheckIn] = useState<Date>(() => initial.ci ?? todayUTC());
  const [checkOut, setCheckOut] = useState<Date>(
    () => initial.co ?? addDays(initial.ci ?? todayUTC(), 1)
  );
  const [guests, setGuests] = useState<number>(initial.adults ?? 2);
  const [children, setChildren] = useState<number>(initial.children ?? 0);
  const [rooms, setRooms] = useState<number>(1);
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "rating" | "near_me">("default");
  const [maxBudget, setMaxBudget] = useState<number | null>(null); // USD per night, null = no limit
  const [savedOnly, setSavedOnly] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroSentinelRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("hotel_faves") || "[]") as string[]); }
    catch { return new Set<string>(); }
  });

  type RecentlyViewed = {
    id: string;
    name: string;
    category: string | null;
    address: string | null;
    logo_url: string | null;
    banner_url: string | null;
    viewed_at: number;
  };
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>(() => {
    try { return (JSON.parse(localStorage.getItem("hotel_recently_viewed") || "[]") as RecentlyViewed[]).filter((x) => x?.id && x?.name); }
    catch { return []; }
  });
  const clearRecentlyViewed = () => {
    try { localStorage.removeItem("hotel_recently_viewed"); } catch {}
    setRecentlyViewed([]);
  };

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [conciergeOpen, setConciergeOpen] = useState(false);

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem("hotel_faves", JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // Show a sticky compact header once the hero scrolls out of view
  useEffect(() => {
    const onScroll = () => {
      const el = heroSentinelRef.current;
      if (!el) return;
      // Sentinel sits right below the hero. When its top is above 0 the hero has scrolled away.
      setShowStickyBar(el.getBoundingClientRect().top < 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync filters back to the URL so refresh / back-button / share preserve state
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    const setOrDelete = (key: string, val: string) => {
      if (val) next.set(key, val); else next.delete(key);
    };
    setOrDelete("city", search.trim());
    setOrDelete("filter", activeFilter !== "all" ? activeFilter : "");
    setOrDelete("tags", activeTags.join(","));
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeFilter, activeTags]);

  const pushRecentSearch = useCallback((value: string) => {
    const v = value.trim();
    if (!v) return;
    setRecentSearches((prev) => {
      const next = [v, ...prev.filter((p) => p.toLowerCase() !== v.toLowerCase())].slice(0, 5);
      try { localStorage.setItem("hotel_recent_searches", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const listQuery = useQuery({
    queryKey: ["hotels-landing"],
    staleTime: 300_000,
    gcTime: 600_000,
    queryFn: async (): Promise<DirectoryStore[]> => {
      const { data, error } = await (supabase as any)
        .from("store_profiles")
        .select("id, name, category, address, logo_url, banner_url, description, setup_complete, is_verified, latitude, longitude")
        .in("category", LODGING_STORE_CATEGORIES)
        .order("setup_complete", { ascending: false })
        .order("name", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data || []) as DirectoryStore[];
    },
  });

  const all = listQuery.data || [];
  const storeIds = useMemo(() => all.map((s) => s.id), [all]);

  // Min rates per store (with stay-length discount info)
  type RateInfo = {
    base: number;
    weeklyPct: number;
    monthlyPct: number;
  };
  const ratesQuery = useQuery({
    queryKey: ["lodge-min-rates", storeIds],
    enabled: storeIds.length > 0,
    staleTime: 300_000,
    queryFn: async (): Promise<Record<string, RateInfo>> => {
      const { data, error } = await (supabase as any)
        .from("lodge_rooms")
        .select("store_id, base_rate_cents, weekly_discount_pct, monthly_discount_pct, is_active")
        .in("store_id", storeIds)
        .eq("is_active", true);
      if (error) throw error;
      const map: Record<string, RateInfo> = {};
      for (const r of (data || []) as Array<{
        store_id: string;
        base_rate_cents: number;
        weekly_discount_pct: number | null;
        monthly_discount_pct: number | null;
      }>) {
        if (!r.base_rate_cents || r.base_rate_cents <= 0) continue;
        const existing = map[r.store_id];
        if (!existing || r.base_rate_cents < existing.base) {
          map[r.store_id] = {
            base: r.base_rate_cents,
            weeklyPct: Number(r.weekly_discount_pct) || 0,
            monthlyPct: Number(r.monthly_discount_pct) || 0,
          };
        }
      }
      return map;
    },
  });

  // Active public promotions per store (largest discount wins)
  type PromoInfo = {
    type: "percent" | "fixed";
    value: number;
    name: string;
    minNights: number;
    maxNights: number | null;
  };
  const promotionsQuery = useQuery({
    queryKey: ["lodge-promotions", storeIds],
    enabled: storeIds.length > 0,
    staleTime: 300_000,
    queryFn: async (): Promise<Record<string, PromoInfo>> => {
      const nowIso = new Date().toISOString();
      const { data, error } = await (supabase as any)
        .from("lodging_promotions")
        .select("store_id, promo_type, discount_value, name, min_nights, max_nights, starts_at, ends_at, active, member_only")
        .in("store_id", storeIds)
        .eq("active", true)
        .eq("member_only", false);
      if (error) {
        // Silently ignore — fall back to base rates
        return {};
      }
      const map: Record<string, PromoInfo> = {};
      for (const r of (data || []) as Array<any>) {
        if (r.starts_at && r.starts_at > nowIso) continue;
        if (r.ends_at && r.ends_at < nowIso) continue;
        const type = r.promo_type === "fixed" ? "fixed" : "percent";
        const value = Number(r.discount_value) || 0;
        if (value <= 0) continue;
        const candidate: PromoInfo = {
          type,
          value,
          name: r.name || "",
          minNights: Number(r.min_nights) || 1,
          maxNights: r.max_nights ? Number(r.max_nights) : null,
        };
        const existing = map[r.store_id];
        // Prefer larger percentage; fixed treated roughly as value cents-equivalent
        const score = (p: PromoInfo) => (p.type === "percent" ? p.value : p.value);
        if (!existing || score(candidate) > score(existing)) {
          map[r.store_id] = candidate;
        }
      }
      return map;
    },
  });

  type PropertyProfile = { amenities: string[]; rating: number | null };

  // Amenities + ratings per store
  const amenitiesQuery = useQuery({
    queryKey: ["lodge-amenities", storeIds],
    enabled: storeIds.length > 0,
    staleTime: 300_000,
    queryFn: async (): Promise<Record<string, PropertyProfile>> => {
      const { data, error } = await (supabase as any)
        .from("lodge_property_profile")
        .select("store_id, popular_amenities, facilities")
        .in("store_id", storeIds);
      if (error) throw error;
      const map: Record<string, PropertyProfile> = {};
      for (const r of (data || []) as Array<{
        store_id: string;
        popular_amenities: string[] | null;
        facilities: string[] | null;
      }>) {
        const list = [...(r.popular_amenities || []), ...(r.facilities || [])]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase());
        map[r.store_id] = {
          amenities: Array.from(new Set(list)),
          rating: null,
        };
      }
      return map;
    },
  });

  // Review counts + true avg per store (lodging_reviews)
  const reviewStatsQuery = useQuery({
    queryKey: ["lodge-review-stats", storeIds],
    enabled: storeIds.length > 0,
    staleTime: 300_000,
    gcTime: 600_000,
    queryFn: async (): Promise<Record<string, { avg: number; count: number }>> => {
      const { data, error } = await (supabase as any)
        .from("lodging_reviews")
        .select("store_id, rating")
        .in("store_id", storeIds)
        .eq("flagged", false);
      if (error) return {};
      const acc: Record<string, { sum: number; count: number }> = {};
      for (const r of (data || []) as Array<{ store_id: string; rating: number }>) {
        const a = (acc[r.store_id] ||= { sum: 0, count: 0 });
        a.sum += Number(r.rating) || 0;
        a.count += 1;
      }
      const out: Record<string, { avg: number; count: number }> = {};
      for (const [id, v] of Object.entries(acc)) {
        out[id] = { avg: v.count ? v.sum / v.count : 0, count: v.count };
      }
      return out;
    },
  });

  const minRates = ratesQuery.data || {};
  const promotions = promotionsQuery.data || {};
  const amenitiesMap = amenitiesQuery.data || {};
  const reviewStats = reviewStatsQuery.data || {};
  const nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn));

  const requestNearMe = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy("near_me");
      },
      () => setCoords(null),
      { timeout: 8000, enableHighAccuracy: false },
    );
  };

  const featured = useMemo(
    () => {
      const completed = all.filter((s) => s.setup_complete);
      if (completed.length === 0) return [];
      // Sort featured by review rating so best-reviewed properties surface first
      const withRating = [...completed].sort((a, b) => {
        const ra = reviewStats[a.id]?.count ? reviewStats[a.id].avg : -1;
        const rb = reviewStats[b.id]?.count ? reviewStats[b.id].avg : -1;
        return rb - ra;
      });
      return withRating.slice(0, 6);
    },
    [all, reviewStats]
  );


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matcher = FILTERS.find((f) => f.id === activeFilter)?.match || (() => true);
    return all.filter((store) => {
      const cat = normalizeStoreCategory(store.category);
      if (!matcher(cat)) return false;
      if (q) {
        const haystack = [store.name, store.address, store.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (activeTags.length > 0) {
        const am = amenitiesMap[store.id]?.amenities || [];
        const haystack = [...am, store.description?.toLowerCase() || ""].join(" ");
        const ok = activeTags.every((tagId) => {
          const tag = QUICK_TAGS.find((t) => t.id === tagId);
          if (!tag) return true;
          return tag.keywords.some((k) => haystack.includes(k));
        });
        if (!ok) return false;
      }
      if (savedOnly && !favorites.has(store.id)) return false;
      if (maxBudget !== null) {
        const cents = minRates[store.id]?.base;
        if (typeof cents === "number" && cents / 100 > maxBudget) return false;
      }
      return true;
    });
  }, [all, search, activeFilter, activeTags, amenitiesMap, savedOnly, favorites, maxBudget, minRates]);

  const sorted = useMemo(() => {
    if (sortBy === "price_asc") {
      return [...filtered].sort((a, b) => (minRates[a.id]?.base ?? Infinity) - (minRates[b.id]?.base ?? Infinity));
    }
    if (sortBy === "price_desc") {
      return [...filtered].sort((a, b) => (minRates[b.id]?.base ?? 0) - (minRates[a.id]?.base ?? 0));
    }
    if (sortBy === "rating") {
      return [...filtered].sort((a, b) => {
        const ra = reviewStats[a.id]?.count ? reviewStats[a.id].avg : -1;
        const rb = reviewStats[b.id]?.count ? reviewStats[b.id].avg : -1;
        return rb - ra;
      });
    }
    if (sortBy === "near_me") {
      if (coords) {
        return [...filtered].sort((a, b) => {
          const da = (typeof a.latitude === "number" && typeof a.longitude === "number")
            ? haversineDist(coords.lat, coords.lng, a.latitude, a.longitude) : Infinity;
          const db = (typeof b.latitude === "number" && typeof b.longitude === "number")
            ? haversineDist(coords.lat, coords.lng, b.latitude, b.longitude) : Infinity;
          return da - db;
        });
      }
      return [...filtered].sort((a, b) => (favorites.has(a.id) ? 0 : 1) - (favorites.has(b.id) ? 0 : 1));
    }
    return filtered;
  }, [filtered, sortBy, minRates, favorites, reviewStats, coords]);

  const toggleTag = (id: string) => {
    setActiveTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-dvh bg-background pb-24">
      <Helmet>
        <title>Hotels & Resorts — Find Your Stay | ZIVO</title>
        <meta name="description" content="Discover hotels, resorts and guesthouses. Browse properties in Phnom Penh, Siem Reap, Sihanoukville and more. Book direct on ZIVO." />
        <link rel="canonical" href="https://hizivo.com/hotels" />
        <meta property="og:title" content="Hotels & Resorts — Find Your Stay | ZIVO" />
        <meta property="og:description" content="Discover hotels, resorts and guesthouses. Browse properties and book direct on ZIVO." />
        <meta property="og:image" content="https://hizivo.com/og-hotels.jpg" />
        <meta property="og:url" content="https://hizivo.com/hotels" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hotels & Resorts — Find Your Stay | ZIVO" />
        <meta name="twitter:description" content="Discover hotels, resorts and guesthouses. Book direct on ZIVO." />
        <meta name="twitter:image" content="https://hizivo.com/og-hotels.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Hotels & Resorts — ZIVO",
          "url": "https://hizivo.com/hotels",
          "description": "Search and book hotels, resorts and guesthouses on ZIVO.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://hizivo.com/hotels-list?city={city}",
            "query-input": "required name=city"
          }
        })}</script>
      </Helmet>

      {/* Hero — tightened */}
      <div className="relative overflow-hidden">
        <img
          src={tabHotelsBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-background" />

        <div className="relative px-4 pt-3 pb-4 safe-area-top">
          <div className="flex items-center gap-2">
            <button type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="h-11 w-11 -ml-1 rounded-full flex items-center justify-center bg-white/15 backdrop-blur active:bg-white/25 transition touch-manipulation"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-base font-bold text-white flex-1 truncate drop-shadow-lg">Hotels & Resorts</h1>
          </div>

          <div className="mt-3 mb-3">
            <h2 className="text-[22px] sm:text-[26px] font-extrabold text-white leading-tight drop-shadow-lg">
              Find your perfect stay
            </h2>
            <p className="mt-1 text-[13px] text-white/90 drop-shadow-md">
              Hotels, resorts and guesthouses across Cambodia.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={(e) => pushRecentSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") pushRecentSearch((e.target as HTMLInputElement).value); }}
              placeholder="Search city, hotel name..."
              aria-label="Search hotels and destinations"
              className="w-full h-11 pl-10 pr-9 rounded-2xl bg-white text-foreground placeholder:text-muted-foreground shadow-lg outline-none text-sm focus:ring-2 focus:ring-primary/40 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted active:scale-95 transition"
              >
                <span className="text-base leading-none">×</span>
              </button>
            )}
          </div>

          {/* Dates + Guests */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Popover open={datesOpen} onOpenChange={setDatesOpen}>
              <PopoverTrigger asChild>
                <button type="button" className="h-11 rounded-2xl bg-white/95 backdrop-blur shadow-md text-left px-3 flex items-center gap-2 active:scale-[0.98] transition">
                  <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">
                      {nights} night{nights > 1 ? "s" : ""}
                    </p>
                    <p className="text-[12px] font-semibold text-foreground truncate leading-tight">
                      {format(checkIn, "MMM d")} – {format(checkOut, "MMM d")}
                    </p>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 max-w-[92vw]" align="start">
                <div className="p-2 border-b">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Pick check-in & check-out
                  </p>
                </div>
                <Calendar
                  mode="range"
                  selected={{ from: checkIn, to: checkOut }}
                  onSelect={(range) => {
                    if (range?.from) setCheckIn(range.from);
                    if (range?.to) {
                      setCheckOut(range.to);
                      setDatesOpen(false);
                    }
                  }}
                  numberOfMonths={1}
                  disabled={(d) => d < todayUTC()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
              <PopoverTrigger asChild>
                <button type="button" className="h-11 rounded-2xl bg-white/95 backdrop-blur shadow-md text-left px-3 flex items-center gap-2 active:scale-[0.98] transition">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">
                      Guests · Rooms
                    </p>
                    <p className="text-[12px] font-semibold text-foreground truncate leading-tight">
                      {guests + children} guest{guests + children > 1 ? "s" : ""} · {rooms} room{rooms > 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                <div className="space-y-3">
                  <Stepper label="Adults" value={guests} min={1} max={20} onChange={setGuests} />
                  <Stepper label="Children" value={children} min={0} max={10} onChange={setChildren} />
                  <Stepper label="Rooms" value={rooms} min={1} max={10} onChange={setRooms} />
                  <Button className="w-full h-9" onClick={() => setGuestsOpen(false)}>
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div ref={heroSentinelRef} aria-hidden className="h-px" />

      {/* Sticky compact search bar — appears after hero scrolls past */}
      <div
        className={cn(
          "sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border transition-all duration-200",
          showStickyBar ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden border-0",
        )}
      >
        <div className="px-3 py-2 flex items-center gap-2 safe-area-top">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center bg-muted active:bg-muted/70 touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={(e) => pushRecentSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") pushRecentSearch((e.target as HTMLInputElement).value); }}
              placeholder="Search city, hotel name..."
              aria-label="Search hotels and destinations (sticky)"
              className="w-full h-9 pl-9 pr-8 rounded-full bg-muted text-foreground placeholder:text-muted-foreground outline-none text-sm focus:ring-2 focus:ring-primary/40"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-background"
              >
                <span className="text-base leading-none">×</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDatesOpen(true)}
            className="h-9 px-2.5 shrink-0 rounded-full bg-muted text-[11px] font-semibold text-foreground inline-flex items-center gap-1 active:bg-muted/70"
            aria-label="Edit dates"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
            {format(checkIn, "MMM d")}–{format(checkOut, "MMM d")}
          </button>
        </div>
      </div>

      {/* Recent searches */}
      {!search && recentSearches.length > 0 && (
        <section className="pt-3">
          <div className="px-4 flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[11px] text-muted-foreground shrink-0 mr-0.5">Recent:</span>
            {recentSearches.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setSearch(q)}
                className="shrink-0 rounded-full px-3 py-1 text-[11px] font-medium bg-muted/70 text-foreground active:bg-muted truncate max-w-[140px]"
              >
                {q}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setRecentSearches([]);
                try { localStorage.removeItem("hotel_recent_searches"); } catch {}
              }}
              className="shrink-0 text-[11px] text-muted-foreground underline ml-1"
            >
              Clear
            </button>
          </div>
        </section>
      )}

      {/* Quick filter chips */}
      <section className="pt-3">
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button type="button"
            onClick={() => {
              if (coords) { setCoords(null); setSortBy("default"); }
              else requestNearMe();
            }}
            className={cn(
              "shrink-0 inline-flex min-h-[40px] items-center gap-1 rounded-full px-3.5 py-2 text-[11px] font-semibold transition border shadow-sm touch-manipulation",
              coords
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border/80 hover:bg-muted active:bg-muted",
            )}
          >
            <LocateFixed className="w-3 h-3" />
            Near me
          </button>
          {favorites.size > 0 && (
            <button
              type="button"
              onClick={() => setSavedOnly((v) => !v)}
              aria-pressed={savedOnly}
              className={cn(
                "shrink-0 inline-flex min-h-[40px] items-center gap-1 rounded-full px-3.5 py-2 text-[11px] font-semibold transition border shadow-sm touch-manipulation",
                savedOnly
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border/80 hover:bg-muted active:bg-muted",
              )}
            >
              <Heart className={cn("w-3 h-3", savedOnly ? "fill-current" : "fill-rose-500 text-rose-500")} />
              Saved ({favorites.size})
            </button>
          )}
          {QUICK_TAGS.map((tag) => {
            const active = activeTags.includes(tag.id);
            return (
              <button type="button"
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "shrink-0 min-h-[40px] rounded-full px-3.5 py-2 text-[11px] font-semibold transition border shadow-sm touch-manipulation",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border/80 hover:bg-muted active:bg-muted",
                )}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular destinations */}
      <section className="pt-4">
        <div className="px-4 flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            Popular destinations
          </h3>
        </div>
        <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {POPULAR_DESTINATIONS.map((dest) => {
            const active = search.toLowerCase() === dest.city;
            return (
              <button type="button"
                key={dest.id}
                onClick={() => {
                  const next = active ? "" : dest.city;
                  setSearch(next);
                  if (next) pushRecentSearch(next);
                  setActiveFilter("all");
                  document.getElementById("hotels-all")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={
                  "shrink-0 relative w-[140px] h-[88px] rounded-2xl overflow-hidden border transition active:scale-95 " +
                  (active ? "border-primary ring-2 ring-primary/30" : "border-border")
                }
                aria-label={`Show hotels in ${dest.label}`}
              >
                <img
                  src={dest.img}
                  alt={dest.label}
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  className="absolute inset-0 w-full h-full object-cover bg-muted"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute bottom-1.5 left-2 right-2 text-[11px] font-bold text-white drop-shadow text-left whitespace-nowrap">
                  {dest.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      {!listQuery.isLoading && featured.length > 0 && (
        <section className="pt-5">
          <div className="px-4 flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Featured properties
            </h3>
            <button type="button"
              onClick={() => document.getElementById("hotels-all")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="min-h-[40px] px-1 text-[11px] font-semibold text-primary flex items-center gap-0.5 touch-manipulation"
            >
              See all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featured.map((store) => {
              const rate = minRates[store.id];
              const minCents = rate?.base;
              const rs = reviewStats[store.id];
              const rating = rs?.count ? rs.avg : null;
              const promo = promotions[store.id];
              let discountedCents: number | null = null;
              let pctOff = 0;
              if (typeof minCents === "number" && promo && nights >= promo.minNights && (!promo.maxNights || nights <= promo.maxNights)) {
                if (promo.type === "percent") {
                  discountedCents = Math.round(minCents * (1 - promo.value / 100));
                  pctOff = Math.round(promo.value);
                } else {
                  discountedCents = Math.max(0, minCents - Math.round(promo.value * 100));
                  pctOff = Math.round((1 - discountedCents / minCents) * 100);
                }
              }
              const showCents = discountedCents ?? minCents;
              return (
                <button type="button"
                  key={store.id}
                  onClick={() => navigate(`/hotel/${store.id}?ci=${format(checkIn, "yyyy-MM-dd")}&co=${format(checkOut, "yyyy-MM-dd")}&adults=${guests}&children=${children}`)}
                  className="shrink-0 w-[210px] rounded-2xl border border-border bg-card overflow-hidden text-left active:scale-[0.98] transition shadow-sm"
                  aria-label={`Open ${store.name}`}
                >
                  <div className="relative w-full h-28 bg-muted">
                    <SmartImage
                      src={store.banner_url || store.logo_url}
                      alt={store.name}
                      fallback={
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center">
                          <HotelIcon className="w-7 h-7 text-primary/60" />
                        </div>
                      }
                    />
                    {store.is_verified && (
                      <Badge className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] px-1.5 py-0">
                        Verified
                      </Badge>
                    )}
                    {pctOff > 0 && (
                      <Badge className="absolute bottom-1.5 left-1.5 bg-red-600 text-white text-[9px] px-1.5 py-0">
                        -{pctOff}%
                      </Badge>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[13px] font-bold text-foreground truncate">{store.name}</p>
                    {store.address && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{store.address}</span>
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {typeof rating === "number" ? rating.toFixed(1) : "New"}
                      </span>
                      {typeof showCents === "number" ? (
                        <span className="text-[11px] font-bold text-foreground">
                          from{" "}
                          {discountedCents !== null && typeof minCents === "number" && (
                            <span className="line-through text-muted-foreground font-normal mr-0.5">{fmtPrice(minCents / 100, "USD")}</span>
                          )}
                          <span className={discountedCents !== null ? "text-emerald-600" : "text-primary"}>{fmtPrice(showCents / 100, "USD")}</span>
                          <span className="text-muted-foreground font-normal text-[9px]"> /night</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <section className="pt-5">
          <div className="px-4 flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground">Recently viewed</h3>
            <button
              type="button"
              onClick={clearRecentlyViewed}
              className="min-h-[40px] px-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition touch-manipulation"
            >
              Clear
            </button>
          </div>
          <div className="-mx-4 px-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recentlyViewed.map((rv) => (
              <button
                key={rv.id}
                type="button"
                onClick={() => {
                  qc.prefetchQuery({
                    queryKey: ["hotel-detail-rpc", rv.id],
                    queryFn: async () => {
                      const { data } = await (supabase as any).rpc("get_hotel_detail", {
                        p_store_id: rv.id, p_check_in: null, p_check_out: null,
                      });
                      return data;
                    },
                    staleTime: 60_000,
                  });
                  navigate(`/hotel/${rv.id}?ci=${format(checkIn, "yyyy-MM-dd")}&co=${format(checkOut, "yyyy-MM-dd")}&adults=${guests}&children=${children}`);
                }}
                className="shrink-0 w-44 rounded-2xl border border-border bg-card overflow-hidden text-left active:scale-[0.98] transition"
                aria-label={`Open ${rv.name}`}
              >
                <div className="relative h-24 bg-muted">
                  {rv.banner_url || rv.logo_url ? (
                    <img
                      src={rv.banner_url || rv.logo_url || ""}
                      alt={rv.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold text-foreground truncate">{rv.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground capitalize truncate">
                    {rv.category?.replace(/_/g, " ") || "Hotel"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* All Hotels & Resorts */}
      <section id="hotels-all" className="pt-5 scroll-mt-4">
        <div className="px-4 flex items-center justify-between mb-2 gap-3">
          <h3 className="text-sm font-bold text-foreground">All Hotels & Resorts</h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {filtered.length === all.length
                ? `${all.length} found`
                : `${filtered.length} of ${all.length}`}
            </span>
            <div className="inline-flex rounded-full border border-border bg-card overflow-hidden text-[11px] font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                className={cn("min-h-[40px] px-3 py-2 transition touch-manipulation", viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                aria-pressed={viewMode === "map"}
                className={cn("min-h-[40px] px-3 py-2 transition touch-manipulation", viewMode === "map" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Sort chips */}
        <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-[11px] text-muted-foreground shrink-0">Sort:</span>
          {([
            { id: "default", label: "Best match" },
            { id: "rating", label: "Top rated" },
            { id: "price_asc", label: "Price ↑" },
            { id: "price_desc", label: "Price ↓" },
          ] as const).map((opt) => (
            <button type="button"
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={
                "shrink-0 min-h-[40px] rounded-full px-3.5 py-2 text-xs font-semibold transition touch-manipulation " +
                (sortBy === opt.id
                  ? "bg-foreground text-background"
                  : "bg-muted/70 text-muted-foreground active:bg-muted")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Budget filter chips */}
        <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-[11px] text-muted-foreground shrink-0">Budget:</span>
          {([
            { id: null,  label: "Any",        key: "any" },
            { id: 25,    label: "Under $25",   key: "25" },
            { id: 50,    label: "Under $50",   key: "50" },
            { id: 100,   label: "Under $100",  key: "100" },
            { id: 200,   label: "Under $200",  key: "200" },
          ] as const).map((opt) => (
            <button type="button"
              key={opt.key}
              onClick={() => setMaxBudget(opt.id)}
              className={
                "shrink-0 min-h-[40px] rounded-full px-3.5 py-2 text-xs font-semibold transition touch-manipulation " +
                (maxBudget === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/70 text-muted-foreground active:bg-muted")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Type filter chips */}
        <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = f.id === activeFilter;
            return (
              <button type="button"
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={
                  "shrink-0 min-h-[40px] rounded-full px-3.5 py-2 text-xs font-semibold transition touch-manipulation " +
                  (active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/70 text-muted-foreground active:bg-muted")
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {viewMode === "map" ? (
          <div className="px-4">
            <Suspense fallback={<div className="h-[60vh] rounded-2xl bg-muted/20 animate-pulse" />}>
              <HotelsMapView
                apiKey={GOOGLE_MAPS_KEY}
                hotels={sorted
                  .filter((s) => typeof s.latitude === "number" && typeof s.longitude === "number")
                  .map((s) => ({
                    id: s.id,
                    name: s.name,
                    category: s.category,
                    address: s.address,
                    banner_url: s.banner_url,
                    logo_url: s.logo_url,
                    latitude: s.latitude as number,
                    longitude: s.longitude as number,
                    pricePerNightCents: minRates[s.id]?.base ?? null,
                    rating: reviewStats[s.id]?.count ? reviewStats[s.id].avg : null,
                    reviewCount: reviewStats[s.id]?.count ?? 0,
                  }))}
                onSelect={(id) => {
                  qc.prefetchQuery({
                    queryKey: ["hotel-detail-rpc", id],
                    queryFn: async () => {
                      const { data } = await (supabase as any).rpc("get_hotel_detail", {
                        p_store_id: id, p_check_in: null, p_check_out: null,
                      });
                      return data;
                    },
                    staleTime: 60_000,
                  });
                  navigate(`/hotel/${id}?ci=${format(checkIn, "yyyy-MM-dd")}&co=${format(checkOut, "yyyy-MM-dd")}&adults=${guests}&children=${children}`);
                }}
              />
            </Suspense>
          </div>
        ) : (
        <div className="px-4">
          {listQuery.isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden flex">
                  <Skeleton className="w-32 h-32 shrink-0 rounded-none" />
                  <div className="flex-1 p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Skeleton className="h-3.5 flex-1 max-w-[60%]" />
                      <Skeleton className="h-4 w-10 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-3/4" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-3" />
                    </div>
                    <div className="flex items-end justify-between pt-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 gap-2">
              <HotelIcon className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">No properties found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {savedOnly
                  ? "You haven't saved any properties yet — tap the heart on a card."
                  : search || activeTags.length > 0 || activeFilter !== "all"
                  ? "Try a different city or remove some filters."
                  : "Be the first — list your property on ZIVO."}
              </p>
              {(search || activeTags.length > 0 || activeFilter !== "all" || savedOnly) ? (
                <button type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveTags([]);
                    setActiveFilter("all");
                    setSavedOnly(false);
                  }}
                  className="mt-2 text-xs font-semibold text-primary"
                >
                  Clear filters
                </button>
              ) : (
                <Button
                  className="mt-2 h-9 px-4 text-xs"
                  onClick={() => navigate("/business/onboarding")}
                >
                  List your property
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {sorted.map((store, idx) => (
                <PropertyCard
                  key={store.id}
                  store={store}
                  index={idx}
                  rateInfo={minRates[store.id]}
                  promo={promotions[store.id]}
                  amenities={amenitiesMap[store.id]?.amenities || []}
                  rating={reviewStats[store.id]?.count ? reviewStats[store.id].avg : null}
                  reviewCount={reviewStats[store.id]?.count ?? 0}
                  isFavorite={favorites.has(store.id)}
                  onToggleFavorite={(e) => toggleFavorite(store.id, e)}
                  nights={nights}
                  onOpen={() => {
                    // Phase D: warm the aggregate RPC cache so the detail page
                    // renders instantly. One round-trip vs the old 5-6.
                    qc.prefetchQuery({
                      queryKey: ["hotel-detail-rpc", store.id],
                      queryFn: async () => {
                        const { data } = await (supabase as any).rpc("get_hotel_detail", {
                          p_store_id: store.id,
                          p_check_in: null,
                          p_check_out: null,
                        });
                        return data;
                      },
                      staleTime: 60_000,
                    });
                    navigate(`/hotel/${store.id}?ci=${format(checkIn, "yyyy-MM-dd")}&co=${format(checkOut, "yyyy-MM-dd")}&adults=${guests}&children=${children}`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
        )}
      </section>

      {/* Floating "Find with AI" CTA — hidden in Map view so it doesn't
          obscure the property cards / map markers. */}
      {viewMode !== "map" && (
        <button
          type="button"
          onClick={() => setConciergeOpen(true)}
          aria-label="Find a hotel with AI"
          className="fixed z-30 bottom-[max(env(safe-area-inset-bottom),16px)] right-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-sm font-bold px-4 py-3 shadow-xl shadow-violet-500/30 active:scale-95 transition md:right-6 md:bottom-6"
        >
          <Sparkles className="w-4 h-4" />
          Find with AI
        </button>
      )}

      {/* AI concierge sheet */}
      <Suspense fallback={null}>
        <HotelConciergeSheet
          isOpen={conciergeOpen}
          onClose={() => setConciergeOpen(false)}
          candidates={sorted.map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            address: s.address,
            banner_url: s.banner_url,
            logo_url: s.logo_url,
            pricePerNightCents: minRates[s.id]?.base ?? null,
          }))}
          onSelect={(id) => {
            qc.prefetchQuery({
              queryKey: ["hotel-detail-rpc", id],
              queryFn: async () => {
                const { data } = await (supabase as any).rpc("get_hotel_detail", {
                  p_store_id: id, p_check_in: null, p_check_out: null,
                });
                return data;
              },
              staleTime: 60_000,
            });
            setConciergeOpen(false);
            navigate(`/hotel/${id}?ci=${format(checkIn, "yyyy-MM-dd")}&co=${format(checkOut, "yyyy-MM-dd")}&adults=${guests}&children=${children}`);
          }}
        />
      </Suspense>
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-8 w-8 rounded-full border border-border text-foreground disabled:opacity-40 active:bg-muted"
          aria-label={`Decrease ${label}`}
        >
          –
        </button>
        <span className="w-6 text-center text-sm font-bold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-8 w-8 rounded-full border border-border text-foreground disabled:opacity-40 active:bg-muted"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

const AMENITY_ICONS: Array<{ key: string; icon: typeof Wifi; label: string }> = [
  { key: "wifi", icon: Wifi, label: "Wi-Fi" },
  { key: "pool", icon: Waves, label: "Pool" },
  { key: "breakfast", icon: Coffee, label: "Breakfast" },
  { key: "pet", icon: Dog, label: "Pets" },
];

type RateInfoProp = {
  base: number;
  weeklyPct: number;
  monthlyPct: number;
};
type PromoInfoProp = {
  type: "percent" | "fixed";
  value: number;
  name: string;
  minNights: number;
  maxNights: number | null;
};

function PropertyCard({
  store,
  index,
  rateInfo,
  promo,
  amenities,
  rating,
  reviewCount,
  nights,
  isFavorite,
  onToggleFavorite,
  onOpen,
}: {
  store: DirectoryStore;
  index: number;
  rateInfo?: RateInfoProp;
  promo?: PromoInfoProp;
  amenities: string[];
  rating?: number | null;
  reviewCount?: number;
  nights: number;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onOpen: () => void;
}) {
  const { format: fmtPrice } = useCurrency();
  const location = store.address || "";
  const haystack = amenities.join(" ");
  const matchedAmenities = AMENITY_ICONS.filter((a) =>
    a.key === "wifi"
      ? haystack.includes("wifi") || haystack.includes("wi-fi")
      : haystack.includes(a.key),
  ).slice(0, 4);

  // Pricing + discount calculation
  const baseCents = rateInfo?.base;
  let discountedCents: number | null = null;
  let pctOff = 0;
  let promoLabel = "";

  if (typeof baseCents === "number") {
    const promoApplies =
      promo &&
      nights >= promo.minNights &&
      (!promo.maxNights || nights <= promo.maxNights);

    if (promoApplies && promo) {
      if (promo.type === "percent") {
        discountedCents = Math.round(baseCents * (1 - promo.value / 100));
        pctOff = Math.round(promo.value);
      } else {
        const off = Math.round(promo.value * 100);
        discountedCents = Math.max(0, baseCents - off);
        pctOff = Math.round((1 - discountedCents / baseCents) * 100);
      }
      promoLabel = promo.name || `${pctOff}% OFF`;
    } else if (rateInfo && nights >= 28 && rateInfo.monthlyPct > 0) {
      pctOff = Math.round(rateInfo.monthlyPct);
      discountedCents = Math.round(baseCents * (1 - pctOff / 100));
      promoLabel = "Monthly deal";
    } else if (rateInfo && nights >= 7 && rateInfo.weeklyPct > 0) {
      pctOff = Math.round(rateInfo.weeklyPct);
      discountedCents = Math.round(baseCents * (1 - pctOff / 100));
      promoLabel = "Weekly deal";
    }
  }

  const hasDiscount = discountedCents !== null && discountedCents < (baseCents ?? 0);
  const effectiveCents = hasDiscount ? (discountedCents as number) : baseCents;
  const totalCents = typeof effectiveCents === "number" ? effectiveCents * nights : null;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 6) * 0.04 }}
      className="text-left rounded-2xl border border-border bg-card overflow-hidden shadow-sm active:scale-[0.99] transition cursor-pointer"
      aria-label={`Open ${store.name}`}
    >
      <div className="flex">
        <div className="relative w-32 shrink-0 bg-muted">
          {(store.banner_url || store.logo_url) ? (
            <img
              src={store.banner_url || store.logo_url || ""}
              alt={`${store.name} cover`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center">
              <HotelIcon className="w-6 h-6 text-primary/60" />
            </div>
          )}
          {store.is_verified && (
            <Badge className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] px-1.5 py-0">
              Verified
            </Badge>
          )}
          {hasDiscount && pctOff > 0 && (
            <Badge className="absolute bottom-1.5 left-1.5 bg-red-600 text-white text-[9px] px-1.5 py-0">
              -{pctOff}%
            </Badge>
          )}
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
            onClick={onToggleFavorite}
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/30 backdrop-blur flex items-center justify-center active:scale-90 transition-transform"
          >
            <Heart className={cn("w-3.5 h-3.5", isFavorite ? "fill-rose-500 text-rose-500" : "text-white")} />
          </button>
        </div>
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-start gap-2">
            <h3 className="text-sm font-bold text-foreground truncate flex-1">{store.name}</h3>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {typeof rating === "number" ? rating.toFixed(1) : "New"}
              {reviewCount && reviewCount > 0 ? (
                <span className="text-amber-600/70 font-normal">({reviewCount})</span>
              ) : null}
            </span>
          </div>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}

          {matchedAmenities.length > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              {matchedAmenities.map((a) => {
                const Icon = a.icon;
                return (
                  <span
                    key={a.key}
                    className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"
                    title={a.label}
                  >
                    <Icon className="w-3 h-3" />
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-2 flex items-end justify-between gap-2">
            <span className="text-[10px] font-medium text-muted-foreground capitalize truncate">
              {store.category?.replace(/_/g, " ") || "Hotel"}
            </span>
            {typeof effectiveCents === "number" ? (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground leading-none">from</p>
                {hasDiscount && typeof baseCents === "number" ? (
                  <>
                    <p className="text-[10px] line-through text-muted-foreground leading-none">
                      {fmtPrice(baseCents / 100, "USD")}
                    </p>
                    <p className="text-[14px] font-extrabold text-emerald-600 leading-tight">
                      {fmtPrice(effectiveCents / 100, "USD")}
                      <span className="text-[10px] font-medium text-emerald-600/80"> /night</span>
                    </p>
                  </>
                ) : (
                  <p className="text-[14px] font-extrabold text-foreground leading-tight">
                    {fmtPrice(effectiveCents / 100, "USD")}
                    <span className="text-[10px] font-medium text-muted-foreground"> /night</span>
                  </p>
                )}
                {totalCents && nights > 1 && (
                  <p className="text-[9px] text-muted-foreground leading-none">
                    {fmtPrice(totalCents / 100, "USD")} for {nights}n
                  </p>
                )}
                {hasDiscount && promoLabel && (
                  <p className="text-[9px] font-semibold text-red-600 leading-none mt-0.5 truncate max-w-[110px] ml-auto">
                    {promoLabel}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
