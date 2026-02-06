/**
 * ZIVO Home Screen - Mobile Premium
 * Clean layout with profile integration and service grid
 */
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Plane, Car, Utensils, Package,
  MapPin, Bell, ChevronRight, LucideIcon, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Premium Image Assets
const assets = {
  flights: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80&w=800",
  rides: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800",
  eats: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
  move: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=800",
};

// Service Card Component with Image Background
interface ServiceCardProps {
  title: string;
  subtitle: string;
  img: string;
  icon: LucideIcon;
  onClick: () => void;
}

const ServiceCard = ({ title, subtitle, img, icon: Icon, onClick }: ServiceCardProps) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.97 }}
    className="relative h-36 rounded-2xl overflow-hidden group cursor-pointer border border-border/30 touch-manipulation"
  >
    {/* Background Image */}
    <img 
      src={img} 
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-active:scale-105" 
      alt={title} 
    />
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

    {/* Content */}
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
      <p className="text-xs text-zinc-300">{subtitle}</p>
    </div>
  </motion.button>
);

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile();

  const handleNavigate = useCallback((path: string) => {
    window.scrollTo(0, 0);
    navigate(path);
  }, [navigate]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Traveler";
  const initials = displayName.charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] font-sans text-white overflow-x-hidden selection:bg-primary/30">
      
      {/* 1. HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-[#0D0D0D] via-[#0D0D0D]/95 to-transparent safe-area-top">
        <div className="flex items-center gap-3">
          <Avatar className="w-11 h-11 border-2 border-primary/30">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-zinc-400">{greeting()}</p>
            <p className="text-base font-bold">{displayName}</p>
          </div>
        </div>

        <button 
          onClick={() => navigate("/alerts")}
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:bg-white/20 transition-colors relative touch-manipulation"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* 2. PROMO BANNER */}
      <div className="pt-24 px-4 safe-area-top">
        <motion.button 
          onClick={() => handleNavigate("/rides")}
          whileTap={{ scale: 0.98 }}
          className="w-full relative bg-gradient-to-r from-primary via-teal-500 to-cyan-400 rounded-2xl p-4 overflow-hidden touch-manipulation"
        >
          {/* Subtle Glow Effect */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">Book a Ride</p>
                <p className="text-xs text-white/70">Premium vehicles available</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-white/20 rounded-full">
              <span className="text-xs font-bold text-white">GO</span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* 3. HERO TITLE & SEARCH */}
      <div className="px-4 pt-8 pb-6">
        <h1 className="text-4xl font-thin tracking-tight mb-6">
          Explore the <span className="font-black italic">World</span>
        </h1>

        {/* Glass Search Bar */}
        <button 
          onClick={() => navigate("/search")}
          className="relative group w-full touch-manipulation"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-teal-400 rounded-2xl blur opacity-20 group-active:opacity-40 transition-opacity" />
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform">
            <Search className="w-5 h-5 text-zinc-400" />
            <span className="text-zinc-500 font-medium text-left flex-1">Where to?</span>
            <div className="h-6 w-[1px] bg-white/10" />
            <div className="p-2 bg-white/10 rounded-lg">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* 4. SERVICES GRID */}
      <div className="px-4 pb-32">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Services</h2>
          <button 
            onClick={() => navigate("/search")}
            className="text-xs text-primary font-semibold touch-manipulation flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <ServiceCard 
            title="Flights" 
            subtitle="Search & compare" 
            img={assets.flights} 
            icon={Plane}
            onClick={() => handleNavigate("/flights")}
          />
          <ServiceCard 
            title="Rides" 
            subtitle="Premium mobility" 
            img={assets.rides} 
            icon={Car}
            onClick={() => handleNavigate("/rides")}
          />
          <ServiceCard 
            title="Eats" 
            subtitle="Gourmet delivery" 
            img={assets.eats} 
            icon={Utensils}
            onClick={() => handleNavigate("/eats")}
          />
          <ServiceCard 
            title="Move" 
            subtitle="Package delivery" 
            img={assets.move} 
            icon={Package}
            onClick={() => handleNavigate("/move")}
          />
        </div>
      </div>

      {/* 5. BOTTOM NAVIGATION */}
      <ZivoMobileNav />
    </div>
  );
};

export default AppHome;
