import { Car, Image, Fuel, MapPin, Star, ChevronLeft, ChevronRight, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const vehicles = [
  {
    id: 1,
    name: "Tesla Model 3",
    category: "Electric",
    images: ["front", "battery", "interior"],
    price: 89,
    rating: 4.9,
    reviews: 1240,
    features: ["Autopilot", "Long Range", "Fast Charging"],
    specs: {
      range: "358 mi",
      acceleration: "3.1s 0-60",
      seats: 5,
    },
    tag: "Eco-Friendly",
    available: true,
  },
  {
    id: 2,
    name: "BMW M4",
    category: "Sports",
    images: ["front", "engine", "exhaust"],
    price: 149,
    rating: 4.8,
    reviews: 892,
    features: ["503 HP", "M Performance", "Carbon Package"],
    specs: {
      range: "Unlimited",
      acceleration: "3.8s 0-60",
      seats: 4,
    },
    tag: "Performance",
    available: true,
  },
  {
    id: 3,
    name: "Range Rover Sport",
    category: "Luxury SUV",
    images: ["front", "terrain", "interior"],
    price: 199,
    rating: 4.9,
    reviews: 756,
    features: ["Terrain Response", "Meridian Audio", "Panoramic Roof"],
    specs: {
      range: "Unlimited",
      acceleration: "4.3s 0-60",
      seats: 7,
    },
    tag: "Luxury",
    available: true,
  },
];

const CarVehicleGallery = () => {
  const [activeVehicle, setActiveVehicle] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  const vehicle = vehicles[activeVehicle];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
              <Car className="w-4 h-4" />
              Featured Vehicles
            </span>
            <h2 className="text-2xl md:text-4xl font-display font-bold mb-3">
              Premium <span className="text-primary">Fleet Gallery</span>
            </h2>
            <p className="text-muted-foreground">
              Explore our collection of premium vehicles in detail
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-emerald-500/20 aspect-[4/3] mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="w-24 h-24 text-primary/40" />
                </div>

                {/* Navigation Arrows */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 active:scale-[0.90] transition-all duration-200 touch-manipulation"
                  onClick={() => setActiveImage((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length)}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 active:scale-[0.90] transition-all duration-200 touch-manipulation"
                  onClick={() => setActiveImage((prev) => (prev + 1) % vehicle.images.length)}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </Button>

                {/* Tag */}
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {vehicle.tag}
                </span>

                {/* Category */}
                <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-sm">
                  {vehicle.category}
                </span>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-3">
                {vehicle.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-1 aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center text-4xl border-2 transition-all duration-200 active:scale-[0.95] touch-manipulation ${
                      activeImage === index ? "border-primary shadow-md" : "border-transparent opacity-60"
                    }`}
                  >
                    {img}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="flex flex-col">
              {/* Vehicle Selector */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {vehicles.map((v, index) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setActiveVehicle(index);
                      setActiveImage(0);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.95] touch-manipulation ${
                      activeVehicle === index
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>

              {/* Info Card */}
              <div className="flex-1 p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{vehicle.name}</h3>
                    <p className="text-muted-foreground">{vehicle.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${vehicle.price}</div>
                    <div className="text-sm text-muted-foreground">per day</div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-amber-400 fill-current" />
                    <span className="font-semibold">{vehicle.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({vehicle.reviews} reviews)</span>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-sm font-medium">{vehicle.specs.acceleration}</div>
                    <div className="text-xs text-muted-foreground">Acceleration</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <Fuel className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-sm font-medium">{vehicle.specs.range}</div>
                    <div className="text-xs text-muted-foreground">Range</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <Car className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-sm font-medium">{vehicle.specs.seats} Seats</div>
                    <div className="text-xs text-muted-foreground">Capacity</div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {vehicle.features.map((feature, index) => (
                    <span key={index} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                      {feature}
                    </span>
                  ))}
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                  Reserve This Vehicle
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarVehicleGallery;
