/**
 * App Home Screen - 2026 Travel Super-App Layout
 * Premium scrollable design with saved places, quick estimate, popular services,
 * quick actions, promos, rewards, and personalized content.
 * @module AppHome
 */
import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useCountry } from "@/hooks/useCountry";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Search from "lucide-react/dist/esm/icons/search";
import Plane from "lucide-react/dist/esm/icons/plane";
import Car from "lucide-react/dist/esm/icons/car";
import BedDouble from "lucide-react/dist/esm/icons/bed-double";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Package from "lucide-react/dist/esm/icons/package";
import Star from "lucide-react/dist/esm/icons/star";
import Heart from "lucide-react/dist/esm/icons/heart";
import Home from "lucide-react/dist/esm/icons/home";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalizedHome, HomeRestaurant } from "@/hooks/usePersonalizedHome";
import { useUserProfile } from "@/hooks/useUserProfile";
import zivoRideIcon from "@/assets/zivo-ride-icon.webp";
import zivoEatsIcon from "@/assets/zivo-eats-icon.webp";
import zivoFlightsIcon from "@/assets/zivo-flights-icon.webp";
import zivoHotelsIcon from "@/assets/zivo-hotels-icon.webp";
import zivoRentalCarIcon from "@/assets/zivo-rental-car.webp";
import zivoReserveIcon from "@/assets/zivo-reserve-car.webp";
import zivoShoppingIcon from "@/assets/zivo-shopping.webp";

// Lazy-load below-fold heavy components
const LiveTripTracker = lazy(() => import("@/components/home/widgets/LiveTripTracker"));
const TrendingNearYou = lazy(() => import("@/components/home/TrendingNearYou"));
const QuickReorderCarousel = lazy(() => import("@/components/home/widgets/QuickReorderCarousel"));
const PriceAlertsWidget = lazy(() => import("@/components/home/widgets/PriceAlertsWidget"));
const AISmartDeals = lazy(() => import("@/components/home/AISmartDeals"));
const TravelItineraryCard = lazy(() => import("@/components/home/widgets/TravelItineraryCard"));
const ActivityTimeline = lazy(() => import("@/components/shared/ActivityTimeline"));
const ZivoMobileNav = lazy(() => import("@/components/app/ZivoMobileNav"));
const UniversalSearchOverlay = lazy(() => import("@/components/search/UniversalSearchOverlay"));
const NetworkPromoStrip = lazy(() => import("@/components/home/NetworkPromoStrip"));
const ConciergeLauncher = lazy(() => import("@/components/home/ConciergeLauncher"));
const TodayPlanWidget = lazy(() => import("@/components/home/TodayPlanWidget"));
const NotificationsPeek = lazy(() => import("@/components/home/NotificationsPeek"));
const SpendTrackerWidget = lazy(() => import("@/components/home/SpendTrackerWidget"));
const QuickReorderWidget = lazy(() => import("@/components/home/QuickReorderWidget"));
const InsightsCard = lazy(() => import("@/components/home/InsightsCard"));

// Icons used below-fold (still small, but needed)
import Utensils from "lucide-react/dist/esm/icons/utensils";
import History from "lucide-react/dist/esm/icons/history";
import Gift from "lucide-react/dist/esm/icons/gift";
import Users from "lucide-react/dist/esm/icons/users";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Clock from "lucide-react/dist/esm/icons/clock";
import Wallet from "lucide-react/dist/esm/icons/wallet";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import Plus from "lucide-react/dist/esm/icons/plus";
import Timer from "lucide-react/dist/esm/icons/timer";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import Zap from "lucide-react/dist/esm/icons/zap";
import Shield from "lucide-react/dist/esm/icons/shield";
import Globe from "lucide-react/dist/esm/icons/globe";
import Crown from "lucide-react/dist/esm/icons/crown";
import Flame from "lucide-react/dist/esm/icons/flame";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Activity from "lucide-react/dist/esm/icons/activity";
import Bell from "lucide-react/dist/esm/icons/bell";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import UtensilsCrossed from "lucide-react/dist/esm/icons/utensils-crossed";
import Tv from "lucide-react/dist/esm/icons/tv";
import Rocket from "lucide-react/dist/esm/icons/rocket";
import Gem from "lucide-react/dist/esm/icons/gem";
import Dumbbell from "lucide-react/dist/esm/icons/dumbbell";
import { Progress } from "@/components/ui/progress";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import { useUserRewards } from "@/hooks/useUserRewards";
import { ZIVO_TIERS, getTierFromPoints, getPointsToNextTier, type ZivoTier } from "@/config/zivoPoints";
import { useReferrals } from "@/hooks/useReferrals";
import { REFERRAL_REWARDS } from "@/config/referralProgram";
import { useScheduledBookingsQuery } from "@/hooks/useScheduledBookings";
import { useCustomerWallet } from "@/hooks/useCustomerWallet";
import { useLocalPaymentMethods } from "@/hooks/useLocalPaymentMethods";
import { useRecommendedDeals } from "@/hooks/useRecommendedDeals";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useSavedLocations } from "@/hooks/useSavedLocations";
import { useCustomerActivityFeed } from "@/hooks/useCustomerActivityFeed";
import { destinationPhotos } from "@/config/photos";
import PartnerBadge from "@/components/shared/PartnerBadge";
import { useDestinationPrices } from "@/hooks/useDestinationPrices";
import { useHotDeals, type HotDeal } from "@/hooks/useHotDeals";
import { getRestaurantPhoto } from "@/config/restaurantPhotos";
import { formatDistanceToNow, format } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";
import { useDeviceIntegrityCheck } from "@/hooks/useDeviceIntegrityCheck";
// ─── Saved Places Icon Map ───
// ─── Dynamic search placeholder by tab ───
// Search placeholder is now handled inside the component with t()

const savedPlaceIconMap: Record<string, LucideIcon> = {
  home: Home,
  work: Briefcase,
  star: Star,
  pin: MapPin,
};

// ─── Top service tabs (Uber-style) ───
// These are now built inside the component with t() for translation
// See homeTabs and suggestions inside AppHome component

// ─── Restaurant Card (Premium) ───
const RestaurantCard = ({ restaurant, onNavigate }: { restaurant: HomeRestaurant; onNavigate: () => void }) => (
  <motion.button
    onClick={onNavigate}
    whileTap={{ scale: 0.94, rotateX: 5 }}
    whileHover={{ y: -6, rotateX: -2 }}
    className="shrink-0 w-[170px] rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-xl transition-all duration-300 touch-manipulation text-left group card-3d"
    style={{ transformStyle: "preserve-3d" }}
  >
    <div className="relative h-[120px] overflow-hidden">
      <img
        src={restaurant.cover_image_url || restaurant.logo_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400"}
        alt={restaurant.name}
        width={170}
        height={120}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      {restaurant.rating && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-xl rounded-full px-2 py-0.5">
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold text-primary-foreground">{restaurant.rating.toFixed(1)}</span>
        </div>
      )}
      <PartnerBadge size="xs" className="absolute top-2 left-2 shadow-sm" />
      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart className="w-3.5 h-3.5 text-primary-foreground" />
      </div>
    </div>
    <div className="p-3" style={{ transform: "translateZ(8px)" }}>
      <div className="text-xs font-bold text-foreground truncate">{restaurant.name}</div>
      {restaurant.cuisine_type && (
        <div className="text-[10px] text-muted-foreground truncate mt-0.5">{restaurant.cuisine_type}</div>
      )}
    </div>
  </motion.button>
);

// ─── Section Header (Premium) ───
const SectionHeader = ({ icon: Icon, iconColor, title, badge, actionLabel, onSeeAll }: { icon: LucideIcon; iconColor: string; title: string; badge?: string; actionLabel?: string; onSeeAll: () => void }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-bold text-foreground flex items-center gap-2.5">
      <motion.div
        whileHover={{ scale: 1.1, rotateY: 10 }}
        className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center shadow-sm icon-3d-pop"
      >
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </motion.div>
      {title}
      {badge && (
        <Badge variant="secondary" className="text-[9px] font-bold bg-primary/10 text-primary border-0 px-1.5 py-0">
          {badge}
        </Badge>
      )}
    </h2>
    <button onClick={onSeeAll} className="text-xs text-primary font-bold touch-manipulation active:scale-95 min-w-[44px] min-h-[32px] flex items-center gap-0.5 hover:gap-1.5 transition-all">
      {actionLabel}
      <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ─── Promo banners ───
// Promos and trending rides are built inside the component for translation

// ─── Trending Rides (static) ───
// trendingRides built inside component for translation

// ─── Popular Destinations (expanded with real photos) ───
const popularDestKeysUS = [
  "miami", "las-vegas", "new-york", "cancun", "los-angeles",
  "orlando", "san-francisco", "chicago", "barcelona", "paris",
  "san-diego", "dallas", "atlanta", "phoenix",
  "honolulu", "nashville", "denver", "seattle", "boston", "san-juan",
  "tampa", "charlotte", "minneapolis", "portland", "austin",
  "fort-lauderdale", "new-orleans", "washington",
  "toronto", "mexico-city", "london", "tokyo", "dubai",
  "rome", "istanbul", "seoul", "kuala-lumpur", "bali",
  "singapore", "sydney", "manila", "taipei", "mumbai",
  "phuket", "hanoi", "bangkok", "amsterdam",
] as const;

// Cambodia destinations (using local photos from config)
const cambodiaDestKeysKH = [
  "phnom-penh", "siem-reap", "sihanoukville", "kampot", "battambang", "kep",
  "bangkok", "ho-chi-minh", "hanoi", "phuket", "kuala-lumpur", "bali",
  "seoul", "tokyo", "singapore", "manila", "taipei", "mumbai",
] as const;


// ─── Recently viewed type config ───

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, currentLanguage } = useI18n();
  const { isCambodia: isKH } = useCountry();
  useDeviceIntegrityCheck();

  const promos = [
    { title: t("home.promo_first_ride"), subtitle: t("home.promo_first_ride_sub"), gradient: "from-emerald-500 to-teal-600", icon: Car, cta: t("home.promo_claim") },
    { title: t("home.promo_free_delivery"), subtitle: t("home.promo_free_delivery_sub"), gradient: "from-orange-500 to-amber-600", icon: Package, cta: t("home.promo_order_now") },
    { title: t("home.promo_flights_deal"), subtitle: t("home.promo_flights_deal_sub"), gradient: "from-sky-500 to-blue-600", icon: Plane, cta: t("home.promo_explore") },
    { title: t("home.promo_hotel_sale"), subtitle: t("home.promo_hotel_sale_sub"), gradient: "from-violet-500 to-purple-600", icon: BedDouble, cta: t("home.promo_book_now") },
    // Driver recruitment — US only
    ...(!isKH ? [{ title: "Become a ZIVO Driver", subtitle: "", gradient: "from-sky-500 to-blue-600", icon: Car, cta: "Join ZIVO Today", isDriverPromo: true as const }] : []),
  ];

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeHomeTab, setActiveHomeTab] = useState<"rides" | "eats" | "flights" | "hotels">("rides");

  const homeTabs = [
    { id: "rides", label: t("home.rides"), icon: null, image: zivoRideIcon },
    { id: "eats", label: t("home.eats"), icon: null, image: zivoEatsIcon },
    { id: "flights", label: t("home.flights"), icon: null, image: zivoFlightsIcon },
    { id: "hotels", label: t("home.hotels"), icon: null, image: zivoHotelsIcon },
  ] as const;

  const suggestions = [
    { label: t("home.ride"), icon: null, image: zivoRideIcon, href: "/rides", badge: "Hot Deal", badgeVariant: "promo" as const },
    { label: t("home.flights"), icon: null, image: zivoFlightsIcon, href: "/flights", badge: "Discount", badgeVariant: "discount" as const },
    { label: t("home.rental_cars"), icon: null, image: zivoRentalCarIcon, href: "/rent-car", badge: "Promo", badgeVariant: "promo" as const },
    ...(isKH ? [{ label: t("home.shopping"), icon: null, image: zivoShoppingIcon, href: "/grocery", badge: "Promo", badgeVariant: "promo" as const }] : []),
  ];

  function getSearchPlaceholder(tab: string): string {
    if (tab === "rides") return t("home.book_ride");
    if (tab === "eats") {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 11) return t("home.breakfast");
      if (hour >= 11 && hour < 17) return t("home.lunch");
      if (hour >= 17 && hour < 22) return t("home.dinner");
      return t("home.late_night");
    }
    if (tab === "flights") return t("home.search_flights");
    if (tab === "hotels") return t("home.search_hotels");
    return t("home.where_to");
  }
  const { recommended, favorites, orderAgain } = usePersonalizedHome();
  useUserProfile();
  const { data: deals = [] } = useRecommendedDeals("all", 6);
  const { items: recentItems } = useRecentlyViewed();
  const { data: savedLocations } = useSavedLocations(user?.id);
  const { points, getNextTierProgress } = useLoyaltyPoints();
  const { active: activeRewards } = useUserRewards();
  const { referralCode, shareReferral } = useReferrals();
  const destKeys = isKH ? [...cambodiaDestKeysKH] : [...popularDestKeysUS];
  const { data: destPrices = {}, isLoading: destPricesLoading } = useDestinationPrices(destKeys, isKH);
  const { data: hotDeals = [], isLoading: hotDealsLoading } = useHotDeals();
  const { data: allBookings = [] } = useScheduledBookingsQuery();
  const upcomingBookings = allBookings.filter((b: any) => {
    if (b.status !== "scheduled" && b.status !== "confirmed" && b.status !== "pending") return false;
    const sd = b.scheduledDate || b.scheduled_date;
    const st = b.scheduledTime || b.scheduled_time;
    if (!sd || !st) return false;
    const bookingDate = new Date(`${sd}T${st}`);
    return bookingDate > new Date();
  }).sort((a: any, b: any) => {
    const ad = a.scheduledDate || a.scheduled_date;
    const at2 = a.scheduledTime || a.scheduled_time;
    const bd = b.scheduledDate || b.scheduled_date;
    const bt = b.scheduledTime || b.scheduled_time;
    return new Date(`${ad}T${at2}`).getTime() - new Date(`${bd}T${bt}`).getTime();
  });
  const { balanceDollars } = useCustomerWallet();
  const { getDefault } = useLocalPaymentMethods();
  const defaultCard = getDefault();

  const estimate = (() => {
    const hour = new Date().getHours();
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    if (isKH) {
      return {
        pickupEta: isPeak ? "~៨ នាទី" : "~៤ នាទី",
        priceRange: isPeak ? "៛61,000-៛89,000" : "៛49,000-៛73,000",
        label: isPeak ? t("home.peak_hours") : t("home.normal"),
        surge: isPeak,
      };
    }
    return {
      pickupEta: isPeak ? "~8 min" : "~4 min",
      priceRange: isPeak ? "$15-22" : "$12-18",
      label: isPeak ? t("home.peak_hours") : t("home.normal"),
      surge: isPeak,
    };
  })();
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

  return (
    <>
    <div className="relative min-h-[100dvh] bg-background font-sans text-foreground selection:bg-primary/30 overflow-x-hidden" role="main">
      {/* 3D Ambient orbs — contained within scrollable area only */}

      {/* Scrollable content */}
      <div className="scroll-momentum relative z-10" style={{ paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 24px)' }}>
        {/* Ambient orbs removed on mobile — they triggered CLS and constant repaints. */}
        {/* ─── HEADER ─── */}
        <div className="bg-background relative">

          {/* ─── BRAND HEADER (Instagram-style: wordmark left, slim icons right) ─── */}
          {user ? (
            <div className="flex items-center justify-between px-4 pt-safe pb-3">
              <span className="font-bold italic text-2xl tracking-tight text-foreground select-none">
                ZIVO
              </span>
              <div className="flex items-center gap-1">
                {balanceDollars != null && balanceDollars > 0 && (
                  <button
                    onClick={() => navigate("/account/wallet")}
                    className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5 touch-manipulation active:scale-95 transition-transform"
                  >
                    <Wallet className="w-3.5 h-3.5 text-foreground" strokeWidth={2} />
                    <span className="text-xs font-semibold text-foreground">${balanceDollars.toFixed(2)}</span>
                  </button>
                )}
                <button
                  onClick={() => navigate("/activity")}
                  aria-label="Notifications"
                  className="relative w-10 h-10 flex items-center justify-center touch-manipulation active:scale-90 transition-transform"
                >
                  <Bell className="w-6 h-6 text-foreground" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ) : null}

          {/* Service Tabs — 3D Pill Chips */}
          <div
            className={cn("flex items-center gap-2 px-4 pb-2 overflow-hidden preserve-3d", user ? "pt-1" : "pt-safe")}
          >
            {homeTabs.map((tab) => {
              const isActive = activeHomeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "hotels") {
                      navigate("/hotels");
                      return;
                    }
                    setActiveHomeTab(tab.id);
                  }}
                  aria-label={tab.label}
                  aria-pressed={isActive}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-full text-[13px] font-semibold transition-colors touch-manipulation min-h-[40px] border",
                    isActive
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-foreground border-border hover:bg-secondary"
                  )}
                >
                  {tab.image ? (
                    <img
                      src={tab.image}
                      alt=""
                      width={18}
                      height={18}
                      className="w-4 h-4 object-contain"
                      style={{ filter: isActive ? "brightness(0) invert(1)" : "none" }}
                    />
                  ) : tab.icon ? (
                    <tab.icon className="w-4 h-4" strokeWidth={1.75} />
                  ) : null}
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Search bar — Instagram-style flat input */}
          <div className="px-4 pt-3 pb-4">
            <motion.button
              whileTap={{ scale: 0.99 }}
              aria-label={getSearchPlaceholder(activeHomeTab)}
              onClick={() => {
                const routes: Record<string, string> = {
                  rides: "/rides",
                  eats: "/eats",
                  flights: "/flights",
                  hotels: "/hotels",
                };
                navigate(routes[activeHomeTab] || "/rides");
              }}
              className="w-full touch-manipulation"
            >
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 min-h-[40px]">
                <Search className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                <span className="text-[14px] text-muted-foreground flex-1 text-left">
                  {getSearchPlaceholder(activeHomeTab)}
                </span>
              </div>
            </motion.button>
          </div>

          {/* ─── TODAY'S PLAN ─── */}
          <Suspense fallback={null}>
            <TodayPlanWidget />
          </Suspense>

          {/* ─── ZIVO CONCIERGE ─── */}
          <Suspense fallback={<div className="h-[140px]" />}>
            <ConciergeLauncher />
          </Suspense>

          {/* ─── ZIVO NETWORK PROMO ─── */}
          <Suspense fallback={<div className="h-[68px]" />}>
            <NetworkPromoStrip />
          </Suspense>

          {/* ─── RECENT ACTIVITY PEEK ─── */}
          <Suspense fallback={null}>
            <NotificationsPeek />
          </Suspense>

          {/* ─── QUICK REORDER (last delivered meal) ─── */}
          <Suspense fallback={null}>
            <QuickReorderWidget />
          </Suspense>

          {/* ─── SPEND TRACKER (this month) ─── */}
          <Suspense fallback={null}>
            <SpendTrackerWidget />
          </Suspense>

          {/* ─── BUNDLE INSIGHTS ─── */}
          <Suspense fallback={null}>
            <InsightsCard />
          </Suspense>

          {/* ─── SAVED PLACES QUICK ACCESS ─── */}
          {user && savedLocations && savedLocations.length > 0 && (
            <div className="pb-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5" style={{ WebkitOverflowScrolling: "touch" }}>
                {savedLocations.slice(0, 6).map((loc) => {
                  const Icon = savedPlaceIconMap[loc.icon] || MapPin;
                  return (
                    <motion.button
                      key={loc.id}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => navigate(`/rides?destination=${encodeURIComponent(loc.address)}`)}
                      className="shrink-0 flex items-center gap-1.5 bg-card border border-border/50 rounded-full px-3 py-2 shadow-sm touch-manipulation hover:border-primary/30 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground whitespace-nowrap">{loc.label}</span>
                    </motion.button>
                  );
                })}
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigate("/account/addresses")}
                  className="shrink-0 flex items-center gap-1.5 bg-muted/50 border border-dashed border-border/50 rounded-full px-3 py-2 touch-manipulation"
                >
                  <Plus className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Add place</span>
                </motion.button>
              </div>
            </div>
          )}

          {/* What's New — recent product updates */}
          <div className="px-4 sm:px-5 pb-4">
            <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">What's New</p>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">12 NEW</span>
              </div>
              <motion.button
                type="button"
                onClick={() => navigate("/rides/hub?tab=corporate")}
                whileTap={{ scale: 0.99 }}
                className="group w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted/30 transition-colors"
                aria-label="See what's new in the Ride Hub"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">Ride Hub</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">3 NEW</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Live fleet tracker · Tab categories · Shareable URLs</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate("/chat")}
                whileTap={{ scale: 0.99 }}
                className="group w-full flex items-center gap-3 px-4 py-3 text-left border-t border-border/30 active:bg-muted/30 transition-colors"
                aria-label="See what's new in Chat"
              >
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-fuchsia-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">Chat</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-500">9 NEW</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Auto-delete · ⌘K · Drag &amp; drop · Smart replies · Polls</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
              </motion.button>
            </div>
          </div>

          {/* ─── PROMO BANNER CAROUSEL ─── */}
          <div className="pb-4">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3 pl-5">
                {promos.map((promo, i) => (
                  <motion.button
                    key={`${promo.title}-${i}`}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if ((promo as any).isDriverPromo) { navigate("/driver-signup"); return; }
                      const promoRoutes = ["/rides", "/eats", "/flights", "/hotels"];
                      navigate(promoRoutes[i] || "/rides");
                    }}
                    className={cn(
                      "shrink-0 w-[calc(82vw)] max-w-[310px] rounded-2xl p-5 text-left shadow-lg touch-manipulation relative overflow-hidden bg-gradient-to-br",
                      promo.gradient
                    )}
                  >
                    <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10">
                      <promo.icon className="w-6 h-6 text-white/90 mb-2.5" />
                      <p className="text-white font-bold text-[15px] leading-tight">{promo.title}</p>
                      {promo.subtitle && <p className="text-white/75 text-xs mt-1 leading-relaxed">{promo.subtitle}</p>}
                      <div className="mt-3.5 inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-sm rounded-full px-3.5 py-1.5">
                        <span className="text-white font-bold text-[11px]">{promo.cta}</span>
                        <ChevronRight className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </motion.button>
                ))}
                <div className="shrink-0 w-5" />
              </div>
            </div>
            <div className="flex justify-center gap-1.5 mt-3">
              {promos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    activePromo === i ? "w-4 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>

          {/* ─── ALL SERVICES ─── */}
          <div className="pb-5">
            <div className="flex items-center justify-between mb-3 px-5">
              <h2 className="text-base font-bold text-foreground">{t("home.more_services")}</h2>
              <button onClick={() => navigate("/services")} className="w-8 h-8 flex items-center justify-center touch-manipulation rounded-full hover:bg-muted/50 transition-colors">
                <ArrowRight className="w-4.5 h-4.5 text-muted-foreground" />
              </button>
            </div>
            {/* Row 1 */}
            <div className="grid grid-cols-4 gap-3 px-5 pb-3 preserve-3d">
              {[
                { label: t("home.ride"), image: zivoRideIcon, href: "/rides", badge: "Hot Deal", badgeVariant: "promo" as const },
                { label: t("home.eats"), image: zivoEatsIcon, href: "/eats", badge: null, badgeVariant: "promo" as const },
                { label: t("home.flights"), image: zivoFlightsIcon, href: "/flights", badge: "Deals", badgeVariant: "discount" as const },
                { label: t("home.hotels"), image: zivoHotelsIcon, href: "/hotels", badge: null, badgeVariant: "promo" as const },
              ].map((s) => (
                <motion.button
                  key={s.label}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigate(s.href)}
                  className="flex flex-col items-center gap-2 touch-manipulation relative group"
                >
                  {s.badge && (
                    <div className={cn(
                      "absolute -top-2.5 -right-2 z-10 text-[8px] font-bold px-2 py-[2px] rounded-full shadow-md",
                      s.badgeVariant === "discount"
                        ? "bg-primary text-primary-foreground"
                        : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    )}>
                      {s.badge}
                    </div>
                  )}
                  <div className="w-[60px] h-[60px] rounded-2xl bg-card border border-border/30 shadow-sm flex items-center justify-center icon-3d-pop group-active:scale-95 transition-all duration-200">
                    <img src={s.image} alt={s.label} width={32} height={32} className="w-8 h-8 object-contain" />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground text-center leading-tight group-hover:text-foreground transition-colors">{s.label}</span>
                </motion.button>
              ))}
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-4 gap-3 px-5 pb-2 preserve-3d">
              {(([
                { label: t("home.rental_cars"), image: zivoRentalCarIcon, icon: null, href: "/rent-car", badge: "Promo" },
                { label: "Reserve", image: zivoReserveIcon, icon: null, href: "/rides/hub?tab=reserve", badge: null },
                { label: t("home.shopping"), image: zivoShoppingIcon, icon: null, href: "/grocery", badge: null },
                { label: "Delivery", image: null, icon: Package, href: "/delivery", badge: null },
              ]) as Array<{ label: string; image: string | null; icon: typeof Package | null; href: string; badge: string | null }>).map((s) => {
                const SvcIcon = s.icon;
                return (
                  <motion.button
                    key={s.label}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => navigate(s.href)}
                    className="flex flex-col items-center gap-2 touch-manipulation relative group"
                  >
                    {s.badge && (
                      <div className="absolute -top-2.5 -right-2 z-10 text-[8px] font-bold px-2 py-[2px] rounded-full shadow-md bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        {s.badge}
                      </div>
                    )}
                    <div className="w-[60px] h-[60px] rounded-2xl bg-card border border-border/30 shadow-sm flex items-center justify-center icon-3d-pop group-active:scale-95 transition-all duration-200">
                      {s.image ? (
                        <img src={s.image} alt={s.label} width={32} height={32} className="w-8 h-8 object-contain" />
                      ) : SvcIcon ? (
                        <SvcIcon className="w-7 h-7 text-primary" />
                      ) : null}
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground text-center leading-tight group-hover:text-foreground transition-colors">{s.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>



          {/* ─── DISCOVER (gradient cards) ─── */}
          <div className="pb-5">
            <div className="flex items-center justify-between mb-3 px-5">
              <h2 className="text-base font-bold text-foreground">Discover</h2>
              <button onClick={() => navigate("/more")} className="w-8 h-8 flex items-center justify-center touch-manipulation rounded-full hover:bg-muted/50 transition-colors">
                <ArrowRight className="w-4.5 h-4.5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 px-5" style={{ WebkitOverflowScrolling: "touch" }}>
              {[
                { icon: Briefcase, label: "Jobs", desc: "Find work", href: "/personal-dashboard", gradient: "from-blue-500 via-indigo-500 to-violet-500" },
                { icon: Tv, label: "Live", desc: "Watch live", href: "/live", gradient: "from-rose-500 via-red-500 to-orange-400" },
                { icon: Rocket, label: "Creator Hub", desc: "Grow & earn", href: "/creator-dashboard", gradient: "from-violet-500 via-purple-500 to-fuchsia-500" },
                { icon: Heart, label: "Wellness", desc: "Stay healthy", href: "/wellness/activity", gradient: "from-emerald-500 via-teal-400 to-cyan-400" },
                { icon: Crown, label: "ZIVO Plus", desc: "Premium perks", href: "/zivo-plus", gradient: "from-amber-500 via-yellow-400 to-orange-400" },
                { icon: Gem, label: "Rewards", desc: "Earn points", href: "/rewards", gradient: "from-pink-500 via-fuchsia-500 to-purple-500" },
                { icon: Sparkles, label: "Marketplace", desc: "Buy & sell", href: "/marketplace", gradient: "from-sky-500 via-blue-500 to-indigo-500" },
                { icon: Dumbbell, label: "Workouts", desc: "Train daily", href: "/wellness/workouts", gradient: "from-lime-500 via-green-500 to-emerald-500" },
              ].map((card, i) => (
                <motion.button
                  key={card.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(card.href)}
                  className={cn(
                    "shrink-0 w-[128px] h-[96px] rounded-[20px] bg-gradient-to-br p-3 flex flex-col justify-between shadow-lg touch-manipulation text-left",
                    card.gradient
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <card.icon className="w-5 h-5 text-white/90" />
                  <div>
                    <p className="text-white font-bold text-[12px] leading-tight">{card.label}</p>
                    <p className="text-white/75 text-[10px] mt-0.5">{card.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* 3D Section Divider */}
          <div className="h-3 relative overflow-hidden">
            <div className="absolute inset-x-4 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-full bg-muted/20" />
          </div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div className="px-5 space-y-8">

          {/* ─── LIVE TRIP TRACKER ─── */}
          <Suspense fallback={null}><LiveTripTracker /></Suspense>

          {/* ─── UPCOMING BOOKINGS ─── */}
          {user && upcomingBookings.length > 0 && (
            <div>
              <SectionHeader icon={Calendar} iconColor="text-sky-500" title="Upcoming Trips" badge={String(upcomingBookings.length)} actionLabel="See all" onSeeAll={() => navigate("/trips")} />
              <div className="space-y-2">
                {upcomingBookings.slice(0, 2).map((booking: any) => {
                  const sd = booking.scheduledDate || booking.scheduled_date;
                  const st = booking.scheduledTime || booking.scheduled_time;
                  const bookingDate = new Date(`${sd}T${st}`);
                  return (
                    <motion.button
                      key={booking.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/trips")}
                      className="w-full flex items-center gap-3 bg-card border border-border/40 rounded-2xl p-4 shadow-sm text-left touch-manipulation"
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/15">
                        <Calendar className="w-5 h-5 text-sky-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate capitalize">{(booking.type || booking.service || "Trip").replace(/_/g, " ")}</p>
                        <p className="text-[11px] text-muted-foreground">{format(bookingDate, "MMM d 'at' h:mm a")}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-bold text-sky-500 border-sky-500/20 bg-sky-500/5 shrink-0 capitalize">
                        {booking.status || "Scheduled"}
                      </Badge>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TRAVEL ITINERARY CARD ─── */}
          {user && (
            <Suspense fallback={<div className="h-36 rounded-2xl bg-muted/30 animate-pulse" />}>
              <TravelItineraryCard />
            </Suspense>
          )}

          {/* ─── TRENDING NEAR YOU (AI) ─── */}
          <Suspense fallback={<div className="h-40 rounded-2xl bg-muted/30 animate-pulse" />}><TrendingNearYou /></Suspense>

          {/* ─── QUICK REORDER CAROUSEL ─── */}
          <Suspense fallback={null}><QuickReorderCarousel /></Suspense>

          {/* ─── PRICE ALERTS WIDGET ─── */}
          <Suspense fallback={null}><PriceAlertsWidget /></Suspense>

          {/* ─── ORDER AGAIN ─── */}
          {user && orderAgain.length > 0 && (
            <div>
              <SectionHeader icon={History} iconColor="text-orange-500" title={t("home.order_again")} badge="Quick" actionLabel={t("home.see_all")} onSeeAll={() => navigate("/eats")} />
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5" style={{ WebkitOverflowScrolling: 'touch' }}>
                {orderAgain.map((r) => (
                  <motion.button
                    key={r.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(`/eats/restaurant/${r.id}`)}
                    className="shrink-0 w-[170px] rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-lg transition-all duration-300 touch-manipulation text-left group"
                  >
                    <div className="relative h-[100px] overflow-hidden">
                       <img
                         src={r.cover_image_url || r.logo_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400"}
                         alt={r.name}
                         width={170}
                         height={100}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                         loading="lazy"
                       />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute bottom-2 right-2 bg-orange-500/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 shadow-sm">
                        <span className="text-[9px] font-bold text-primary-foreground flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" /> {t("home.reorder")}</span>
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

          {/* ─── RECENTLY VIEWED ─── */}
          {user && recentItems.length > 0 && (
            <div>
              <SectionHeader icon={Clock} iconColor="text-muted-foreground" title="Recently Viewed" actionLabel="Clear" onSeeAll={() => navigate("/more")} />
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5" style={{ WebkitOverflowScrolling: "touch" }}>
                {recentItems.slice(0, 8).map((item: any) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      if (item.item_type === "restaurant") navigate(`/eats/restaurant/${item.item_id}`);
                      else if (item.item_type === "store") navigate(`/store/${item.item_id}`);
                      else if (item.item_type === "hotel") navigate(`/hotel/${item.item_id}`);
                      else navigate("/more");
                    }}
                    className="shrink-0 flex flex-col items-center gap-1.5 touch-manipulation group"
                  >
                    <div className="w-[60px] h-[60px] rounded-2xl bg-card border border-border/40 shadow-sm flex items-center justify-center overflow-hidden group-hover:border-primary/30 transition-colors">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title || "Item"} width={60} height={60} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Globe className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground text-center truncate max-w-[64px]">{item.title || item.item_type}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* ─── RECENT ACTIVITY ─── */}
          {user && activityItems.length > 0 && (
            <div>
              <SectionHeader icon={Clock} iconColor="text-primary" title={t("home.recent_activity")} actionLabel={t("home.see_all")} onSeeAll={() => navigate("/trips")} />
              <Suspense fallback={null}><ActivityTimeline
                items={activityItems.map((a: any) => ({
                  id: a.id,
                  icon: Activity,
                  iconColor: "text-primary",
                  title: a.eventType?.replace(/_/g, " ") || "Activity",
                  subtitle: typeof a.eventData === "object" ? JSON.stringify(a.eventData)?.slice(0, 60) : String(a.eventData || ""),
                  timestamp: new Date(a.createdAt || a.created_at || Date.now()),
                  status: "completed" as const,
                }))}
                maxHeight="280px"
                emptyMessage="No recent activity"
              /></Suspense>
            </div>
          )}

          {/* ─── POPULAR NEAR YOU ─── */}
          <div>
            <SectionHeader icon={TrendingUp} iconColor="text-emerald-500" title={t("home.popular_near")} badge="Hot" actionLabel={t("home.see_all")} onSeeAll={() => navigate("/flights")} />


            {/* Popular Destinations — Top 4 Grid + Scroll for more */}
            <div className="mb-6">
              <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em] mb-3">{t("home.destinations")}</p>
              
              {/* Top 4 in 2x2 grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {(isKH ? cambodiaDestKeysKH : popularDestKeysUS).slice(0, 4).map((key, i) => {
                  const dest = destinationPhotos[key as keyof typeof destinationPhotos];
                  if (!dest) return null;
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/search?tab=flights&to=${dest.city}`)}
                      className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 touch-manipulation text-left group relative"
                    >
                      <div className="relative h-[120px] overflow-hidden">
                        <img src={dest.src} alt={dest.alt} width={340} height={120} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {i < 2 && (
                          <div className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm">
                            <span className="text-[8px] font-bold text-primary-foreground uppercase tracking-wider">{t("home.trending")}</span>
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="text-xs font-bold text-primary-foreground">{dest.city}</div>
                          <div className="text-[10px] text-primary-foreground/80 font-semibold flex items-center gap-1">
                            <Plane className="w-2.5 h-2.5" />
                            {destPrices[key] != null
                              ? `${t("home.from")} $${Math.round(destPrices[key]!)}`
                              : destPricesLoading
                                ? "..."
                                : t("home.search_flights")}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* More destinations label + horizontal scroll */}
              <p className="text-[9px] uppercase font-bold text-muted-foreground/40 tracking-[0.15em] mb-2">More to explore</p>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5" style={{ WebkitOverflowScrolling: 'touch' }}>
                {(isKH ? cambodiaDestKeysKH : popularDestKeysUS).slice(4).map((key) => {
                  const dest = destinationPhotos[key as keyof typeof destinationPhotos];
                  if (!dest) return null;
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/search?tab=flights&to=${dest.city}`)}
                      className="shrink-0 flex flex-col items-center gap-1.5 touch-manipulation group"
                    >
                      <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden ring-2 ring-border/30 group-hover:ring-primary/40 transition-all">
                        <img src={dest.src} alt={dest.alt} width={72} height={72} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-semibold text-foreground leading-tight truncate max-w-[76px]">{dest.city}</div>
                        <div className="text-[8px] text-muted-foreground font-medium">
                          {destPrices[key] != null
                            ? `$${Math.round(destPrices[key]!)}`
                            : destPricesLoading ? "..." : ""}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ─── AI SMART DEALS ─── */}
          <Suspense fallback={<div className="h-40 rounded-2xl bg-muted/30 animate-pulse" />}><AISmartDeals /></Suspense>

          {/* ─── HOT DEALS ─── */}
          <div>
            <SectionHeader icon={Flame} iconColor="text-orange-500" title="Hot Deals" badge="LIVE" actionLabel={t("home.see_all")} onSeeAll={() => navigate("/flights")} />
            {hotDealsLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5" style={{ WebkitOverflowScrolling: 'touch' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="shrink-0 w-[220px] h-[140px] rounded-2xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : hotDeals.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5" style={{ WebkitOverflowScrolling: 'touch' }}>
                {hotDeals.map((deal, i) => {
                  const destPhoto = destinationPhotos[deal.destinationKey as keyof typeof destinationPhotos];
                  const formattedDate = new Date(deal.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <motion.button
                      key={`${deal.originCode}-${deal.destinationCode}-${i}`}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/flights/results?origin=${deal.originCode}&destination=${deal.destinationCode}&departureDate=${deal.departureDate}&adults=1&cabinClass=economy`)}
                      className="shrink-0 w-[220px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 touch-manipulation text-left group relative border border-border/20"
                    >
                      <div className="relative h-[140px] overflow-hidden">
                        <img
                          src={destPhoto?.src || `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400`}
                          alt={deal.destination}
                          width={220}
                          height={140}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-2.5 py-0.5 shadow-lg">
                          <span className="text-[8px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> HOT DEAL
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                          <span className="text-[8px] font-semibold text-white flex items-center gap-0.5">
                            <Calendar className="w-2 h-2" /> {formattedDate}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-xs font-bold text-white">{deal.destination}</div>
                              <div className="text-[9px] text-white/70 font-medium mt-0.5">
                                {deal.originCode} → {deal.destinationCode} · {deal.stops === 0 ? "Nonstop" : `${deal.stops} stop`} · {deal.duration}
                              </div>
                              {deal.airline && (
                                <div className="text-[8px] text-white/60 mt-0.5">{deal.airline}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-black text-white leading-none">${Math.round(deal.price)}</div>
                              <div className="text-[8px] text-white/60">one way</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No deals available right now. Check back soon!</p>
            )}
          </div>

          {/* ─── LOYALTY & REWARDS CARD ─── */}
          {user && points && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/rewards")}
              className="w-full rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/8 border border-amber-500/20 p-5 text-left shadow-sm relative overflow-hidden touch-manipulation"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-foreground">ZIVO Miles</p>
                    {(points as any).tier && (
                      <Badge variant="secondary" className="text-[9px] font-bold bg-amber-500/15 text-amber-600 border-0 px-1.5">
                        {(points as any).tier}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{((points as any).points_balance || 0).toLocaleString()}</span> pts · Earn more with every trip
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
              {((points as any).points_balance || 0) > 0 && (
                <div className="mt-3 relative z-10">
                  <Progress value={Math.min((((points as any).points_balance || 0) / 5000) * 100, 100)} className="h-1.5 bg-amber-500/20" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {Math.max(0, 5000 - ((points as any).points_balance || 0)).toLocaleString()} pts to next tier
                  </p>
                </div>
              )}
            </motion.button>
          )}

          {/* ─── REFERRAL CTA ─── */}
          {user && referralCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-violet-500/8 border border-violet-500/20 p-5 relative overflow-hidden shadow-sm"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Invite Friends, Earn Rewards</p>
                    <p className="text-[11px] text-muted-foreground">Get ${REFERRAL_REWARDS.referrer.amount} credit per friend who joins</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5 flex items-center border border-border/30">
                    <span className="text-sm font-mono font-bold text-foreground tracking-widest">{referralCode.code}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); shareReferral(); }}
                    className="h-[42px] px-4 rounded-xl font-bold shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Share
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── GUEST SIGN-UP CTA ─── */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 15, rotateX: -8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              whileHover={{ y: -4, rotateX: 2 }}
              className="rounded-2xl bg-gradient-to-br from-primary/12 via-sky-500/6 to-primary/10 border border-primary/20 p-6 relative overflow-hidden shadow-sm card-3d"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary/10 rounded-full blur-3xl breathe-glow" />
              <div className="relative z-10" style={{ transform: "translateZ(15px)" }}>
                <h3 className="text-base font-bold text-foreground mb-1">{t("home.join_free")}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {t("home.join_desc")}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate("/signup")}
                    size="sm"
                    className="flex-1 h-11 rounded-xl font-bold shadow-md shadow-primary/20 btn-3d"
                  >
                    {t("home.sign_up_free")}
                  </Button>
                  <Button
                    onClick={() => navigate("/login")}
                    variant="outline"
                    size="sm"
                    className="h-11 px-5 rounded-xl font-medium card-3d"
                  >
                    {t("home.log_in")}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          {/* Spacer for fixed bottom nav */}
          <div className="h-24 md:h-8" aria-hidden="true" />
        </div>
      </div>

      <Suspense fallback={null}>
        <UniversalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </Suspense>
    </div>

    {/* Bottom Nav — outside perspective container so position:fixed works */}
    <Suspense fallback={<div className="h-16" />}><ZivoMobileNav /></Suspense>
    </>
  );
};

export default AppHome;
