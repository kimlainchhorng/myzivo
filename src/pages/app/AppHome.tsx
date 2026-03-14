/**
 * App Home Screen - 2026 Travel Super-App Layout
 * Premium scrollable design with saved places, quick estimate, popular services,
 * quick actions, promos, rewards, and personalized content.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search, Plane, Car, Utensils, BedDouble,
  MapPin, Bell, LucideIcon, Package, Star, Sparkles,
  UtensilsCrossed, Heart, History, Hotel, Gift, Users, Share2, Clock,
  Wallet, CreditCard, Home, Briefcase, Plus, Timer, DollarSign,
  TrendingUp, Navigation, ChevronRight, ArrowRight, Zap, Shield,
  Globe, Crown, Flame, Calendar
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
import LiveTripTracker from "@/components/home/widgets/LiveTripTracker";
import PriceAlertsWidget from "@/components/home/widgets/PriceAlertsWidget";
import TravelItineraryCard from "@/components/home/widgets/TravelItineraryCard";
import QuickReorderCarousel from "@/components/home/widgets/QuickReorderCarousel";
import zivoRideIcon from "@/assets/zivo-ride-icon.png";
import zivoEatsIcon from "@/assets/zivo-eats-icon.png";
import zivoFlightsIcon from "@/assets/zivo-flights-icon.png";
import zivoHotelsIcon from "@/assets/zivo-hotels-icon.png";
import zivoRentalCarIcon from "@/assets/zivo-rental-car.png";
import zivoReserveIcon from "@/assets/zivo-reserve-car.png";
import zivoShoppingIcon from "@/assets/zivo-shopping.png";

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
    whileTap={{ scale: 0.96 }}
    className="shrink-0 w-[170px] rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-xl transition-all duration-300 touch-manipulation text-left group"
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
    <div className="p-3">
      <div className="text-xs font-bold text-foreground truncate">{restaurant.name}</div>
      {restaurant.cuisine_type && (
        <div className="text-[10px] text-muted-foreground truncate mt-0.5">{restaurant.cuisine_type}</div>
      )}
    </div>
  </motion.button>
);

// ─── Section Header (Premium) ───
const SectionHeader = ({ icon: Icon, iconColor, title, badge, onSeeAll }: { icon: LucideIcon; iconColor: string; title: string; badge?: string; onSeeAll: () => void }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-bold text-foreground flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center shadow-sm">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      {title}
      {badge && (
        <Badge variant="secondary" className="text-[9px] font-bold bg-primary/10 text-primary border-0 px-1.5 py-0">
          {badge}
        </Badge>
      )}
    </h2>
    <button onClick={onSeeAll} className="text-xs text-primary font-bold touch-manipulation active:scale-95 min-w-[44px] min-h-[32px] flex items-center gap-0.5 hover:gap-1.5 transition-all">
      See all
      <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </div>
);


// ─── Promo banners ───
const promos = [
  { title: "50% off first ride", subtitle: "Use code ZIVO50", gradient: "from-emerald-500 to-teal-600", icon: Car, cta: "Claim Now" },
  { title: "Free delivery", subtitle: "On orders over $25", gradient: "from-orange-500 to-amber-600", icon: Package, cta: "Order Now" },
  { title: "Flight deals from $49", subtitle: "Book by this weekend", gradient: "from-sky-500 to-blue-600", icon: Plane, cta: "Explore" },
  { title: "Hotel flash sale", subtitle: "Up to 60% off", gradient: "from-violet-500 to-purple-600", icon: BedDouble, cta: "Book Now" },
];

// ─── Trending Rides (static) ───
const trendingRides = [
  { name: "Airport Transfer", eta: "~15 min", price: "$22-35", icon: Plane, popular: true },
  { name: "Downtown", eta: "~8 min", price: "$12-18", icon: Navigation, popular: false },
  { name: "Beach", eta: "~20 min", price: "$18-28", icon: TrendingUp, popular: false },
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
    surge: isPeak,
  };
};

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useDeviceIntegrityCheck();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeHomeTab, setActiveHomeTab] = useState<"rides" | "eats" | "flights" | "hotels">("rides");
  const { recommended, favorites, orderAgain } = usePersonalizedHome();
  const { data: profile } = useUserProfile();
  const { data: deals = [] } = useRecommendedDeals("all", 6);
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
    <div className="relative min-h-[100dvh] bg-background font-sans text-foreground selection:bg-primary/30" role="main">
      {/* Scrollable content */}
      <div className="overflow-y-auto pb-24 scroll-momentum">
        {/* ─── HEADER ─── */}
        <div className="bg-background relative">
          {/* Service Tabs — Pill Chips */}
          <div
            className="flex items-center gap-2 px-4 pb-2 overflow-hidden safe-area-top"
          >
            {homeTabs.map((tab) => {
              const isActive = activeHomeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveHomeTab(tab.id)}
                  whileTap={{ scale: 0.95 }}
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 touch-manipulation min-h-[44px]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted/70"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.image ? (
                      <img src={tab.image} alt={tab.label} className="w-5 h-5 object-contain" />
                    ) : tab.icon ? (
                      <tab.icon className="w-4.5 h-4.5" />
                    ) : null}
                    <span className="text-[13px]">{tab.label}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Where to? Search Bar */}
          <div className="px-5 pt-4 pb-4">
            <motion.button
              whileTap={{ scale: 0.985 }}
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
              <div className="bg-muted/40 backdrop-blur-sm rounded-2xl px-5 py-4 flex items-center gap-3 min-h-[56px] border border-border/40 shadow-sm transition-all active:bg-muted/60">
                <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center">
                  <Search className="w-4.5 h-4.5 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground font-medium text-[15px] flex-1 text-left">{getSearchPlaceholder(activeHomeTab)}</span>
              </div>
            </motion.button>
          </div>

          {/* Suggestions Section */}
          <div className="pb-5">
            <div className="flex items-center justify-between mb-3 px-5">
              <h2 className="text-base font-bold text-foreground">More Services</h2>
              <button onClick={() => navigate("/services")} className="w-8 h-8 flex items-center justify-center touch-manipulation rounded-full hover:bg-muted/50 transition-colors">
                <ArrowRight className="w-4.5 h-4.5 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 px-5 pt-3 pb-2">
              {suggestions.map((s, idx) => (
                <motion.button
                  key={s.label}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => navigate(s.href)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="flex flex-col items-center gap-2 touch-manipulation relative group"
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
                  {/* Icon container */}
                  <div className="w-[60px] h-[60px] rounded-2xl bg-card border border-border/30 shadow-sm flex items-center justify-center group-active:scale-95 group-hover:shadow-md group-hover:border-primary/20 transition-all duration-200">
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

          {/* Subtle section divider */}
          <div className="h-2 bg-muted/30" />
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div className="px-5 space-y-8">

          {/* ─── LIVE TRIP TRACKER ─── */}
          <LiveTripTracker />




          {/* ─── QUICK REORDER CAROUSEL ─── */}
          <QuickReorderCarousel />

          {/* ─── TRAVEL ITINERARY CARD ─── */}
          <TravelItineraryCard />

          {/* ─── PRICE ALERTS WIDGET ─── */}
          <PriceAlertsWidget />

          {/* ─── ORDER AGAIN ─── */}
          {user && orderAgain.length > 0 && (
            <div>
              <SectionHeader icon={History} iconColor="text-orange-500" title="Order Again" badge="Quick" onSeeAll={() => navigate("/eats")} />
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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
                        <span className="text-[9px] font-bold text-primary-foreground flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" /> Reorder</span>
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
            <SectionHeader icon={TrendingUp} iconColor="text-emerald-500" title="Popular Near You" badge="Hot" onSeeAll={() => navigate("/eats")} />

            {/* Popular Restaurants */}
            {recommended.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em] mb-3">Restaurants</p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {recommended.slice(0, 5).map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} onNavigate={() => navigate(`/eats/restaurant/${r.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Popular Destinations */}
            <div className="mb-6">
              <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em] mb-3">Destinations</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {popularDestKeys.map((key, i) => {
                  const dest = destinationPhotos[key];
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/search?tab=flights&to=${dest.city}`)}
                      className="shrink-0 w-[170px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 touch-manipulation text-left group relative"
                    >
                      <div className="relative h-[120px] overflow-hidden">
                        <img src={dest.src} alt={dest.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {i < 2 && (
                          <div className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm">
                            <span className="text-[8px] font-bold text-primary-foreground uppercase tracking-wider">Trending</span>
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="text-xs font-bold text-primary-foreground">{dest.city}</div>
                          <div className="text-[10px] text-primary-foreground/80 font-semibold flex items-center gap-1">
                            <Plane className="w-2.5 h-2.5" />
                            from {popularDestPrices[key]}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Trending Rides */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em] mb-3">Trending Rides</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {trendingRides.map((ride) => (
                  <motion.button
                    key={ride.name}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate("/rides")}
                    className="shrink-0 w-[170px] rounded-2xl bg-card/90 backdrop-blur-sm border border-border/40 p-4 shadow-sm hover:shadow-lg transition-all duration-300 touch-manipulation text-left relative overflow-hidden group"
                  >
                    {ride.popular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-primary/90 text-[7px] font-bold text-primary-foreground px-2 py-0.5 rounded-bl-lg">POPULAR</div>
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/8 flex items-center justify-center mb-3 border border-primary/10 shadow-inner group-hover:scale-105 transition-transform">
                      <ride.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-xs font-bold text-foreground">{ride.name}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-primary font-bold">{ride.eta}</span>
                      <span className="text-[10px] text-muted-foreground/40">·</span>
                      <span className="text-[10px] font-bold text-foreground">{ride.price}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── PROMO BANNER CAROUSEL (Ultra Premium) ─── */}
          <div>
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
              <div className="flex">
                {promos.map((promo, i) => (
                  <div key={i} className="flex-[0_0_100%] min-w-0 px-0.5">
                    <div className={`bg-gradient-to-br ${promo.gradient} rounded-2xl p-6 text-primary-foreground relative overflow-hidden min-h-[130px] flex flex-col justify-between`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-xl" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-8 blur-xl" />
                      <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-2">
                          <promo.icon className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <h3 className="text-lg font-bold mb-0.5">{promo.title}</h3>
                        <p className="text-sm opacity-90">{promo.subtitle}</p>
                      </div>
                      <div className="relative z-10 mt-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                          {promo.cta} <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
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
                    i === activePromo ? "bg-primary w-6 h-1.5" : "bg-muted-foreground/20 w-1.5 h-1.5"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ─── REWARDS WALLET CARD (Ultra Premium) ─── */}
          {user && (() => {
            const tierName = getTierFromPoints(points.lifetime_points);
            const tierConfig = ZIVO_TIERS[tierName];
            const { nextTier, pointsNeeded } = getPointsToNextTier(points.lifetime_points);
            const { progress } = getNextTierProgress();
            const recentRewards = activeRewards.slice(0, 3);

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-primary/8 border border-primary/15 p-6 relative overflow-hidden shadow-sm"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-500/8 rounded-full blur-2xl" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-inner">
                      <Crown className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground">My Rewards</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold ${tierConfig.color} ${tierConfig.borderColor} shadow-sm`}>
                    {tierConfig.icon} {tierConfig.displayName}
                  </Badge>
                </div>
                <p className="text-4xl font-bold text-foreground mb-2 relative z-10">
                  {points.points_balance.toLocaleString()}
                  <span className="text-sm text-muted-foreground ml-2 font-semibold">pts</span>
                </p>
                <Progress value={progress} className="h-2.5 mb-2 relative z-10" />
                <p className="text-xs text-muted-foreground mb-5 relative z-10">
                  {nextTier ? `${pointsNeeded.toLocaleString()} pts to ${ZIVO_TIERS[nextTier].displayName}` : "Max tier reached!"}
                </p>

                {recentRewards.length > 0 && (
                  <div className="space-y-2 mb-5 relative z-10">
                    {recentRewards.map((r) => (
                      <div key={r.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-card/30">
                        <span className="text-primary font-bold">+{r.reward_value} pts</span>
                        <span className="text-muted-foreground">{r.reward_type}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => navigate("/rewards")}
                  className="w-full bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground rounded-xl h-12 font-bold relative z-10 shadow-md shadow-primary/20"
                  size="sm"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Redeem Points
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </motion.div>
            );
          })()}

          {/* ─── INVITE FRIENDS REFERRAL CARD (Ultra Premium) ─── */}
          {user && (() => {
            const totalInvited = referralCode?.total_referrals || 0;
            const totalEarned = referralCode?.total_earnings || 0;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-gradient-to-br from-violet-500/10 via-pink-500/5 to-violet-500/8 border border-violet-500/15 p-6 relative overflow-hidden shadow-sm"
              >
                <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/10 flex items-center justify-center shadow-inner">
                      <Users className="w-4.5 h-4.5 text-violet-500" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Invite Friends</span>
                  </div>
                  <button onClick={() => navigate("/account/referrals")} className="text-[10px] text-violet-500 font-bold flex items-center gap-0.5 hover:gap-1.5 transition-all">
                    Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-4 relative z-10">
                  Earn <span className="font-bold text-violet-500">{REFERRAL_REWARDS.referrer.pointsPerReferral.toLocaleString()} pts</span> for every friend who books
                </p>

                {referralCode?.code && (
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Badge variant="outline" className="font-mono text-xs tracking-wider px-4 py-2 bg-card/50 border-violet-500/25 shadow-sm">
                      {referralCode.code}
                    </Badge>
                  </div>
                )}

                <div className="flex gap-8 mb-5 text-xs relative z-10">
                  <div>
                    <span className="text-muted-foreground">Invited</span>
                    <p className="font-bold text-foreground text-lg">{totalInvited}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Earned</span>
                    <p className="font-bold text-foreground text-lg">{totalEarned.toLocaleString()} pts</p>
                  </div>
                </div>

                <Button
                  onClick={() => shareReferral()}
                  variant="outline"
                  size="sm"
                  className="w-full border-violet-500/25 text-violet-600 hover:bg-violet-500/10 rounded-xl h-12 font-bold relative z-10 shadow-sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share & Earn
                </Button>
              </motion.div>
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
              <div className="rounded-2xl bg-gradient-to-br from-primary/8 to-emerald-500/5 border border-primary/12 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shadow-inner">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {upcomingBookings.length > 1 && (
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5 font-bold">
                        +{upcomingBookings.length - 1} more
                      </Badge>
                    )}
                    <button onClick={() => navigate("/scheduled")} className="text-[10px] text-primary font-bold">
                      View All
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/10">
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
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>
            );
          })()}

          {/* ─── WALLET SUMMARY CARD (Ultra Premium) ─── */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-primary/5 to-emerald-500/8 border border-emerald-500/15 p-6 relative overflow-hidden shadow-sm"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center shadow-inner">
                    <Wallet className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Wallet</span>
                </div>
                <button onClick={() => navigate("/wallet")} className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 hover:gap-1.5 transition-all">
                  Manage <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-end gap-2 mb-3 relative z-10">
                <p className="text-4xl font-bold text-foreground">
                  ${balanceDollars.toFixed(2)}
                </p>
                <span className="text-xs text-muted-foreground mb-1.5 font-medium">balance</span>
              </div>
              {defaultCard && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card/40 border border-border/30 relative z-10">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">
                    •••• {defaultCard.last4}
                  </span>
                  <Badge variant="outline" className="text-[8px] ml-auto border-primary/20 text-primary bg-primary/5 font-bold">
                    Default
                  </Badge>
                </div>
              )}
              {!defaultCard && (
                <Button
                  onClick={() => navigate("/wallet")}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl h-11 font-bold border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 relative z-10"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Payment Method
                </Button>
              )}
            </motion.div>
          )}

          {/* ─── WAVE 5: Smart Home Widgets ─── */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> SMART INSIGHTS
            </h2>

            {/* Weekly Spending */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-card border border-border/40 p-4">
              <p className="text-xs font-bold text-foreground mb-3">This Week's Spending</p>
              <div className="flex items-end gap-1.5 h-14">
                {[32, 18, 45, 12, 28, 52, 8].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(val / 60) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.08 }}
                      className={`w-full rounded-t ${i === new Date().getDay() ? "bg-primary" : "bg-primary/20"}`} />
                    <span className="text-[8px] text-muted-foreground">{["S","M","T","W","T","F","S"][i]}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span>Total: <b className="text-foreground">$195</b></span>
                <span className="text-emerald-500">↓ 12% vs last week</span>
              </div>
            </motion.div>

            {/* Travel Streak */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">7-Day Booking Streak! 🔥</p>
                  <p className="text-[10px] text-muted-foreground">Keep it going for bonus ZIVO points</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-500">7</p>
                  <p className="text-[8px] text-muted-foreground">days</p>
                </div>
              </div>
            </div>

            {/* Nearby Attractions */}
            <div className="rounded-2xl bg-card border border-border/40 p-4">
              <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-violet-500" /> Nearby Attractions</p>
              <div className="space-y-2">
                {[
                  { name: "Central Park", distance: "0.5 mi", rating: 4.8, type: "Park" },
                  { name: "Museum of Art", distance: "1.2 mi", rating: 4.9, type: "Museum" },
                  { name: "Broadway District", distance: "0.8 mi", rating: 4.7, type: "Entertainment" },
                ].map(a => (
                  <div key={a.name} className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex-1"><p className="text-xs font-bold text-foreground">{a.name}</p><p className="text-[10px] text-muted-foreground">{a.distance} · {a.type}</p></div>
                    <span className="text-[10px] font-bold text-amber-500">★ {a.rating}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Suggestions */}
            <div className="rounded-2xl bg-sky-500/5 border border-sky-500/20 p-4">
              <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-sky-500" /> Smart Suggestions</p>
              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground">💡 Flights to Miami are 23% cheaper next Tuesday</p>
                <p className="text-[11px] text-muted-foreground">🏨 Hotel prices drop 15% for mid-week stays</p>
                <p className="text-[11px] text-muted-foreground">🚗 Book rental cars 3 weeks ahead to save $40+</p>
              </div>
            </div>
          </div>

          {/* ─── GUEST SIGN-UP CTA ─── */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-primary/12 via-sky-500/6 to-primary/10 border border-primary/20 p-6 relative overflow-hidden shadow-sm"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-base font-bold text-foreground mb-1">Join ZIVO — it's free</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Earn rewards, save trips, get price alerts, and access exclusive deals.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate("/signup")}
                    size="sm"
                    className="flex-1 h-11 rounded-xl font-bold shadow-md shadow-primary/20"
                  >
                    Sign Up Free
                  </Button>
                  <Button
                    onClick={() => navigate("/login")}
                    variant="outline"
                    size="sm"
                    className="h-11 px-5 rounded-xl font-medium"
                  >
                    Log In
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── TRUST BAR ─── */}
          <div className="flex items-center justify-center gap-6 py-4">
            <div className="flex items-center gap-1.5 text-muted-foreground/50">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">Secure</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground/50">
              <Globe className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">500K+ travelers</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground/50">
              <Star className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">4.8 rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <UniversalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Bottom Nav */}
      <ZivoMobileNav />
    </div>
  );
};

export default AppHome;
