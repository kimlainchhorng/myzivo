/**
 * App Home Screen - Mobile Premium
 * Premium Bento-grid design with screen navigation
 */
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Plane, Car, Utensils, BedDouble,
  MapPin, Bell, Zap, LucideIcon, ChevronRight, Package, Clock, CreditCard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import flightsHeroImg from "@/assets/flights-hero.png";
import RecommendedDealsSection from "@/components/home/RecommendedDealsSection";

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
  imgPosition?: string;
}

const ServiceCard = ({ title, subtitle, img, icon: Icon, onNavigate, className = "", imgPosition = "center" }: ServiceCardProps) => {
  return (
    <motion.button
      onClick={onNavigate}
      whileTap={{ scale: 0.97 }}
      className={`relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10 touch-manipulation ${className}`}
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img 
          src={img} 
          className="w-full h-full object-cover transition-transform duration-500 group-active:scale-105" 
          alt={title}
          style={{ objectPosition: imgPosition }}
        />
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

      {/* 2. LIVE ACTIVITY "ISLAND" */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed top-16 left-4 right-4 z-40 safe-area-top"
      >
        <button 
          onClick={() => handleNavigate("RIDES")}
          className="w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl flex items-center justify-between shadow-2xl touch-manipulation active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Book a Ride</div>
              <div className="text-[10px] text-zinc-400">Premium vehicles available</div>
            </div>
          </div>
          <div className="pr-1">
            <div className="w-10 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400">GO</span>
            </div>
          </div>
        </button>
      </motion.div>

      {/* 3. HERO SEARCH SECTION */}
      <div className="pt-36 px-4 pb-4">
        <h1 className="text-2xl font-thin tracking-tight mb-0.5">
          Explore the <span className="font-black italic">World</span>
        </h1>
        <p className="text-zinc-400 mb-4 text-sm">One app for every journey.</p>

        {/* Glass Search Bar */}
        <button 
          onClick={() => navigate("/search")}
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

      {/* 4. BENTO GRID SERVICE NAV */}
      <div className="px-4 pb-24 space-y-2">
        {/* Main Bento Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          {/* Row 1: Flights Image + Rides Image */}
          <ServiceCard 
            title="Flights" 
            subtitle="Global Travel" 
            img={assets.flights}
            icon={Plane} 
            onNavigate={() => handleNavigate("FLIGHTS")}
            className="h-24"
            imgPosition="center 60%"
          />
          <ServiceCard 
            title="Rides" 
            subtitle="Premium Mobility" 
            img={assets.rides} 
            icon={Car}
            onNavigate={() => handleNavigate("RIDES")}
            className="h-24"
            imgPosition="center 40%"
          />

          {/* Row 2: Food Image + Move Image */}
          <ServiceCard 
            title="Eats" 
            subtitle="Gourmet Delivery" 
            img={assets.food} 
            icon={Utensils}
            onNavigate={() => handleNavigate("EATS")}
            className="h-24"
            imgPosition="center 50%"
          />
          <ServiceCard 
            title="Move" 
            subtitle="Package Delivery" 
            img={assets.move} 
            icon={Package}
            onNavigate={() => handleNavigate("MOVE")}
            className="h-24"
            imgPosition="center 40%"
          />
        </div>

        {/* Bottom Row: Hotels + Cars + Premium */}
        <div className="grid grid-cols-6 gap-2">
          <ServiceCard 
            title="Hotels" 
            subtitle="Luxury Stays" 
            img={assets.hotels} 
            icon={BedDouble}
            onNavigate={() => handleNavigate("HOTELS")}
            className="col-span-2 h-20"
            imgPosition="center 60%"
          />
          <ServiceCard 
            title="Cars" 
            subtitle="Rent & Drive" 
            img="https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=300&fit=crop"
            icon={Car}
            onNavigate={() => navigate("/rent-car")}
            className="col-span-2 h-20"
            imgPosition="center 50%"
          />
          <motion.button 
            onClick={() => navigate("/account")}
            whileTap={{ scale: 0.97 }}
            className="col-span-2 bg-primary/90 rounded-2xl p-3 relative overflow-hidden flex flex-col justify-center touch-manipulation text-left border border-primary/20"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6" />
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-teal-400/20 rounded-full blur-xl -ml-3 -mb-3" />
            <Zap className="w-5 h-5 text-white mb-1" />
            <div className="font-bold text-sm leading-tight text-white">Premium</div>
            <div className="text-[9px] text-white/70 mt-0.5">Exclusive perks</div>
          </motion.button>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={() => navigate("/rides/history")}
            whileTap={{ scale: 0.97 }}
            className="bg-zinc-900/80 border border-white/10 rounded-2xl p-3 flex items-center gap-3 touch-manipulation"
          >
            <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Past Trips</div>
              <div className="text-[10px] text-zinc-400">Ride history</div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => navigate("/payment-methods")}
            whileTap={{ scale: 0.97 }}
            className="bg-zinc-900/80 border border-white/10 rounded-2xl p-3 flex items-center gap-3 touch-manipulation"
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Payment</div>
              <div className="text-[10px] text-zinc-400">Manage cards</div>
            </div>
          </motion.button>
        </div>

        {/* Recommended Deals */}
        <RecommendedDealsSection className="py-6 px-0" />
      </div>

      {/* 5. BOTTOM NAVIGATION */}
      <ZivoMobileNav />
    </div>
  );
};

export default AppHome;
