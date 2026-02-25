import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Hotel, 
  Star, 
  MapPin, 
  Users,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  Utensils,
  Heart,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Shield,
  Coffee,
  Snowflake,
  PawPrint,
  Accessibility
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HotelResult {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  stars: number;
  price: number;
  originalPrice?: number;
  amenities: string[];
  image: string;
  freeCancellation?: boolean;
  breakfast?: boolean;
  isBestValue?: boolean;
  isPopular?: boolean;
}

interface HotelSearchProps {
  onSelectHotel?: (hotel: HotelResult) => void;
  showFilters?: boolean;
}

const HotelSearch = ({ onSelectHotel, showFilters = true }: HotelSearchProps) => {
  const [sortBy, setSortBy] = useState<"recommended" | "price" | "rating">("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minStars, setMinStars] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [freeCancellationOnly, setFreeCancellationOnly] = useState(false);
  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [hoveredHotel, setHoveredHotel] = useState<number | null>(null);

  const [searchResults] = useState<HotelResult[]>([
    { 
      id: 1, 
      name: "The Grand Plaza Hotel", 
      location: "Manhattan, New York",
      rating: 4.9, 
      reviews: 2340, 
      stars: 5,
      price: 299,
      originalPrice: 399,
      amenities: ["wifi", "pool", "gym", "restaurant", "parking"],
      image: "🏨",
      freeCancellation: true,
      breakfast: true,
      isBestValue: true
    },
    { 
      id: 2, 
      name: "Skyline Suites", 
      location: "Times Square, New York",
      rating: 4.7, 
      reviews: 1890, 
      stars: 4,
      price: 219,
      originalPrice: 279,
      amenities: ["wifi", "gym", "restaurant"],
      image: "🌆",
      freeCancellation: true,
      breakfast: false,
      isPopular: true
    },
    { 
      id: 3, 
      name: "Central Park Inn", 
      location: "Upper West Side, New York",
      rating: 4.8, 
      reviews: 1560, 
      stars: 4,
      price: 249,
      amenities: ["wifi", "pool", "restaurant", "parking"],
      image: "🌳",
      freeCancellation: false,
      breakfast: true
    },
    { 
      id: 4, 
      name: "Boutique Hotel Brooklyn", 
      location: "Brooklyn, New York",
      rating: 4.6, 
      reviews: 980, 
      stars: 3,
      price: 159,
      amenities: ["wifi", "restaurant"],
      image: "🏘️",
      freeCancellation: true,
      breakfast: false
    },
  ]);

  const amenityOptions = [
    { id: "wifi", label: "WiFi", icon: Wifi },
    { id: "pool", label: "Pool", icon: Waves },
    { id: "gym", label: "Gym", icon: Dumbbell },
    { id: "restaurant", label: "Restaurant", icon: Utensils },
    { id: "parking", label: "Parking", icon: Car },
    { id: "ac", label: "A/C", icon: Snowflake },
    { id: "pets", label: "Pet Friendly", icon: PawPrint },
    { id: "accessible", label: "Accessible", icon: Accessibility },
  ];

  const filteredResults = searchResults
    .filter(hotel => {
      if (hotel.price < priceRange[0] || hotel.price > priceRange[1]) return false;
      if (minStars > 0 && hotel.stars < minStars) return false;
      if (freeCancellationOnly && !hotel.freeCancellation) return false;
      if (breakfastIncluded && !hotel.breakfast) return false;
      if (selectedAmenities.length > 0 && !selectedAmenities.every(a => hotel.amenities.includes(a))) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price": return a.price - b.price;
        case "rating": return b.rating - a.rating;
        default: return 0;
      }
    });

  const getAmenityIcon = (amenity: string) => {
    const found = amenityOptions.find(a => a.id === amenity);
    if (found) {
      const Icon = found.icon;
      return <Icon className="w-3.5 h-3.5" />;
    }
    return null;
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header with Sort & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display">Available Hotels</h2>
          <p className="text-muted-foreground text-sm">{filteredResults.length} properties found</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Quick Sort Pills */}
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl">
            {[
              { key: "recommended", label: "Best Match", icon: Sparkles },
              { key: "price", label: "Lowest Price", icon: TrendingUp },
              { key: "rating", label: "Top Rated", icon: Star },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSortBy(key as typeof sortBy)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  sortBy === key 
                    ? "bg-amber-500 text-white shadow-sm" 
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
              className={cn(filtersOpen && "border-amber-500 bg-amber-500/10")}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {(freeCancellationOnly || breakfastIncluded || selectedAmenities.length > 0 || minStars > 0) && (
                <Badge className="ml-2 bg-amber-500 text-white text-xs px-1.5">
                  {(freeCancellationOnly ? 1 : 0) + (breakfastIncluded ? 1 : 0) + selectedAmenities.length + (minStars > 0 ? 1 : 0)}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible Filters */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Price per Night</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={500}
                      step={10}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}+</span>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Minimum Stars</Label>
                    <div className="flex gap-2">
                      {[0, 3, 4, 5].map(stars => (
                        <button
                          key={stars}
                          onClick={() => setMinStars(stars)}
                          className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                            minStars === stars
                              ? "bg-amber-500 text-white"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          )}
                        >
                          {stars === 0 ? "Any" : (
                            <>
                              {stars}
                              <Star className="w-3 h-3 fill-current" />
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Quick Filters</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-xl">
                        <span className="text-sm flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          Free cancellation
                        </span>
                        <Switch 
                          checked={freeCancellationOnly} 
                          onCheckedChange={setFreeCancellationOnly}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-xl">
                        <span className="text-sm flex items-center gap-2">
                          <Coffee className="w-4 h-4 text-amber-500" />
                          Breakfast included
                        </span>
                        <Switch 
                          checked={breakfastIncluded} 
                          onCheckedChange={setBreakfastIncluded}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Amenities</Label>
                    <div className="flex flex-wrap gap-2">
                      {amenityOptions.slice(0, 6).map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => toggleAmenity(id)}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all",
                            selectedAmenities.includes(id)
                              ? "bg-amber-500 text-white"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {(freeCancellationOnly || breakfastIncluded || selectedAmenities.length > 0 || minStars > 0 || priceRange[0] > 0 || priceRange[1] < 500) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 text-amber-500"
                    onClick={() => {
                      setFreeCancellationOnly(false);
                      setBreakfastIncluded(false);
                      setSelectedAmenities([]);
                      setMinStars(0);
                      setPriceRange([0, 500]);
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hotel Results */}
      <div className="space-y-4">
        {filteredResults.map((hotel, index) => (
          <motion.div
            key={hotel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredHotel(hotel.id)}
            onMouseLeave={() => setHoveredHotel(null)}
          >
            <Card className={cn(
              "glass-card overflow-hidden transition-all duration-300",
              hoveredHotel === hotel.id && "border-amber-500/50 shadow-lg shadow-amber-500/10"
            )}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative md:w-56 h-48 md:h-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <motion.span 
                      className="text-6xl"
                      animate={{ scale: hoveredHotel === hotel.id ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {hotel.image}
                    </motion.span>
                    <button
                      onClick={() => toggleFavorite(hotel.id)}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-all duration-200 active:scale-[0.90] touch-manipulation"
                    >
                      <Heart className={cn(
                        "w-5 h-5 transition-all duration-200",
                        favorites.includes(hotel.id) 
                          ? "fill-red-500 text-red-500" 
                          : "text-muted-foreground"
                      )} />
                    </button>
                    {hotel.originalPrice && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                        {Math.round((1 - hotel.price / hotel.originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                    {hotel.isBestValue && (
                      <Badge className="absolute bottom-3 left-3 bg-green-500 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Best Value
                      </Badge>
                    )}
                    {hotel.isPopular && (
                      <Badge className="absolute bottom-3 left-3 bg-amber-500 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Stars & Name */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">{renderStars(hotel.stars)}</div>
                          <span className="text-xs text-muted-foreground">{hotel.stars}-star</span>
                        </div>
                        <h3 className="font-display text-xl font-bold mb-1">{hotel.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                          <MapPin className="w-3.5 h-3.5" />
                          {hotel.location}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold">{hotel.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({hotel.reviews.toLocaleString()} reviews)
                          </span>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap items-center gap-2">
                          {hotel.amenities.slice(0, 5).map((amenity) => (
                            <div
                              key={amenity}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-full text-xs text-muted-foreground"
                            >
                              {getAmenityIcon(amenity)}
                              <span className="capitalize">{amenity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-3 mt-3 text-xs">
                          {hotel.freeCancellation && (
                            <span className="flex items-center gap-1 text-green-500">
                              <Shield className="w-3.5 h-3.5" />
                              Free cancellation
                            </span>
                          )}
                          {hotel.breakfast && (
                            <span className="flex items-center gap-1 text-amber-500">
                              <Coffee className="w-3.5 h-3.5" />
                              Breakfast included
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="lg:text-right lg:min-w-[140px]">
                        {hotel.originalPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            ${hotel.originalPrice}
                          </p>
                        )}
                        <p className="text-2xl font-bold text-amber-500">${hotel.price}</p>
                        <p className="text-xs text-muted-foreground mb-3">per night</p>
                        <Button 
                          className="w-full lg:w-auto bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => onSelectHotel?.(hotel)}
                        >
                          View Deal
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Hotel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hotels found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
          <Button 
            variant="outline"
            onClick={() => {
              setFreeCancellationOnly(false);
              setBreakfastIncluded(false);
              setSelectedAmenities([]);
              setMinStars(0);
              setPriceRange([0, 500]);
            }}
          >
            Clear all filters
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default HotelSearch;
