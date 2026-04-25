/**
 * StoresListPage — Full list of nearby stores (See All from /store-map)
 * Mirrors map filters and shares the same data hook.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  X,
  Star,
  MapPin,
  ChevronRight,
  Store,
  Phone,
  Car,
  Share2,
  Locate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorePins, distanceMiles, type StorePin } from "@/hooks/useStorePins";
import { STORE_CATEGORY_OPTIONS } from "@/config/groceryStores";
import { buildShopDeepLink } from "@/lib/deepLinks";
import { trackInitiateCheckout } from "@/services/metaConversion";
import { supabase } from "@/integrations/supabase/client";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import NavBar from "@/components/home/NavBar";

const CATEGORY_ICONS: Record<string, string> = {
  "food-market": "🛒", "grocery": "🛒", "restaurant": "🍽️", "fashion": "👗",
  "drink": "🥤", "mall": "🏬", "supermarket": "🏪", "salon": "💇",
  "electronics": "📱", "pharmacy": "💊", "car-rental": "🚗", "car-dealership": "🚙",
  "auto-repair": "🔧", "tire-shop": "🛞", "auto-parts": "⚙️", "other": "📍", "default": "📍",
};

const getIcon = (c: string) => CATEGORY_ICONS[c] || CATEGORY_ICONS.default;
const getLabel = (c: string) => STORE_CATEGORY_OPTIONS.find((o) => o.value === c)?.label || c;

export default function StoresListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("cat") || "all";
  const initialQ = params.get("q") || "";

  const [activeCategory, setActiveCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState<string>(initialQ);
  const [searchOpen, setSearchOpen] = useState<boolean>(!!initialQ);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [sheetStore, setSheetStore] = useState<StorePin | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { stores: allStores, isLoading } = useStorePins();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  // Try to get GPS for distance sorting
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 60_000 }
    );
  }, []);

  // Persist filters back to URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (activeCategory !== "all") next.set("cat", activeCategory);
    if (searchQuery.trim()) next.set("q", searchQuery.trim());
    setParams(next, { replace: true });
  }, [activeCategory, searchQuery, setParams]);

  const usedCategories = useMemo(() => {
    const present = new Set(allStores.map((s) => s.category));
    return STORE_CATEGORY_OPTIONS.filter((o) => present.has(o.value));
  }, [allStores]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = allStores.filter((s) => {
      const catOk = activeCategory === "all" || s.category === activeCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.address || "").toLowerCase().includes(q) ||
        getLabel(s.category).toLowerCase().includes(q)
      );
    });
    if (userLoc) {
      list = [...list].sort(
        (a, b) =>
          distanceMiles(userLoc, { lat: a.latitude, lng: a.longitude }) -
          distanceMiles(userLoc, { lat: b.latitude, lng: b.longitude })
      );
    }
    return list;
  }, [allStores, activeCategory, searchQuery, userLoc]);

  const goBackToMap = () => {
    const next = new URLSearchParams();
    if (activeCategory !== "all") next.set("cat", activeCategory);
    navigate(`/store-map${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const handleShare = async (s: StorePin) => {
    const url = buildShopDeepLink(s.slug);
    try {
      if (navigator.share) await navigator.share({ title: s.name, text: `Check out ${s.name} on ZiVo`, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      try { await navigator.clipboard.writeText(url); } catch {}
    }
  };

  const handleRide = (s: StorePin) => {
    trackInitiateCheckout({
      eventId: `ride-book-${s.id}-${Date.now()}`,
      externalId: currentUserId || undefined,
      sourceType: "ride_book",
      sourceTable: "store_profiles",
      sourceId: s.id,
      payload: { destination: s.address || s.name },
    });
    navigate(
      `/rides/hub?destination=${encodeURIComponent(s.address || s.name)}&destLat=${s.latitude}&destLng=${s.longitude}`
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="hidden lg:block shrink-0">
        <NavBar />
      </div>

      {/* Header */}
      <div
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 8px)" }}
      >
        <div className="px-4 pt-2 pb-3">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 bg-card border border-border/40 shadow-sm"
              >
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition"
                  aria-label="Close search"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Search className="w-4 h-4 shrink-0 text-primary" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stores, addresses…"
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-muted/60 text-muted-foreground"
                    aria-label="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="title"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={goBackToMap}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border/40 shadow-sm text-foreground hover:bg-muted transition"
                  aria-label="Back to map"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-[16px] font-bold leading-tight text-foreground">All Stores</h1>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {filtered.length} {filtered.length === 1 ? "store" : "stores"}
                    {userLoc ? " · sorted by distance" : ""}
                  </p>
                </div>
                <button
                  onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 80); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border/40 shadow-sm text-muted-foreground hover:bg-muted transition"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>
                <button
                  onClick={goBackToMap}
                  className="hidden sm:inline-flex h-10 px-3.5 items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold shadow-sm"
                >
                  <Locate className="w-4 h-4" /> Map
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category chips */}
        {usedCategories.length > 0 && (
          <div className="relative">
            <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 w-max">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory("all")}
                  className={`px-4 h-9 inline-flex items-center rounded-full text-[13px] font-semibold transition-all whitespace-nowrap border ${
                    activeCategory === "all"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-foreground/80 border-border/40"
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
                      onClick={() => setActiveCategory(isActive ? "all" : cat.value)}
                      className={`px-4 h-9 inline-flex items-center gap-1.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap border ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-foreground/80 border-border/40"
                      }`}
                    >
                      <span className="text-[14px] leading-none">{getIcon(cat.value)}</span>
                      {cat.label} <span className={isActive ? "opacity-90" : "text-muted-foreground"}>({count})</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-background to-transparent" />
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-[110px]">
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[88px] rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
              <Store className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold">No stores match</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try clearing filters or searching with a different term.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((s) => {
              const dist = userLoc ? distanceMiles(userLoc, { lat: s.latitude, lng: s.longitude }) : null;
              return (
                <li key={s.id}>
                  <motion.div
                    whileTap={{ scale: 0.985 }}
                    className="rounded-2xl bg-card border border-border/40 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => navigate(`/grocery/shop/${s.slug}`)}
                      className="w-full p-3.5 flex items-center gap-3 text-left"
                    >
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden bg-muted/40">
                        {s.logo_url ? (
                          <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span className="text-2xl">{getIcon(s.category)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[15px] truncate text-foreground">{s.name}</h3>
                          {s.rating ? (
                            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500 shrink-0">
                              <Star className="w-3 h-3 fill-current" />
                              {s.rating}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-primary/10 text-primary">
                            {getLabel(s.category)}
                          </span>
                          {dist != null && (
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {dist < 0.1 ? "<0.1" : dist.toFixed(1)} mi
                            </span>
                          )}
                        </div>
                        {s.address && (
                          <p className="text-[11px] mt-1 truncate flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {s.address}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                    <div className="flex border-t border-border/30">
                      <button
                        onClick={() => handleRide(s)}
                        className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary hover:bg-primary/5 transition"
                      >
                        <Car className="w-3.5 h-3.5" /> Ride
                      </button>
                      <div className="w-px bg-border/30" />
                      <button
                        onClick={() => handleShare(s)}
                        className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary hover:bg-primary/5 transition"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      {s.phone && (
                        <>
                          <div className="w-px bg-border/30" />
                          <button
                            onClick={() => window.open(`tel:${s.phone}`, "_self")}
                            className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary hover:bg-primary/5 transition"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </button>
                        </>
                      )}
                      <div className="w-px bg-border/30" />
                      <button
                        onClick={() => setSheetStore(s)}
                        className="w-10 h-10 inline-flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition"
                        aria-label="More"
                      >
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </button>
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Quick action sheet */}
      <AnimatePresence>
        {sheetStore && (
          <motion.div
            className="fixed inset-0 z-[1700] bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSheetStore(null)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 240 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="absolute left-0 right-0 bottom-0 bg-card rounded-t-3xl border-t border-border/40 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto w-10 h-1 rounded-full bg-muted mb-3" />
              <p className="text-[15px] font-bold truncate">{sheetStore.name}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{sheetStore.address}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button onClick={() => { navigate(`/grocery/shop/${sheetStore.slug}`); setSheetStore(null); }}>
                  <Store className="w-4 h-4 mr-1.5" /> View Store
                </Button>
                <Button variant="outline" onClick={() => { handleRide(sheetStore); setSheetStore(null); }}>
                  <Car className="w-4 h-4 mr-1.5" /> Ride There
                </Button>
                <Button variant="outline" onClick={() => { handleShare(sheetStore); setSheetStore(null); }}>
                  <Share2 className="w-4 h-4 mr-1.5" /> Share
                </Button>
                {sheetStore.phone ? (
                  <Button variant="outline" onClick={() => window.open(`tel:${sheetStore!.phone}`, "_self")}>
                    <Phone className="w-4 h-4 mr-1.5" /> Call
                  </Button>
                ) : (
                  <Button variant="ghost" disabled>
                    <Phone className="w-4 h-4 mr-1.5" /> No phone
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ZivoMobileNav />
    </div>
  );
}
