/**
 * App Home Screen - Mobile Premium
 * Premium Bento-grid design with screen navigation
 */
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Plane, Car, Utensils, BedDouble,
  MapPin, Bell, Zap, LucideIcon, ChevronRight, Package
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import flightsHeroImg from "@/assets/flights-hero.png";

// Premium Image Assets
const assets = {
  flights: flightsHeroImg,
  hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
  rides: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
  move: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
};

// Service Card Component - Image Background Style
interface ServiceCardProps {
  title: string;
  subtitle: string;
  img: string;
  icon: LucideIcon;
  onNavigate: () => void;
  className?: string;
}

const ServiceCard = ({ title, subtitle, img, icon: Icon, onNavigate, className = "" }: ServiceCardProps) => {
  return (
    <motion.button
      onClick={onNavigate}
      whileTap={{ scale: 0.97 }}
      className={`relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10 touch-manipulation ${className}`}
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-active:scale-105" alt={title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      </div>

      {/* Icon Badge */}
      <div className="absolute top-3 left-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
        <Icon className="w-4 h-4 text-white" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-base font-bold text-white leading-none mb-0.5">{title}</h3>
        <p className="text-[9px] text-zinc-300 font-medium uppercase tracking-wider">{subtitle}</p>
      </div>
    </motion.button>
  );
};

// Dark Card Component - No Image Background
interface DarkCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onNavigate: () => void;
  className?: string;
}

const DarkCard = ({ title, subtitle, icon: Icon, onNavigate, className = "" }: DarkCardProps) => {
  return (
    <motion.button
      onClick={onNavigate}
      whileTap={{ scale: 0.97 }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer bg-zinc-900/80 border border-white/10 touch-manipulation p-4 flex flex-col justify-end ${className}`}
    >
      {/* Icon Badge */}
      <div className="absolute top-3 left-3 w-8 h-8 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
        <Icon className="w-4 h-4 text-zinc-400" />
      </div>

      {/* Content */}
      <div className="mt-auto">
        <h3 className="text-base font-bold text-white leading-none mb-0.5">{title}</h3>
        <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">{subtitle}</p>
      </div>
    </motion.button>
  );
};

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Navigation handler for service cards - routes to premium screens
  const handleNavigate = useCallback((screen: string) => {
    window.scrollTo(0, 0);
    switch (screen) {
      case "FLIGHTS":
        navigate("/search?tab=flights");
        break;
      case "HOTELS":
        navigate("/search?tab=hotels");
        break;
      case "RIDES":
        navigate("/rides");
        break;
      case "EATS":
        navigate("/eats");
        break;
      case "MOVE":
        navigate("/move");
        break;
      default:
        navigate("/search");
    }
  }, [navigate]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = user?.email?.split('@')[0] || "Traveler";

  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-white overflow-x-hidden selection:bg-primary/30">
      
      {/* 1. TOP BAR: Profile & Notifications */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-zinc-950/80 to-transparent safe-area-top">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 p-0.5">
            <img src={assets.avatar} className="w-full h-full rounded-full object-cover" alt="Profile" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">{greeting()}</div>
            <div className="text-sm font-bold">{userName}</div>
          </div>
        </div>
        <button 
          onClick={() => navigate("/alerts")}
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:bg-white/20 transition-colors relative touch-manipulation"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-black" />
        </button>
      </div>

      {/* 2. LIVE ACTIVITY "ISLAND" */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed top-24 left-6 right-6 z-40 safe-area-top"
      >
        <button 
          onClick={() => handleNavigate("RIDES")}
          className="w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center justify-between shadow-2xl touch-manipulation active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Book a Ride</div>
              <div className="text-[10px] text-zinc-400">Premium vehicles available</div>
            </div>
          </div>
          <div className="pr-2">
            <div className="w-12 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400">GO</span>
            </div>
          </div>
        </button>
      </motion.div>

      {/* 3. HERO SEARCH SECTION */}
      <div className="pt-48 px-6 pb-8">
        <h1 className="text-4xl font-thin tracking-tight mb-1">
          Explore the <span className="font-black italic">World</span>
        </h1>
        <p className="text-zinc-400 mb-8 text-sm">One app for every journey.</p>

        {/* Glass Search Bar */}
        <button 
          onClick={() => navigate("/search")}
          className="relative group w-full touch-manipulation"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-teal-400 rounded-2xl blur opacity-20 group-active:opacity-40 transition-opacity" />
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform">
            <Search className="w-5 h-5 text-zinc-400" />
            <span className="text-zinc-500 font-medium text-left flex-1">Where to? (e.g. Tokyo, Sushi, Home)</span>
            <div className="h-6 w-[1px] bg-white/10 mx-1" />
            <div className="p-2 bg-white/10 rounded-lg">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* 4. BENTO GRID SERVICE NAV */}
      <div className="px-6 pb-32 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Services</h2>
          <button 
            onClick={() => navigate("/search")}
            className="text-xs text-primary font-semibold touch-manipulation flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Bento Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {/* Row 1: Flights Image + Rides Image */}
          <ServiceCard 
            title="Flights" 
            subtitle="Global Travel" 
            img={assets.flights}
            icon={Plane} 
            onNavigate={() => handleNavigate("FLIGHTS")}
            className="h-32"
          />
          <ServiceCard 
            title="Rides" 
            subtitle="Premium Mobility" 
            img={assets.rides} 
            icon={Car}
            onNavigate={() => handleNavigate("RIDES")}
            className="h-32"
          />

          {/* Row 2: Food Image + Move Image */}
          <ServiceCard 
            title="Eats" 
            subtitle="Gourmet Delivery" 
            img={assets.food} 
            icon={Utensils}
            onNavigate={() => handleNavigate("EATS")}
            className="h-32"
          />
          <ServiceCard 
            title="Move" 
            subtitle="Package Delivery" 
            img={assets.move} 
            icon={Package}
            onNavigate={() => handleNavigate("MOVE")}
            className="h-32"
          />
        </div>

        {/* Bottom Row: Hotels + Premium */}
        <div className="grid grid-cols-5 gap-3">
          <ServiceCard 
            title="Hotels" 
            subtitle="Luxury Stays" 
            img={assets.hotels} 
            icon={BedDouble}
            onNavigate={() => handleNavigate("HOTELS")}
            className="col-span-2 h-28"
          />
          <motion.button 
            onClick={() => navigate("/account")}
            whileTap={{ scale: 0.97 }}
            className="col-span-3 bg-primary/90 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-center touch-manipulation text-left border border-primary/20"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-teal-400/20 rounded-full blur-xl -ml-4 -mb-4" />
            <Zap className="w-6 h-6 text-white mb-2" />
            <div className="font-bold text-base leading-tight text-white">ZIVO<br/>Premium</div>
            <div className="text-[10px] text-white/70 mt-1">Upgrade for exclusive perks</div>
          </motion.button>
        </div>
      </div>

      {/* 5. BOTTOM NAVIGATION */}
      <ZivoMobileNav />
    </div>
  );
};

export default AppHome;
