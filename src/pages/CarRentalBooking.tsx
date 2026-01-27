import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Shield,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingSummaryCard, CheckoutModal, BookingConfirmation } from "@/components/booking";
import { toast } from "sonner";

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

type BookingStep = "search" | "select" | "details" | "confirmation";

const CarRentalBooking = () => {
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [carType, setCarType] = useState("all");
  const [searchResults, setSearchResults] = useState<typeof sampleCars | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedCar, setSelectedCar] = useState<typeof sampleCars[0] | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>("search");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");

  const handleSearch = () => {
    setSearchResults(sampleCars);
    setBookingStep("select");
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSelectCar = (car: typeof sampleCars[0]) => {
    setSelectedCar(car);
    setBookingStep("details");
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsCheckoutOpen(false);
    setConfirmationNumber(`CAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setBookingStep("confirmation");
  };

  const handleReset = () => {
    setSearchResults(null);
    setSelectedCar(null);
    setBookingStep("search");
    navigate("/rent-car");
  };

  const days = pickupDate && returnDate ? differenceInDays(returnDate, pickupDate) : 1;
  const rentalCost = selectedCar ? selectedCar.pricePerDay * days : 0;
  const insurance = rentalCost * 0.15;
  const grandTotal = rentalCost + insurance;

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "ac": return <Snowflake className="w-3 h-3" />;
      case "bluetooth": return <Radio className="w-3 h-3" />;
      case "gps": return <MapPin className="w-3 h-3" />;
      default: return null;
    }
  };

  // Show confirmation screen
  if (bookingStep === "confirmation" && selectedCar) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BookingConfirmation
          confirmationNumber={confirmationNumber}
          title="Your car is reserved!"
          subtitle={`${selectedCar.make} ${selectedCar.model} ${selectedCar.year}`}
          details={[
            { label: "Pickup", value: pickupDate ? format(pickupDate, "MMM d, yyyy") : "Selected date", icon: <CalendarIcon className="w-4 h-4" /> },
            { label: "Return", value: returnDate ? format(returnDate, "MMM d, yyyy") : "Selected date", icon: <CalendarIcon className="w-4 h-4" /> },
            { label: "Location", value: selectedCar.location, icon: <MapPin className="w-4 h-4" /> },
            { label: "Duration", value: `${days} day${days > 1 ? 's' : ''}`, icon: <Key className="w-4 h-4" /> },
          ]}
          totalAmount={grandTotal}
          onGoHome={handleReset}
          accentColor="rides"
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-24">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-rides/15 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-violet-500/20 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-rides/15 to-cyan-500/10 rounded-full blur-3xl" />
          
          {/* Floating emojis */}
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-32 left-[8%] text-5xl hidden lg:block opacity-50"
          >
            🚗
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute bottom-40 right-[10%] text-4xl hidden lg:block opacity-40"
          >
            🛣️
          </motion.div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold mb-6 shadow-xl shadow-violet-500/40"
              >
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Car className="w-4 h-4" />
                </motion.div>
                ZIVO Car Rental
              </motion.div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">
                Drive your way
                <br />
                <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">anywhere you go</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                From compact city cars to <span className="text-foreground font-medium">luxury SUVs</span>. Pick up and drop off at your convenience.
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
                            <Button
                              className="bg-rides hover:bg-rides/90 text-white"
                              onClick={() => handleSelectCar(car)}
                            >
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

      {/* Selected Car Summary */}
      <AnimatePresence>
        {selectedCar && bookingStep === "details" && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-24 md:right-6 md:left-auto md:w-80 z-50"
          >
            <BookingSummaryCard
              title={`${selectedCar.make} ${selectedCar.model}`}
              subtitle={selectedCar.location}
              icon={<Car className="w-5 h-5" />}
              items={[
                { label: `${days} day${days > 1 ? 's' : ''} rental`, amount: rentalCost },
                { label: "Insurance", amount: insurance },
                { label: "Total", amount: grandTotal, isTotal: true },
              ]}
              ctaLabel={`Reserve for $${grandTotal.toFixed(0)}`}
              onConfirm={() => setIsCheckoutOpen(true)}
              accentColor="rides"
              features={["Free Cancellation", selectedCar.mileage]}
            />
            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={() => {
                setSelectedCar(null);
                setBookingStep("select");
              }}
            >
              Choose Different Car
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        amount={grandTotal}
        serviceName={`${selectedCar?.make} ${selectedCar?.model}`}
        serviceDetails={`${days} day${days > 1 ? 's' : ''} • ${selectedCar?.location}`}
        onConfirm={handleConfirmBooking}
        isProcessing={isProcessing}
        accentColor="rides"
      />

      <Footer />
    </div>
  );
};

export default CarRentalBooking;
