/**
 * HotelsLandingPage
 * Full-bleed Hotels & Resorts landing page with hero, popular destinations,
 * featured properties, and a complete directory grid.
 *
 * Route: /hotels
 */
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import HotelIcon from "lucide-react/dist/esm/icons/hotel";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Search from "lucide-react/dist/esm/icons/search";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Star from "lucide-react/dist/esm/icons/star";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LODGING_STORE_CATEGORIES, normalizeStoreCategory } from "@/hooks/useOwnerStoreProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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
}

const FILTERS: Array<{ id: string; label: string; match: (cat: string) => boolean }> = [
  { id: "all", label: "All", match: () => true },
  { id: "hotel", label: "Hotels", match: (c) => c.includes("hotel") },
  { id: "resort", label: "Resorts", match: (c) => c.includes("resort") },
  { id: "guesthouse", label: "Guesthouses", match: (c) => c.includes("guest") || c.includes("bed and breakfast") },
];

const POPULAR_DESTINATIONS: Array<{ id: string; label: string; city: string; img: string }> = [
  { id: "pp", label: "Phnom Penh", city: "phnom penh", img: destPhnomPenh },
  { id: "sr", label: "Siem Reap", city: "siem reap", img: destSiemReap },
  { id: "sv", label: "Sihanoukville", city: "sihanoukville", img: destSihanoukville },
  { id: "kep", label: "Kep", city: "kep", img: destKep },
  { id: "kampot", label: "Kampot", city: "kampot", img: destKampot },
  { id: "btb", label: "Battambang", city: "battambang", img: destBattambang },
];

export default function HotelsLandingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const listQuery = useQuery({
    queryKey: ["hotels-landing"],
    queryFn: async (): Promise<DirectoryStore[]> => {
      const { data, error } = await (supabase as any)
        .from("store_profiles")
        .select("id, name, category, address, logo_url, banner_url, description, setup_complete")
        .in("category", LODGING_STORE_CATEGORIES)
        .order("setup_complete", { ascending: false })
        .order("name", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data || []) as DirectoryStore[];
    },
  });

  const all = listQuery.data || [];

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
      if (!q) return true;
      const haystack = [store.name, store.address, store.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [all, search, activeFilter]);

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

      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src={tabHotelsBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-background" />

        <div className="relative px-4 pt-3 pb-6 safe-area-top">
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

          <div className="mt-6 mb-4">
            <h2 className="text-2xl font-extrabold text-white leading-tight drop-shadow-md">
              Find your perfect stay
            </h2>
            <p className="mt-1 text-[13px] text-white/85 drop-shadow">
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
              className="w-full h-12 pl-10 pr-3 rounded-2xl bg-white text-foreground placeholder:text-muted-foreground shadow-lg outline-none text-sm focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>
        </div>
      </div>

      {/* Popular destinations */}
      <section className="pt-5">
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
                  // scroll to list
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
        <section className="pt-6">
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
            {featured.map((store) => (
              <button
                key={store.id}
                onClick={() => navigate(`/hotel/${store.id}`)}
                className="shrink-0 w-[200px] rounded-2xl border border-border bg-card overflow-hidden text-left active:scale-[0.98] transition shadow-sm"
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
                  <Badge className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] px-1.5 py-0">
                    Ready
                  </Badge>
                </div>
                <div className="p-2.5">
                  <p className="text-[13px] font-bold text-foreground truncate">{store.name}</p>
                  {store.address && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-[10px] font-semibold text-foreground">New</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* All Hotels & Resorts */}
      <section id="hotels-all" className="pt-6 scroll-mt-4">
        <div className="px-4 flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">All Hotels & Resorts</h3>
          <span className="text-[11px] text-muted-foreground">{filtered.length} found</span>
        </div>

        {/* Filter chips */}
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
                {search ? "Try a different city or property name." : "No hotels listed yet. Check back soon."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs font-semibold text-primary"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((store, idx) => (
                <PropertyCard key={store.id} store={store} index={idx} onOpen={() => navigate(`/hotel/${store.id}`)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PropertyCard({
  store,
  index,
  onOpen,
}: {
  store: DirectoryStore;
  index: number;
  onOpen: () => void;
}) {
  const location = store.address || "";
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
        </div>
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-start gap-2">
            <h3 className="text-sm font-bold text-foreground truncate flex-1">{store.name}</h3>
            {store.setup_complete && (
              <Badge variant="outline" className="text-[9px] text-primary border-primary/30 shrink-0">
                Ready
              </Badge>
            )}
          </div>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}
          {store.description && (
            <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2 leading-snug">
              {store.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              New
            </span>
            <span className="text-[10px] font-medium text-muted-foreground capitalize truncate">
              {store.category?.replace(/_/g, " ") || "Hotel"}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
