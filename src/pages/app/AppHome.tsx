/**
 * App Home Screen - Super App Hub
 * Layout: Promo Banner → Services Grid → 3 Scrolling Sections → Quick Actions
 */
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Plane, Car, Utensils, BedDouble,
  MapPin, Bell, LucideIcon, Package, RefreshCw, Navigation, CalendarDays, ChevronRight, Star, Sparkles,
  Coffee, UtensilsCrossed, CupSoda, Moon, Bird, Tag, Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePersonalizedHome, HomeRestaurant } from "@/hooks/usePersonalizedHome";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRecommendedDeals } from "@/hooks/useRecommendedDeals";
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

// Quick Action Card
interface QuickActionCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onNavigate: () => void;
}

const QuickActionCard = ({ icon: Icon, iconBg, iconColor, title, subtitle, onNavigate }: QuickActionCardProps) => (
  <motion.button
    onClick={onNavigate}
    whileTap={{ scale: 0.97 }}
    className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 touch-manipulation text-left shadow-sm"
  >
    <div className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-foreground truncate">{title}</div>
      <div className="text-[10px] text-muted-foreground truncate">{subtitle}</div>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
  </motion.button>
);

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

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { timeSuggestions, recommended } = usePersonalizedHome();
  const { data: profile } = useUserProfile();
  const { deals } = useRecommendedDeals(6);

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

  // Quick Actions data
  const { data: lastMeal } = useQuery({
    queryKey: ["home-last-meal", user?.id],
    queryFn: async () => {
      const db = supabase as any;
      const { data } = await db
        .from("food_orders")
        .select("id, restaurant_id, restaurants(name)")
        .eq("user_id", user!.id)
        .eq("status", "delivered")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const { data: lastRide } = useQuery({
    queryKey: ["home-last-ride", user?.id],
    queryFn: async () => {
      const db = supabase as any;
      const { data } = await db
        .from("trips")
        .select("id, pickup_address")
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const { data: upcomingCount } = useQuery({
    queryKey: ["home-upcoming-count", user?.id],
    queryFn: async () => {
      const db = supabase as any;
      const [trips, hotels, orders] = await Promise.all([
        db.from("trips").select("id", { count: "exact", head: true }).eq("user_id", user!.id).in("status", ["accepted", "in_progress"]),
        db.from("hotel_bookings").select("id", { count: "exact", head: true }).eq("user_id", user!.id).gte("check_in_date", new Date().toISOString().split("T")[0]),
        db.from("food_orders").select("id", { count: "exact", head: true }).eq("user_id", user!.id).in("status", ["pending", "preparing", "ready"]),
      ]);
      return (trips.count || 0) + (hotels.count || 0) + (orders.count || 0);
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

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

      {/* QUICK ACTIONS (auth-gated) */}
      {user && (
        <div className="px-4 pb-4 space-y-2">
          <h2 className="text-sm font-bold text-foreground mb-1">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickActionCard
              icon={RefreshCw}
              iconBg="bg-orange-500/20"
              iconColor="text-orange-400"
              title={lastMeal ? "Reorder" : "Order Food"}
              subtitle={lastMeal ? ((lastMeal.restaurants as any)?.name || "Last meal") : "Browse restaurants"}
              onNavigate={() => {
                if (lastMeal?.restaurant_id) {
                  navigate(`/eats/restaurant/${lastMeal.restaurant_id}`);
                } else {
                  navigate("/eats");
                }
              }}
            />
            <QuickActionCard
              icon={Navigation}
              iconBg="bg-primary/20"
              iconColor="text-primary"
              title={lastRide ? "Rebook Ride" : "Book a Ride"}
              subtitle={lastRide?.pickup_address || "Get moving"}
              onNavigate={() => {
                if (lastRide?.pickup_address) {
                  navigate(`/rides?pickup=${encodeURIComponent(lastRide.pickup_address)}`);
                } else {
                  navigate("/rides");
                }
              }}
            />
          </div>
          <QuickActionCard
            icon={CalendarDays}
            iconBg="bg-violet-500/20"
            iconColor="text-violet-400"
            title="Upcoming Bookings"
            subtitle={upcomingCount ? `${upcomingCount} active` : "View all"}
            onNavigate={() => navigate("/trips")}
          />
        </div>
      )}

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
