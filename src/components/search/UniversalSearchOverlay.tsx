/**
 * Universal Search Overlay
 * Full-screen cross-service search hub for the Super App
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Clock, Car, Utensils, Package, Plane, BedDouble,
  ChevronRight, Sparkles, MapPin,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UniversalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "all" | "eats" | "rides" | "hotels" | "flights" | "rentals";

const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: "all", label: "All", color: "bg-white text-zinc-900" },
  { key: "eats", label: "Eats", color: "bg-orange-500" },
  { key: "rides", label: "Rides", color: "bg-emerald-500" },
  { key: "hotels", label: "Hotels", color: "bg-amber-500" },
  { key: "flights", label: "Flights", color: "bg-sky-500" },
  { key: "rentals", label: "Rentals", color: "bg-violet-500" },
];

const POPULAR_SERVICES = [
  { label: "Ride", icon: Car, href: "/rides", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
  { label: "Eats", icon: Utensils, href: "/eats", color: "bg-orange-500/20 text-orange-400 border-orange-500/20" },
  { label: "Delivery", icon: Package, href: "/move", color: "bg-blue-500/20 text-blue-400 border-blue-500/20" },
  { label: "Flights", icon: Plane, href: "/search?tab=flights", color: "bg-sky-500/20 text-sky-400 border-sky-500/20" },
  { label: "Hotels", icon: BedDouble, href: "/search?tab=hotels", color: "bg-amber-500/20 text-amber-400 border-amber-500/20" },
  { label: "Rentals", icon: Car, href: "/rent-car", color: "bg-violet-500/20 text-violet-400 border-violet-500/20" },
];

// Recent search helpers
const RECENT_KEY = "zivo_recent_searches";
interface RecentSearch {
  query: string;
  type?: string;
  timestamp?: number;
}

function getRecentSearches(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw).slice(0, 5);
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s.query.toLowerCase() !== query.toLowerCase());
    filtered.unshift({ query, timestamp: Date.now() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 10)));
  } catch {}
}

export default function UniversalSearchOverlay({ isOpen, onClose }: UniversalSearchOverlayProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Body scroll lock + focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setDebouncedQuery("");
      setActiveTab("all");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Restaurant search
  const { data: restaurantResults } = useQuery({
    queryKey: ["universal-search-restaurants", debouncedQuery],
    queryFn: async () => {
      const db = supabase as any;
      const { data } = await db
        .from("restaurants")
        .select("id, name, cuisine_type, logo_url")
        .ilike("name", `%${debouncedQuery}%`)
        .eq("status", "active")
        .limit(5);
      return (data || []) as { id: string; name: string; cuisine_type: string | null; logo_url: string | null }[];
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  // Nearby restaurants (suggestions)
  const { data: nearbyRestaurants } = useQuery({
    queryKey: ["nearby-restaurants"],
    queryFn: async () => {
      const db = supabase as any;
      const { data } = await db
        .from("restaurants")
        .select("id, name, cuisine_type, logo_url")
        .eq("status", "active")
        .order("rating", { ascending: false })
        .limit(5);
      return (data || []) as { id: string; name: string; cuisine_type: string | null; logo_url: string | null }[];
    },
    enabled: isOpen && query === "",
    staleTime: 60_000,
  });

  const handleNavigate = useCallback((path: string) => {
    if (query.trim()) saveRecentSearch(query.trim());
    onClose();
    window.scrollTo(0, 0);
    navigate(path);
  }, [navigate, onClose, query]);

  const hasQuery = debouncedQuery.length >= 2;

  // Build result cards per service
  const eatsCards = hasQuery && restaurantResults
    ? restaurantResults.map((r) => ({
        key: `eats-${r.id}`,
        service: "eats" as const,
        icon: Utensils,
        iconColor: "text-orange-400",
        iconBg: "bg-orange-500/20",
        title: r.name,
        subtitle: r.cuisine_type || "Restaurant",
        action: () => handleNavigate(`/eats/restaurant/${r.id}`),
      }))
    : [];

  const actionCards = hasQuery
    ? [
        {
          key: "rides-action",
          service: "rides" as const,
          icon: Car,
          iconColor: "text-emerald-400",
          iconBg: "bg-emerald-500/20",
          title: `Book a ride to "${debouncedQuery}"`,
          subtitle: "ZIVO Ride",
          action: () => handleNavigate(`/rides?dropoff=${encodeURIComponent(debouncedQuery)}`),
        },
        {
          key: "hotels-action",
          service: "hotels" as const,
          icon: BedDouble,
          iconColor: "text-amber-400",
          iconBg: "bg-amber-500/20",
          title: `Search hotels in "${debouncedQuery}"`,
          subtitle: "ZIVO Hotels",
          action: () => handleNavigate(`/search?tab=hotels`),
        },
        {
          key: "flights-action",
          service: "flights" as const,
          icon: Plane,
          iconColor: "text-sky-400",
          iconBg: "bg-sky-500/20",
          title: `Search flights to "${debouncedQuery}"`,
          subtitle: "ZIVO Flights",
          action: () => handleNavigate(`/search?tab=flights`),
        },
        {
          key: "rentals-action",
          service: "rentals" as const,
          icon: Car,
          iconColor: "text-violet-400",
          iconBg: "bg-violet-500/20",
          title: `Rent a car in "${debouncedQuery}"`,
          subtitle: "ZIVO Rentals",
          action: () => handleNavigate(`/rent-car?pickup=${encodeURIComponent(debouncedQuery)}`),
        },
      ]
    : [];

  const allCards = [...eatsCards, ...actionCards];
  const filteredCards = activeTab === "all" ? allCards : allCards.filter((c) => c.service === activeTab);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col"
        >
          {/* Header */}
          <div className="safe-area-top px-4 pt-4 pb-2 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food, rides, hotels, flights..."
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-sm text-zinc-400 font-medium active:text-white transition-colors touch-manipulation"
            >
              Cancel
            </button>
          </div>

          {/* Tabs (only when there's a query) */}
          {hasQuery && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all touch-manipulation ${
                    activeTab === tab.key
                      ? `${tab.color} text-white`
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {!hasQuery ? (
              /* === SUGGESTIONS === */
              <div className="space-y-6 pt-2">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Recent</h3>
                    <div className="space-y-1">
                      {recentSearches.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(s.query)}
                          className="w-full flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left touch-manipulation"
                        >
                          <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span className="text-sm text-zinc-300 truncate">{s.query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Services */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Popular Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SERVICES.map((svc) => (
                      <button
                        key={svc.label}
                        onClick={() => handleNavigate(svc.href)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${svc.color} active:scale-95 transition-transform touch-manipulation`}
                      >
                        <svc.icon className="w-3 h-3" />
                        {svc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nearby Restaurants */}
                {nearbyRestaurants && nearbyRestaurants.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nearby Restaurants</h3>
                    <div className="space-y-1">
                      {nearbyRestaurants.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleNavigate(`/eats/restaurant/${r.id}`)}
                          className="w-full flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left touch-manipulation"
                        >
                          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                            <Utensils className="w-4 h-4 text-orange-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-white truncate">{r.name}</div>
                            <div className="text-[10px] text-zinc-400">{r.cuisine_type || "Restaurant"}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* === RESULTS === */
              <div className="space-y-1 pt-2">
                {filteredCards.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">No results for "{debouncedQuery}"</p>
                  </div>
                )}
                {filteredCards.map((card) => (
                  <button
                    key={card.key}
                    onClick={card.action}
                    className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left touch-manipulation"
                  >
                    <div className={`w-8 h-8 ${card.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                      <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">{card.title}</div>
                      <div className="text-[10px] text-zinc-400">{card.subtitle}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
