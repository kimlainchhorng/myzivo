/**
 * App Home Screen - 2026 Travel Super-App Layout
 * Premium scrollable design with saved places, quick estimate, popular services,
 * quick actions, promos, rewards, and personalized content.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Plane, Car, Utensils, BedDouble,
  MapPin, Bell, LucideIcon, Package, Star, Sparkles,
  UtensilsCrossed, Heart, History, Hotel, Gift, Users, Share2, Clock,
  Wallet, CreditCard, Home, Briefcase, Plus, Timer, DollarSign,
  TrendingUp, Navigation, ChevronRight, ArrowRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalizedHome, HomeRestaurant } from "@/hooks/usePersonalizedHome";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import { useUserRewards } from "@/hooks/useUserRewards";
import { ZIVO_TIERS, getTierFromPoints, getPointsToNextTier, type ZivoTier } from "@/config/zivoPoints";
import { useReferrals } from "@/hooks/useReferrals";
import { REFERRAL_REWARDS } from "@/config/referralProgram";
import { useScheduledBookingsQuery } from "@/hooks/useScheduledBookings";
import { useCustomerWallet } from "@/hooks/useCustomerWallet";
import { useLocalPaymentMethods } from "@/hooks/useLocalPaymentMethods";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRecommendedDeals } from "@/hooks/useRecommendedDeals";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useSavedLocations } from "@/hooks/useSavedLocations";
import { useCustomerActivityFeed } from "@/hooks/useCustomerActivityFeed";
import ActivityTimeline from "@/components/shared/ActivityTimeline";
import { destinationPhotos } from "@/config/photos";
import { getRestaurantPhoto } from "@/config/restaurantPhotos";
import { formatDistanceToNow, format } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import UniversalSearchOverlay from "@/components/search/UniversalSearchOverlay";
import { useDeviceIntegrityCheck } from "@/hooks/useDeviceIntegrityCheck";

// ─── Saved Places Icon Map ───
const savedPlaceIconMap: Record<string, LucideIcon> = {
  home: Home,
  work: Briefcase,
  star: Star,
  pin: MapPin,
};

// ─── Restaurant Card (Premium) ───
const RestaurantCard = ({ restaurant, onNavigate }: { restaurant: HomeRestaurant; onNavigate: () => void }) => (
  <motion.button
    onClick={onNavigate}
    whileTap={{ scale: 0.96 }}
    className="shrink-0 w-[170px] rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all touch-manipulation text-left group"
  >
    <div className="relative h-[115px] overflow-hidden">
      <img
        src={restaurant.cover_image_url || restaurant.logo_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400"}
        alt={restaurant.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {restaurant.rating && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-0.5">
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold text-white">{restaurant.rating.toFixed(1)}</span>
        </div>
      )}
    </div>
    <div className="p-3">
      <div className="text-xs font-bold text-foreground truncate">{restaurant.name}</div>
      {restaurant.cuisine_type && (
        <div className="text-[10px] text-muted-foreground truncate mt-0.5">{restaurant.cuisine_type}</div>
      )}
    </div>
  </motion.button>
);

// ─── Section Header (Premium) ───
const SectionHeader = ({ icon: Icon, iconColor, title, onSeeAll }: { icon: LucideIcon; iconColor: string; title: string; onSeeAll: () => void }) => (
  <div className="flex items-center justify-between mb-3.5">
    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
      <div className="w-6 h-6 rounded-lg bg-muted/60 flex items-center justify-center">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      {title}
    </h2>
    <button onClick={onSeeAll} className="text-xs text-primary font-semibold touch-manipulation active:scale-95 min-w-[44px] min-h-[32px] flex items-center gap-0.5">
      See all
      <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ─── Quick Actions Grid (3x2 - Premium Glassmorphism) ───
const quickActions = [
  { label: "Ride", icon: Car, href: "/rides", gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/8", iconBg: "bg-gradient-to-br from-emerald-400/20 to-emerald-500/10", color: "text-emerald-600 dark:text-emerald-400", accent: "bg-emerald-500" },
  { label: "Eats", icon: UtensilsCrossed, href: "/eats", gradient: "from-orange-500 to-red-500", bg: "bg-orange-500/8", iconBg: "bg-gradient-to-br from-orange-400/20 to-orange-500/10", color: "text-orange-600 dark:text-orange-400", accent: "bg-orange-500" },
  { label: "Delivery", icon: Package, href: "/move", gradient: "from-violet-500 to-purple-600", bg: "bg-violet-500/8", iconBg: "bg-gradient-to-br from-violet-400/20 to-violet-500/10", color: "text-violet-600 dark:text-violet-400", accent: "bg-violet-500" },
  { label: "Flights", icon: Plane, href: "/search?tab=flights", gradient: "from-sky-500 to-blue-600", bg: "bg-sky-500/8", iconBg: "bg-gradient-to-br from-sky-400/20 to-sky-500/10", color: "text-sky-600 dark:text-sky-400", accent: "bg-sky-500" },
  { label: "Hotels", icon: BedDouble, href: "/search?tab=hotels", gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/8", iconBg: "bg-gradient-to-br from-amber-400/20 to-amber-500/10", color: "text-amber-600 dark:text-amber-400", accent: "bg-amber-500" },
  { label: "Rentals", icon: Car, href: "/rent-car", gradient: "from-teal-500 to-cyan-600", bg: "bg-teal-500/8", iconBg: "bg-gradient-to-br from-teal-400/20 to-teal-500/10", color: "text-teal-600 dark:text-teal-400", accent: "bg-teal-500" },
];

// ─── Promo banners ───
const promos = [
  { title: "50% off first ride", subtitle: "Use code ZIVO50", gradient: "from-emerald-500 to-teal-600", emoji: "🚗" },
  { title: "Free delivery", subtitle: "On orders over $25", gradient: "from-orange-500 to-amber-600", emoji: "📦" },
  { title: "Flight deals from $49", subtitle: "Book by this weekend", gradient: "from-sky-500 to-blue-600", emoji: "✈️" },
];

// ─── Trending Rides (static) ───
const trendingRides = [
  { name: "Airport Transfer", eta: "~15 min", price: "$22-35", icon: Plane },
  { name: "Downtown", eta: "~8 min", price: "$12-18", icon: Navigation },
  { name: "Beach", eta: "~20 min", price: "$18-28", icon: TrendingUp },
];

// ─── Popular Destinations (subset) ───
const popularDestKeys = ["miami", "las-vegas", "new-york", "cancun", "los-angeles"] as const;
const popularDestPrices: Record<string, string> = {
  miami: "$89",
  "las-vegas": "$79",
  "new-york": "$99",
  cancun: "$149",
  "los-angeles": "$69",
};

// ─── Recently viewed type config ───
const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  hotel: { icon: Hotel, color: "bg-amber-500" },
  flight: { icon: Plane, color: "bg-sky-500" },
  car: { icon: Car, color: "bg-emerald-500" },
  restaurant: { icon: Utensils, color: "bg-orange-500" },
};

// ─── Smart ETA logic ───
const getQuickEstimate = () => {
  const hour = new Date().getHours();
  const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  return {
    pickupEta: isPeak ? "~8 min" : "~4 min",
    priceRange: isPeak ? "$15-22" : "$12-18",
    label: isPeak ? "Peak hours" : "Normal",
  };
};

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useDeviceIntegrityCheck();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { recommended, favorites, orderAgain } = usePersonalizedHome();
  const { data: profile } = useUserProfile();
  const { deals } = useRecommendedDeals(6);
  const { items: recentItems } = useRecentlyViewed();
  const { data: savedLocations } = useSavedLocations(user?.id);
  const { points, getNextTierProgress } = useLoyaltyPoints();
  const { active: activeRewards } = useUserRewards();
  const { referralCode, shareReferral } = useReferrals();
  const { data: allBookings = [] } = useScheduledBookingsQuery();
  const upcomingBookings = allBookings.filter((b) => {
    if (b.status !== "scheduled" && b.status !== "confirmed") return false;
    const bookingDate = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
    return bookingDate > new Date();
  }).sort((a, b) => new Date(`${a.scheduled_date}T${a.scheduled_time}`).getTime() - new Date(`${b.scheduled_date}T${b.scheduled_time}`).getTime());
  const { balanceDollars } = useCustomerWallet();
  const { getDefault } = useLocalPaymentMethods();
  const defaultCard = getDefault();

  const estimate = getQuickEstimate();
  const { items: activityItems, hasActiveItems } = useCustomerActivityFeed();

  // Promo carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activePromo, setActivePromo] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActivePromo(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    const autoplay = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => { clearInterval(autoplay); emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Traveler";
  const avatarUrl = profile?.avatar_url;
  const initials = (profile?.full_name || user?.email || "Z").charAt(0).toUpperCase();

  return (
    <div className="relative min-h-[100dvh] bg-background font-sans text-foreground selection:bg-primary/30">
      {/* Scrollable content */}
      <div className="overflow-y-auto pb-24">
        {/* ─── PREMIUM HEADER ZONE ─── */}
        <div className="bg-gradient-to-b from-primary/6 via-primary/3 to-background relative overflow-hidden">
          {/* Subtle decorative orbs */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute top-10 -left-10 w-32 h-32 bg-emerald-500/6 rounded-full blur-3xl" />

          {/* Greeting bar */}
          <div className="px-5 pt-4 pb-3 flex justify-between items-center safe-area-top relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="relative"
              >
                <div className="w-11 h-11 rounded-2xl border-2 border-primary/20 p-0.5 overflow-hidden bg-card shadow-sm">
                  {avatarUrl ? (
                    <img src={avatarUrl} className="w-full h-full rounded-xl object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Online dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
              </motion.div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-[0.2em]">{greeting()}</div>
                <div className="text-base font-bold text-foreground -mt-0.5">{userName}</div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate("/alerts")}
              className="w-11 h-11 min-w-[44px] min-h-[44px] bg-card/80 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-border/50 shadow-sm active:bg-muted/80 transition-all relative touch-manipulation"
            >
              <Bell className="w-[18px] h-[18px] text-muted-foreground" />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
            </motion.button>
          </div>

          {/* ─── SEARCH BAR (Premium Glass) ─── */}
          <div className="px-5 pb-3">
            <motion.button
              whileTap={{ scale: 0.985 }}
              onClick={() => setIsSearchOpen(true)}
              className="w-full touch-manipulation"
            >
              <div className="bg-card/90 backdrop-blur-2xl border border-border/40 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-lg shadow-black/[0.04] min-h-[54px] transition-all active:shadow-md">
                <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                  <Search className="w-4.5 h-4.5 text-primary" />
                </div>
                <span className="text-muted-foreground font-medium text-left flex-1 text-sm">Where to?</span>
                <div className="h-6 w-px bg-border/60" />
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
              </div>
            </motion.button>
          </div>

          {/* ─── SAVED PLACES ROW ─── */}
          <div className="px-5 pb-5">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {(savedLocations || []).slice(0, 4).map((loc) => {
                const Icon = savedPlaceIconMap[loc.icon] || MapPin;
                return (
                  <motion.button
                    key={loc.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => navigate("/rides")}
                    className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm transition-all touch-manipulation min-h-[40px]"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground whitespace-nowrap">{loc.label}</span>
                  </motion.button>
                );
              })}
              {(!savedLocations || savedLocations.length < 2) && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigate("/account/saved-places")}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-muted/30 border border-dashed border-border/60 transition-all touch-manipulation min-h-[40px]"
                >
                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Add Place</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div className="px-5 space-y-7">

          {/* ─── QUICK ESTIMATE CARD (Premium) ─── */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/rides")}
            className="w-full rounded-2xl bg-gradient-to-br from-primary/8 via-emerald-500/4 to-primary/6 border border-primary/12 p-4 flex items-center gap-4 touch-manipulation text-left group relative overflow-hidden"
          >
            {/* Subtle shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-active:opacity-100 transition-opacity" />
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/10 flex items-center justify-center border border-primary/10">
              <Timer className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground">Quick Estimate</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                <span className="text-primary font-bold">{estimate.pickupEta}</span> pickup · <span className="font-bold text-foreground">{estimate.priceRange}</span> to Downtown
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] border-primary/20 text-primary bg-primary/5 shrink-0 font-bold">
              {estimate.label}
            </Badge>
          </motion.button>

          {/* ─── QUICK ACTIONS GRID (3x2 Premium) ─── */}
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.93 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => navigate(action.href)}
                className="relative flex flex-col items-center gap-2.5 py-5 px-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm hover:shadow-md transition-all touch-manipulation overflow-hidden group min-h-[110px]"
              >
                {/* Top accent bar with gradient */}
                <div className={`absolute top-0 left-4 right-4 h-[2px] rounded-b-full bg-gradient-to-r ${action.gradient} opacity-80`} />
                {/* Icon container */}
                <div className={`w-14 h-14 rounded-2xl ${action.iconBg} border border-white/[0.08] flex items-center justify-center transition-transform group-active:scale-95`}>
                  <action.icon className={`w-7 h-7 ${action.color}`} strokeWidth={1.8} />
                </div>
                <span className="text-xs font-bold text-foreground tracking-tight">{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* ─── ORDER AGAIN ─── */}
          {user && orderAgain.length > 0 && (
            <div>
              <SectionHeader icon={History} iconColor="text-orange-500" title="Order Again" onSeeAll={() => navigate("/eats")} />
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {orderAgain.map((r) => (
                  <motion.button
                    key={r.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(`/eats/restaurant/${r.id}`)}
                    className="shrink-0 w-[170px] rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-md transition-all touch-manipulation text-left group"
                  >
                    <div className="relative h-[95px] overflow-hidden">
                      <img
                        src={r.cover_image_url || r.logo_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400"}
                        alt={r.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 right-2 bg-orange-500/90 backdrop-blur-sm rounded-full px-2.5 py-0.5">
                        <span className="text-[9px] font-bold text-white">Reorder</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-bold text-foreground truncate">{r.name}</div>
                      {r.cuisine_type && (
                        <div className="text-[10px] text-muted-foreground truncate mt-0.5">{r.cuisine_type}</div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* ─── RECENT ACTIVITY ─── */}
          {user && activityItems.length > 0 && (
            <div>
              <SectionHeader icon={Clock} iconColor="text-primary" title="Recent Activity" onSeeAll={() => navigate("/trips")} />
              <ActivityTimeline
                items={activityItems}
                maxHeight="280px"
                emptyMessage="No recent activity"
              />
            </div>
          )}

          {/* ─── POPULAR NEAR YOU ─── */}
          <div>
            <SectionHeader icon={TrendingUp} iconColor="text-emerald-500" title="Popular Near You" onSeeAll={() => navigate("/eats")} />

            {/* Popular Restaurants */}
            {recommended.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em] mb-2.5">Restaurants</p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {recommended.slice(0, 5).map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} onNavigate={() => navigate(`/eats/restaurant/${r.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Popular Destinations */}
            <div className="mb-5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em] mb-2.5">Destinations</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {popularDestKeys.map((key) => {
                  const dest = destinationPhotos[key];
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/search?tab=flights&to=${dest.city}`)}
                      className="shrink-0 w-[170px] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all touch-manipulation text-left group"
                    >
                      <div className="relative h-[115px] overflow-hidden">
                        <img src={dest.src} alt={dest.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-2.5 left-3 right-3">
                          <div className="text-xs font-bold text-white">{dest.city}</div>
                          <div className="text-[10px] text-white/80 font-medium">from {popularDestPrices[key]}</div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Trending Rides */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em] mb-2.5">Trending Rides</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {trendingRides.map((ride) => (
                  <motion.button
                    key={ride.name}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate("/rides")}
                    className="shrink-0 w-[165px] rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 p-4 shadow-sm hover:shadow-md transition-all touch-manipulation text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-3 border border-primary/10">
                      <ride.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-xs font-bold text-foreground">{ride.name}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-primary font-bold">{ride.eta}</span>
                      <span className="text-[10px] text-muted-foreground/50">·</span>
                      <span className="text-[10px] font-bold text-foreground">{ride.price}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── PROMO BANNER CAROUSEL (Premium) ─── */}
          <div>
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
              <div className="flex">
                {promos.map((promo, i) => (
                  <div key={i} className="flex-[0_0_100%] min-w-0 px-0.5">
                    <div className={`bg-gradient-to-br ${promo.gradient} rounded-2xl p-5 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8 blur-xl" />
                      <h3 className="text-lg font-bold mb-1 relative z-10">{promo.title}</h3>
                      <p className="text-sm opacity-90 relative z-10">{promo.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-1.5 mt-3">
              {promos.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === activePromo ? "bg-primary w-5 h-1.5" : "bg-muted-foreground/20 w-1.5 h-1.5"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ─── REWARDS WALLET CARD (Premium) ─── */}
          {user && (() => {
            const tierName = getTierFromPoints(points.lifetime_points);
            const tierConfig = ZIVO_TIERS[tierName];
            const { nextTier, pointsNeeded } = getPointsToNextTier(points.lifetime_points);
            const { progress } = getNextTierProgress();
            const recentRewards = activeRewards.slice(0, 3);

            return (
              <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-emerald-500/4 to-primary/6 border border-primary/12 p-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary/8 rounded-full blur-2xl" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground">My Rewards</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold ${tierConfig.color} ${tierConfig.borderColor}`}>
                    {tierConfig.icon} {tierConfig.displayName}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1.5 relative z-10">
                  {points.points_balance.toLocaleString()}
                  <span className="text-base text-muted-foreground ml-1.5 font-semibold">pts</span>
                </p>
                <Progress value={progress} className="h-2 mb-2 relative z-10" />
                <p className="text-xs text-muted-foreground mb-4 relative z-10">
                  {nextTier ? `${pointsNeeded.toLocaleString()} pts to ${ZIVO_TIERS[nextTier].displayName}` : "Max tier reached!"}
                </p>

                {recentRewards.length > 0 && (
                  <div className="space-y-1.5 mb-4 relative z-10">
                    {recentRewards.map((r) => (
                      <div key={r.id} className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">+{r.reward_value} pts</span>
                        <span className="text-muted-foreground">{r.reward_type}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => navigate("/rewards")}
                  className="w-full bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground rounded-xl h-11 font-bold relative z-10"
                  size="sm"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Redeem Points
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </div>
            );
          })()}

          {/* ─── INVITE FRIENDS REFERRAL CARD (Premium) ─── */}
          {user && (() => {
            const totalInvited = referralCode?.total_referrals || 0;
            const totalEarned = referralCode?.total_earnings || 0;

            return (
              <div className="rounded-2xl bg-gradient-to-br from-violet-500/8 via-pink-500/4 to-violet-500/6 border border-violet-500/12 p-5 relative overflow-hidden">
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                      <Users className="w-4 h-4 text-violet-500" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Invite Friends</span>
                  </div>
                  <button onClick={() => navigate("/account/referrals")} className="text-[10px] text-violet-500 font-semibold flex items-center gap-0.5">
                    Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-3 relative z-10">
                  Earn {REFERRAL_REWARDS.referrer.pointsPerReferral.toLocaleString()} pts for every friend who books
                </p>

                {referralCode?.code && (
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <Badge variant="outline" className="font-mono text-xs tracking-wider px-3 py-1.5 bg-card/50 border-violet-500/20">
                      {referralCode.code}
                    </Badge>
                  </div>
                )}

                <div className="flex gap-6 mb-4 text-xs relative z-10">
                  <div>
                    <span className="text-muted-foreground">Invited</span>
                    <p className="font-bold text-foreground text-base">{totalInvited}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Earned</span>
                    <p className="font-bold text-foreground text-base">{totalEarned.toLocaleString()} pts</p>
                  </div>
                </div>

                <Button
                  onClick={() => shareReferral()}
                  variant="outline"
                  size="sm"
                  className="w-full border-violet-500/20 text-violet-600 hover:bg-violet-500/10 rounded-xl h-11 font-bold relative z-10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
              </div>
            );
          })()}

          {/* ─── UPCOMING SCHEDULED BOOKINGS (Premium) ─── */}
          {user && upcomingBookings.length > 0 && (() => {
            const next = upcomingBookings[0];
            const nextDate = new Date(`${next.scheduled_date}T${next.scheduled_time}`);
            const schedTypeConfig: Record<string, { icon: typeof Car; color: string; label: string }> = {
              ride: { icon: Car, color: "text-primary", label: "Ride" },
              eats: { icon: UtensilsCrossed, color: "text-orange-500", label: "Food" },
              delivery: { icon: Package, color: "text-violet-500", label: "Delivery" },
            };
            const cfg = schedTypeConfig[next.booking_type] || schedTypeConfig.ride;
            const Icon = cfg.icon;
            const formatTime12 = (t: string) => {
              const [h, m] = t.split(":").map(Number);
              const ampm = h >= 12 ? "PM" : "AM";
              const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
              return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
            };

            return (
              <div className="rounded-2xl bg-gradient-to-br from-primary/6 to-emerald-500/4 border border-primary/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {upcomingBookings.length > 1 && (
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5">
                        +{upcomingBookings.length - 1} more
                      </Badge>
                    )}
                    <button onClick={() => navigate("/scheduled")} className="text-[10px] text-primary font-semibold">
                      View All
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/10">
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {cfg.label}{next.destination_address ? ` to ${next.destination_address}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(nextDate, "MMM d")} · {formatTime12(next.scheduled_time)}
                    </p>
                    {next.pickup_address && (
                      <p className="text-[10px] text-muted-foreground/70 truncate">{next.pickup_address}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─── WALLET SUMMARY CARD (Premium) ─── */}
          {user && (
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/8 via-primary/4 to-emerald-500/6 border border-emerald-500/12 p-5 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/8 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Wallet</span>
                </div>
                <button onClick={() => navigate("/account/wallet")} className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                  See All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1.5 relative z-10">
                ${balanceDollars.toFixed(2)}
              </p>
              {defaultCard && (
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {defaultCard.brand} ····{defaultCard.last4}
                  </span>
                </div>
              )}
              {!defaultCard && (
                <p className="text-xs text-muted-foreground mb-4 relative z-10">No payment method</p>
              )}
              <div className="flex gap-2.5 relative z-10">
                <Button
                  onClick={() => navigate("/account/gift-cards")}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl h-11 font-bold"
                >
                  Add Funds
                </Button>
                <Button
                  onClick={() => navigate("/payment-methods")}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 rounded-xl h-11 font-bold"
                >
                  Cards
                </Button>
              </div>
            </div>
          )}

          {/* ─── RECENTLY USED ─── */}
          {user && recentItems.length > 0 && (
            <div>
              <SectionHeader icon={History} iconColor="text-muted-foreground" title="Recently Used" onSeeAll={() => navigate("/trips")} />
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {recentItems.slice(0, 8).map((item) => {
                  const cfg = typeConfig[item.item_type] || { icon: MapPin, color: "bg-muted" };
                  const ItemIcon = cfg.icon;
                  const itemData = item.item_data as Record<string, any> | null;
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate("/trips")}
                      className="shrink-0 w-[155px] rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm p-3.5 touch-manipulation text-left"
                    >
                      <div className={`w-9 h-9 ${cfg.color} rounded-xl flex items-center justify-center mb-2.5`}>
                        <ItemIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-xs font-bold text-foreground truncate">
                        {itemData?.name || item.item_type}
                      </div>
                      {itemData?.location && (
                        <div className="text-[10px] text-muted-foreground truncate mt-0.5">{itemData.location}</div>
                      )}
                      <div className="text-[9px] text-muted-foreground/60 mt-1.5 font-medium">
                        {formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true })}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── FAVORITES ─── */}
          <div>
            <SectionHeader icon={Heart} iconColor="text-destructive" title="Favorites" onSeeAll={() => navigate("/account")} />
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {favorites.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} onNavigate={() => navigate(`/eats/restaurant/${r.id}`)} />
              ))}
              {(savedLocations || []).map((loc) => (
                <motion.button
                  key={loc.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate("/rides")}
                  className="shrink-0 w-[145px] rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm p-3.5 touch-manipulation text-left"
                >
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center mb-2.5 border border-primary/10">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xs font-bold text-foreground truncate">{loc.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">{loc.address}</div>
                </motion.button>
              ))}
              {favorites.length === 0 && (!savedLocations || savedLocations.length === 0) && (
                <div className="w-full rounded-2xl bg-card/50 border border-dashed border-border/40 p-8 flex flex-col items-center gap-2.5 text-center">
                  <Heart className="w-6 h-6 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground/60 font-medium">Save your favorite spots</span>
                </div>
              )}
            </div>
          </div>

          {/* ─── SMART RECOMMENDATIONS ─── */}
          {(recommended.length > 0 || deals.length > 0) && (
            <div>
              <SectionHeader icon={Sparkles} iconColor="text-amber-400" title="Recommended for You" onSeeAll={() => navigate("/eats")} />
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {recommended.slice(0, 6).map((r) => (
                  <div key={r.id} className="relative shrink-0">
                    <RestaurantCard restaurant={r} onNavigate={() => navigate(`/eats/restaurant/${r.id}`)} />
                    <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-md rounded-full px-2 py-0.5">
                      <span className="text-[8px] font-bold text-primary-foreground">Recommended</span>
                    </div>
                  </div>
                ))}
                {deals.slice(0, 3).map((deal) => (
                  <motion.button
                    key={deal.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(deal.href)}
                    className="shrink-0 w-[155px] rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm p-3.5 touch-manipulation text-left"
                  >
                    <div className="inline-block px-2.5 py-1 rounded-lg bg-primary/10 mb-2.5">
                      <span className="text-[10px] font-bold text-primary">{deal.discountLabel}</span>
                    </div>
                    <div className="text-xs font-bold text-foreground truncate">{deal.name}</div>
                    {deal.description && (
                      <div className="text-[10px] text-muted-foreground truncate mt-0.5">{deal.description}</div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <ZivoMobileNav />

      {/* Universal Search Overlay */}
      <UniversalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default AppHome;