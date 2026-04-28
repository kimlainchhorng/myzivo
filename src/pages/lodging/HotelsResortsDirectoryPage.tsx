/**
 * HotelsResortsDirectoryPage
 * Public-facing list of all Hotel & Resort properties on ZIVO.
 * Route: /hotels-list
 *
 * Each card opens /hotel/:storeId (HotelResortDetailPage).
 */
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react/dist/esm/icons/arrow-left";
import { Hotel } from "lucide-react/dist/esm/icons/hotel";
import { MapPin } from "lucide-react/dist/esm/icons/map-pin";
import { Search } from "lucide-react/dist/esm/icons/search";
import { Star } from "lucide-react/dist/esm/icons/star";
import { Filter } from "lucide-react/dist/esm/icons/filter";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LODGING_STORE_CATEGORIES, normalizeStoreCategory } from "@/hooks/useOwnerStoreProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DirectoryStore {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  country: string | null;
  logo_url: string | null;
  description: string | null;
  setup_complete: boolean | null;
}

const FILTERS: Array<{ id: string; label: string; match: (cat: string) => boolean }> = [
  { id: "all", label: "All", match: () => true },
  { id: "hotel", label: "Hotels", match: (c) => c.includes("hotel") },
  { id: "resort", label: "Resorts", match: (c) => c.includes("resort") },
  { id: "guesthouse", label: "Guesthouses", match: (c) => c.includes("guest") || c.includes("bed and breakfast") },
];

export default function HotelsResortsDirectoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const listQuery = useQuery({
    queryKey: ["hotels-directory"],
    queryFn: async (): Promise<DirectoryStore[]> => {
      const { data, error } = await (supabase as any)
        .from("stores")
        .select("id, name, category, city, country, logo_url, description, setup_complete")
        .in("category", LODGING_STORE_CATEGORIES)
        .order("setup_complete", { ascending: false })
        .order("name", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data || []) as DirectoryStore[];
    },
  });

  const filtered = useMemo(() => {
    const list = listQuery.data || [];
    const q = search.trim().toLowerCase();
    const matcher = FILTERS.find((f) => f.id === activeFilter)?.match || (() => true);
    return list.filter((store) => {
      const cat = normalizeStoreCategory(store.category);
      if (!matcher(cat)) return false;
      if (!q) return true;
      const haystack = [store.name, store.city, store.country, store.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [listQuery.data, search, activeFilter]);

  return (
    <div className="min-h-dvh bg-background pb-24">
      <Helmet>
        <title>Hotels & Resorts — ZIVO</title>
        <meta
          name="description"
          content="Browse hotels, resorts and guesthouses on ZIVO. Tap any property to view rooms, amenities and contact details."
        />
        <link rel="canonical" href="https://hizivo.com/hotels-list" />
      </Helmet>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-2 safe-area-top">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="h-9 w-9 -ml-1 rounded-full flex items-center justify-center active:bg-muted transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-foreground flex-1 truncate">Hotels & Resorts</h1>
          <button
            aria-label="Filters"
            className="h-9 w-9 rounded-full flex items-center justify-center active:bg-muted transition"
          >
            <Filter className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hotels, cities..."
              aria-label="Search hotels and resorts"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-muted/60 border border-transparent focus:border-primary/30 focus:bg-background outline-none text-sm transition"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      </div>

      {/* List */}
      <div className="px-4 pt-4">
        {listQuery.isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 gap-2">
            <Hotel className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No properties found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {search
                ? "Try a different city or property name."
                : "No hotels or resorts are listed yet. Check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((store, idx) => (
              <PropertyCard key={store.id} store={store} index={idx} onOpen={() => navigate(`/hotel/${store.id}`)} />
            ))}
          </div>
        )}
      </div>
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
  const location = [store.city, store.country].filter(Boolean).join(", ");
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
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={`${store.name} cover`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center">
              <Hotel className="w-6 h-6 text-primary/60" />
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
