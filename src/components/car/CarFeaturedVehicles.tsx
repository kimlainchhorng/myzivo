import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, Fuel, Settings2, Heart, ArrowRight, Zap, Car, Crown, Truck, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";

const featuredVehicles = [
  {
    id: 1,
    make: "Tesla",
    model: "Model 3",
    year: 2024,
    image: "zap",
    category: "Electric",
    pricePerDay: 89,
    originalPrice: 119,
    rating: 4.9,
    reviews: 1240,
    seats: 5,
    transmission: "Auto",
    fuelType: "Electric",
    tag: "Eco-Friendly",
    featured: true,
  },
  {
    id: 2,
    make: "Mercedes",
    model: "S-Class",
    year: 2024,
    image: "crown",
    category: "Luxury",
    pricePerDay: 299,
    originalPrice: 399,
    rating: 4.9,
    reviews: 890,
    seats: 5,
    transmission: "Auto",
    fuelType: "Hybrid",
    tag: "VIP Choice",
    featured: true,
  },
  {
    id: 3,
    make: "Jeep",
    model: "Wrangler",
    year: 2024,
    image: "truck",
    category: "SUV",
    pricePerDay: 95,
    originalPrice: 125,
    rating: 4.8,
    reviews: 2100,
    seats: 5,
    transmission: "Auto",
    fuelType: "Gasoline",
    tag: "Adventure",
    featured: false,
  },
  {
    id: 4,
    make: "Porsche",
    model: "911 Carrera",
    year: 2024,
    image: "car",
    category: "Sports",
    pricePerDay: 450,
    originalPrice: 599,
    rating: 5.0,
    reviews: 456,
    seats: 2,
    transmission: "Auto",
    fuelType: "Gasoline",
    tag: "Premium",
    featured: false,
  },
];

interface CarFeaturedVehiclesProps {
  onSelect?: (carName: string) => void;
}

const CarFeaturedVehicles = ({ onSelect }: CarFeaturedVehiclesProps) => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Featured Fleet
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Premium <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">Vehicles</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Drive the best with our hand-picked premium selection
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredVehicles.map((vehicle, index) => (
            <Card
              key={vehicle.id}
              className={cn(
                "glass-card overflow-hidden group cursor-pointer transition-all duration-200 touch-manipulation active:scale-[0.98]",
                "hover:border-violet-500/50 hover:-translate-y-1",
                vehicle.featured && "lg:col-span-2"
              )}
              onClick={() => onSelect?.(`${vehicle.make} ${vehicle.model}`)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0 h-full flex flex-col">
                <div className={cn(
                  "relative bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center",
                  vehicle.featured ? "h-48" : "h-40"
                )}>
                  {(() => {
                    const iconMap: Record<string, typeof Car> = { car: Car, crown: Crown, truck: Truck, zap: Zap, "car-front": CarFront };
                    const IconComp = iconMap[vehicle.image] || Car;
                    return (
                      <div className={cn("rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center transition-transform group-hover:scale-110", vehicle.featured ? "w-24 h-24" : "w-16 h-16")}>
                        <IconComp className={cn("text-violet-300", vehicle.featured ? "w-12 h-12" : "w-8 h-8")} />
                      </div>
                    );
                  })()}
                  <Badge className="absolute top-3 left-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                    {vehicle.tag}
                  </Badge>
                  <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-all duration-200">
                    <Heart className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                  </button>
                  {vehicle.originalPrice && (
                    <Badge className="absolute bottom-3 right-3 bg-red-500 text-white">
                      ${vehicle.originalPrice - vehicle.pricePerDay} OFF
                    </Badge>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-violet-400 text-violet-400" />
                    <span className="font-bold text-sm">{vehicle.rating}</span>
                    <span className="text-xs text-muted-foreground">({vehicle.reviews} reviews)</span>
                  </div>
                  <h3 className="font-display font-bold text-lg group-hover:text-violet-400 transition-all duration-200">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{vehicle.year} • {vehicle.category}</p>

                  <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {vehicle.seats}
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings2 className="w-3 h-3" /> {vehicle.transmission}
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3 h-3" /> {vehicle.fuelType}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-violet-400">${vehicle.pricePerDay}</span>
                      <span className="text-xs text-muted-foreground">/day</span>
                    </div>
                    <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white">
                      Rent <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarFeaturedVehicles;
