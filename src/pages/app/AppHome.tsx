/**
 * App Home Screen - Super App Hub
 * Three zones: Services Grid, Personalized Section, Quick Actions
 */
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Plane, Car, Utensils, BedDouble,
  MapPin, Bell, LucideIcon, Package, RefreshCw, Navigation, CalendarDays, ChevronRight, Star, Sparkles,
  Coffee, UtensilsCrossed, CupSoda, Moon, Bird
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePersonalizedHome, HomeRestaurant } from "@/hooks/usePersonalizedHome";
import { useUserProfile } from "@/hooks/useUserProfile";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import UniversalSearchOverlay from "@/components/search/UniversalSearchOverlay";
import flightsHeroImg from "@/assets/flights-hero.png";
import RecommendedDealsSection from "@/components/home/RecommendedDealsSection";
import SmartOffersSection from "@/components/home/SmartOffersSection";
import { WinBackBanner } from "@/components/home/WinBackBanner";
import HomepageAdBanner from "@/components/ads/HomepageAdBanner";

// Image Assets
const assets = {
  flights: flightsHeroImg,
  hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
  rides: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
  move: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
  rentals: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
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
      className="relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10 touch-manipulation h-28"
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
    className="shrink-0 w-[120px] rounded-2xl overflow-hidden bg-card border border-border shadow-sm touch-manipulation text-left"
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

// Horizontal scroll row
// Map title keywords to Lucide icons
const rowIcons: Record<string, { Icon: typeof Plane; color: string }> = {
  "Order Again": { Icon: RefreshCw, color: "text-orange-400" },
  "Your Favorites": { Icon: Star, color: "text-rose-400" },
  "Recommended for You": { Icon: Sparkles, color: "text-amber-400" },
};

const timeIcons: Record<string, { Icon: typeof Plane; color: string }> = {
  coffee: { Icon: Coffee, color: "text-amber-400" },
  "utensils-crossed": { Icon: UtensilsCrossed, color: "text-orange-400" },
  "cup-soda": { Icon: CupSoda, color: "text-teal-400" },
  moon: { Icon: Moon, color: "text-indigo-400" },
  bird: { Icon: Bird, color: "text-violet-400" },
};

const PersonalizedRow = ({ title, iconName, restaurants, navigate: nav }: { title: string; iconName?: string; restaurants: HomeRestaurant[]; navigate: (path: string) => void }) => {
  if (!restaurants.length) return null;
  const iconConfig = rowIcons[title] || (iconName ? timeIcons[iconName] : undefined);
  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
        {iconConfig && <iconConfig.Icon className={`w-3.5 h-3.5 ${iconConfig.color}`} />}
        {title}
      </h2>
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
        {restaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} onNavigate={() => nav(`/eats/restaurant/${r.id}`)} />
        ))}
      </div>
    </div>
  );
};

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { timeContext, timeSuggestions, orderAgain, favorites, recommended } = usePersonalizedHome();
  const { data: profile } = useUserProfile();

  // Trending destinations
  const trendingDestinations = [
    { city: "Miami", color: "from-teal-500/30 to-emerald-500/30", price: "$89" },
    { city: "New York", color: "from-sky-500/30 to-blue-500/30", price: "$120" },
    { city: "Los Angeles", color: "from-amber-500/30 to-orange-500/30", price: "$99" },
    { city: "Chicago", color: "from-slate-500/30 to-zinc-500/30", price: "$75" },
    { city: "Las Vegas", color: "from-violet-500/30 to-purple-500/30", price: "$65" },
    { city: "San Francisco", color: "from-rose-500/30 to-pink-500/30", price: "$110" },
  ];

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

  // --- Zone 3: Last Meal ---
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

  // --- Zone 3: Last Ride ---
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

  // --- Zone 3: Upcoming Count ---
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
      
      {/* 1. TOP BAR */}
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

      {/* 2. SEARCH */}
      <div className="pt-20 px-4 pb-4">
        {user && <WinBackBanner className="mb-4" />}

        <h1 className="text-2xl font-thin tracking-tight mb-0.5 text-foreground">
          Explore the <span className="font-black italic">World</span>
        </h1>
        <p className="text-muted-foreground mb-4 text-sm">One app for every journey.</p>

        <button 
          onClick={() => setIsSearchOpen(true)}
          className="relative group w-full touch-manipulation"
        >
          <div className="absolute inset-0 bg-primary/5 rounded-2xl blur opacity-40 group-active:opacity-60 transition-opacity" />
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

      {/* Promo banner for signed-out users */}
      {!user && (
        <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-r from-primary to-sky-500 p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">Sign up & save</span>
          </div>
          <p className="text-xs opacity-85">Create a free account and get $10 off your first booking.</p>
          <button
            onClick={() => navigate("/login?mode=signup")}
            className="mt-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-lg text-xs font-semibold active:scale-95 transition-transform"
          >
            Get Started
          </button>
        </div>
      )}

      {/* Trending Destinations */}
      <div className="px-4 pb-4">
        <div className="border-t border-border pt-4 mb-3" />
        <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5 text-sky-400" />Trending Destinations
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {trendingDestinations.map((dest) => (
            <motion.button
              key={dest.city}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/flights?to=${dest.city}`)}
              className="shrink-0 px-3 py-2.5 rounded-xl bg-card border border-border shadow-sm touch-manipulation"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${dest.color} flex items-center justify-center mb-1.5 mx-auto`}>
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs font-semibold text-foreground">{dest.city}</div>
              <div className="text-[10px] text-primary font-bold">from {dest.price}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ZONE 1: Services Grid */}
      <div className="px-4 pb-4">
        <div className="border-t border-border pt-4 mb-3" />
        <div className="grid grid-cols-2 gap-2">
          <ServiceCard title="Ride" subtitle="Premium Mobility" img={assets.rides} icon={Car} onNavigate={() => handleNavigate("RIDES")} imgPosition="center 40%" />
          <ServiceCard title="Eats" subtitle="Gourmet Delivery" img={assets.food} icon={Utensils} onNavigate={() => handleNavigate("EATS")} imgPosition="center 50%" />
          <ServiceCard title="Delivery" subtitle="Package Delivery" img={assets.move} icon={Package} onNavigate={() => handleNavigate("MOVE")} imgPosition="center 40%" />
          <ServiceCard title="Flights" subtitle="Global Travel" img={assets.flights} icon={Plane} onNavigate={() => handleNavigate("FLIGHTS")} imgPosition="center 60%" />
          <ServiceCard title="Hotels" subtitle="Luxury Stays" img={assets.hotels} icon={BedDouble} onNavigate={() => handleNavigate("HOTELS")} imgPosition="center 60%" />
          <ServiceCard title="Rentals" subtitle="Rent & Drive" img={assets.rentals} icon={Car} onNavigate={() => handleNavigate("RENTALS")} imgPosition="center 50%" />
        </div>
      </div>

      {/* Mobile Ad Banner */}
      <div className="px-4 pb-4">
        <HomepageAdBanner
          headline="Summer deals are here"
          description="Save up to 40% on flights and hotels to top destinations."
          ctaText="Browse Deals"
          ctaHref="/flights"
        />
      </div>

      {/* ZONE 2: Personalized Rows */}
      <div className="px-4 pb-4 space-y-4">
        <div className="border-t border-border pt-4" />
        {/* Time Context Banner */}
        <PersonalizedRow
          title={timeContext.headline}
          iconName={timeContext.iconName}
          restaurants={timeSuggestions}
          navigate={navigate}
        />

        {/* Order Again (auth-gated) */}
        {user && orderAgain.length > 0 && (
          <PersonalizedRow title="Order Again" restaurants={orderAgain} navigate={navigate} />
        )}

        {/* Your Favorites (auth-gated) */}
        {user && favorites.length > 0 && (
          <PersonalizedRow title="Your Favorites" restaurants={favorites} navigate={navigate} />
        )}

        {/* Recommended for You */}
        <PersonalizedRow title="Recommended for You" restaurants={recommended} navigate={navigate} />
      </div>

      {/* ZONE 3: Quick Actions (auth-gated) */}
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

      {/* Smart Offers (signed-in) / Recommended Deals (signed-out) */}
      <div className="px-4 pb-24">
        {user ? (
          <SmartOffersSection className="py-6 px-0" />
        ) : (
          <RecommendedDealsSection className="py-6 px-0" />
        )}
      </div>

      {/* Bottom Navigation */}
      <ZivoMobileNav />

      {/* Universal Search Overlay */}
      <UniversalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default AppHome;
