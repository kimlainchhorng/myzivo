/**
 * HeroSearchCard - Floating tabbed search card for all ZIVO services
 */
import { useState } from "react";
import { Plane, Hotel, CarFront, Car, UtensilsCrossed, Search, MapPin, Calendar, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const tabs = [
  { id: "flights", label: "Flights", icon: Plane, color: "text-[hsl(var(--flights))]" },
  { id: "hotels", label: "Hotels", icon: Hotel, color: "text-[hsl(var(--hotels))]" },
  { id: "cars", label: "Cars", icon: CarFront, color: "text-[hsl(var(--cars))]" },
  { id: "rides", label: "Rides", icon: Car, color: "text-[hsl(var(--rides))]" },
  { id: "eats", label: "Eats", icon: UtensilsCrossed, color: "text-[hsl(var(--eats))]" },
];

export default function HeroSearchCard() {
  const [activeTab, setActiveTab] = useState("flights");
  const navigate = useNavigate();

  const handleSearch = () => {
    const routes: Record<string, string> = {
      flights: "/flights",
      hotels: "/hotels",
      cars: "/rent-car",
      rides: "/rides",
      eats: "/eats",
    };
    navigate(routes[activeTab] || "/flights");
  };

  return (
    <section className="relative z-20 -mt-8 sm:-mt-12 pb-8 sm:pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-4xl mx-auto bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-border/50 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 flex-1 justify-center min-w-0",
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <tab.icon className={cn("w-4 h-4 shrink-0", activeTab === tab.id ? "text-primary" : "")} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Forms */}
          <div className="p-5 sm:p-6">
            {activeTab === "flights" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="From" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="To" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Dates" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Passengers" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <Button onClick={handleSearch} className="h-12 rounded-xl font-semibold gap-2 text-base">
                  <Search className="w-4 h-4" /> Search
                </Button>
              </div>
            )}

            {activeTab === "hotels" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Location" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Check-in / Check-out" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Guests" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <Button onClick={handleSearch} className="h-12 rounded-xl font-semibold gap-2 text-base">
                  <Search className="w-4 h-4" /> Search
                </Button>
              </div>
            )}

            {activeTab === "cars" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Pickup location" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Pickup date" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Return date" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <Button onClick={handleSearch} className="h-12 rounded-xl font-semibold gap-2 text-base">
                  <Search className="w-4 h-4" /> Search
                </Button>
              </div>
            )}

            {activeTab === "rides" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input placeholder="Pickup location" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
                  <Input placeholder="Dropoff location" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <Button onClick={handleSearch} className="h-12 rounded-xl font-semibold gap-2 text-base">
                  <Search className="w-4 h-4" /> Search
                </Button>
              </div>
            )}

            {activeTab === "eats" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-2">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Delivery address or search restaurants" className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <Button onClick={handleSearch} className="h-12 rounded-xl font-semibold gap-2 text-base">
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
