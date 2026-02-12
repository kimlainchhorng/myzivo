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
  TrendingUp, Navigation
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
import { useScheduledBookings } from "@/hooks/useScheduledBookings";
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

// ─── Saved Places Icon Map ───
const savedPlaceIconMap: Record<string, LucideIcon> = {
  home: Home,
  work: Briefcase,
  star: Star,
  pin: MapPin,
};

// ─── Restaurant Card ───
const RestaurantCard = ({ restaurant, onNavigate }: { restaurant: HomeRestaurant; onNavigate: () => void }) => (
  <motion.button
    onClick={onNavigate}
    whileTap={{ scale: 0.96 }}
    className="shrink-0 w-[160px] rounded-3xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-shadow touch-manipulation text-left"
  >
    <div className="relative h-[110px]">
      <img
        src={restaurant.cover_image_url || restaurant.logo_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400"}
        alt={restaurant.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      {restaurant.rating && (
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5">
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span className="text-[9px] font-bold text-white">{restaurant.rating.toFixed(1)}</span>
        </div>
      )}
    </div>
    <div className="p-2.5">
      <div className="text-xs font-semibold text-foreground truncate">{restaurant.name}</div>
      {restaurant.cuisine_type && (
        <div className="text-[9px] text-muted-foreground truncate mt-0.5">{restaurant.cuisine_type}</div>
      )}
    </div>
  </motion.button>
);

// ─── Section Header ───
const SectionHeader = ({ icon: Icon, iconColor, title, onSeeAll }: { icon: LucideIcon; iconColor: string; title: string; onSeeAll: () => void }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      {title}
    </h2>
    <button onClick={onSeeAll} className="text-xs text-primary font-semibold">See all</button>
  </div>
);

// ─── Quick Actions Grid (3x2) ───
const quickActions = [
  { label: "Ride", icon: Car, href: "/rides", bg: "bg-primary/10", color: "text-primary", accent: "bg-primary" },
  { label: "Eats", icon: UtensilsCrossed, href: "/eats", bg: "bg-orange-500/10", color: "text-orange-500", accent: "bg-orange-500" },
  { label: "Delivery", icon: Package, href: "/move", bg: "bg-violet-500/10", color: "text-violet-500", accent: "bg-violet-500" },
  { label: "Flights", icon: Plane, href: "/search?tab=flights", bg: "bg-sky-500/10", color: "text-sky-500", accent: "bg-sky-500" },
  { label: "Hotels", icon: BedDouble, href: "/search?tab=hotels", bg: "bg-amber-500/10", color: "text-amber-500", accent: "bg-amber-500" },
  { label: "Rentals", icon: Car, href: "/rent-car", bg: "bg-emerald-500/10", color: "text-emerald-500", accent: "bg-emerald-500" },
];

// ─── Promo banners ───
const promos = [
  { title: "50% off first ride", subtitle: "Use code ZIVO50", gradient: "from-primary to-emerald-400" },
  { title: "Free delivery", subtitle: "On orders over $25", gradient: "from-orange-400 to-amber-500" },
  { title: "Flight deals from $49", subtitle: "Book by this weekend", gradient: "from-sky-400 to-blue-500" },
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { recommended, favorites } = usePersonalizedHome();
  const { data: profile } = useUserProfile();
  const { deals } = useRecommendedDeals(6);
  const { items: recentItems } = useRecentlyViewed();
  const { data: savedLocations } = useSavedLocations(user?.id);
  const { points, getNextTierProgress } = useLoyaltyPoints();
  const { active: activeRewards } = useUserRewards();
  const { referralCode, shareReferral } = useReferrals();
  const { getUpcoming } = useScheduledBookings();
  const upcomingBookings = getUpcoming();
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
      <div className="overflow-y-auto pb-20">
        {/* Gradient header zone */}
        <div className="bg-gradient-to-b from-primary/5 to-background">
          {/* Greeting bar */}
          <div className="p-4 flex justify-between items-center safe-area-top">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-border p-0.5 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{greeting()}</div>
                <div className="text-sm font-bold text-foreground">{userName}</div>
              </div>
            </div>
            <button
              onClick={() => navigate("/alerts")}
              className="w-9 h-9 bg-muted rounded-full flex items-center justify-center border border-border active:bg-muted/80 transition-colors relative touch-manipulation"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-destructive rounded-full" />
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full touch-manipulation"
            >
              <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-3 flex items-center gap-2.5 shadow-lg active:scale-[0.99] transition-transform">
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground font-medium text-left flex-1 text-sm">Where to?</span>
                <div className="h-5 w-[1px] bg-border" />
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
            </button>
          </div>

          {/* ─── SAVED PLACES ROW ─── */}
          <div className="px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {(savedLocations || []).slice(0, 4).map((loc) => {
                const Icon = savedPlaceIconMap[loc.icon] || MapPin;
                return (
                  <button
                    key={loc.id}
                    onClick={() => navigate("/rides")}
                    className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border/60 shadow-sm active:scale-95 transition-transform touch-manipulation"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground whitespace-nowrap">{loc.label}</span>
                  </button>
                );
              })}
              {(!savedLocations || savedLocations.length < 2) && (
                <button
                  onClick={() => navigate("/account/saved-places")}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/50 border border-dashed border-border active:scale-95 transition-transform touch-manipulation"
                >
                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Add Place</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="px-4 space-y-6">

          {/* ─── QUICK ESTIMATE CARD ─── */}
          <button
            onClick={() => navigate("/rides")}
            className="w-full rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-500/5 border border-primary/15 p-4 flex items-center gap-4 touch-manipulation active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Timer className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground">Quick Estimate</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                <span className="text-primary font-semibold">{estimate.pickupEta}</span> pickup · <span className="font-semibold">{estimate.priceRange}</span> to Downtown
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary shrink-0">
              {estimate.label}
            </Badge>
          </button>

          {/* ─── QUICK ACTIONS GRID (3x2) ─── */}
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.href)}
                className="relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow touch-manipulation overflow-hidden"
              >
                {/* Accent line */}
                <div className={`absolute top-0 left-3 right-3 h-0.5 rounded-b-full ${action.accent}`} />
                <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center`}>
                  <action.icon className={`w-7 h-7 ${action.color}`} />
                </div>
                <span className="text-xs font-semibold text-foreground">{action.label}</span>
              </motion.button>
            ))}
          </div>

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
              <div className="mb-4">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Restaurants</p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {recommended.slice(0, 5).map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} onNavigate={() => navigate(`/eats/restaurant/${r.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Popular Destinations */}
            <div className="mb-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Destinations</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {popularDestKeys.map((key) => {
                  const dest = destinationPhotos[key];
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/search?tab=flights&to=${dest.city}`)}
                      className="shrink-0 w-[160px] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow touch-manipulation text-left"
                    >
                      <div className="relative h-[110px]">
                        <img src={dest.src} alt={dest.alt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-2 left-2.5 right-2.5">
                          <div className="text-xs font-bold text-white">{dest.city}</div>
                          <div className="text-[10px] text-white/80">from {popularDestPrices[key]}</div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Trending Rides */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Trending Rides</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {trendingRides.map((ride) => (
                  <motion.button
                    key={ride.name}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate("/rides")}
                    className="shrink-0 w-[160px] rounded-3xl bg-card border border-border p-3.5 shadow-sm hover:shadow-md transition-shadow touch-manipulation text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2.5">
                      <ride.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-xs font-bold text-foreground">{ride.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-primary font-semibold">{ride.eta}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] font-semibold text-foreground">{ride.price}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── PROMO BANNER CAROUSEL ─── */}
          <div>
            <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
              <div className="flex">
                {promos.map((promo, i) => (
                  <div key={i} className="flex-[0_0_100%] min-w-0 px-0.5">
                    <div className={`bg-gradient-to-br ${promo.gradient} rounded-3xl p-5 text-white`}>
                      <h3 className="text-lg font-bold mb-1">{promo.title}</h3>
                      <p className="text-sm opacity-90">{promo.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-1.5 mt-2">
              {promos.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === activePromo ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ─── REWARDS WALLET CARD ─── */}
          {user && (() => {
            const tierName = getTierFromPoints(points.lifetime_points);
            const tierConfig = ZIVO_TIERS[tierName];
            const { nextTier, pointsNeeded } = getPointsToNextTier(points.lifetime_points);
            const { progress } = getNextTierProgress();
            const recentRewards = activeRewards.slice(0, 3);

            return (
              <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">My Rewards</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${tierConfig.color} ${tierConfig.borderColor}`}>
                    {tierConfig.icon} {tierConfig.displayName}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {points.points_balance.toLocaleString()}
                  <span className="text-lg text-muted-foreground ml-1">pts</span>
                </p>
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground mb-3">
                  {nextTier ? `${pointsNeeded.toLocaleString()} pts to ${ZIVO_TIERS[nextTier].displayName}` : "Max tier reached!"}
                </p>

                {recentRewards.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {recentRewards.map((r) => (
                      <div key={r.id} className="flex justify-between text-xs">
                        <span className="text-foreground">+{r.reward_value} pts</span>
                        <span className="text-muted-foreground">{r.reward_type}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => navigate("/rewards")}
                  className="w-full bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground"
                  size="sm"
                >
                  <Gift className="w-4 h-4 mr-1.5" />
                  Redeem Points
                </Button>
              </div>
            );
          })()}

          {/* ─── INVITE FRIENDS REFERRAL CARD ─── */}
          {user && (() => {
            const totalInvited = referralCode?.total_referrals || 0;
            const totalEarned = referralCode?.total_earnings || 0;

            return (
              <div className="rounded-3xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-bold text-foreground">Invite Friends</span>
                  </div>
                  <button onClick={() => navigate("/account/referrals")} className="text-[10px] text-violet-500 font-medium">
                    See all
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Earn {REFERRAL_REWARDS.referrer.pointsPerReferral.toLocaleString()} pts for every friend who books
                </p>

                {referralCode?.code && (
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="font-mono text-xs tracking-wider px-3 py-1">
                      {referralCode.code}
                    </Badge>
                  </div>
                )}

                <div className="flex gap-4 mb-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Invited</span>
                    <p className="font-bold text-foreground">{totalInvited}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Earned</span>
                    <p className="font-bold text-foreground">{totalEarned.toLocaleString()} pts</p>
                  </div>
                </div>

                <Button
                  onClick={() => shareReferral()}
                  variant="outline"
                  size="sm"
                  className="w-full border-violet-500/30 text-violet-600 hover:bg-violet-500/10"
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Share Link
                </Button>
              </div>
            );
          })()}

          {/* ─── UPCOMING SCHEDULED BOOKINGS ─── */}
          {user && upcomingBookings.length > 0 && (() => {
            const next = upcomingBookings[0];
            const nextDate = new Date(`${next.scheduledDate}T${next.scheduledTime}`);
            const schedTypeConfig: Record<string, { icon: typeof Car; color: string; label: string }> = {
              ride: { icon: Car, color: "text-primary", label: "Ride" },
              eats: { icon: UtensilsCrossed, color: "text-orange-500", label: "Food" },
              delivery: { icon: Package, color: "text-violet-500", label: "Delivery" },
            };
            const cfg = schedTypeConfig[next.type] || schedTypeConfig.ride;
            const Icon = cfg.icon;
            const formatTime12 = (t: string) => {
              const [h, m] = t.split(":").map(Number);
              const ampm = h >= 12 ? "PM" : "AM";
              const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
              return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
            };

            return (
              <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/15 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {upcomingBookings.length > 1 && (
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                        +{upcomingBookings.length - 1} more
                      </Badge>
                    )}
                    <button onClick={() => navigate("/scheduled")} className="text-[10px] text-primary font-medium">
                      View All
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {cfg.label}{next.destination ? ` to ${next.destination}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(nextDate, "MMM d")} · {formatTime12(next.scheduledTime)}
                    </p>
                    {next.pickup && (
                      <p className="text-[10px] text-muted-foreground truncate">{next.pickup}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─── WALLET SUMMARY CARD ─── */}
          {user && (
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500/10 to-primary/5 border border-emerald-500/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-foreground">Wallet</span>
                </div>
                <button onClick={() => navigate("/account/wallet")} className="text-[10px] text-emerald-500 font-medium">
                  See All
                </button>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                ${balanceDollars.toFixed(2)}
              </p>
              {defaultCard && (
                <div className="flex items-center gap-1.5 mb-3">
                  <CreditCard className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {defaultCard.brand} ····{defaultCard.last4}
                  </span>
                </div>
              )}
              {!defaultCard && (
                <p className="text-xs text-muted-foreground mb-3">No payment method</p>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate("/account/gift-cards")}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-primary text-primary-foreground"
                >
                  Add Funds
                </Button>
                <Button
                  onClick={() => navigate("/payment-methods")}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
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
                      className="shrink-0 w-[150px] rounded-2xl bg-card border border-border shadow-sm p-3 touch-manipulation text-left"
                    >
                      <div className={`w-8 h-8 ${cfg.color} rounded-xl flex items-center justify-center mb-2`}>
                        <ItemIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-xs font-semibold text-foreground truncate">
                        {itemData?.name || item.item_type}
                      </div>
                      {itemData?.location && (
                        <div className="text-[9px] text-muted-foreground truncate mt-0.5">{itemData.location}</div>
                      )}
                      <div className="text-[9px] text-muted-foreground mt-1">
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
                  className="shrink-0 w-[140px] rounded-2xl bg-card border border-border shadow-sm p-3 touch-manipulation text-left"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xs font-semibold text-foreground truncate">{loc.label}</div>
                  <div className="text-[9px] text-muted-foreground truncate mt-0.5">{loc.address}</div>
                </motion.button>
              ))}
              {favorites.length === 0 && (!savedLocations || savedLocations.length === 0) && (
                <div className="w-full rounded-2xl bg-card border border-dashed border-border p-6 flex flex-col items-center gap-2 text-center">
                  <Heart className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Save your favorite spots</span>
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
                    <div className="absolute top-1.5 right-1.5 bg-primary/90 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                      <span className="text-[8px] font-bold text-primary-foreground">Recommended</span>
                    </div>
                  </div>
                ))}
                {deals.slice(0, 3).map((deal) => (
                  <motion.button
                    key={deal.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(deal.href)}
                    className="shrink-0 w-[150px] rounded-2xl bg-card border border-border shadow-sm p-3 touch-manipulation text-left"
                  >
                    <div className="inline-block px-2 py-0.5 rounded-lg bg-primary/10 mb-2">
                      <span className="text-[10px] font-bold text-primary">{deal.discountLabel}</span>
                    </div>
                    <div className="text-xs font-semibold text-foreground truncate">{deal.name}</div>
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
