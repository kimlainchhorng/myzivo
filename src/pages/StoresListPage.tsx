/**
 * StoresListPage — Full list of nearby stores (See All from /store-map)
 * Features: skeletons + retry, GPS error banner, share toasts, favorites
 * filter + per-row heart, recenter button, shared store details drawer,
 * Manage favorites (bulk un-favorite), offline cache + offline pill,
 * shareable image card, Open directions, promo code field, "Open now"
 * filter, persisted filter prefs, queued offline-sync pill, jump-to-map
 * shortcut on each row.
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
  CheckSquare,
  CloudOff,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useStorePins, distanceMiles, type StorePin } from "@/hooks/useStorePins";
import { useStoreFavorites } from "@/hooks/useStoreFavorites";
import { STORE_CATEGORY_OPTIONS } from "@/config/groceryStores";
import { buildShopDeepLink } from "@/lib/deepLinks";
import { trackInitiateCheckout } from "@/services/metaConversion";
import { supabase } from "@/integrations/supabase/client";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import NavBar from "@/components/home/NavBar";
import { shareStoreWithCard } from "@/lib/social/storeShareCard";
import { openDirections } from "@/lib/maps/openDirections";
import { isOpenNow } from "@/lib/store/storeHours";
import StoreDetailsDrawer from "@/components/store/StoreDetailsDrawer";

const CATEGORY_ICONS: Record<string, string> = {
  "food-market": "🛒", "grocery": "🛒", "restaurant": "🍽️", "fashion": "👗",
  "drink": "🥤", "mall": "🏬", "supermarket": "🏪", "salon": "💇",
  "electronics": "📱", "pharmacy": "💊", "car-rental": "🚗", "car-dealership": "🚙",
  "auto-repair": "🔧", "tire-shop": "🛞", "auto-parts": "⚙️", "other": "📍", "default": "📍",
};

const FILTER_PREFS = "zivo:stores:filters";

const getIcon = (c: string) => CATEGORY_ICONS[c] || CATEGORY_ICONS.default;
const getLabel = (c: string) => STORE_CATEGORY_OPTIONS.find((o) => o.value === c)?.label || c;

async function shareStore(s: StorePin, distanceMi: number | null) {
  try {
    const result = await shareStoreWithCard(s, {
      distanceMi: distanceMi ?? undefined,
      categoryLabel: getLabel(s.category),
    });
    if (result.mode === "shared-with-image") toast.success("Shared with image");
    else if (result.mode === "shared-link") toast.success("Link shared");
    else if (result.mode === "downloaded") toast.success("Image saved · link copied");
    else if (result.mode === "copied") toast.success("Link copied to clipboard");
    else if (result.mode === "error") toast.error("Couldn't share — try again");
  } catch {
    try {
      await navigator.clipboard.writeText(buildShopDeepLink(s.slug));
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't share — try again");
    }
  }
}

interface PersistedFilters {
  cat?: string;
  q?: string;
  fav?: boolean;
  open?: boolean;
}

function readPersistedFilters(): PersistedFilters | null {
  try {
    const raw = localStorage.getItem(FILTER_PREFS);
    return raw ? (JSON.parse(raw) as PersistedFilters) : null;
  } catch {
    return null;
  }
}

function writePersistedFilters(prefs: PersistedFilters) {
  try {
    localStorage.setItem(FILTER_PREFS, JSON.stringify(prefs));
  } catch {
    /* noop */
  }
}

export default function StoresListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // Hydrate from URL → fallback to localStorage prefs on first paint
  const initial = useMemo(() => {
    const hasUrl =
      params.get("cat") || params.get("q") || params.get("fav") || params.get("open");
    if (hasUrl) {
      return {
        cat: params.get("cat") || "all",
        q: params.get("q") || "",
        fav: params.get("fav") === "1",
        open: params.get("open") === "1",
      };
    }
    const persisted = readPersistedFilters();
    return {
      cat: persisted?.cat || "all",
      q: persisted?.q || "",
      fav: !!persisted?.fav,
      open: !!persisted?.open,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>(initial.cat);
  const [searchQuery, setSearchQuery] = useState<string>(initial.q);
  const [searchOpen, setSearchOpen] = useState<boolean>(!!initial.q);
  const [showFavorites, setShowFavorites] = useState<boolean>(initial.fav);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(initial.open);

  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsBannerDismissed, setGpsBannerDismissed] = useState(false);
  const [recentering, setRecentering] = useState(false);
  const [drawerStore, setDrawerStore] = useState<StorePin | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Manage mode state
  const [manageMode, setManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [removingFavs, setRemovingFavs] = useState(false);

  const { stores: allStores, isLoading, error, refetch, isFetching, isOffline } = useStorePins();
  const {
    isFavorite, toggleFavorite, removeFavorites, isAuthed, favoriteIds,
    pendingSyncCount, syncNow,
  } = useStoreFavorites();

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
        setGpsBannerDismissed(false);
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

  useEffect(() => {
    requestGps({ silent: true });
  }, [requestGps]);

  // Mirror filters back to URL + localStorage
  useEffect(() => {
    const next = new URLSearchParams();
    if (activeCategory !== "all") next.set("cat", activeCategory);
    if (searchQuery.trim()) next.set("q", searchQuery.trim());
    if (showFavorites) next.set("fav", "1");
    if (openNowOnly) next.set("open", "1");
    setParams(next, { replace: true });
    writePersistedFilters({
      cat: activeCategory,
      q: searchQuery.trim(),
      fav: showFavorites,
      open: openNowOnly,
    });
  }, [activeCategory, searchQuery, showFavorites, openNowOnly, setParams]);

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
      if (openNowOnly) {
        const open = isOpenNow(s.hours);
        if (open !== true) return false;
      }
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
  }, [allStores, activeCategory, searchQuery, userLoc, showFavorites, openNowOnly, favoriteIds]);

  const visibleFavoriteIds = useMemo(
    () => filtered.filter((s) => favoriteIds.has(s.id)).map((s) => s.id),
    [filtered, favoriteIds]
  );

  const goBackToMap = () => {
    const next = new URLSearchParams();
    if (activeCategory !== "all") next.set("cat", activeCategory);
    if (searchQuery.trim()) next.set("q", searchQuery.trim());
    if (openNowOnly) next.set("open", "1");
    navigate(`/store-map${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const buildRideUrl = (s: StorePin, promo?: string | null) => {
    const qp = new URLSearchParams({
      destination: s.address || s.name,
      destLat: String(s.latitude),
      destLng: String(s.longitude),
    });
    if (promo) qp.set("promo", promo);
    return `/rides/hub?${qp.toString()}`;
  };

  const handleRide = (s: StorePin, promo?: string | null) => {
    trackInitiateCheckout({
      eventId: `ride-book-${s.id}-${Date.now()}`,
      externalId: currentUserId || undefined,
      sourceType: "ride_book",
      sourceTable: "store_profiles",
      sourceId: s.id,
      payload: { destination: s.address || s.name, promo: promo || undefined },
    });
    navigate(buildRideUrl(s, promo));
  };

  const handleViewStore = (s: StorePin, promo?: string | null) => {
    const path = `/grocery/shop/${s.slug}${promo ? `?promo=${encodeURIComponent(promo)}` : ""}`;
    navigate(path);
  };

  const handleToggleFavorite = async (s: StorePin) => {
    const res = await toggleFavorite(s.id, {
      name: s.name, slug: s.slug, category: s.category, logo_url: s.logo_url,
    });
    if (res.needsAuth) { toast.error("Sign in to save favorites"); return; }
    if (res.error) { toast.error("Couldn't update favorites"); return; }
    if (res.queued) {
      toast.success(res.added ? "Saved offline — syncs later" : "Removed offline — syncs later");
      return;
    }
    toast.success(res.added ? "Added to favorites" : "Removed from favorites");
  };

  const enterManageMode = () => {
    setShowFavorites(true);
    setManageMode(true);
    setSelectedIds(new Set());
  };
  const exitManageMode = () => {
    setManageMode(false);
    setSelectedIds(new Set());
  };
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAllVisible = () => {
    if (selectedIds.size === visibleFavoriteIds.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(visibleFavoriteIds));
  };
  const handleBulkRemove = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setRemovingFavs(true);
    const res = await removeFavorites(ids);
    setRemovingFavs(false);
    if (res.failed > 0) { toast.error("Couldn't remove some favorites"); return; }
    toast.success(res.removed === 1 ? "Removed 1 favorite" : `Removed ${res.removed} favorites`);
    exitManageMode();
  };

  const handleSyncNow = async () => {
    const res = await syncNow();
    if (res.flushed > 0) toast.success(`Synced ${res.flushed} change${res.flushed === 1 ? "" : "s"}`);
    else toast.info("Nothing to sync");
  };

  const handleOpenDirections = (s: StorePin) => {
    openDirections({ lat: s.latitude, lng: s.longitude, label: s.name, address: s.address });
  };

  const renderRow = (s: StorePin) => {
    const dist = userLoc ? distanceMiles(userLoc, { lat: s.latitude, lng: s.longitude }) : null;
    const fav = isFavorite(s.id);
    const selected = selectedIds.has(s.id);
    const inManage = manageMode && fav;
    const open = isOpenNow(s.hours);
    const showRating = typeof s.rating === "number" && s.rating > 0;

    return (
      <motion.div
        whileTap={{ scale: 0.985 }}
        className={`rounded-2xl border shadow-sm overflow-hidden transition-colors ${
          selected ? "bg-rose-50 border-rose-300" : "bg-card border-border/40"
        }`}
      >
        <button
          onClick={() => { if (inManage) toggleSelected(s.id); else setDrawerStore(s); }}
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
              {showRating && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500 shrink-0">
                  <Star className="w-3 h-3 fill-current" />
                  {s.rating!.toFixed(1)}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-primary/10 text-primary">
                {getLabel(s.category)}
              </span>
              {open != null && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    open ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {open ? "Open" : "Closed"}
                </span>
              )}
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
          {inManage ? (
            <div className="w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 bg-card border border-border/50">
              <Checkbox checked={selected} onCheckedChange={() => toggleSelected(s.id)} />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(s); }}
                className={`w-9 h-9 rounded-full inline-flex items-center justify-center transition ${
                  fav ? "bg-rose-50 text-rose-500" : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
                aria-label={fav ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`w-4 h-4 ${fav ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/store-map?focus=${s.id}`); }}
                className="w-9 h-9 rounded-full inline-flex items-center justify-center bg-muted/40 text-muted-foreground hover:bg-muted transition"
                aria-label="Show on map"
                title="Show on map"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          )}
        </button>
        {!inManage && (
          <div className="flex border-t border-border/30">
            <button
              onClick={(e) => { e.stopPropagation(); handleRide(s); }}
              className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary hover:bg-primary/5 transition"
            >
              <Car className="w-3.5 h-3.5" /> Ride
            </button>
            <div className="w-px bg-border/30" />
            <button
              onClick={(e) => { e.stopPropagation(); shareStore(s, dist); }}
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
        )}
      </motion.div>
    );
  };

  const showGpsBanner = gpsError && !gpsBannerDismissed && !manageMode;

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
                  onClick={manageMode ? exitManageMode : goBackToMap}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border/40 shadow-sm text-foreground hover:bg-muted transition"
                  aria-label={manageMode ? "Exit manage mode" : "Back to map"}
                >
                  {manageMode ? <X className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-[16px] font-bold leading-tight text-foreground flex items-center gap-1.5">
                    {manageMode ? "Manage favorites" : "All Stores"}
                    {isOffline && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        <CloudOff className="w-3 h-3" /> Offline
                      </span>
                    )}
                  </h1>
                  <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                    {manageMode
                      ? `${selectedIds.size} selected · tap rows to choose`
                      : `${filtered.length} ${filtered.length === 1 ? "store" : "stores"}${userLoc ? " · sorted by distance" : ""}`}
                  </p>
                </div>
                {!manageMode && favoriteIds.size > 0 && (
                  <button
                    onClick={enterManageMode}
                    className="h-10 px-3 inline-flex items-center gap-1.5 rounded-full bg-card border border-border/40 shadow-sm text-foreground text-[12px] font-semibold"
                    aria-label="Manage favorites"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span className="hidden xs:inline">Manage</span>
                  </button>
                )}
                {!manageMode && (
                  <>
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
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pending sync pill */}
          {pendingSyncCount > 0 && !manageMode && (
            <button
              onClick={handleSyncNow}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold rounded-full px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {pendingSyncCount} change{pendingSyncCount === 1 ? "" : "s"} pending sync · tap to retry
            </button>
          )}
        </div>

        {/* Category chips (hidden in manage mode) */}
        {!manageMode && (usedCategories.length > 0 || favoriteIds.size > 0) && (
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
                  onClick={() => setOpenNowOnly((v) => !v)}
                  className={`px-4 h-9 inline-flex items-center gap-1.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap border ${
                    openNowOnly
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-card text-foreground/80 border-border/40"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Open now
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
      {showGpsBanner && (
        <div className="px-3 pt-3">
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-900">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold">Location unavailable</p>
              <p className="text-[12px] opacity-80">
                {gpsError}. Enable location in your browser/phone settings, then tap Try again.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => requestGps()}
                disabled={recentering}
                className="h-8 px-2.5 inline-flex items-center gap-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-[12px] font-semibold disabled:opacity-60"
              >
                {recentering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Try again
              </button>
              <button
                onClick={() => setGpsBannerDismissed(true)}
                className="h-7 px-2.5 inline-flex items-center justify-center rounded-full text-amber-800 text-[11px] font-semibold hover:bg-amber-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className={`flex-1 overflow-y-auto px-3 pt-3 ${manageMode ? "pb-[140px]" : "pb-[110px]"}`}>
        {error && !isOffline ? (
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
        ) : isLoading && allStores.length === 0 ? (
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
              ) : openNowOnly ? (
                <Clock className="w-7 h-7 text-muted-foreground" />
              ) : (
                <Store className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <p className="text-foreground font-semibold">
              {showFavorites ? "No favorites yet" : openNowOnly ? "No stores open right now" : "No stores match"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {showFavorites
                ? "Tap the heart on a store to save it here."
                : openNowOnly
                ? "Try clearing the Open now filter or browse all stores."
                : "Try clearing filters or searching with a different term."}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setActiveCategory("all"); setSearchQuery(""); setShowFavorites(false); setOpenNowOnly(false); exitManageMode(); }}
            >
              Reset filters
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

      {/* Manage mode action bar */}
      <AnimatePresence>
        {manageMode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed left-0 right-0 bottom-0 z-50 bg-card border-t border-border/40 shadow-2xl"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
          >
            <div className="px-3 py-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllVisible}
                disabled={visibleFavoriteIds.length === 0}
              >
                {selectedIds.size === visibleFavoriteIds.length && visibleFavoriteIds.length > 0
                  ? "Clear"
                  : "Select all"}
              </Button>
              <div className="flex-1 text-center text-[13px] font-semibold text-foreground">
                {selectedIds.size} selected
              </div>
              <Button
                onClick={handleBulkRemove}
                disabled={selectedIds.size === 0 || removingFavs}
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                {removingFavs ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1.5" />
                )}
                Remove{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared store details drawer */}
      {drawerStore && !manageMode && (
        <StoreDetailsDrawer
          store={drawerStore}
          userLoc={userLoc}
          categoryLabel={getLabel(drawerStore.category)}
          isFavorite={isFavorite(drawerStore.id)}
          isAuthed={isAuthed}
          onClose={() => setDrawerStore(null)}
          onView={(s, promo) => handleViewStore(s, promo)}
          onRide={(s, promo) => handleRide(s, promo)}
          onDirections={handleOpenDirections}
          onShare={(s, d) => shareStore(s, d)}
          onToggleFavorite={handleToggleFavorite}
          onOpenInMap={(s) => navigate(`/store-map?focus=${s.id}`)}
          onPromoApplied={(code) =>
            toast.success(`Promo ${code} ready for your next ride or order`)
          }
        />
      )}

      {/* Hide bottom nav while drawer or manage bar is showing */}
      {!manageMode && !drawerStore && <ZivoMobileNav />}
    </div>
  );
}
