/**
 * App Home Screen - Map-First Super App Hub
 * Layout: Full-screen map + floating top bar + draggable bottom panel
 * Panel: Quick Actions Grid → Promo Carousel → Recently Used → Favorites → Recommendations
 */
import { useCallback, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import {
  Search, Plane, Car, Utensils, BedDouble,
  MapPin, Bell, LucideIcon, Package, Star, Sparkles,
  UtensilsCrossed, Heart, History, Hotel
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalizedHome, HomeRestaurant } from "@/hooks/usePersonalizedHome";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRecommendedDeals } from "@/hooks/useRecommendedDeals";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useSavedLocations } from "@/hooks/useSavedLocations";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { formatDistanceToNow } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import UniversalSearchOverlay from "@/components/search/UniversalSearchOverlay";
import { GoogleMapProvider, GoogleMap } from "@/components/maps";

// Restaurant Card for personalized rows
const RestaurantCard = ({ restaurant, onNavigate }: { restaurant: HomeRestaurant; onNavigate: () => void }) => (
  <motion.button
    onClick={onNavigate}
    whileTap={{ scale: 0.96 }}
    className="shrink-0 w-[140px] rounded-2xl overflow-hidden bg-card border border-border shadow-sm touch-manipulation text-left"
  >
    <div className="relative h-[100px]">
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
    <div className="p-2">
      <div className="text-xs font-semibold text-foreground truncate">{restaurant.name}</div>
      {restaurant.cuisine_type && (
        <div className="text-[9px] text-muted-foreground truncate mt-0.5">{restaurant.cuisine_type}</div>
      )}
    </div>
  </motion.button>
);

// Section Header
const SectionHeader = ({ icon: Icon, iconColor, title, onSeeAll }: { icon: LucideIcon; iconColor: string; title: string; onSeeAll: () => void }) => (
  <div className="flex items-center justify-between mb-2">
    <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      {title}
    </h2>
    <button onClick={onSeeAll} className="text-xs text-primary font-semibold">See all</button>
  </div>
);

// Quick Actions Grid config (3x2)
const quickActions = [
  { label: "Ride", icon: Car, href: "/rides", bg: "bg-primary/10", color: "text-primary" },
  { label: "Eats", icon: UtensilsCrossed, href: "/eats", bg: "bg-orange-500/10", color: "text-orange-500" },
  { label: "Delivery", icon: Package, href: "/move", bg: "bg-violet-500/10", color: "text-violet-500" },
  { label: "Flights", icon: Plane, href: "/search?tab=flights", bg: "bg-sky-500/10", color: "text-sky-500" },
  { label: "Hotels", icon: BedDouble, href: "/search?tab=hotels", bg: "bg-amber-500/10", color: "text-amber-500" },
  { label: "Rentals", icon: Car, href: "/rent-car", bg: "bg-emerald-500/10", color: "text-emerald-500" },
];

// Promo banners
const promos = [
  { title: "50% off first ride", subtitle: "Use code ZIVO50", gradient: "from-primary to-emerald-400" },
  { title: "Free delivery", subtitle: "On orders over $25", gradient: "from-orange-400 to-amber-500" },
  { title: "Flight deals from $49", subtitle: "Book by this weekend", gradient: "from-sky-400 to-blue-500" },
];

// Recently viewed type config
const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  hotel: { icon: Hotel, color: "bg-amber-500" },
  flight: { icon: Plane, color: "bg-sky-500" },
  car: { icon: Car, color: "bg-emerald-500" },
  restaurant: { icon: Utensils, color: "bg-orange-500" },
};

// Bottom sheet snap points (as fractions of viewport height from bottom)
const SNAP_COLLAPSED = 0.25;
const SNAP_DEFAULT = 0.45;
const SNAP_EXPANDED = 0.80;

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { recommended, favorites } = usePersonalizedHome();
  const { data: profile } = useUserProfile();
  const { deals } = useRecommendedDeals(6);
  const { items: recentItems } = useRecentlyViewed();
  const { data: savedLocations } = useSavedLocations(user?.id);
  const { getCurrentLocation } = useCurrentLocation();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location on mount
  useEffect(() => {
    getCurrentLocation()
      .then(loc => setUserLocation({ lat: loc.lat, lng: loc.lng }))
      .catch(() => {}); // Fallback handled by default center
  }, [getCurrentLocation]);

  const mapCenter = userLocation || { lat: 40.7128, lng: -74.006 };

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

  // Bottom sheet drag
  const sheetY = useMotionValue(0);
  const windowH = typeof window !== "undefined" ? window.innerHeight : 800;
  const snapPoints = [
    windowH * (1 - SNAP_EXPANDED),
    windowH * (1 - SNAP_DEFAULT),
    windowH * (1 - SNAP_COLLAPSED),
  ];
  const [currentSnap, setCurrentSnap] = useState(1); // default snap
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial position to default snap
    sheetY.set(snapPoints[1]);
  }, []);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const currentY = sheetY.get();
    const velocity = info.velocity.y;

    // Find closest snap point, biased by velocity
    let targetSnap = 1;
    let minDist = Infinity;
    snapPoints.forEach((snap, i) => {
      const dist = Math.abs(currentY - snap) - velocity * (currentY > snap ? 0.15 : -0.15);
      if (dist < minDist) {
        minDist = dist;
        targetSnap = i;
      }
    });

    // Velocity-based override
    if (velocity > 500 && targetSnap < 2) targetSnap = Math.min(targetSnap + 1, 2);
    if (velocity < -500 && targetSnap > 0) targetSnap = Math.max(targetSnap - 1, 0);

    setCurrentSnap(targetSnap);
    animate(sheetY, snapPoints[targetSnap], {
      type: "spring",
      stiffness: 400,
      damping: 40,
    });
  }, [sheetY, snapPoints]);

  // Sheet height for content scrolling
  const sheetHeight = useTransform(sheetY, (y) => windowH - y);

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
    <div className="relative h-[100dvh] bg-background font-sans text-foreground overflow-hidden selection:bg-primary/30">

      {/* FULL-SCREEN MAP BACKGROUND */}
      <div className="absolute inset-0">
        <GoogleMapProvider>
          <GoogleMap
            center={mapCenter}
            zoom={14}
            darkMode={false}
            showControls={false}
            className="w-full h-full"
          />
        </GoogleMapProvider>
      </div>

      {/* TOP OVERLAY */}
      <div className="absolute top-0 left-0 right-0 z-30">
        {/* Greeting bar */}
        <div className="p-4 flex justify-between items-center bg-white/90 dark:bg-background/90 backdrop-blur-xl safe-area-top border-b border-border/30">
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
        <div className="px-4 pt-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full touch-manipulation"
          >
            <div className="bg-white/95 dark:bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-3 flex items-center gap-2.5 shadow-lg active:scale-[0.99] transition-transform">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium text-left flex-1 text-sm">Where to?</span>
              <div className="h-5 w-[1px] bg-border" />
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* BOTTOM SLIDING PANEL */}
      <motion.div
        ref={sheetRef}
        style={{ y: sheetY }}
        drag="y"
        dragConstraints={{ top: snapPoints[0], bottom: snapPoints[2] }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        className="absolute left-0 right-0 z-40 bg-background rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-border/50"
        initial={{ y: snapPoints[1] }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Panel content - scrollable */}
        <div
          className="overflow-y-auto overscroll-contain px-4 pb-24"
          style={{ maxHeight: `calc(${SNAP_EXPANDED * 100}vh - 48px)` }}
        >
          {/* QUICK ACTIONS GRID (3x2) */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.href)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border shadow-sm touch-manipulation"
              >
                <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <span className="text-xs font-semibold text-foreground">{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* PROMO BANNER CAROUSEL */}
          <div className="mb-5">
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
              <div className="flex">
                {promos.map((promo, i) => (
                  <div key={i} className="flex-[0_0_100%] min-w-0 px-0.5">
                    <div className={`bg-gradient-to-br ${promo.gradient} rounded-2xl p-5 text-white`}>
                      <h3 className="text-lg font-bold mb-1">{promo.title}</h3>
                      <p className="text-sm opacity-90">{promo.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Dot indicators */}
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

          {/* RECENTLY USED */}
          {user && recentItems.length > 0 && (
            <div className="mb-5">
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

          {/* FAVORITES */}
          <div className="mb-5">
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

          {/* SMART RECOMMENDATIONS */}
          {(recommended.length > 0 || deals.length > 0) && (
            <div className="mb-5">
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
      </motion.div>

      {/* Bottom Navigation */}
      <ZivoMobileNav />

      {/* Universal Search Overlay */}
      <UniversalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default AppHome;
