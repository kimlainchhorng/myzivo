import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Car, 
  Star, 
  MapPin, 
  Users,
  Fuel,
  Settings2,
  Heart,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Shield,
  Snowflake,
  Radio,
  Gauge,
  Calendar,
  Zap,
  Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CarResult {
  id: number;
  make: string;
  model: string;
  year: number;
  category: string;
  image: string;
  pricePerDay: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  seats: number;
  transmission: string;
  fuelType: string;
  features: string[];
  location: string;
  mileage: string;
  deposit: number;
  isElectric?: boolean;
  instantBook?: boolean;
}

interface CarSearchProps {
  onSelectCar?: (car: CarResult) => void;
  showFilters?: boolean;
}

const CarSearch = ({ onSelectCar, showFilters = true }: CarSearchProps) => {
  const [sortBy, setSortBy] = useState<"recommended" | "price" | "rating">("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [instantBookOnly, setInstantBookOnly] = useState(false);
  const [electricOnly, setElectricOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [hoveredCar, setHoveredCar] = useState<number | null>(null);

  const [searchResults] = useState<CarResult[]>([
    {
      id: 1,
      make: "Toyota",
      model: "Camry",
      year: 2024,
      category: "Sedan",
      image: "🚗",
      pricePerDay: 45,
      originalPrice: 59,
      rating: 4.8,
      reviews: 324,
      seats: 5,
      transmission: "Automatic",
      fuelType: "Hybrid",
      features: ["ac", "bluetooth", "gps", "usb"],
      location: "LAX Airport",
      mileage: "Unlimited",
      deposit: 200,
      instantBook: true,
    },
    {
      id: 2,
      make: "Tesla",
      model: "Model 3",
      year: 2024,
      category: "Electric",
      image: "⚡",
      pricePerDay: 89,
      rating: 4.9,
      reviews: 256,
      seats: 5,
      transmission: "Automatic",
      fuelType: "Electric",
      features: ["ac", "bluetooth", "gps", "autopilot"],
      location: "Downtown LA",
      mileage: "Unlimited",
      deposit: 300,
      isElectric: true,
      instantBook: true,
    },
    {
      id: 3,
      make: "BMW",
      model: "3 Series",
      year: 2024,
      category: "Luxury",
      image: "🏎️",
      pricePerDay: 120,
      originalPrice: 150,
      rating: 4.9,
      reviews: 189,
      seats: 5,
      transmission: "Automatic",
      fuelType: "Gasoline",
      features: ["ac", "bluetooth", "gps", "leather", "sunroof"],
      location: "Beverly Hills",
      mileage: "200 mi/day",
      deposit: 500,
    },
    {
      id: 4,
      make: "Jeep",
      model: "Wrangler",
      year: 2024,
      category: "SUV",
      image: "🚙",
      pricePerDay: 85,
      rating: 4.7,
      reviews: 142,
      seats: 5,
      transmission: "Automatic",
      fuelType: "Gasoline",
      features: ["ac", "bluetooth", "4wd"],
      location: "Santa Monica",
      mileage: "150 mi/day",
      deposit: 400,
      instantBook: true,
    },
  ]);

  const categories = ["Sedan", "SUV", "Luxury", "Electric", "Compact", "Van"];

  const filteredResults = searchResults
    .filter(car => {
      if (car.pricePerDay < priceRange[0] || car.pricePerDay > priceRange[1]) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(car.category)) return false;
      if (instantBookOnly && !car.instantBook) return false;
      if (electricOnly && !car.isElectric) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price": return a.pricePerDay - b.pricePerDay;
        case "rating": return b.rating - a.rating;
        default: return 0;
      }
    });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "ac": return <Snowflake className="w-3 h-3" />;
      case "bluetooth": return <Radio className="w-3 h-3" />;
      case "gps": return <MapPin className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Sort & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display">Available Cars</h2>
          <p className="text-muted-foreground text-sm">{filteredResults.length} vehicles found</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Quick Sort Pills */}
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg">
            {[
              { key: "recommended", label: "Best Match", icon: Sparkles },
              { key: "price", label: "Lowest", icon: TrendingUp },
              { key: "rating", label: "Top Rated", icon: Star },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSortBy(key as typeof sortBy)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all touch-manipulation active:scale-95",
                  sortBy === key 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {showFilters && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                "touch-manipulation active:scale-95 transition-all",
                filtersOpen && "border-primary bg-primary/10"
              )}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {(instantBookOnly || electricOnly || selectedCategories.length > 0) && (
                <Badge className="ml-2 bg-primary text-primary-foreground text-xs px-1.5">
                  {(instantBookOnly ? 1 : 0) + (electricOnly ? 1 : 0) + selectedCategories.length}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible Filters */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          filtersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <Card className="glass-card">
            <CardContent className="p-4 sm:p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Price per Day</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={200}
                    step={5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quick Filters</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                      <span className="text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Instant Book
                      </span>
                      <Switch 
                        checked={instantBookOnly} 
                        onCheckedChange={setInstantBookOnly}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                      <span className="text-sm flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-500" />
                        Electric Only
                      </span>
                      <Switch 
                        checked={electricOnly} 
                        onCheckedChange={setElectricOnly}
                      />
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-3 sm:col-span-2">
                  <Label className="text-sm font-medium">Vehicle Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all touch-manipulation active:scale-95",
                          selectedCategories.includes(category)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(instantBookOnly || electricOnly || selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 200) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-primary"
                  onClick={() => {
                    setInstantBookOnly(false);
                    setElectricOnly(false);
                    setSelectedCategories([]);
                    setPriceRange([0, 200]);
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Car Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResults.map((car, index) => (
          <div
            key={car.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
            onMouseEnter={() => setHoveredCar(car.id)}
            onMouseLeave={() => setHoveredCar(null)}
          >
            <Card className={cn(
              "glass-card overflow-hidden transition-all duration-200 h-full touch-manipulation",
              hoveredCar === car.id && "border-primary/50 shadow-lg shadow-primary/10 -translate-y-1"
            )}>
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative h-44 bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                  <span 
                    className={cn(
                      "text-7xl transition-transform duration-200",
                      hoveredCar === car.id && "scale-110 translate-x-1"
                    )}
                  >
                    {car.image}
                  </span>
                  
                  <button
                    onClick={() => toggleFavorite(car.id)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors active:scale-90"
                  >
                    <Heart className={cn(
                      "w-5 h-5 transition-colors",
                      favorites.includes(car.id) 
                        ? "fill-red-500 text-red-500" 
                        : "text-muted-foreground"
                    )} />
                  </button>
                  
                  {car.originalPrice && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                      {Math.round((1 - car.pricePerDay / car.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                  
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                    <Badge className="bg-background/90 backdrop-blur-sm text-foreground">
                      {car.category}
                    </Badge>
                    {car.instantBook && (
                      <Badge className="bg-primary/90 text-primary-foreground">
                        <Zap className="w-3 h-3 mr-1" />
                        Instant
                      </Badge>
                    )}
                    {car.isElectric && (
                      <Badge className="bg-green-500/90 text-white">
                        <Leaf className="w-3 h-3 mr-1" />
                        EV
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display font-bold text-lg">
                        {car.make} {car.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">{car.year}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span className="text-sm font-medium">{car.rating}</span>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{car.seats} seats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>{car.transmission}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5" />
                      <span>{car.fuelType}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {car.features.slice(0, 4).map((feature) => (
                      <div
                        key={feature}
                        className="w-7 h-7 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground"
                        title={feature}
                      >
                        {getFeatureIcon(feature)}
                      </div>
                    ))}
                  </div>

                  {/* Location & Mileage */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{car.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5" />
                      <span>{car.mileage}</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      {car.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          ${car.originalPrice}/day
                        </p>
                      )}
                      <p className="text-xl font-bold text-primary">${car.pricePerDay}<span className="text-xs text-muted-foreground font-normal">/day</span></p>
                    </div>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground touch-manipulation active:scale-95"
                      onClick={() => onSelectCar?.(car)}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResults.length === 0 && (
        <div className="text-center py-16 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce"><Car className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
          <Button
            variant="outline"
            onClick={() => {
              setInstantBookOnly(false);
              setElectricOnly(false);
              setSelectedCategories([]);
              setPriceRange([0, 200]);
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default CarSearch;
