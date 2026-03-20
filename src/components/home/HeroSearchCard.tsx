/**
 * HeroSearchCard - Floating tabbed search card for all ZIVO services
 */
import { useState } from "react";
import { Plane, Hotel, CarFront, Car, UtensilsCrossed, Search, MapPin, Calendar, Users, Clock, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const tabs = [
  { id: "flights", label: "Flights", icon: Plane, color: "text-[hsl(var(--flights))]", border: "border-[hsl(var(--flights))]", bg: "bg-[hsl(var(--flights)/0.05)]" },
  { id: "hotels", label: "Hotels", icon: Hotel, color: "text-[hsl(var(--hotels))]", border: "border-[hsl(var(--hotels))]", bg: "bg-[hsl(var(--hotels)/0.05)]" },
  { id: "cars", label: "Cars", icon: CarFront, color: "text-[hsl(var(--cars))]", border: "border-[hsl(var(--cars))]", bg: "bg-[hsl(var(--cars)/0.05)]" },
  { id: "rides", label: "Rides", icon: Car, color: "text-[hsl(var(--rides))]", border: "border-[hsl(var(--rides))]", bg: "bg-[hsl(var(--rides)/0.05)]" },
  { id: "eats", label: "Eats", icon: UtensilsCrossed, color: "text-[hsl(var(--eats))]", border: "border-[hsl(var(--eats))]", bg: "bg-[hsl(var(--eats)/0.05)]" },
];

export default function HeroSearchCard() {
  const [activeTab, setActiveTab] = useState("flights");
  const [tripType, setTripType] = useState<"round" | "oneway">("round");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (activeTab === "flights") {
      navigate("/flights");
      return;
    }
    const routes: Record<string, string> = {
      hotels: "/hotels",
      cars: "/rent-car",
      rides: "/rides",
      eats: "/eats",
    };
    toast.success(`Searching ${activeTab}...`, { duration: 1500 });
    navigate(routes[activeTab] || "/");
  };

  return (
    <section id="hero-search-card" className="relative z-20 -mt-8 sm:-mt-12 pb-8 sm:pb-12" aria-label="Search flights, hotels, cars, rides, and restaurants">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl mx-auto bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden border-glow relative"
        >
          {/* Gradient top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[hsl(var(--flights))] via-[hsl(var(--hotels))] to-[hsl(var(--rides))] opacity-60" />
          {/* Tabs */}
          <div className="flex border-b border-border/50 overflow-x-auto scrollbar-hide relative" role="tablist" aria-label="Service type">
             {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`search-panel-${tab.id}`}
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 flex-1 justify-center min-w-0 relative touch-manipulation active:scale-[0.97] min-h-[48px]",
                    isActive
                      ? `${tab.border} ${tab.color} ${tab.bg}`
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1, rotate: isActive ? -6 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <tab.icon className={cn("w-4 h-4 shrink-0", isActive ? tab.color : "")} />
                  </motion.div>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Forms */}
          <div id={`search-panel-${activeTab}`} role="tabpanel" aria-label={`${activeTab} search`} className="p-5 sm:p-6">
            {activeTab === "flights" && (
              <div className="space-y-4">
                {/* Trip type toggle */}
                 <div className="flex gap-2">
                  <button
                    onClick={() => setTripType("round")}
                    className={cn(tripType === "round" ? "chip-active" : "chip-inactive", "text-xs px-4 py-1.5 touch-manipulation active:scale-95 min-h-[36px]")}
                  >
                    Round Trip
                  </button>
                  <button
                    onClick={() => setTripType("oneway")}
                    className={cn(tripType === "oneway" ? "chip-active" : "chip-inactive", "text-xs px-4 py-1.5 touch-manipulation active:scale-95 min-h-[36px]")}
                  >
                    One Way
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Where from?" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Where to?" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                    {/* Swap button */}
                    <button
                      className="absolute -left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card border border-border/50 shadow-sm flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 hover:rotate-180 transition-all duration-200 z-10 hidden sm:flex hover:scale-110"
                      aria-label="Swap origin and destination"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Dates" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Passengers" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                  </div>
                  <Button onClick={handleSearch} className="h-12 rounded-xl font-semibold gap-2 text-base hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    <Search className="w-4 h-4" /> Search
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "hotels" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="City, hotel, or destination" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Check-in / Check-out" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Guests & rooms" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                </div>
                <Button onClick={handleSearch} className="h-12 rounded-xl font-semibold gap-2 text-base hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  <Search className="w-4 h-4" /> Search
                </Button>
              </div>
            )}

            {activeTab === "cars" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Pickup location" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Pickup date" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Return date" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                </div>
                <Button onClick={handleSearch} className="h-12 rounded-xl font-semibold gap-2 text-base hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  <Search className="w-4 h-4" /> Search
                </Button>
              </div>
            )}

            {activeTab === "rides" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input placeholder="Where are you?" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
                  <Input placeholder="Where are you going?" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                </div>
                <Button onClick={handleSearch} className="h-12 rounded-xl font-semibold gap-2 text-base hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  <Search className="w-4 h-4" /> Search
                </Button>
              </div>
            )}

            {activeTab === "eats" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-2">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Enter your delivery address" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 input-focus-glow" />
                </div>
                <Button onClick={handleSearch} className="h-12 rounded-xl font-semibold gap-2 text-base hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  <Search className="w-4 h-4" /> Search
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
