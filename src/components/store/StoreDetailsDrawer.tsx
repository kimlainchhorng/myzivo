/**
 * StoreDetailsDrawer — shared bottom-sheet with full store info, actions,
 * live pulse badge, km + walk time, trail planner hook, and check-in.
 * Used by StoreMapPage and StoresListPage.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Star, MapPin, Clock, Phone, Store, Car, Share2, Heart,
  Navigation, Tag, CheckCircle2, Map as MapIcon, Route, Timer,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StorePin } from "@/hooks/useStorePins";
import { distanceMiles } from "@/hooks/useStorePins";
import { isOpenNow } from "@/lib/store/storeHours";

const CATEGORY_ICONS: Record<string, string> = {
  "food-market": "🛒", "grocery": "🛒", "restaurant": "🍽️", "fashion": "👗",
  "drink": "🥤", "mall": "🏬", "supermarket": "🏪", "salon": "💇",
  "electronics": "📱", "pharmacy": "💊", "car-rental": "🚗", "car-dealership": "🚙",
  "auto-repair": "🔧", "tire-shop": "🛞", "auto-parts": "⚙️", "other": "📍", "default": "📍",
};

const PROMO_KEY = "zivo:pending-promo";

function getIcon(c: string) { return CATEGORY_ICONS[c] || CATEGORY_ICONS.default; }

function fmtKm(mi: number): string {
  const km = mi * 1.609344;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function fmtWalk(mi: number): string {
  const mins = Math.ceil((mi * 1.609344 / 25) * 60);
  if (mins < 2) return "< 1 min";
  if (mins >= 60) return `~${Math.round(mins / 60)} h by tuk-tuk`;
  return `~${mins} min by tuk-tuk`;
}

function savePendingPromo(code: string, store: StorePin) {
  try {
    sessionStorage.setItem(
      PROMO_KEY,
      JSON.stringify({ code, storeId: store.id, storeSlug: store.slug, ts: Date.now() })
    );
  } catch { /* noop */ }
}

export interface StoreDetailsDrawerProps {
  store: StorePin | null;
  userLoc?: { lat: number; lng: number } | null;
  categoryLabel: string;
  isFavorite: boolean;
  isAuthed: boolean;
  isLive?: boolean;
  onClose: () => void;
  onView: (store: StorePin, promo: string | null) => void;
  onRide: (store: StorePin, promo: string | null) => void;
  onDirections: (store: StorePin) => void;
  onShare: (store: StorePin, distanceMi: number | null) => void;
  onToggleFavorite: (store: StorePin) => void;
  onOpenInMap?: (store: StorePin) => void;
  onAddToTrail?: (store: StorePin) => void;
  onPromoApplied?: (code: string) => void;
}

export default function StoreDetailsDrawer({
  store,
  userLoc,
  categoryLabel,
  isFavorite,
  isAuthed,
  isLive,
  onClose,
  onView,
  onRide,
  onDirections,
  onShare,
  onToggleFavorite,
  onOpenInMap,
  onAddToTrail,
  onPromoApplied,
}: StoreDetailsDrawerProps) {
  const navigate = useNavigate();
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    setPromoOpen(false);
    setPromoCode("");
    setPromoApplied(null);
  }, [store?.id]);

  if (!store) return null;

  const distMi = userLoc
    ? distanceMiles(userLoc, { lat: store.latitude, lng: store.longitude })
    : null;
  const open = isOpenNow(store.hours);
  const showRating = typeof store.rating === "number" && store.rating > 0;

  const handleApply = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setPromoApplied(code);
    savePendingPromo(code, store);
    onPromoApplied?.(code);
  };

  const handleCheckIn = () => {
    setCheckingIn(true);
    setTimeout(() => {
      onClose();
      navigate(`/check-in?storeId=${store.id}&storeName=${encodeURIComponent(store.name)}&lat=${store.latitude}&lng=${store.longitude}`);
    }, 350);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1700] bg-foreground/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 320 }}
          animate={{ y: 0 }}
          exit={{ y: 360 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="absolute left-0 right-0 bottom-0 bg-card rounded-t-3xl border-t border-border/40 p-4 shadow-2xl max-h-[88vh] overflow-y-auto"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)" }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label={`${store.name} details`}
        >
          <div className="mx-auto w-10 h-1 rounded-full bg-muted mb-4" />

          {/* Live pulse banner */}
          {isLive && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <p className="text-[12px] font-semibold text-emerald-800 flex-1">
                Live activity — someone purchased here in the last 30 minutes
              </p>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden bg-muted/40">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{getIcon(store.category)}</span>
              )}
              {isLive && (
                <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold leading-tight text-foreground">{store.name}</h2>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-primary/10 text-primary">
                  {categoryLabel}
                </span>
                {showRating && (
                  <span className="flex items-center gap-0.5 text-[12px] font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {(store.rating ?? 0).toFixed(1)}
                  </span>
                )}
                {open != null && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    open ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {open ? "Open" : "Closed"}
                  </span>
                )}
              </div>
              {distMi != null && (
                <div className="mt-1.5 flex items-center gap-1 text-[12px] font-semibold text-muted-foreground">
                  <Timer className="w-3.5 h-3.5" />
                  {fmtKm(distMi)} away · {fmtWalk(distMi)}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-muted/50 text-muted-foreground hover:bg-muted transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Photo carousel */}
          {(() => {
            const raw = (store as any).gallery_images;
            const imgs: string[] = Array.isArray(raw)
              ? (raw as unknown[]).filter((v): v is string => typeof v === "string" && v.startsWith("http"))
              : [];
            if (!imgs.length) return null;
            return (
              <div className="mt-4 -mx-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-1">
                  {imgs.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${store.name} photo ${i + 1}`}
                      className="h-44 w-auto max-w-[260px] rounded-2xl object-cover shrink-0 border border-border/20"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Info rows */}
          <div className="mt-4 space-y-2.5">
            {store.address && (
              <div className="flex items-start gap-2.5 text-[13px] text-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="flex-1">{store.address}</span>
              </div>
            )}
            {store.hours && (
              <div className="flex items-start gap-2.5 text-[13px] text-foreground">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 whitespace-pre-line">{store.hours}</span>
              </div>
            )}
            {store.phone && (
              <a href={`tel:${store.phone}`} className="flex items-center gap-2.5 text-[13px] font-semibold text-primary">
                <Phone className="w-4 h-4 shrink-0" />
                {store.phone}
              </a>
            )}
          </div>

          {/* Promo code */}
          <div className="mt-4 rounded-xl border border-border/40 bg-muted/20 overflow-hidden">
            <button
              onClick={() => setPromoOpen((v) => !v)}
              className="w-full px-3.5 py-3 flex items-center gap-2 text-left"
              aria-expanded={promoOpen}
            >
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-[13px] font-semibold text-foreground flex-1">
                {promoApplied ? `Promo ${promoApplied} applied` : "Have a promo code?"}
              </span>
              {promoApplied && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              <span className="text-[12px] text-muted-foreground">{promoOpen ? "Hide" : "Add"}</span>
            </button>
            {promoOpen && (
              <div className="px-3.5 pb-3.5 flex items-center gap-2">
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="h-10 rounded-xl flex-1 text-sm uppercase"
                  maxLength={20}
                  disabled={!!promoApplied}
                />
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={!promoCode.trim() || !!promoApplied}
                  className="h-10 px-4 rounded-xl"
                >
                  {promoApplied ? "Applied" : "Apply"}
                </Button>
              </div>
            )}
            {promoApplied && (
              <p className="px-3.5 pb-3 text-[11px] text-muted-foreground">
                Will be added to your next ride or order from this store.
              </p>
            )}
          </div>

          {/* Primary actions */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={() => { onView(store, promoApplied); onClose(); }}>
              <Store className="w-4 h-4 mr-1.5" /> View Store
            </Button>
            <Button variant="outline" onClick={() => { onRide(store, promoApplied); onClose(); }}>
              <Car className="w-4 h-4 mr-1.5" /> Ride There
            </Button>
            <Button variant="outline" onClick={() => onDirections(store)}>
              <Navigation className="w-4 h-4 mr-1.5" /> Directions
            </Button>
            <Button variant="outline" onClick={() => onShare(store, distMi)}>
              <Share2 className="w-4 h-4 mr-1.5" /> Share
            </Button>

            {/* Check In */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="col-span-2 h-10 rounded-md border border-input bg-background px-4 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-70"
            >
              {checkingIn
                ? <><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500 animate-pulse" /> Checking in…</>
                : <><UserCheck className="w-4 h-4 mr-1.5" /> Check In Here</>
              }
            </motion.button>

            {/* Add to Trail (shown only when caller supports it) */}
            {onAddToTrail && (
              <Button
                variant="outline"
                className="col-span-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                onClick={() => { onAddToTrail(store); onClose(); }}
              >
                <Route className="w-4 h-4 mr-1.5" /> Add to Shopping Trail
              </Button>
            )}

            <Button
              variant={isFavorite ? "default" : "outline"}
              className={`col-span-2 ${isFavorite ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500" : ""}`}
              onClick={() => onToggleFavorite(store)}
            >
              <Heart className={`w-4 h-4 mr-1.5 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Saved to Favorites" : "Save to Favorites"}
            </Button>
          </div>

          {onOpenInMap && (
            <button
              onClick={() => onOpenInMap(store)}
              className="mt-3 w-full h-10 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition"
            >
              <MapIcon className="w-4 h-4" /> Open in map
            </button>
          )}

          {!isAuthed && (
            <p className="mt-3 text-[11px] text-center text-muted-foreground">
              Sign in to save favorites across devices.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
