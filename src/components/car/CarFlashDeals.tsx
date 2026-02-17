import { ArrowRight, MapPin, Car, Truck, Crown, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const popularPickups = [
  { id: 1, name: "Economy & Compact", location: "LAX Airport", icon: Car, description: "Fuel-efficient city cars" },
  { id: 2, name: "Electric Vehicles", location: "SFO Airport", icon: Car, description: "Tesla, EV options" },
  { id: 3, name: "SUVs & Crossovers", location: "JFK Airport", icon: Truck, description: "Room for the whole family" },
  { id: 4, name: "Luxury & Premium", location: "ORD Airport", icon: Crown, description: "Travel in style" },
];

const CarFlashDeals = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="mb-3 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <Car className="w-3 h-3 mr-1" /> Browse
            </Badge>
            <h2 className="text-2xl md:text-3xl font-display font-bold">
              Popular Vehicle Categories
            </h2>
          </div>
          <Button variant="outline" className="hidden md:flex">
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularPickups.map((item) => (
            <div key={item.id} className="group relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all">
              <div className="p-6">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/15 flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
                <h3 className="font-bold text-center mb-1">{item.name}</h3>
                <p className="text-muted-foreground text-sm text-center mb-2">{item.description}</p>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-4">
                  <MapPin className="w-3 h-3" />
                  Available at {item.location}
                </div>

                <Button className="w-full bg-emerald-500 hover:bg-emerald-600" size="sm">
                  Search Rentals
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarFlashDeals;
