/**
 * App Home Screen - Super App Hub
 * Layout: Promo Banner → Services Grid → Quick Actions → Recently Used → Favorites → Recommendations → Popular → Deals → Rides
 */
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Plane, Car, Utensils, BedDouble,
  MapPin, Bell, LucideIcon, Package, ChevronRight, Star, Sparkles,
  UtensilsCrossed, Tag, Clock, Heart, History, Hotel
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalizedHome, HomeRestaurant } from "@/hooks/usePersonalizedHome";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRecommendedDeals } from "@/hooks/useRecommendedDeals";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useSavedLocations } from "@/hooks/useSavedLocations";
import { formatDistanceToNow } from "date-fns";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import UniversalSearchOverlay from "@/components/search/UniversalSearchOverlay";
import flightsHeroImg from "@/assets/flights-hero.png";

// Image Assets
const assets = {
  flights: flightsHeroImg,
  hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
  rides: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
  move: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
  rentals: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800",
};

// Service badges
const serviceBadges: Record<string, { label: string; color: string }> = {
  Delivery: { label: "NEW", color: "bg-emerald-500" },
  Flights: { label: "POPULAR", color: "bg-amber-500" },
};

// Service Card Component
interface ServiceCardProps {
  title: string;
  subtitle: string;
  img: string;
  icon: LucideIcon;
  onNavigate: () => void;
  imgPosition?: string;
}

const ServiceCard = ({ title, subtitle, img, icon: Icon, onNavigate, imgPosition = "center" }: ServiceCardProps) => {
  const badge = serviceBadges[title];
  return (
    <motion.button
      onClick={onNavigate}
      whileTap={{ scale: 0.97 }}
      className="relative rounded-2xl overflow-hidden group cursor-pointer border border-border/50 touch-manipulation h-28 shadow-sm"
    >
      <div className="absolute inset-0">
        <img 
          src={img} 
          className="w-full h-full object-cover transition-transform duration-500 group-active:scale-105" 
          alt={title}
          style={{ objectPosition: imgPosition }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      </div>
      {badge && (
        <div className={`absolute top-2 right-2 ${badge.color} px-1.5 py-0.5 rounded-md`}>
          <span className="text-[8px] font-black text-white tracking-wider animate-pulse">{badge.label}</span>
        </div>
      )}
      <div className="absolute top-3 left-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-base font-bold text-white leading-none mb-0.5">{title}</h3>
        <p className="text-[9px] text-zinc-300 font-medium uppercase tracking-wider">{subtitle}</p>
      </div>
    </motion.button>
  );
};

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

// Nearby Rides data
const rideOptions = [
  { type: "Economy", eta: "3 min", price: "~$8", icon: Car },
  { type: "Comfort", eta: "5 min", price: "~$14", icon: Car },
  { type: "Premium", eta: "7 min", price: "~$22", icon: Car },
];

// Quick Actions Bar config
const quickActionsBar = [
  { label: "Book Ride", icon: Car, href: "/rides", bg: "bg-primary/10", color: "text-primary" },
  { label: "Order Food", icon: Utensils, href: "/eats", bg: "bg-orange-500/10", color: "text-orange-500" },
  { label: "Track Order", icon: Package, href: "/trips", bg: "bg-violet-500/10", color: "text-violet-500" },
  { label: "Book Flight", icon: Plane, href: "/search?tab=flights", bg: "bg-sky-500/10", color: "text-sky-500" },
];

// Recently viewed type config
const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  hotel: { icon: Hotel, color: "bg-amber-500" },
  flight: { icon: Plane, color: "bg-sky-500" },
  car: { icon: Car, color: "bg-emerald-500" },
  restaurant: { icon: Utensils, color: "bg-orange-500" },
};

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { timeSuggestions, recommended, favorites } = usePersonalizedHome();
  const { data: profile } = useUserProfile();
  const { deals } = useRecommendedDeals(6);
  const { items: recentItems } = useRecentlyViewed();
  const { data: savedLocations } = useSavedLocations(user?.id);

  // Merge restaurant sources for "Popular Restaurants"
  const popularRestaurants = [...recommended, ...timeSuggestions]
    .filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i)
    .slice(0, 10);

  const handleNavigate = useCallback((screen: string) => {
    window.scrollTo(0, 0);
    switch (screen) {
      case "FLIGHTS": navigate("/search?tab=flights"); break;
      case "HOTELS": navigate("/search?tab=hotels"); break;
      case "RIDES": navigate("/rides"); break;
      case "EATS": navigate("/eats"); break;
      case "MOVE": navigate("/move"); break;
      case "RENTALS": navigate("/rent-car"); break;
      default: navigate("/search");
    }
  }, [navigate]);

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
    <div className="relative min-h-screen bg-background font-sans text-foreground overflow-x-hidden selection:bg-primary/30">
      
      {/* TOP BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-background/80 backdrop-blur-lg safe-area-top border-b border-border/50">
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

      {/* LARGE PROMO BANNER */}
      <div className="pt-20 px-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-emerald-400 p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">Travel smarter. Save more.</h2>
          <p className="text-sm opacity-90 mb-4">Get up to 50% off flights, hotels, and rides</p>
          <button
            onClick={() => navigate("/search")}
            className="bg-white text-primary font-bold px-6 py-3 rounded-xl text-sm active:scale-95 transition-transform touch-manipulation"
          >
            Explore Deals
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-4 py-4">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="relative group w-full touch-manipulation"
        >
          <div className="relative bg-card border border-border rounded-2xl p-3 flex items-center gap-2.5 active:scale-[0.99] transition-transform shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium text-left flex-1 text-sm">Where to?</span>
            <div className="h-5 w-[1px] bg-border" />
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        </button>
      </div>

      {/* SERVICES GRID (3×2) */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <ServiceCard title="Ride" subtitle="Premium Mobility" img={assets.rides} icon={Car} onNavigate={() => handleNavigate("RIDES")} imgPosition="center 40%" />
          <ServiceCard title="Eats" subtitle="Gourmet Delivery" img={assets.food} icon={Utensils} onNavigate={() => handleNavigate("EATS")} imgPosition="center 50%" />
          <ServiceCard title="Delivery" subtitle="Package Delivery" img={assets.move} icon={Package} onNavigate={() => handleNavigate("MOVE")} imgPosition="center 40%" />
          <ServiceCard title="Flights" subtitle="Global Travel" img={assets.flights} icon={Plane} onNavigate={() => handleNavigate("FLIGHTS")} imgPosition="center 60%" />
          <ServiceCard title="Hotels" subtitle="Luxury Stays" img={assets.hotels} icon={BedDouble} onNavigate={() => handleNavigate("HOTELS")} imgPosition="center 60%" />
          <ServiceCard title="Rentals" subtitle="Rent & Drive" img={assets.rentals} icon={Car} onNavigate={() => handleNavigate("RENTALS")} imgPosition="center 50%" />
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickActionsBar.map((action) => (
            <motion.button
              key={action.label}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(action.href)}
              className="shrink-0 flex items-center gap-2.5 bg-card border border-border rounded-2xl px-4 py-3 touch-manipulation shadow-sm"
            >
              <div className={`w-9 h-9 ${action.bg} rounded-xl flex items-center justify-center`}>
                <action.icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <span className="text-xs font-semibold text-foreground whitespace-nowrap">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* RECENTLY USED */}
      {user && recentItems.length > 0 && (
        <div className="px-4 pb-4">
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
      <div className="px-4 pb-4">
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
        <div className="px-4 pb-4">
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

      {/* POPULAR RESTAURANTS */}
      {popularRestaurants.length > 0 && (
        <div className="px-4 pb-4">
          <SectionHeader icon={UtensilsCrossed} iconColor="text-orange-400" title="Popular Restaurants" onSeeAll={() => navigate("/eats")} />
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {popularRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} onNavigate={() => navigate(`/eats/restaurant/${r.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* TRAVEL DEALS */}
      {deals.length > 0 && (
        <div className="px-4 pb-4">
          <SectionHeader icon={Tag} iconColor="text-primary" title="Travel Deals" onSeeAll={() => navigate("/deals")} />
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {deals.map((deal) => (
              <motion.button
                key={deal.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(deal.href)}
                className="shrink-0 w-[160px] rounded-2xl bg-card border border-border shadow-sm p-3 touch-manipulation text-left"
              >
                <div className="inline-block px-2 py-0.5 rounded-lg bg-primary/10 mb-2">
                  <span className="text-[10px] font-bold text-primary">{deal.discountLabel}</span>
                </div>
                <div className="text-xs font-semibold text-foreground truncate">{deal.name}</div>
                {deal.description && (
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">{deal.description}</div>
                )}
                {deal.expiresAt && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">Limited time</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* NEARBY RIDES */}
      <div className="px-4 pb-4">
        <SectionHeader icon={Car} iconColor="text-primary" title="Nearby Rides" onSeeAll={() => navigate("/rides")} />
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {rideOptions.map((ride) => (
            <motion.button
              key={ride.type}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/rides")}
              className="shrink-0 w-[140px] rounded-2xl bg-card border border-border shadow-sm p-4 touch-manipulation text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <ride.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm font-bold text-foreground">{ride.type}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{ride.eta} • {ride.price}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom spacing for nav */}
      <div className="pb-20" />

      {/* Bottom Navigation */}
      <ZivoMobileNav />

      {/* Universal Search Overlay */}
      <UniversalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default AppHome;
