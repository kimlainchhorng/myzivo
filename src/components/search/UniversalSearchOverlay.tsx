/**
 * Universal Search Overlay
 * Full-screen cross-service search hub for the Super App
 * Searches: restaurants, food items, past orders, trips, saved addresses, help articles
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Clock, Car, Utensils, Package, Plane, BedDouble,
  ChevronRight, Sparkles, MapPin, Trash2, ShoppingBag, HelpCircle,
  RotateCcw, Navigation, History, BookOpen,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UniversalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "all" | "eats" | "rides" | "orders" | "flights" | "hotels" | "help";

const TABS: { key: TabKey; label: string; icon: typeof Search }[] = [
  { key: "all", label: "All", icon: Search },
  { key: "eats", label: "Food", icon: Utensils },
  { key: "rides", label: "Rides", icon: Car },
  { key: "flights", label: "Flights", icon: Plane },
  { key: "hotels", label: "Hotels", icon: BedDouble },
  { key: "orders", label: "History", icon: ShoppingBag },
  { key: "help", label: "Help", icon: HelpCircle },
];

const POPULAR_SERVICES = [
  { label: "Ride", icon: Car, href: "/rides", color: "bg-primary/10 text-primary border-primary/20" },
  { label: "Eats", icon: Utensils, href: "/eats", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { label: "Delivery", icon: Package, href: "/move", color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { label: "Flights", icon: Plane, href: "/search?tab=flights", color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
  { label: "Hotels", icon: BedDouble, href: "/search?tab=hotels", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { label: "Rentals", icon: Car, href: "/rent-car", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
];

// Help articles (static, could be pulled from DB)
const HELP_ARTICLES = [
  { id: "cancel-ride", title: "How to cancel a ride", category: "Rides", href: "/help" },
  { id: "refund-order", title: "How to get a refund", category: "Orders", href: "/help" },
  { id: "change-address", title: "Change delivery address", category: "Eats", href: "/help" },
  { id: "payment-methods", title: "Add or update payment methods", category: "Account", href: "/help" },
  { id: "promo-code", title: "How to apply a promo code", category: "General", href: "/help" },
  { id: "track-order", title: "Track your food order", category: "Eats", href: "/help" },
  { id: "schedule-ride", title: "Schedule a ride in advance", category: "Rides", href: "/help" },
  { id: "contact-support", title: "Contact customer support", category: "Support", href: "/help" },
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
    return JSON.parse(raw).slice(0, 8);
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

function clearRecentSearches() {
  localStorage.removeItem(RECENT_KEY);
}

export default function UniversalSearchOverlay({ isOpen, onClose }: UniversalSearchOverlayProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // ─── Restaurant search ───
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

  // ─── Menu item search ───
  const { data: menuResults } = useQuery({
    queryKey: ["universal-search-menu", debouncedQuery],
    queryFn: async () => {
      const db = supabase as any;
      const { data } = await db
        .from("menu_items")
        .select("id, name, price, restaurant_id")
        .ilike("name", `%${debouncedQuery}%`)
        .eq("is_available", true)
        .limit(5);
      return (data || []) as { id: string; name: string; price: number; restaurant_id: string }[];
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  // ─── Past orders search ───
  const { data: orderResults } = useQuery({
    queryKey: ["universal-search-orders", debouncedQuery, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const db = supabase as any;
      const { data } = await db
        .from("food_orders")
        .select("id, restaurant_name, total, status, created_at")
        .eq("customer_id", user.id)
        .ilike("restaurant_name", `%${debouncedQuery}%`)
        .order("created_at", { ascending: false })
        .limit(5);
      return (data || []) as { id: string; restaurant_name: string; total: number; status: string; created_at: string }[];
    },
    enabled: debouncedQuery.length >= 2 && !!user?.id,
    staleTime: 30_000,
  });

  // ─── Trip history search ───
  const { data: tripResults } = useQuery({
    queryKey: ["universal-search-trips", debouncedQuery, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const db = supabase as any;
      const { data } = await db
        .from("trips")
        .select("id, pickup_address, dropoff_address, status, created_at, fare")
        .eq("rider_id", user.id)
        .or(`pickup_address.ilike.%${debouncedQuery}%,dropoff_address.ilike.%${debouncedQuery}%`)
        .order("created_at", { ascending: false })
        .limit(5);
      return (data || []) as { id: string; pickup_address: string; dropoff_address: string; status: string; created_at: string; fare: number | null }[];
    },
    enabled: debouncedQuery.length >= 2 && !!user?.id,
    staleTime: 30_000,
  });

  // ─── Nearby restaurants (suggestions) ───
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

  // ─── Help articles search ───
  const helpResults = debouncedQuery.length >= 2
    ? HELP_ARTICLES.filter(a => a.title.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : [];

  const handleNavigate = useCallback((path: string) => {
    if (query.trim()) saveRecentSearch(query.trim());
    onClose();
    window.scrollTo(0, 0);
    navigate(path);
  }, [navigate, onClose, query]);

  const handleClearHistory = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const hasQuery = debouncedQuery.length >= 2;

  // ─── Build result cards ───
  type ResultCard = {
    key: string;
    category: TabKey;
    icon: typeof Search;
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle: string;
    action: () => void;
    badge?: string;
  };

  const cards: ResultCard[] = [];

  if (hasQuery) {
    // Restaurants
    restaurantResults?.forEach((r) => {
      cards.push({
        key: `rest-${r.id}`,
        category: "eats",
        icon: Utensils,
        iconColor: "text-orange-500",
        iconBg: "bg-orange-500/10",
        title: r.name,
        subtitle: r.cuisine_type || "Restaurant",
        action: () => handleNavigate(`/eats/restaurant/${r.id}`),
      });
    });

    // Menu items
    menuResults?.forEach((m) => {
      cards.push({
        key: `menu-${m.id}`,
        category: "eats",
        icon: Utensils,
        iconColor: "text-orange-500",
        iconBg: "bg-orange-500/10",
        title: m.name,
        subtitle: `$${(m.price / 100).toFixed(2)}`,
        action: () => handleNavigate(`/eats/restaurant/${m.restaurant_id}`),
        badge: "Menu item",
      });
    });

    // Past orders
    orderResults?.forEach((o) => {
      cards.push({
        key: `order-${o.id}`,
        category: "orders",
        icon: ShoppingBag,
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
        title: o.restaurant_name || "Order",
        subtitle: `$${((o.total || 0) / 100).toFixed(2)} · ${o.status}`,
        action: () => handleNavigate(`/eats/orders`),
        badge: "Reorder",
      });
    });

    // Trips
    tripResults?.forEach((t) => {
      cards.push({
        key: `trip-${t.id}`,
        category: "rides",
        icon: Car,
        iconColor: "text-emerald-500",
        iconBg: "bg-emerald-500/10",
        title: t.dropoff_address || "Trip",
        subtitle: `From ${t.pickup_address || "Unknown"} · ${t.status}`,
        action: () => handleNavigate(`/rides`),
        badge: "Rebook",
      });
    });

    // Quick service actions
    cards.push({
      key: "rides-action",
      category: "rides",
      icon: Navigation,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
      title: `Book a ride to "${debouncedQuery}"`,
      subtitle: "ZIVO Ride",
      action: () => handleNavigate(`/rides?dropoff=${encodeURIComponent(debouncedQuery)}`),
    });

    cards.push({
      key: "hotels-action",
      category: "hotels",
      icon: BedDouble,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      title: `Search hotels in "${debouncedQuery}"`,
      subtitle: "ZIVO Hotels",
      action: () => handleNavigate(`/search?tab=hotels`),
    });

    cards.push({
      key: "flights-action",
      category: "flights",
      icon: Plane,
      iconColor: "text-sky-500",
      iconBg: "bg-sky-500/10",
      title: `Search flights to "${debouncedQuery}"`,
      subtitle: "ZIVO Flights",
      action: () => handleNavigate(`/search?tab=flights`),
    });

    cards.push({
      key: "rentals-action",
      category: "all",
      icon: Car,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
      title: `Rent a car in "${debouncedQuery}"`,
      subtitle: "ZIVO Rentals",
      action: () => handleNavigate(`/rent-car`),
    });

    // Help results
    helpResults.forEach((h) => {
      cards.push({
        key: `help-${h.id}`,
        category: "help",
        icon: BookOpen,
        iconColor: "text-muted-foreground",
        iconBg: "bg-muted",
        title: h.title,
        subtitle: h.category,
        action: () => handleNavigate(h.href),
      });
    });
  }

  const filteredCards = activeTab === "all" ? cards : cards.filter((c) => c.category === activeTab);

  // Tab counts
  const tabCounts: Record<TabKey, number> = {
    all: cards.length,
    eats: cards.filter(c => c.category === "eats").length,
    rides: cards.filter(c => c.category === "rides").length,
    flights: cards.filter(c => c.category === "flights").length,
    hotels: cards.filter(c => c.category === "hotels").length,
    orders: cards.filter(c => c.category === "orders").length,
    help: cards.filter(c => c.category === "help").length,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col"
        >
          {/* Header */}
          <div className="safe-area-top px-4 pt-4 pb-2 flex items-center gap-3 border-b border-border">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food, rides, hotels, orders..."
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground font-medium active:text-foreground transition-all duration-200 touch-manipulation"
            >
              Cancel
            </button>
          </div>

          {/* Tabs */}
          {hasQuery && (
            <div className="px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide border-b border-border/50">
              {TABS.map((tab) => {
                const count = tabCounts[tab.key];
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all touch-manipulation ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                    {hasQuery && count > 0 && (
                      <span className={`text-[10px] rounded-full px-1 ${isActive ? "bg-primary-foreground/20" : "bg-foreground/10"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {!hasQuery ? (
              /* === SUGGESTIONS === */
              <div className="space-y-6 pt-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent</h3>
                      <button
                        onClick={handleClearHistory}
                        className="text-xs text-destructive font-medium flex items-center gap-1 active:opacity-70 touch-manipulation"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {recentSearches.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(s.query)}
                          className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-accent active:bg-accent/80 transition-all duration-200 text-left touch-manipulation"
                        >
                          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground truncate">{s.query}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 ml-auto" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Services */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Access</h3>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SERVICES.map((svc) => (
                      <button
                        key={svc.label}
                        onClick={() => handleNavigate(svc.href)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${svc.color} active:scale-95 transition-transform touch-manipulation`}
                      >
                        <svc.icon className="w-3.5 h-3.5" />
                        {svc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Searches */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Pizza", "Airport", "Sushi", "Coffee", "Hotel"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border hover:bg-accent touch-manipulation transition-all duration-200 hover:scale-105 active:scale-[0.97]"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nearby Restaurants */}
                {nearbyRestaurants && nearbyRestaurants.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      Nearby
                    </h3>
                    <div className="space-y-0.5">
                      {nearbyRestaurants.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleNavigate(`/eats/restaurant/${r.id}`)}
                          className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors text-left touch-manipulation"
                        >
                          <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                            <Utensils className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-foreground truncate">{r.name}</div>
                            <div className="text-[11px] text-muted-foreground">{r.cuisine_type || "Restaurant"}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* === RESULTS === */
              <div className="space-y-0.5 pt-2">
                {filteredCards.length === 0 && (
                  <div className="text-center py-16">
                    <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No results for "{debouncedQuery}"</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
                  </div>
                )}
                {filteredCards.map((card) => (
                  <button
                    key={card.key}
                    onClick={card.action}
                    className="w-full flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors text-left touch-manipulation"
                  >
                    <div className={`w-9 h-9 ${card.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                      <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground truncate">{card.title}</div>
                      <div className="text-[11px] text-muted-foreground">{card.subtitle}</div>
                    </div>
                    {card.badge && (
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                        {card.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
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
