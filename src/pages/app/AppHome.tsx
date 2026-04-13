/**
 * App Home Screen - 2026 Travel Super-App Layout
 * Premium scrollable design with saved places, quick estimate, popular services,
 * quick actions, promos, rewards, and personalized content.
 * @module AppHome
 */
import { useState, useEffect, lazy, Suspense } from "react";
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
import { useCountry as useCountryHook } from "@/hooks/useCountry";
import zivoRideIcon from "@/assets/zivo-ride-icon.png";
import zivoEatsIcon from "@/assets/zivo-eats-icon.png";
import zivoFlightsIcon from "@/assets/zivo-flights-icon.png";
import zivoHotelsIcon from "@/assets/zivo-hotels-icon.png";
import zivoRentalCarIcon from "@/assets/zivo-rental-car.png";
import zivoReserveIcon from "@/assets/zivo-reserve-car.png";
import zivoShoppingIcon from "@/assets/zivo-shopping.png";

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
import tabFlightsBg from "@/assets/tab-flights-bg.jpg";
import tabHotelsBg from "@/assets/tab-hotels-bg.jpg";
import tabCarsBg from "@/assets/tab-cars-bg.jpg";
import tabRidesBg from "@/assets/tab-rides-bg.jpg";
import tabEatsBg from "@/assets/tab-eats-bg.jpg";

const tabBgMap: Record<string, string> = {
  rides: tabRidesBg,
  eats: tabEatsBg,
  flights: tabFlightsBg,
  hotels: tabHotelsBg,
};

const tabCssVarMap: Record<string, string> = {
  rides: "var(--rides)",
  eats: "var(--eats)",
  flights: "var(--flights)",
  hotels: "var(--hotels)",
};
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
  const { data: profile } = useUserProfile();
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.good_morning");
    if (hour < 17) return t("home.good_afternoon");
    return t("home.good_evening");
  };

  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Traveler";
  const avatarUrl = profile?.avatar_url;
  const initials = (profile?.full_name || user?.email || "Z").charAt(0).toUpperCase();

  return (
    <>
    <div className="relative min-h-[100dvh] bg-background font-sans text-foreground selection:bg-primary/30 overflow-x-hidden" role="main">
      {/* 3D Ambient orbs — contained within scrollable area only */}

      {/* Scrollable content */}
      <div className="pb-24 scroll-momentum relative z-10">
        {/* 3D Ambient orbs inside scroll container */}
        <div className="orb-3d-1 top-[-5%] right-[-10%] opacity-40 z-0 pointer-events-none" />
        <div className="orb-3d-2 top-[40%] left-[-15%] opacity-25 z-0 pointer-events-none" />
        {/* ─── HEADER ─── */}
        <div className="bg-background relative">
          {/* Service Tabs — 3D Pill Chips */}
          <div
            className="flex items-center gap-2 px-4 pb-2 overflow-hidden safe-area-top preserve-3d"
          >
            {homeTabs.map((tab) => {
              const isActive = activeHomeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveHomeTab(tab.id)}
                  whileTap={{ scale: 0.92, rotateX: 5 }}
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 touch-manipulation min-h-[44px] tab-3d",
                    isActive
                      ? "text-white shadow-lg"
                      : "text-muted-foreground"
                  )}
                  style={{ overflow: "hidden" }}
                >
                  {/* Background image */}
                  <img
                    src={tabBgMap[tab.id]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                    style={{
                      opacity: isActive ? 0.75 : 0.15,
                      transition: "opacity 0.3s ease",
                    }}
                  />
                  {/* Color overlay */}
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, hsl(${tabCssVarMap[tab.id]} / 0.55), hsl(${tabCssVarMap[tab.id]} / 0.35))`
                        : "hsl(var(--muted) / 0.3)",
                      transition: "background 0.3s ease",
                    }}
                  />
                  {/* Border */}
                  <span
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      border: `1.5px solid hsl(${tabCssVarMap[tab.id]} / ${isActive ? "0.5" : "0.12"})`,
                      boxShadow: isActive
                        ? `0 4px 12px -2px hsl(${tabCssVarMap[tab.id]} / 0.35), inset 0 1px 2px rgba(255,255,255,0.15)`
                        : "none",
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.image ? (
                      <img src={tab.image} alt={tab.label} className="w-5 h-5 object-contain" style={{ filter: isActive ? "brightness(10)" : "none" }} />
                    ) : tab.icon ? (
                      <tab.icon className="w-4.5 h-4.5" />
                    ) : null}
                    <span className="text-[13px]" style={{ textShadow: isActive ? "0 1px 3px rgba(0,0,0,0.3)" : "none" }}>{tab.label}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Where to? Search Bar — 3D Glass */}
          <div className="px-5 pt-4 pb-4">
            <motion.button
              whileTap={{ scale: 0.98, rotateX: 3 }}
              whileHover={{ y: -2, scale: 1.01 }}
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
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative rounded-2xl px-5 py-4 flex items-center gap-3 min-h-[56px] shadow-lg transition-all overflow-hidden" style={{ border: `1.5px solid hsl(${tabCssVarMap[activeHomeTab]} / 0.3)`, boxShadow: `0 4px 20px -4px hsl(${tabCssVarMap[activeHomeTab]} / 0.15)` }}>
                {/* Background image for search bar */}
                <img
                  src={tabBgMap[activeHomeTab]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: 0.35, transition: "opacity 0.3s" }}
                />
                <span className="absolute inset-0" style={{ background: `linear-gradient(135deg, hsl(var(--card) / 0.75), hsl(var(--card) / 0.65))`, backdropFilter: "blur(8px)" }} />
                <span className="absolute inset-0" style={{ background: `linear-gradient(90deg, hsl(${tabCssVarMap[activeHomeTab]} / 0.08), transparent 60%)` }} />
                <div className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `hsl(${tabCssVarMap[activeHomeTab]} / 0.15)` }}>
                  <Search className="w-4.5 h-4.5" style={{ color: `hsl(${tabCssVarMap[activeHomeTab]})` }} />
                </div>
                <span className="relative z-10 font-medium text-[15px] flex-1 text-left" style={{ color: "hsl(var(--foreground) / 0.7)" }}>{getSearchPlaceholder(activeHomeTab)}</span>
              </div>
            </motion.button>
          </div>




          {/* Suggestions Section */}
          <div className="pb-5">
            <div className="flex items-center justify-between mb-3 px-5">
              <h2 className="text-base font-bold text-foreground">{t("home.more_services")}</h2>
              <button onClick={() => navigate("/services")} className="w-8 h-8 flex items-center justify-center touch-manipulation rounded-full hover:bg-muted/50 transition-colors">
                <ArrowRight className="w-4.5 h-4.5 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 px-5 pt-3 pb-2 preserve-3d">
              {suggestions.map((s, idx) => (
                <motion.button
                  key={s.label}
                  whileTap={{ scale: 0.88, rotateX: 8 }}
                  whileHover={{ y: -4, rotateX: -3 }}
                  onClick={() => navigate(s.href)}
                  initial={{ opacity: 0, y: 15, rotateX: -10 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: idx * 0.08, type: "spring", stiffness: 200 }}
                  className="flex flex-col items-center gap-2 touch-manipulation relative group"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Badge */}
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
                  {/* Icon container — 3D depth */}
                  <div
                    className="w-[60px] h-[60px] rounded-2xl bg-card border border-border/30 shadow-sm flex items-center justify-center icon-3d-pop group-active:scale-95 transition-all duration-200"
                    style={{ transform: "translateZ(10px)" }}
                  >
                    {s.image ? (
                      <img src={s.image} alt={s.label} className="w-8 h-8 object-contain" />
                    ) : s.icon ? (
                      <s.icon className="w-6 h-6 text-foreground" />
                    ) : null}
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground text-center leading-tight group-hover:text-foreground transition-colors">{s.label}</span>
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
          <LiveTripTracker />

          {/* ─── TRENDING NEAR YOU (AI) ─── */}
          <TrendingNearYou />

          {/* ─── QUICK REORDER CAROUSEL ─── */}
          <QuickReorderCarousel />

          {/* ─── PRICE ALERTS WIDGET ─── */}
          <PriceAlertsWidget />

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

          {/* ─── RECENT ACTIVITY ─── */}
          {user && activityItems.length > 0 && (
            <div>
              <SectionHeader icon={Clock} iconColor="text-primary" title={t("home.recent_activity")} actionLabel={t("home.see_all")} onSeeAll={() => navigate("/trips")} />
              <ActivityTimeline
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
              />
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
                        <img src={dest.src} alt={dest.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
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
                        <img src={dest.src} alt={dest.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
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
          <AISmartDeals />

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
        </div>
      </div>

      {/* Search Overlay */}
      <UniversalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>

    {/* Bottom Nav — outside perspective container so position:fixed works */}
    <ZivoMobileNav />
    </>
  );
};

export default AppHome;
