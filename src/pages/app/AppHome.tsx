/**
 * App Home Screen - Super App Hub
 * Three zones: Services Grid, Personalized Section, Quick Actions
 */
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Plane, Car, Utensils, BedDouble,
  MapPin, Bell, LucideIcon, Package, RefreshCw, Navigation, CalendarDays, ChevronRight, Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePersonalizedHome, HomeRestaurant } from "@/hooks/usePersonalizedHome";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import UniversalSearchOverlay from "@/components/search/UniversalSearchOverlay";
import flightsHeroImg from "@/assets/flights-hero.png";
import RecommendedDealsSection from "@/components/home/RecommendedDealsSection";
import { WinBackBanner } from "@/components/home/WinBackBanner";

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

// Service Card Component
interface ServiceCardProps {
  title: string;
  subtitle: string;
  img: string;
  icon: LucideIcon;
  onNavigate: () => void;
  imgPosition?: string;
}

const ServiceCard = ({ title, subtitle, img, icon: Icon, onNavigate, imgPosition = "center" }: ServiceCardProps) => (
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
    <div className="absolute top-3 left-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-3">
      <h3 className="text-base font-bold text-white leading-none mb-0.5">{title}</h3>
      <p className="text-[9px] text-zinc-300 font-medium uppercase tracking-wider">{subtitle}</p>
    </div>
  </motion.button>
);

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
    className="bg-zinc-900/80 border border-white/10 rounded-2xl p-3 flex items-center gap-3 touch-manipulation text-left"
  >
    <div className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold truncate">{title}</div>
      <div className="text-[10px] text-zinc-400 truncate">{subtitle}</div>
    </div>
    <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
  </motion.button>
);

// Restaurant Card for personalized rows
const RestaurantCard = ({ restaurant, onNavigate }: { restaurant: HomeRestaurant; onNavigate: () => void }) => (
  <motion.button
    onClick={onNavigate}
    whileTap={{ scale: 0.96 }}
    className="shrink-0 w-[120px] rounded-2xl overflow-hidden bg-zinc-900/80 border border-white/10 touch-manipulation text-left"
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
      <div className="text-xs font-semibold truncate">{restaurant.name}</div>
      {restaurant.cuisine_type && (
        <div className="text-[9px] text-zinc-400 truncate mt-0.5">{restaurant.cuisine_type}</div>
      )}
    </div>
  </motion.button>
);

// Horizontal scroll row
const PersonalizedRow = ({ title, emoji, restaurants, navigate: nav }: { title: string; emoji?: string; restaurants: HomeRestaurant[]; navigate: (path: string) => void }) => {
  if (!restaurants.length) return null;
  return (
    <div>
      <h2 className="text-sm font-bold text-zinc-300 mb-2">{emoji && <span className="mr-1">{emoji}</span>}{title}</h2>
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

  const userName = user?.email?.split('@')[0] || "Traveler";

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
    <div className="relative min-h-screen bg-zinc-950 font-sans text-white overflow-x-hidden selection:bg-primary/30">
      
      {/* 1. TOP BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-zinc-950/80 to-transparent safe-area-top">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-white/20 p-0.5">
            <img src={assets.avatar} className="w-full h-full rounded-full object-cover" alt="Profile" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">{greeting()}</div>
            <div className="text-sm font-bold">{userName}</div>
          </div>
        </div>
        <button 
          onClick={() => navigate("/alerts")}
          className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:bg-white/20 transition-colors relative touch-manipulation"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-black" />
        </button>
      </div>

      {/* 2. SEARCH */}
      <div className="pt-20 px-4 pb-4">
        {user && <WinBackBanner className="mb-4" />}

        <h1 className="text-2xl font-thin tracking-tight mb-0.5">
          Explore the <span className="font-black italic">World</span>
        </h1>
        <p className="text-zinc-400 mb-4 text-sm">One app for every journey.</p>

        <button 
          onClick={() => setIsSearchOpen(true)}
          className="relative group w-full touch-manipulation"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-teal-400 rounded-2xl blur opacity-20 group-active:opacity-40 transition-opacity" />
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-2.5 active:scale-[0.99] transition-transform">
            <Search className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500 font-medium text-left flex-1 text-sm">Where to?</span>
            <div className="h-5 w-[1px] bg-white/10" />
            <div className="p-1.5 bg-white/10 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* ZONE 1: Services Grid */}
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

      {/* ZONE 2: Personalized Rows */}
      <div className="px-4 pb-4 space-y-4">
        {/* Time Context Banner */}
        <PersonalizedRow
          title={timeContext.headline}
          emoji={timeContext.emoji}
          restaurants={timeSuggestions}
          navigate={navigate}
        />

        {/* Order Again (auth-gated) */}
        {user && orderAgain.length > 0 && (
          <PersonalizedRow title="Order Again" emoji="🔄" restaurants={orderAgain} navigate={navigate} />
        )}

        {/* Your Favorites (auth-gated) */}
        {user && favorites.length > 0 && (
          <PersonalizedRow title="Your Favorites" emoji="❤️" restaurants={favorites} navigate={navigate} />
        )}

        {/* Recommended for You */}
        <PersonalizedRow title="Recommended for You" emoji="✨" restaurants={recommended} navigate={navigate} />
      </div>

      {/* ZONE 3: Quick Actions (auth-gated) */}
      {user && (
        <div className="px-4 pb-4 space-y-2">
          <h2 className="text-sm font-bold text-zinc-300 mb-1">Quick Actions</h2>
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

      {/* Recommended Deals */}
      <div className="px-4 pb-24">
        <RecommendedDealsSection className="py-6 px-0" />
      </div>

      {/* Bottom Navigation */}
      <ZivoMobileNav />

      {/* Universal Search Overlay */}
      <UniversalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default AppHome;
