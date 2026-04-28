/**
 * HotelsLandingPage
 * Booking-style discovery: tighter hero, dates+guests, quick filters,
 * price/amenities/rating on cards, "Near me" sort.
 *
 * Route: /hotels
 */
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LODGING_STORE_CATEGORIES, normalizeStoreCategory } from "@/hooks/useOwnerStoreProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

export default function HotelsLandingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState<Date>(() => todayUTC());
  const [checkOut, setCheckOut] = useState<Date>(() => addDays(todayUTC(), 1));
  const [guests, setGuests] = useState<number>(2);
  const [rooms, setRooms] = useState<number>(1);
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const listQuery = useQuery({
    queryKey: ["hotels-landing"],
    queryFn: async (): Promise<DirectoryStore[]> => {
      const { data, error } = await (supabase as any)
        .from("store_profiles")
        .select("id, name, category, address, logo_url, banner_url, description, setup_complete, is_verified")
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

  // Amenities per store
  const amenitiesQuery = useQuery({
    queryKey: ["lodge-amenities", storeIds],
    enabled: storeIds.length > 0,
    queryFn: async (): Promise<Record<string, string[]>> => {
      const { data, error } = await (supabase as any)
        .from("lodge_property_profile")
        .select("store_id, popular_amenities, facilities")
        .in("store_id", storeIds);
      if (error) throw error;
      const map: Record<string, string[]> = {};
      for (const r of (data || []) as Array<{
        store_id: string;
        popular_amenities: string[] | null;
        facilities: string[] | null;
      }>) {
        const list = [...(r.popular_amenities || []), ...(r.facilities || [])]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase());
        map[r.store_id] = Array.from(new Set(list));
      }
      return map;
    },
  });

  const minRates = ratesQuery.data || {};
  const promotions = promotionsQuery.data || {};
  const amenitiesMap = amenitiesQuery.data || {};
  const nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn));

  const requestNearMe = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null),
      { timeout: 8000, enableHighAccuracy: false },
    );
  };

  const featured = useMemo(
    () => all.filter((s) => s.setup_complete).slice(0, 6),
    [all]
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
        const am = amenitiesMap[store.id] || [];
        const haystack = [...am, store.description?.toLowerCase() || ""].join(" ");
        const ok = activeTags.every((tagId) => {
          const tag = QUICK_TAGS.find((t) => t.id === tagId);
          if (!tag) return true;
          return tag.keywords.some((k) => haystack.includes(k));
        });
        if (!ok) return false;
      }
      return true;
    });
  }, [all, search, activeFilter, activeTags, amenitiesMap]);

  const toggleTag = (id: string) => {
    setActiveTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-dvh bg-background pb-24">
      <Helmet>
        <title>Hotels & Resorts — Find your stay on ZIVO</title>
        <meta
          name="description"
          content="Discover hotels, resorts and guesthouses across Cambodia. Browse properties in Phnom Penh, Siem Reap, Sihanoukville and more."
        />
        <link rel="canonical" href="https://hizivo.com/hotels" />
      </Helmet>

      {/* Hero — tightened */}
      <div className="relative overflow-hidden">
        <img
          src={tabHotelsBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/75 via-primary/45 to-background" />

        <div className="relative px-4 pt-3 pb-4 safe-area-top">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="h-9 w-9 -ml-1 rounded-full flex items-center justify-center bg-white/15 backdrop-blur active:bg-white/25 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-base font-bold text-white flex-1 truncate drop-shadow">Hotels & Resorts</h1>
          </div>

          <div className="mt-3 mb-3">
            <h2 className="text-[20px] font-extrabold text-white leading-tight drop-shadow-md">
              Find your perfect stay
            </h2>
            <p className="mt-0.5 text-[12px] text-white/85 drop-shadow">
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
              placeholder="Search city, hotel name..."
              aria-label="Search hotels and destinations"
              className="w-full h-11 pl-10 pr-3 rounded-2xl bg-white text-foreground placeholder:text-muted-foreground shadow-lg outline-none text-sm focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>

          {/* Dates + Guests */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Popover open={datesOpen} onOpenChange={setDatesOpen}>
              <PopoverTrigger asChild>
                <button className="h-11 rounded-2xl bg-white/95 backdrop-blur shadow-md text-left px-3 flex items-center gap-2 active:scale-[0.98] transition">
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
                <button className="h-11 rounded-2xl bg-white/95 backdrop-blur shadow-md text-left px-3 flex items-center gap-2 active:scale-[0.98] transition">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">
                      Guests · Rooms
                    </p>
                    <p className="text-[12px] font-semibold text-foreground truncate leading-tight">
                      {guests} guest{guests > 1 ? "s" : ""} · {rooms} room{rooms > 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                <div className="space-y-3">
                  <Stepper label="Guests" value={guests} min={1} max={20} onChange={setGuests} />
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

      {/* Quick filter chips */}
      <section className="pt-3">
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => {
              if (coords) setCoords(null);
              else requestNearMe();
            }}
            className={cn(
              "shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition border",
              coords
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border active:bg-muted",
            )}
          >
            <LocateFixed className="w-3 h-3" />
            Near me
          </button>
          {QUICK_TAGS.map((tag) => {
            const active = activeTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition border",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border active:bg-muted",
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
              <button
                key={dest.id}
                onClick={() => {
                  setSearch(active ? "" : dest.city);
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
            <button
              onClick={() => document.getElementById("hotels-all")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="text-[11px] font-semibold text-primary flex items-center gap-0.5"
            >
              See all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featured.map((store) => {
              const minCents = minRates[store.id];
              return (
                <button
                  key={store.id}
                  onClick={() => navigate(`/hotel/${store.id}`)}
                  className="shrink-0 w-[210px] rounded-2xl border border-border bg-card overflow-hidden text-left active:scale-[0.98] transition shadow-sm"
                  aria-label={`Open ${store.name}`}
                >
                  <div className="relative w-full h-28 bg-muted">
                    {(store.banner_url || store.logo_url) ? (
                      <img
                        src={store.banner_url || store.logo_url || ""}
                        alt={store.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center">
                        <HotelIcon className="w-7 h-7 text-primary/60" />
                      </div>
                    )}
                    {store.is_verified && (
                      <Badge className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] px-1.5 py-0">
                        Verified
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
                        New
                      </span>
                      {typeof minCents === "number" ? (
                        <span className="text-[11px] font-bold text-foreground">
                          from <span className="text-primary">${(minCents / 100).toFixed(0)}</span>
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

      {/* All Hotels & Resorts */}
      <section id="hotels-all" className="pt-5 scroll-mt-4">
        <div className="px-4 flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">All Hotels & Resorts</h3>
          <span className="text-[11px] text-muted-foreground">{filtered.length} found</span>
        </div>

        {/* Type filter chips */}
        <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = f.id === activeFilter;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition " +
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

        <div className="px-4">
          {listQuery.isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 gap-2">
              <HotelIcon className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">No properties found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {search || activeTags.length > 0
                  ? "Try a different city or remove some filters."
                  : "Be the first — list your property on ZIVO."}
              </p>
              {(search || activeTags.length > 0) ? (
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveTags([]);
                    setActiveFilter("all");
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
              {filtered.map((store, idx) => (
                <PropertyCard
                  key={store.id}
                  store={store}
                  index={idx}
                  rateInfo={minRates[store.id]}
                  promo={promotions[store.id]}
                  amenities={amenitiesMap[store.id] || []}
                  nights={nights}
                  onOpen={() => navigate(`/hotel/${store.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
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
  nights,
  onOpen,
}: {
  store: DirectoryStore;
  index: number;
  rateInfo?: RateInfoProp;
  promo?: PromoInfoProp;
  amenities: string[];
  nights: number;
  onOpen: () => void;
}) {
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
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 6) * 0.04 }}
      className="text-left rounded-2xl border border-border bg-card overflow-hidden shadow-sm active:scale-[0.99] transition"
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
        </div>
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-start gap-2">
            <h3 className="text-sm font-bold text-foreground truncate flex-1">{store.name}</h3>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              New
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
                      ${(baseCents / 100).toFixed(0)}
                    </p>
                    <p className="text-[14px] font-extrabold text-emerald-600 leading-tight">
                      ${(effectiveCents / 100).toFixed(0)}
                      <span className="text-[10px] font-medium text-emerald-600/80"> /night</span>
                    </p>
                  </>
                ) : (
                  <p className="text-[14px] font-extrabold text-foreground leading-tight">
                    ${(effectiveCents / 100).toFixed(0)}
                    <span className="text-[10px] font-medium text-muted-foreground"> /night</span>
                  </p>
                )}
                {totalCents && nights > 1 && (
                  <p className="text-[9px] text-muted-foreground leading-none">
                    ${(totalCents / 100).toFixed(0)} for {nights}n
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
    </motion.button>
  );
}
