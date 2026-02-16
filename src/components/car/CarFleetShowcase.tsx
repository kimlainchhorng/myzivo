import { useState } from "react";
import { Car, Users, Fuel, Gauge, Star, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import fleetEconomy from "@/assets/fleet-economy.png";
import fleetCompact from "@/assets/fleet-compact.png";
import fleetSuv from "@/assets/fleet-suv.png";
import fleetLuxury from "@/assets/fleet-luxury.png";
import fleetElectric from "@/assets/fleet-electric.png";

const fleetCategories = [
  { id: "all", name: "All" },
  { id: "economy", name: "Economy" },
  { id: "compact", name: "Compact" },
  { id: "suv", name: "SUV" },
  { id: "luxury", name: "Luxury" },
  { id: "electric", name: "Electric" },
];

const categoryImages: Record<string, string> = {
  economy: fleetEconomy,
  compact: fleetCompact,
  suv: fleetSuv,
  luxury: fleetLuxury,
  electric: fleetElectric,
};

const vehicles = [
  { id: 1, name: "Hyundai i10", category: "economy", seats: 4, transmission: "Auto", fuel: "Petrol", price: 25, rating: 4.6, available: true },
  { id: 2, name: "Ford Focus", category: "compact", seats: 5, transmission: "Auto", fuel: "Petrol", price: 35, rating: 4.7, available: true },
  { id: 3, name: "Toyota RAV4", category: "suv", seats: 5, transmission: "Auto", fuel: "Hybrid", price: 55, rating: 4.8, available: true },
  { id: 4, name: "BMW 3 Series", category: "luxury", seats: 5, transmission: "Auto", fuel: "Diesel", price: 85, rating: 4.9, available: false },
  { id: 5, name: "Tesla Model 3", category: "electric", seats: 5, transmission: "Auto", fuel: "Electric", price: 95, rating: 4.9, available: true },
  { id: 6, name: "VW Golf", category: "compact", seats: 5, transmission: "Auto", fuel: "Petrol", price: 40, rating: 4.7, available: true },
  { id: 7, name: "Mercedes E-Class", category: "luxury", seats: 5, transmission: "Auto", fuel: "Diesel", price: 120, rating: 4.9, available: true },
  { id: 8, name: "Nissan Leaf", category: "electric", seats: 5, transmission: "Auto", fuel: "Electric", price: 65, rating: 4.6, available: true },
];

const CarFleetShowcase = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [scrollPosition, setScrollPosition] = useState(0);

  const filteredVehicles = activeCategory === "all" 
    ? vehicles 
    : vehicles.filter(v => v.category === activeCategory);

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <Car className="w-3 h-3 mr-1" /> Our Fleet
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Explore Our Vehicle Collection
          </h2>
          <p className="text-muted-foreground">Quality vehicles for every need and budget</p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {fleetCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Vehicle Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={cn(
                "relative p-5 bg-card/60 backdrop-blur-xl rounded-2xl border transition-all hover:-translate-y-1",
                vehicle.available ? "border-border/50 hover:border-border" : "border-border/30 opacity-75"
              )}
            >
              {!vehicle.available && (
                <Badge className="absolute top-3 right-3 bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                  Sold Out
                </Badge>
              )}

              <div className="flex justify-center mb-4">
                <img 
                  src={categoryImages[vehicle.category]} 
                  alt={vehicle.name} 
                  className="w-24 h-24 object-contain"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">{vehicle.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-sm">{vehicle.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-muted/50 rounded-full">
                  <Users className="w-3 h-3" /> {vehicle.seats}
                </span>
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-muted/50 rounded-full">
                  <Gauge className="w-3 h-3" /> {vehicle.transmission}
                </span>
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-muted/50 rounded-full">
                  <Fuel className="w-3 h-3" /> {vehicle.fuel}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <span className="text-xl font-display font-bold text-emerald-400">${vehicle.price}</span>
                  <span className="text-sm text-muted-foreground">/day</span>
                </div>
                <Button 
                  size="sm" 
                  disabled={!vehicle.available}
                  className={vehicle.available ? "bg-gradient-to-r from-emerald-500 to-teal-500" : ""}
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            <Sparkles className="w-4 h-4 mr-2" />
            View All {vehicles.length}+ Vehicles
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CarFleetShowcase;
