/**
 * HotelResortDetailPage
 * Public-facing detail page for a single Hotel/Resort store.
 * Route: /hotel/:storeId
 *
 * Shows cover, name/location, amenities, rooms preview, contact actions.
 * Owners (when their own store is being viewed) get a quick "Open Admin
 * Dashboard" band at the bottom.
 */
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format, addDays, differenceInCalendarDays, parseISO, isValid } from "date-fns";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Hotel from "lucide-react/dist/esm/icons/hotel";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Star from "lucide-react/dist/esm/icons/star";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Phone from "lucide-react/dist/esm/icons/phone";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Globe from "lucide-react/dist/esm/icons/globe";
import Wifi from "lucide-react/dist/esm/icons/wifi";
import Coffee from "lucide-react/dist/esm/icons/coffee";
import Waves from "lucide-react/dist/esm/icons/waves";
import Car from "lucide-react/dist/esm/icons/car";
import Utensils from "lucide-react/dist/esm/icons/utensils";
import Dumbbell from "lucide-react/dist/esm/icons/dumbbell";
import Wind from "lucide-react/dist/esm/icons/wind";
import Tv from "lucide-react/dist/esm/icons/tv";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import CalendarRange from "lucide-react/dist/esm/icons/calendar-range";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import Settings from "lucide-react/dist/esm/icons/settings";
import Users from "lucide-react/dist/esm/icons/users";

import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useLodgePropertyProfile } from "@/hooks/lodging/useLodgePropertyProfile";
import { useLodgeRooms } from "@/hooks/lodging/useLodgeRooms";
import { useOwnerStoreProfile } from "@/hooks/useOwnerStoreProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StoreRow {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  phone: string | null;
  setup_complete: boolean | null;
  slug?: string | null;
}

const AMENITY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  "free wifi": Wifi,
  internet: Wifi,
  breakfast: Coffee,
  pool: Waves,
  "swimming pool": Waves,
  parking: Car,
  "free parking": Car,
  restaurant: Utensils,
  "restaurant on-site": Utensils,
  gym: Dumbbell,
  fitness: Dumbbell,
  ac: Wind,
  "air conditioning": Wind,
  tv: Tv,
  spa: Sparkles,
};

const formatPrice = (cents: number) => {
  if (!cents || cents <= 0) return "—";
  return `$${(cents / 100).toFixed(0)}`;
};

// Format a phone number nicely. KH local numbers (7–9 digits, no leading +)
// get +855 prefix and grouped as +855 XX XXX XXX.
const formatPhone = (raw?: string | null) => {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) {
    const digits = trimmed.replace(/[^\d]/g, "");
    if (digits.length >= 10) {
      const cc = digits.slice(0, digits.length - 9);
      return `+${cc} ${digits.slice(-9, -6)} ${digits.slice(-6, -3)} ${digits.slice(-3)}`;
    }
    return trimmed;
  }
  const local = trimmed.replace(/[^\d]/g, "").replace(/^0+/, "");
  if (local.length >= 7 && local.length <= 9) {
    const a = local.slice(0, local.length - 6);
    const b = local.slice(local.length - 6, local.length - 3);
    const c = local.slice(local.length - 3);
    return `+855 ${a} ${b} ${c}`;
  }
  return trimmed;
};

const amenityIconFor = (label: string) => {
  const key = label.toLowerCase().trim();
  return AMENITY_ICON_MAP[key] || CheckCircle2;
};

// Convert "free_toiletries" / "non-smoking_room" -> "Free Toiletries"
const humanizeLabel = (raw: string) =>
  (raw || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const todayUTC = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseParamDate = (s: string | null) => {
  if (!s) return null;
  const d = parseISO(s);
  return isValid(d) ? d : null;
};

interface PromoInfo {
  type: "percent" | "fixed";
  value: number;
  name: string;
}

export default function HotelResortDetailPage() {
  const { storeId = "" } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { data: ownerStore } = useOwnerStoreProfile();
  const isOwner = ownerStore?.id === storeId;

  // Fetch the store row directly so this page works for any lodging store, not
  // just the current user's own store.
  const storeQuery = useQuery({
    queryKey: ["hotel-detail-store", storeId],
    queryFn: async (): Promise<StoreRow | null> => {
      const { data, error } = await (supabase as any)
        .from("store_profiles")
        .select("id, name, category, address, logo_url, banner_url, description, phone, setup_complete, slug")
        .eq("id", storeId)
        .maybeSingle();
      if (error) throw error;
      return (data as StoreRow) || null;
    },
    enabled: !!storeId,
  });

  const profileQuery = useLodgePropertyProfile(storeId);
  const roomsQuery = useLodgeRooms(storeId);

  const store = storeQuery.data;
  const profile = profileQuery.data;
  const rooms = roomsQuery.data || [];
  const activeRooms = useMemo(() => rooms.filter((r) => r.is_active !== false), [rooms]);

  const cover = store?.banner_url || store?.logo_url || null;
  const location = store?.address || "";
  const amenities = useMemo(() => {
    const merged = [
      ...(profile?.popular_amenities || []),
      ...(profile?.facilities || []),
    ];
    return Array.from(new Set(merged.map((a) => a?.toString().trim()).filter(Boolean))).slice(0, 12);
  }, [profile]);

  // Active public promotion (largest wins)
  const promotionQuery = useQuery({
    queryKey: ["hotel-detail-promo", storeId],
    enabled: !!storeId,
    queryFn: async (): Promise<PromoInfo | null> => {
      const nowIso = new Date().toISOString();
      const { data, error } = await (supabase as any)
        .from("lodging_promotions")
        .select("promo_type, discount_value, name, starts_at, ends_at, active, member_only")
        .eq("store_id", storeId)
        .eq("active", true)
        .eq("member_only", false);
      if (error) return null;
      let best: PromoInfo | null = null;
      for (const r of (data || []) as Array<any>) {
        if (r.starts_at && r.starts_at > nowIso) continue;
        if (r.ends_at && r.ends_at < nowIso) continue;
        const value = Number(r.discount_value) || 0;
        if (value <= 0) continue;
        const candidate: PromoInfo = {
          type: r.promo_type === "fixed" ? "fixed" : "percent",
          value,
          name: r.name || "",
        };
        if (!best || candidate.value > best.value) best = candidate;
      }
      return best;
    },
  });
  const promo = promotionQuery.data;

  const minPriceCents = useMemo(() => {
    const prices = activeRooms.map((r) => r.base_rate_cents).filter((p) => p > 0);
    return prices.length ? Math.min(...prices) : 0;
  }, [activeRooms]);

  // Apply promo to a base price -> { discounted, pctOff }
  const applyPromo = (baseCents: number) => {
    if (!baseCents || !promo) return { discounted: baseCents, pctOff: 0 };
    if (promo.type === "percent") {
      const pct = Math.round(promo.value);
      return { discounted: Math.round(baseCents * (1 - pct / 100)), pctOff: pct };
    }
    const off = Math.round(promo.value * 100);
    const discounted = Math.max(0, baseCents - off);
    const pctOff = Math.round((1 - discounted / baseCents) * 100);
    return { discounted, pctOff };
  };

  const minDeal = useMemo(() => applyPromo(minPriceCents), [minPriceCents, promo]);

  const [searchParams] = useSearchParams();
  const [checkIn, setCheckIn] = useState<Date>(() => parseParamDate(searchParams.get("ci")) ?? todayUTC());
  const [checkOut, setCheckOut] = useState<Date>(() => parseParamDate(searchParams.get("co")) ?? addDays(todayUTC(), 1));
  const [adults, setAdults] = useState<number>(() => Number(searchParams.get("adults")) || 2);
  const [children, setChildren] = useState<number>(() => Number(searchParams.get("children")) || 0);
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [allRoomsOpen, setAllRoomsOpen] = useState(false);
  const nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn));

  // Identify the cheapest active room for a deterministic "Top pick" badge
  const topPickRoomId = useMemo(() => {
    if (!activeRooms.length) return null;
    const cheapest = activeRooms
      .filter((r) => r.base_rate_cents > 0)
      .sort((a, b) => a.base_rate_cents - b.base_rate_cents)[0];
    return cheapest?.id || null;
  }, [activeRooms]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [storeId]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: store?.name || "Hotel on ZIVO",
      text: `Check out ${store?.name || "this property"} on ZIVO`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user cancelled — fall through
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not share link");
    }
  };

  const handleCheckAvailability = () => {
    const ciStr = format(checkIn, "yyyy-MM-dd");
    const coStr = format(checkOut, "yyyy-MM-dd");
    const dest = store?.slug || storeId;
    navigate(`/store/${dest}?ci=${ciStr}&co=${coStr}&adults=${adults}&children=${children}`);
  };

  const isLoading = storeQuery.isLoading || profileQuery.isLoading;

  if (!storeId) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">No property selected.</p>
      </div>
    );
  }

  if (!isLoading && !store) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center gap-3">
        <Hotel className="w-10 h-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Property not found</h1>
        <p className="text-sm text-muted-foreground">This hotel or resort is no longer available.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-12">
      <Helmet>
        <title>{store?.name ? `${store.name} — ZIVO` : "Hotel & Resort — ZIVO"}</title>
        <meta
          name="description"
          content={
            store?.description?.slice(0, 155) ||
            `Discover ${store?.name || "this hotel"} on ZIVO — rooms, amenities, location and contact.`
          }
        />
        <link rel="canonical" href={`https://hizivo.com/hotel/${storeId}`} />
      </Helmet>

      {/* Hero / Cover */}
      <div className="relative">
        <div className="relative h-56 md:h-80 lg:h-[420px] w-full overflow-hidden bg-muted">
          {cover ? (
            <img
              src={cover}
              alt={store?.name ? `${store.name} cover` : "Hotel cover"}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 md:via-transparent to-transparent" />
        </div>

        {/* Top nav */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between safe-area-top">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="px-4 -mt-12 relative z-10 mx-auto w-full max-w-3xl lg:max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card shadow-sm p-4"
        >
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold text-foreground line-clamp-2 break-words">{store?.name}</h1>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {store?.category?.replace(/_/g, " ") || "Hotel"}
                    </Badge>
                    {store?.setup_complete && (
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                        Ready
                      </Badge>
                    )}
                  </div>
                  {location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{location}</span>
                    </p>
                  )}
                </div>
                {minPriceCents > 0 && (
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">From</p>
                    {minDeal.pctOff > 0 && minDeal.discounted < minPriceCents ? (
                      <>
                        <p className="text-base font-bold text-emerald-600 leading-tight">
                          {formatPrice(minDeal.discounted)}
                          <span className="text-[10px] font-normal text-muted-foreground"> /night</span>
                        </p>
                        <div className="mt-0.5 flex items-center justify-end gap-1.5">
                          <span className="text-[10px] text-muted-foreground line-through">
                            {formatPrice(minPriceCents)}
                          </span>
                          <span className="rounded-full bg-red-600 text-white text-[9px] font-semibold px-1.5 py-0.5">
                            -{minDeal.pctOff}%
                          </span>
                        </div>
                        {promo?.name && (
                          <p className="mt-0.5 text-[9px] text-emerald-700 font-medium truncate max-w-[110px] md:max-w-none">
                            {promo.name}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-base font-bold text-primary leading-tight">
                        {formatPrice(minPriceCents)}
                        <span className="text-[10px] font-normal text-muted-foreground"> /night</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick stats */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Stat label="Rooms" value={activeRooms.length || "—"} />
                <Stat
                  label="Check-in"
                  value={profile?.check_in_from?.slice(0, 5) || "—"}
                />
                <Stat
                  label="Check-out"
                  value={profile?.check_out_until?.slice(0, 5) || "—"}
                />
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Body wrapper for tablet/desktop centering */}
      <div className="mx-auto w-full max-w-3xl lg:max-w-5xl">

      {/* Inline desktop CTA (replaces sticky bar on md+) */}
      <div className="hidden md:flex items-stretch gap-2.5 px-4 mt-4">
        <Button
          variant="outline"
          size="lg"
          className="h-12 rounded-2xl flex-1 max-w-[200px] font-semibold border-border/70 hover:bg-muted/60"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
        <Button
          size="lg"
          className="h-12 rounded-2xl flex-1 font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-500/20"
          onClick={handleCheckAvailability}
        >
          <CalendarRange className="w-4 h-4 mr-2" /> Check Availability
        </Button>
      </div>

      {/* Date + Guests picker */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-2">
        <Popover open={datesOpen} onOpenChange={setDatesOpen}>
          <PopoverTrigger asChild>
            <button className="h-11 rounded-2xl border border-border bg-card shadow-sm text-left px-3 flex items-center gap-2 active:scale-[0.98] transition">
              <CalendarRange className="w-4 h-4 text-primary shrink-0" />
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
              <p className="text-[11px] font-semibold text-muted-foreground">Pick check-in & check-out</p>
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
            <button className="h-11 rounded-2xl border border-border bg-card shadow-sm text-left px-3 flex items-center gap-2 active:scale-[0.98] transition">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">Guests</p>
                <p className="text-[12px] font-semibold text-foreground truncate leading-tight">
                  {adults} adult{adults > 1 ? "s" : ""}{children > 0 ? ` · ${children} child${children > 1 ? "ren" : ""}` : ""}
                </p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <DetailStepper label="Adults" value={adults} min={1} max={20} onChange={setAdults} />
              <DetailStepper label="Children" value={children} min={0} max={10} onChange={setChildren} />
              <Button className="w-full h-9" onClick={() => setGuestsOpen(false)}>Done</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Description */}
      {!!store?.description && (
        <Section title="About">
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            <SafeCaption text={store.description} />
          </p>
        </Section>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <Section title="Amenities">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {amenities.map((label) => {
              const Icon = amenityIconFor(label);
              return (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground truncate">{humanizeLabel(label)}</span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Rooms */}
      <Section title={`Rooms${activeRooms.length ? ` · ${activeRooms.length}` : ""}`}>
        {roomsQuery.isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-56 rounded-xl shrink-0" />
            ))}
          </div>
        ) : activeRooms.length === 0 ? (
          <p className="text-xs text-muted-foreground">No rooms published yet.</p>
        ) : (
          <div className="relative">
            <div className="-mx-4 px-4 pr-10 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:pr-0 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3">
              {activeRooms.slice(0, 8).map((room) => {
                const photo = room.photos?.[room.cover_photo_index ?? 0] || room.photos?.[0];
                const deal = applyPromo(room.base_rate_cents);
                const hasDiscount = deal.pctOff > 0 && deal.discounted < room.base_rate_cents;
                const isTopPick = room.id === topPickRoomId;
                return (
                  <div
                    key={room.id}
                    className="snap-start shrink-0 w-60 md:w-auto rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <div className="h-28 bg-muted relative">
                      {photo ? (
                        <img src={photo} alt={room.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Hotel className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {room.breakfast_included && (
                        <span className="absolute top-1.5 left-1.5 rounded-full bg-background/90 px-2 py-0.5 text-[9px] font-semibold text-primary">
                          Breakfast
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="absolute top-1.5 right-1.5 rounded-full bg-red-600 text-white px-1.5 py-0.5 text-[9px] font-bold">
                          -{deal.pctOff}%
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-foreground truncate flex-1">{room.name}</p>
                        {isTopPick && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            Top pick
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground truncate">
                        {room.beds || room.room_type || "Room"} · {room.max_guests} guests
                      </p>
                      <div className="mt-1.5">
                        {hasDiscount ? (
                          <>
                            <span className="text-sm font-bold text-emerald-600">
                              {formatPrice(deal.discounted)}
                              <span className="text-[10px] font-normal text-muted-foreground"> /night</span>
                            </span>
                            <div className="text-[10px] text-muted-foreground line-through leading-none">
                              {formatPrice(room.base_rate_cents)}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {formatPrice(room.base_rate_cents)}
                            <span className="text-[10px] font-normal text-muted-foreground"> /night</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Right-edge fade hint (mobile only) */}
            <div className="md:hidden pointer-events-none absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-background to-transparent" />
          </div>
        )}
        {activeRooms.length > 8 && (
          <button
            type="button"
            onClick={() => setAllRoomsOpen(true)}
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1.5 text-[11px] font-semibold hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
          >
            See all {activeRooms.length} rooms <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </Section>

      {/* Languages */}
      {!!profile?.languages?.length && (
        <Section title="Languages spoken">
          <div className="flex flex-wrap gap-1.5">
            {profile.languages.map((lang) => (
              <span
                key={lang}
                className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 text-[11px] font-medium dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
              >
                {lang}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Contact */}
      {(profile?.contact?.phone || profile?.contact?.whatsapp || profile?.contact?.website || store?.phone) && (
        <Section title="Contact">
          <div className="grid grid-cols-1 gap-2">
            {(profile?.contact?.phone || store?.phone) && (
              <a
                href={`tel:${profile?.contact?.phone || store?.phone}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 active:scale-[0.99]"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{formatPhone(profile?.contact?.phone || store?.phone)}</span>
              </a>
            )}
            {profile?.contact?.whatsapp && (
              <a
                href={`https://wa.me/${profile.contact.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">WhatsApp</span>
              </a>
            )}
            {profile?.contact?.website && (
              <a
                href={profile.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 active:scale-[0.99]"
              >
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground truncate">
                  {profile.contact.website}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
              </a>
            )}
          </div>
        </Section>
      )}

      {/* Owner band */}
      {isOwner && (
        <section className="px-4 mt-5 mb-4">
          <h2 className="text-sm font-bold text-foreground mb-2">Owner tools</h2>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
              <Settings className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">You manage this property</p>
              <p className="text-[11px] text-muted-foreground">Open admin to edit rooms, rates and guests</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate(`/admin/stores/${storeId}?tab=lodge-overview`)}
            >
              Admin
            </Button>
          </div>
        </section>
      )}

      </div>
      {/* /body wrapper */}

      {/* Sticky CTA — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t border-border px-4 py-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="mx-auto max-w-2xl flex items-stretch gap-2">
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-2xl flex-1 font-semibold border-border/70"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button
            size="lg"
            className="h-12 rounded-2xl flex-[2] font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-500/20"
            onClick={handleCheckAvailability}
          >
            <CalendarRange className="w-4 h-4 mr-2" /> Check Availability
          </Button>
        </div>
      </div>

      {/* All rooms sheet */}
      {allRoomsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-end md:items-center justify-center"
          onClick={() => setAllRoomsOpen(false)}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md md:max-w-2xl max-h-[85dvh] bg-card rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-3 border-b border-border">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-muted mb-3 md:hidden" />
              <h3 className="text-base font-bold text-foreground">All rooms · {activeRooms.length}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{store?.name}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3 pb-[max(env(safe-area-inset-bottom),16px)]">
              {activeRooms.map((room) => {
                const photo = room.photos?.[room.cover_photo_index ?? 0] || room.photos?.[0];
                const deal = applyPromo(room.base_rate_cents);
                const hasDiscount = deal.pctOff > 0 && deal.discounted < room.base_rate_cents;
                const isTopPick = room.id === topPickRoomId;
                return (
                  <div key={room.id} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="h-28 bg-muted relative">
                      {photo ? (
                        <img src={photo} alt={room.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Hotel className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {hasDiscount && (
                        <span className="absolute top-1.5 right-1.5 rounded-full bg-red-600 text-white px-1.5 py-0.5 text-[9px] font-bold">
                          -{deal.pctOff}%
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-foreground truncate flex-1">{room.name}</p>
                        {isTopPick && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            Top pick
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground truncate">
                        {room.beds || room.room_type || "Room"} · {room.max_guests} guests
                      </p>
                      <div className="mt-1.5">
                        {hasDiscount ? (
                          <>
                            <span className="text-sm font-bold text-emerald-600">
                              {formatPrice(deal.discounted)}
                              <span className="text-[10px] font-normal text-muted-foreground"> /night</span>
                            </span>
                            <div className="text-[10px] text-muted-foreground line-through leading-none">
                              {formatPrice(room.base_rate_cents)}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {formatPrice(room.base_rate_cents)}
                            <span className="text-[10px] font-normal text-muted-foreground"> /night</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t border-border">
              <Button variant="ghost" className="w-full" onClick={() => setAllRoomsOpen(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-4 mt-5 md:mt-7">
      <h2 className="text-sm font-bold text-foreground mb-2">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/50 py-2 md:py-2.5">
      <p className="text-sm md:text-lg font-bold text-foreground leading-none">{value}</p>
      <p className="mt-0.5 text-[10px] md:text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function DetailStepper({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="h-8 w-8 rounded-full border border-border text-foreground disabled:opacity-40 active:bg-muted" aria-label={`Decrease ${label}`}>–</button>
        <span className="w-6 text-center text-sm font-bold tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="h-8 w-8 rounded-full border border-border text-foreground disabled:opacity-40 active:bg-muted" aria-label={`Increase ${label}`}>+</button>
      </div>
    </div>
  );
}
