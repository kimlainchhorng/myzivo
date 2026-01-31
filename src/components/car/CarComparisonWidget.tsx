import { useState } from "react";
import { Scale, Check, X, Star, Users, Briefcase, Fuel, Gauge, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const sampleCars = [
  {
    id: 1,
    name: "Tesla Model 3",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
    rating: 4.9,
    price: 89,
    category: "Electric",
    seats: 5,
    bags: 2,
    features: ["autopilot", "supercharger", "premium", "unlimited"],
  },
  {
    id: 2,
    name: "BMW X5",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
    rating: 4.7,
    price: 129,
    category: "SUV",
    seats: 7,
    bags: 4,
    features: ["gps", "premium", "unlimited", "insurance"],
  },
  {
    id: 3,
    name: "Mercedes C-Class",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400",
    rating: 4.8,
    price: 99,
    category: "Luxury",
    seats: 5,
    bags: 3,
    features: ["gps", "premium", "leather"],
  },
];

const allFeatures = [
  { key: "autopilot", label: "Autopilot/ADAS" },
  { key: "supercharger", label: "Free Charging" },
  { key: "gps", label: "Built-in GPS" },
  { key: "premium", label: "Premium Audio" },
  { key: "unlimited", label: "Unlimited Miles" },
  { key: "insurance", label: "Full Insurance" },
];

const CarComparisonWidget = () => {
  const [selectedCars] = useState(sampleCars.slice(0, 2));

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/20">
            <Scale className="w-3 h-3 mr-1" /> Compare Vehicles
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Choose Your Perfect Ride
          </h2>
          <p className="text-muted-foreground">
            Compare vehicles side by side to find your ideal rental
          </p>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="inline-flex gap-4 min-w-full">
            {selectedCars.map((car) => (
              <div
                key={car.id}
                className="w-[300px] flex-shrink-0 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden"
              >
                <div className="relative h-48">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 right-3 bg-black/60 text-white border-0">
                    <Star className="w-3 h-3 mr-1 text-yellow-400" />
                    {car.rating}
                  </Badge>
                  <Badge className="absolute top-3 left-3 bg-emerald-500/80 text-white border-0">
                    {car.category}
                  </Badge>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{car.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {car.seats}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {car.bags}
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      Auto
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {allFeatures.map((feature) => {
                      const hasFeature = car.features.includes(feature.key);
                      return (
                        <div key={feature.key} className="flex items-center justify-between text-sm">
                          <span>{feature.label}</span>
                          {hasFeature ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <X className="w-4 h-4 text-red-400/50" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-2xl font-bold">${car.price}</span>
                      <span className="text-sm text-muted-foreground">/day</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500">
                      Select Vehicle
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {selectedCars.length < 3 && (
              <div className="w-[300px] flex-shrink-0 bg-card/30 backdrop-blur-xl border-2 border-dashed border-border/50 rounded-2xl flex items-center justify-center min-h-[550px]">
                <Button variant="ghost" className="flex-col gap-2 h-auto py-8">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-muted-foreground">Add Vehicle</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarComparisonWidget;
