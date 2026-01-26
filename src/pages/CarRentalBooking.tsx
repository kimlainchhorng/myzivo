import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Car,
  Search,
  CalendarIcon,
  MapPin,
  Star,
  Users,
  Fuel,
  Settings2,
  Heart,
  ChevronRight,
  Snowflake,
  Radio,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Popular locations
const popularLocations = [
  { city: "Los Angeles", state: "California", image: "🌴", cars: 450, avgPrice: 45 },
  { city: "Miami", state: "Florida", image: "🏖️", cars: 380, avgPrice: 42 },
  { city: "New York", state: "New York", image: "🗽", cars: 520, avgPrice: 55 },
  { city: "Las Vegas", state: "Nevada", image: "🎰", cars: 290, avgPrice: 38 },
  { city: "San Francisco", state: "California", image: "🌉", cars: 340, avgPrice: 52 },
  { city: "Orlando", state: "Florida", image: "🎢", cars: 410, avgPrice: 35 },
];

// Car categories
const carCategories = [
  { name: "Economy", icon: "🚗", description: "Budget-friendly", avgPrice: 29 },
  { name: "Compact", icon: "🚙", description: "City driving", avgPrice: 35 },
  { name: "SUV", icon: "🚐", description: "Family trips", avgPrice: 55 },
  { name: "Luxury", icon: "🏎️", description: "Premium experience", avgPrice: 120 },
  { name: "Van", icon: "🚌", description: "Group travel", avgPrice: 75 },
  { name: "Convertible", icon: "🚗", description: "Open-top fun", avgPrice: 85 },
];

// Sample cars
const sampleCars = [
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
  },
  {
    id: 2,
    make: "Honda",
    model: "CR-V",
    year: 2024,
    category: "SUV",
    image: "🚙",
    pricePerDay: 65,
    originalPrice: 79,
    rating: 4.9,
    reviews: 256,
    seats: 5,
    transmission: "Automatic",
    fuelType: "Gasoline",
    features: ["ac", "bluetooth", "gps", "usb", "backup_camera"],
    location: "LAX Airport",
    mileage: "Unlimited",
    deposit: 250,
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
    features: ["ac", "bluetooth", "gps", "usb", "leather", "sunroof"],
    location: "Downtown LA",
    mileage: "200 mi/day",
    deposit: 500,
  },
  {
    id: 4,
    make: "Ford",
    model: "Mustang Convertible",
    year: 2024,
    category: "Convertible",
    image: "🚗",
    pricePerDay: 95,
    originalPrice: null,
    rating: 4.7,
    reviews: 142,
    seats: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    features: ["ac", "bluetooth", "usb"],
    location: "Santa Monica",
    mileage: "150 mi/day",
    deposit: 400,
  },
  {
    id: 5,
    make: "Chrysler",
    model: "Pacifica",
    year: 2024,
    category: "Minivan",
    image: "🚐",
    pricePerDay: 75,
    originalPrice: 89,
    rating: 4.6,
    reviews: 98,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Hybrid",
    features: ["ac", "bluetooth", "gps", "usb", "entertainment"],
    location: "LAX Airport",
    mileage: "Unlimited",
    deposit: 300,
  },
];

const CarRentalBooking = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [carType, setCarType] = useState("all");
  const [searchResults, setSearchResults] = useState<typeof sampleCars | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const handleSearch = () => {
    setSearchResults(sampleCars);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const days = pickupDate && returnDate ? differenceInDays(returnDate, pickupDate) : 1;

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "ac": return <Snowflake className="w-3 h-3" />;
      case "bluetooth": return <Radio className="w-3 h-3" />;
      case "gps": return <MapPin className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-24">
        {/* Hero Section */}
        <section className="relative py-12 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-rides/10 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rides/20 text-rides text-sm font-medium mb-6">
                <Car className="w-4 h-4" />
                ZIVO Car Rental
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Drive your way
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rides to-cyan-400">anywhere you go</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From compact city cars to luxury SUVs. Pick up and drop off at your convenience.
              </p>
            </motion.div>

            {/* Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-5xl mx-auto"
            >
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Pickup Location */}
                    <div className="lg:col-span-2">
                      <label className="text-sm text-muted-foreground mb-1 block">Pickup Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rides" />
                        <Input
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="City, airport, or address"
                          className="h-12 pl-10 bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Pickup Date */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Pickup Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-start bg-background/50">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {pickupDate ? format(pickupDate, "MMM d") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={pickupDate}
                            onSelect={setPickupDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Return Date */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Return Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-start bg-background/50">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {returnDate ? format(returnDate, "MMM d") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={returnDate}
                            onSelect={setReturnDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center mt-4">
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-sm text-muted-foreground mb-1 block">Car Type</label>
                      <Select value={carType} onValueChange={setCarType}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <Car className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="economy">Economy</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="luxury">Luxury</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleSearch}
                      className="h-12 px-8 bg-rides hover:bg-rides/90 text-white mt-auto"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Cars
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Search Results */}
        {searchResults && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">
                  {searchResults.length} cars available
                </h2>
                <Select defaultValue="recommended">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card hover:border-rides/50 transition-all overflow-hidden h-full">
                      <CardContent className="p-0">
                        {/* Image */}
                        <div className="relative h-48 bg-gradient-to-br from-rides/20 to-cyan-500/20 flex items-center justify-center">
                          <span className="text-7xl">{car.image}</span>
                          <button
                            onClick={() => toggleFavorite(car.id)}
                            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
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
                          <Badge className="absolute bottom-3 left-3 bg-background/80 text-foreground">
                            {car.category}
                          </Badge>
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
                            <div className="flex items-center gap-1 bg-rides/20 px-2 py-1 rounded">
                              <Star className="w-3 h-3 fill-rides text-rides" />
                              <span className="text-sm font-medium">{car.rating}</span>
                            </div>
                          </div>

                          {/* Specs */}
                          <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {car.seats} seats
                            </div>
                            <div className="flex items-center gap-1">
                              <Settings2 className="w-4 h-4" />
                              {car.transmission}
                            </div>
                            <div className="flex items-center gap-1">
                              <Fuel className="w-4 h-4" />
                              {car.fuelType}
                            </div>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {car.features.slice(0, 4).map((feature) => (
                              <div
                                key={feature}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs text-muted-foreground"
                              >
                                {getFeatureIcon(feature)}
                                <span className="capitalize">{feature.replace("_", " ")}</span>
                              </div>
                            ))}
                          </div>

                          {/* Location & Mileage */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {car.location}
                            </span>
                            <span>{car.mileage}</span>
                          </div>

                          {/* Price & Book */}
                          <div className="flex items-end justify-between">
                            <div>
                              {car.originalPrice && (
                                <p className="text-sm text-muted-foreground line-through">
                                  ${car.originalPrice}/day
                                </p>
                              )}
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-rides">
                                  ${car.pricePerDay}
                                </span>
                                <span className="text-muted-foreground">/day</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                ${car.pricePerDay * days} total for {days} day{days > 1 ? "s" : ""}
                              </p>
                            </div>
                            <Button className="bg-rides hover:bg-rides/90 text-white">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Car Categories */}
        {!searchResults && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl font-bold mb-6">Browse by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {carCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card hover:border-rides/50 transition-all cursor-pointer group">
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                          {category.icon}
                        </div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-xs text-muted-foreground mb-1">{category.description}</p>
                        <p className="text-sm font-medium text-rides">From ${category.avgPrice}/day</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popular Locations */}
        {!searchResults && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">Popular Pickup Locations</h2>
                <Button variant="ghost" className="text-rides">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularLocations.map((location, index) => (
                  <motion.div
                    key={location.city}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setPickupLocation(location.city)}
                    className="cursor-pointer"
                  >
                    <Card className="glass-card hover:border-rides/50 transition-all group overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative h-32 bg-gradient-to-br from-rides/20 to-cyan-500/20 flex items-center justify-center">
                          <span className="text-5xl group-hover:scale-110 transition-transform">
                            {location.image}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-display font-semibold text-lg">{location.city}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{location.state}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{location.cars} cars</span>
                            <span className="font-bold text-rides">From ${location.avgPrice}/day</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Rent With Us */}
        {!searchResults && (
          <section className="py-12 border-t border-border/50">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-xl font-bold mb-8 text-center">Why Rent With ZIVO</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: "💰", title: "Best Price Guarantee", desc: "No hidden fees, ever" },
                  { icon: "🔒", title: "Free Cancellation", desc: "Cancel up to 48h before" },
                  { icon: "🛡️", title: "Full Insurance", desc: "Drive with peace of mind" },
                  { icon: "🎧", title: "24/7 Roadside Help", desc: "We're always here for you" },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CarRentalBooking;
