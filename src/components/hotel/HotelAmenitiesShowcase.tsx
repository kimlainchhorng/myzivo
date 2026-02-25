import { Wifi, Waves, Dumbbell, Utensils, Car, Coffee, Sparkles, Shield, Clock, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

const amenities = [
  { icon: Wifi, label: "Free WiFi", description: "High-speed internet", color: "from-blue-500 to-cyan-500" },
  { icon: Waves, label: "Pool & Spa", description: "Relaxation zones", color: "from-teal-500 to-emerald-500" },
  { icon: Dumbbell, label: "Fitness Center", description: "24/7 access", color: "from-orange-500 to-red-500" },
  { icon: Utensils, label: "Fine Dining", description: "On-site restaurants", color: "from-amber-500 to-orange-500" },
  { icon: Car, label: "Free Parking", description: "Secure lots", color: "from-violet-500 to-purple-500" },
  { icon: Coffee, label: "Room Service", description: "24-hour available", color: "from-rose-500 to-pink-500" },
  { icon: Shield, label: "Safe & Secure", description: "24/7 security", color: "from-green-500 to-emerald-500" },
  { icon: Plane, label: "Airport Transfer", description: "Complimentary", color: "from-sky-500 to-blue-500" },
];

const HotelAmenitiesShowcase = () => {
  return (
    <section className="py-12 sm:py-16 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            World-Class Amenities
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Everything You <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Need & More</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Premium amenities included with every booking
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {amenities.map((amenity, index) => (
            <div
              key={amenity.label}
              className={cn(
                "group relative p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                "hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300",
                "cursor-pointer touch-manipulation active:scale-[0.95]",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto",
                "bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                amenity.color
              )}>
                <amenity.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1 group-hover:text-amber-400 transition-all duration-200">
                {amenity.label}
              </h3>
              <p className="text-xs text-muted-foreground text-center">
                {amenity.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelAmenitiesShowcase;
