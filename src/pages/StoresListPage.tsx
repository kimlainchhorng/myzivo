/**
 * StoresListPage — Full list of nearby stores (See All from /store-map)
 * Features: skeletons + retry, GPS error banner, share toasts, favorites
 * filter + per-row heart, recenter button, store details drawer.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Heart,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Map as MapIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStorePins, distanceMiles, type StorePin } from "@/hooks/useStorePins";
import { useStoreFavorites } from "@/hooks/useStoreFavorites";
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

async function shareStore(s: StorePin) {
  const url = buildShopDeepLink(s.slug);
  const text = `Check out ${s.name} on ZiVo`;
  try {
    if (navigator.share) {
      await navigator.share({ title: s.name, text, url });
      toast.success("Shared!");
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  } catch (err: any) {
    if (err?.name === "AbortError") return; // user cancelled
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't share — try again");
    }
  }
}

export default function StoresListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<string>(params.get("cat") || "all");
  const [searchQuery, setSearchQuery] = useState<string>(params.get("q") || "");
  const [searchOpen, setSearchOpen] = useState<boolean>(!!params.get("q"));
  const [showFavorites, setShowFavorites] = useState<boolean>(params.get("fav") === "1");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [recentering, setRecentering] = useState(false);
  const [drawerStore, setDrawerStore] = useState<StorePin | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { stores: allStores, isLoading, error, refetch, isFetching } = useStorePins();
  const { isFavorite, toggleFavorite, isAuthed, favoriteIds } = useStoreFavorites();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  const requestGps = useCallback((opts?: { silent?: boolean }) => {
    if (!("geolocation" in navigator)) {
      setGpsError("Geolocation not supported on this device");
      if (!opts?.silent) toast.error("Geolocation not supported");
      return;
    }
    setRecentering(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError(null);
        setRecentering(false);
        if (!opts?.silent) toast.success("Distances updated");
      },
      (err) => {
        setRecentering(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied"
            : "Couldn't get your location";
        setGpsError(msg);
        if (!opts?.silent) toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // Initial silent GPS attempt
  useEffect(() => {
    requestGps({ silent: true });
  }, [requestGps]);

  // Persist filters back to URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (activeCategory !== "all") next.set("cat", activeCategory);
    if (searchQuery.trim()) next.set("q", searchQuery.trim());
    if (showFavorites) next.set("fav", "1");
    setParams(next, { replace: true });
  }, [activeCategory, searchQuery, showFavorites, setParams]);

  const usedCategories = useMemo(() => {
    const present = new Set(allStores.map((s) => s.category));
    return STORE_CATEGORY_OPTIONS.filter((o) => present.has(o.value));
  }, [allStores]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = allStores.filter((s) => {
      if (showFavorites && !favoriteIds.has(s.id)) return false;
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
  }, [allStores, activeCategory, searchQuery, userLoc, showFavorites, favoriteIds]);

  const goBackToMap = () => {
    const next = new URLSearchParams();
    if (activeCategory !== "all") next.set("cat", activeCategory);
    navigate(`/store-map${next.toString() ? `?${next.toString()}` : ""}`);
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

  const handleToggleFavorite = async (s: StorePin) => {
    const res = await toggleFavorite(s.id, {
      name: s.name,
      slug: s.slug,
      category: s.category,
      logo_url: s.logo_url,
    });
    if (res.needsAuth) {
      toast.error("Sign in to save favorites");
      return;
    }
    if (res.error) {
      toast.error("Couldn't update favorites");
      return;
    }
    toast.success(res.added ? "Added to favorites" : "Removed from favorites");
  };

  const renderRow = (s: StorePin) => {
    const dist = userLoc ? distanceMiles(userLoc, { lat: s.latitude, lng: s.longitude }) : null;
    const fav = isFavorite(s.id);
    return (
      <motion.div
        whileTap={{ scale: 0.985 }}
        className="rounded-2xl bg-card border border-border/40 shadow-sm overflow-hidden"
      >
        <button
          onClick={() => setDrawerStore(s)}
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
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(s); }}
            className={`w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 transition ${
              fav ? "bg-rose-50 text-rose-500" : "bg-muted/40 text-muted-foreground hover:bg-muted"
            }`}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 ${fav ? "fill-current" : ""}`} />
          </button>
        </button>
        <div className="flex border-t border-border/30">
          <button
            onClick={(e) => { e.stopPropagation(); handleRide(s); }}
            className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary hover:bg-primary/5 transition"
          >
            <Car className="w-3.5 h-3.5" /> Ride
          </button>
          <div className="w-px bg-border/30" />
          <button
            onClick={(e) => { e.stopPropagation(); shareStore(s); }}
            className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary hover:bg-primary/5 transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          {s.phone && (
            <>
              <div className="w-px bg-border/30" />
              <button
                onClick={(e) => { e.stopPropagation(); window.open(`tel:${s.phone}`, "_self"); }}
                className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary hover:bg-primary/5 transition"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </button>
            </>
          )}
        </div>
      </motion.div>
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
                className="flex items-center gap-2"
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
                  <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                    {filtered.length} {filtered.length === 1 ? "store" : "stores"}
                    {userLoc ? " · sorted by distance" : ""}
                  </p>
                </div>
                <button
                  onClick={() => requestGps()}
                  disabled={recentering}
                  className="h-10 px-3 inline-flex items-center gap-1.5 rounded-full bg-card border border-border/40 shadow-sm text-foreground text-[12px] font-semibold disabled:opacity-60"
                  aria-label="Recenter distance"
                  title="Re-fetch GPS and re-sort"
                >
                  {recentering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Locate className="w-4 h-4" />
                  )}
                  <span className="hidden xs:inline">Recenter</span>
                </button>
                <button
                  onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 80); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border/40 shadow-sm text-muted-foreground hover:bg-muted transition"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category chips */}
        {(usedCategories.length > 0 || favoriteIds.size > 0) && (
          <div className="relative">
            <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 w-max">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowFavorites(false); setActiveCategory("all"); }}
                  className={`px-4 h-9 inline-flex items-center rounded-full text-[13px] font-semibold transition-all whitespace-nowrap border ${
                    !showFavorites && activeCategory === "all"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-foreground/80 border-border/40"
                  }`}
                >
                  All ({allStores.length})
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowFavorites((v) => !v); }}
                  className={`px-4 h-9 inline-flex items-center gap-1.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap border ${
                    showFavorites
                      ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                      : "bg-card text-foreground/80 border-border/40"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${showFavorites ? "fill-current" : ""}`} />
                  Favorites ({favoriteIds.size})
                </motion.button>
                {usedCategories.map((cat) => {
                  const count = allStores.filter((s) => s.category === cat.value).length;
                  const isActive = !showFavorites && activeCategory === cat.value;
                  return (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      key={cat.value}
                      onClick={() => { setShowFavorites(false); setActiveCategory(isActive ? "all" : cat.value); }}
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

      {/* GPS error banner */}
      {gpsError && (
        <div className="px-3 pt-3">
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-900">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold">Location unavailable</p>
              <p className="text-[12px] opacity-80">List isn't sorted by distance. {gpsError}.</p>
            </div>
            <button
              onClick={() => requestGps()}
              disabled={recentering}
              className="h-8 px-2.5 inline-flex items-center gap-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-[12px] font-semibold disabled:opacity-60"
            >
              {recentering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Try again
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-[110px]">
        {error ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-3">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <p className="text-foreground font-semibold">Couldn't load stores</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {(error as any)?.message || "Please check your connection and try again."}
            </p>
            <Button className="mt-4" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <ul className="space-y-2.5" aria-busy="true" aria-label="Loading stores">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="rounded-2xl bg-card border border-border/40 overflow-hidden">
                <div className="p-3.5 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted/60 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 rounded-md bg-muted/60 animate-pulse" />
                    <div className="h-2.5 w-1/3 rounded-md bg-muted/40 animate-pulse" />
                    <div className="h-2.5 w-3/4 rounded-md bg-muted/40 animate-pulse" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted/40 animate-pulse" />
                </div>
                <div className="h-10 border-t border-border/30 bg-muted/20 animate-pulse" />
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
              {showFavorites ? (
                <Heart className="w-7 h-7 text-muted-foreground" />
              ) : (
                <Store className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <p className="text-foreground font-semibold">
              {showFavorites ? "No favorites yet" : "No stores match"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {showFavorites
                ? "Tap the heart on a store to save it here."
                : "Try clearing filters or searching with a different term."}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setActiveCategory("all"); setSearchQuery(""); setShowFavorites(false); }}
            >
              {showFavorites ? "Browse all stores" : "Reset filters"}
            </Button>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((s) => (
              <li key={s.id}>{renderRow(s)}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Store details drawer */}
      <AnimatePresence>
        {drawerStore && (
          <motion.div
            className="fixed inset-0 z-[1700] bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerStore(null)}
          >
            <motion.div
              initial={{ y: 280 }}
              animate={{ y: 0 }}
              exit={{ y: 320 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="absolute left-0 right-0 bottom-0 bg-card rounded-t-3xl border-t border-border/40 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shadow-2xl max-h-[88vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label={`${drawerStore.name} details`}
            >
              <div className="mx-auto w-10 h-1 rounded-full bg-muted mb-4" />

              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden bg-muted/40">
                  {drawerStore.logo_url ? (
                    <img src={drawerStore.logo_url} alt={drawerStore.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{getIcon(drawerStore.category)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[18px] font-bold leading-tight text-foreground">{drawerStore.name}</h2>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-primary/10 text-primary">
                      {getLabel(drawerStore.category)}
                    </span>
                    {drawerStore.rating ? (
                      <span className="flex items-center gap-0.5 text-[12px] font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {drawerStore.rating}
                      </span>
                    ) : null}
                    {userLoc && (
                      <span className="text-[12px] font-semibold text-muted-foreground">
                        {(() => {
                          const d = distanceMiles(userLoc, { lat: drawerStore.latitude, lng: drawerStore.longitude });
                          return `${d < 0.1 ? "<0.1" : d.toFixed(1)} mi away`;
                        })()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setDrawerStore(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-muted/50 text-muted-foreground hover:bg-muted transition"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Info rows */}
              <div className="mt-4 space-y-2.5">
                {drawerStore.address && (
                  <div className="flex items-start gap-2.5 text-[13px] text-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1">{drawerStore.address}</span>
                  </div>
                )}
                {drawerStore.hours && (
                  <div className="flex items-start gap-2.5 text-[13px] text-foreground">
                    <Clock className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 whitespace-pre-line">{drawerStore.hours}</span>
                  </div>
                )}
                {drawerStore.phone && (
                  <a
                    href={`tel:${drawerStore.phone}`}
                    className="flex items-center gap-2.5 text-[13px] font-semibold text-primary"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    {drawerStore.phone}
                  </a>
                )}
              </div>

              {/* Primary actions */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  onClick={() => { navigate(`/grocery/shop/${drawerStore.slug}`); setDrawerStore(null); }}
                >
                  <Store className="w-4 h-4 mr-1.5" /> View Store
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { handleRide(drawerStore); setDrawerStore(null); }}
                >
                  <Car className="w-4 h-4 mr-1.5" /> Ride There
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareStore(drawerStore)}
                >
                  <Share2 className="w-4 h-4 mr-1.5" /> Share
                </Button>
                <Button
                  variant={isFavorite(drawerStore.id) ? "default" : "outline"}
                  className={isFavorite(drawerStore.id) ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}
                  onClick={() => handleToggleFavorite(drawerStore)}
                >
                  <Heart className={`w-4 h-4 mr-1.5 ${isFavorite(drawerStore.id) ? "fill-current" : ""}`} />
                  {isFavorite(drawerStore.id) ? "Saved" : "Favorite"}
                </Button>
              </div>

              <button
                onClick={() => navigate(`/store-map?focus=${drawerStore.id}`)}
                className="mt-3 w-full h-10 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition"
              >
                <MapIcon className="w-4 h-4" /> Open in map
              </button>

              {!isAuthed && (
                <p className="mt-3 text-[11px] text-center text-muted-foreground">
                  Sign in to save favorites across devices.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ZivoMobileNav />
    </div>
  );
}
