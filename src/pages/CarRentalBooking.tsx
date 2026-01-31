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
// CSS animations used instead of framer-motion for performance
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
import CarStatsBar from "@/components/car/CarStatsBar";
import CarPromoSection from "@/components/car/CarPromoSection";
import CarTestimonialsSection from "@/components/car/CarTestimonialsSection";
import CarTrustIndicators from "@/components/car/CarTrustIndicators";
import CarFeaturedVehicles from "@/components/car/CarFeaturedVehicles";
import CarCategoriesGrid from "@/components/car/CarCategoriesGrid";
import CarRentalBenefits from "@/components/car/CarRentalBenefits";
import CarPopularLocations from "@/components/car/CarPopularLocations";
import CarNewsletterSection from "@/components/car/CarNewsletterSection";
import CarFAQSection from "@/components/car/CarFAQSection";
import CarSavingsCalculator from "@/components/car/CarSavingsCalculator";
import CarMobileAppPromo from "@/components/car/CarMobileAppPromo";
import CarLoyaltyProgram from "@/components/car/CarLoyaltyProgram";
import CarCompareWidget from "@/components/car/CarCompareWidget";
import CarFlashDeals from "@/components/car/CarFlashDeals";
import CarSocialProof from "@/components/car/CarSocialProof";
import CarPriceGuarantee from "@/components/car/CarPriceGuarantee";
import CarInsuranceOptions from "@/components/car/CarInsuranceOptions";
import CarPickupTips from "@/components/car/CarPickupTips";
import CarDriverRequirements from "@/components/car/CarDriverRequirements";
import CarAccessoriesAddons from "@/components/car/CarAccessoriesAddons";
import CarRoadTripPlanner from "@/components/car/CarRoadTripPlanner";
import CarPopularRoutes from "@/components/car/CarPopularRoutes";
import CarSeasonalOffers from "@/components/car/CarSeasonalOffers";
import CarCustomerStories from "@/components/car/CarCustomerStories";
import CarQuickFilters from "@/components/car/CarQuickFilters";
import CarComparisonWidget from "@/components/car/CarComparisonWidget";
import CarLoyaltyRewards from "@/components/car/CarLoyaltyRewards";
import CarElectricVehicles from "@/components/car/CarElectricVehicles";
import CarGroupBooking from "@/components/car/CarGroupBooking";
import CarWeeklyDeals from "@/components/car/CarWeeklyDeals";
import LiveChatWidget from "@/components/shared/LiveChatWidget";
import PromoCodeBanner from "@/components/shared/PromoCodeBanner";
import CarUpgrades from "@/components/car/CarUpgrades";
import CarGPSAddons from "@/components/car/CarGPSAddons";
import CarFleetShowcase from "@/components/car/CarFleetShowcase";
import TravelBlog from "@/components/shared/TravelBlog";
import UserTestimonials from "@/components/shared/UserTestimonials";
import AppFeatures from "@/components/shared/AppFeatures";
import CarPickupMap from "@/components/car/CarPickupMap";
import CarFuelPolicy from "@/components/car/CarFuelPolicy";
import CarChildSeats from "@/components/car/CarChildSeats";
import CarRoadTrips from "@/components/car/CarRoadTrips";
import WeatherWidget from "@/components/shared/WeatherWidget";
import PackingList from "@/components/shared/PackingList";
import TripPlanner from "@/components/shared/TripPlanner";
import EmergencyContacts from "@/components/shared/EmergencyContacts";
import CurrencyConverter from "@/components/shared/CurrencyConverter";
import TimeZoneConverter from "@/components/shared/TimeZoneConverter";
import TravelInsuranceCompare from "@/components/shared/TravelInsuranceCompare";
import CarAccessibility from "@/components/car/CarAccessibility";
import CarSustainability from "@/components/car/CarSustainability";
import SocialProofTicker from "@/components/shared/SocialProofTicker";
import RewardsProgress from "@/components/shared/RewardsProgress";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

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
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <Header />
      
      <main className="pt-16 pb-20">
        {/* Hero Section - Mobile optimized */}
        <section className="relative py-8 sm:py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-violet-500/12 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-gradient-to-bl from-violet-500/18 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[150px] sm:w-[300px] h-[150px] sm:h-[300px] bg-gradient-to-tr from-rides/15 to-cyan-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-lg shadow-violet-500/30">
                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ZIVO Car Rental
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
                Drive your way
                <br />
                <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">anywhere you go</span>
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-4">
                From compact cars to luxury SUVs. Rent at your convenience.
              </p>
            </div>

            {/* Search Card */}
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-4 sm:p-6">
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
            </div>
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

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {searchResults.map((car, index) => (
                  <div
                    key={car.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="glass-card hover:border-rides/50 transition-all overflow-hidden h-full touch-manipulation active:scale-[0.98]">
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
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Stats Bar */}
        {!searchResults && <CarStatsBar />}

        {/* Car Categories */}
        {!searchResults && (
          <section className="py-8 sm:py-12">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Browse by Category</h2>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                {carCategories.map((category, index) => (
                  <div
                    key={category.name}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="glass-card hover:border-rides/50 transition-all cursor-pointer group touch-manipulation active:scale-[0.98]">
                      <CardContent className="p-2 sm:p-4 text-center">
                        <div className="text-2xl sm:text-4xl mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                          {category.icon}
                        </div>
                        <h3 className="font-semibold text-xs sm:text-base">{category.name}</h3>
                        <p className="text-[9px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 hidden sm:block">{category.description}</p>
                        <p className="text-[10px] sm:text-sm font-medium text-rides">${category.avgPrice}/day</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popular Locations */}
        {!searchResults && (
          <section className="py-8 sm:py-12">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold">Popular Pickup Locations</h2>
                <Button variant="ghost" className="text-rides text-sm sm:text-base">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {popularLocations.map((location, index) => (
                  <div
                    key={location.city}
                    onClick={() => setPickupLocation(location.city)}
                    className="cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <Card className="glass-card hover:border-rides/50 transition-all group overflow-hidden touch-manipulation active:scale-[0.98]">
                      <CardContent className="p-0">
                        <div className="relative h-24 sm:h-32 bg-gradient-to-br from-rides/20 to-cyan-500/20 flex items-center justify-center">
                          <span className="text-3xl sm:text-5xl group-hover:scale-110 transition-transform">
                            {location.image}
                          </span>
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="font-display font-semibold text-base sm:text-lg">{location.city}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{location.state}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-sm text-muted-foreground">{location.cars} cars</span>
                            <span className="font-bold text-rides text-xs sm:text-base">${location.avgPrice}/day</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Promo Section */}
        {!searchResults && (
          <CarPromoSection 
            onPromoClick={(code) => toast.success(`Promo code ${code} copied!`)}
          />
        )}

        {/* Featured Vehicles */}
        {!searchResults && (
          <CarFeaturedVehicles 
            onSelect={(name) => toast.info(`Viewing ${name}`)}
          />
        )}

        {/* Categories Grid */}
        {!searchResults && (
          <CarCategoriesGrid 
            onSelect={(category) => setCarType(category.toLowerCase())}
          />
        )}

        {/* Popular Locations */}
        {!searchResults && (
          <CarPopularLocations 
            onSelect={(city) => setPickupLocation(city)}
          />
        )}

        {/* Benefits Section */}
        {!searchResults && <CarRentalBenefits />}

        {/* Insurance Options */}
        {!searchResults && <CarInsuranceOptions />}

        {/* Driver Requirements */}
        {!searchResults && <CarDriverRequirements />}

        {/* Pickup Tips */}
        {!searchResults && <CarPickupTips />}

        {/* Car Upgrades */}
        {!searchResults && <CarUpgrades />}

        {/* GPS & Add-ons */}
        {!searchResults && <CarGPSAddons />}

        {/* Accessories & Add-ons */}
        {!searchResults && <CarAccessoriesAddons />}

        {/* Fleet Showcase */}
        {!searchResults && <CarFleetShowcase />}

        {/* Road Trip Planner */}
        {!searchResults && <CarRoadTripPlanner />}

        {/* Popular Routes */}
        {!searchResults && <CarPopularRoutes />}

        {/* Seasonal Offers */}
        {!searchResults && <CarSeasonalOffers />}

        {/* Electric Vehicles */}
        {!searchResults && <CarElectricVehicles />}

        {/* Group Booking */}
        {!searchResults && <CarGroupBooking />}

        {/* Weekly Deals */}
        {!searchResults && <CarWeeklyDeals />}

        {/* Loyalty Program */}
        {!searchResults && <CarLoyaltyProgram />}

        {/* Loyalty Rewards */}
        {!searchResults && <CarLoyaltyRewards />}

        {/* Flash Deals */}
        {!searchResults && <CarFlashDeals />}

        {/* Comparison Widget */}
        {!searchResults && <CarComparisonWidget />}

        {/* Compare Widget */}
        {!searchResults && <CarCompareWidget />}

        {/* Customer Stories */}
        {!searchResults && <CarCustomerStories />}

        {/* Social Proof */}
        {!searchResults && <CarSocialProof />}

        {/* Price Guarantee */}
        {!searchResults && <CarPriceGuarantee />}

        {/* Savings Calculator */}
        {!searchResults && <CarSavingsCalculator />}

        {/* Travel Blog */}
        {!searchResults && <TravelBlog />}

        {/* Pickup Map */}
        {!searchResults && <CarPickupMap />}

        {/* Fuel Policy */}
        {!searchResults && <CarFuelPolicy />}

        {/* Child Seats */}
        {!searchResults && <CarChildSeats />}

        {/* Road Trips */}
        {!searchResults && <CarRoadTrips />}

        {/* Currency Converter */}
        {!searchResults && <CurrencyConverter />}

        {/* Time Zone Converter */}
        {!searchResults && <TimeZoneConverter />}

        {/* Travel Insurance */}
        {!searchResults && <TravelInsuranceCompare />}

        {/* Weather Widget */}
        {!searchResults && <WeatherWidget />}

        {/* Trip Planner */}
        {!searchResults && <TripPlanner />}

        {/* Packing List */}
        {!searchResults && <PackingList />}

        {/* Emergency Contacts */}
        {!searchResults && <EmergencyContacts />}

        {/* App Features */}
        {!searchResults && <AppFeatures />}

        {/* Newsletter Section */}
        {!searchResults && <CarNewsletterSection />}

        {/* FAQ Section */}
        {!searchResults && <CarFAQSection />}

        {/* User Testimonials */}
        {!searchResults && <UserTestimonials />}

        {/* Mobile App Promo */}
        {!searchResults && <CarMobileAppPromo />}

        {/* Testimonials */}
        {!searchResults && <CarTestimonialsSection />}

        {/* Accessibility */}
        {!searchResults && <CarAccessibility />}

        {/* Sustainability */}
        {!searchResults && <CarSustainability />}

        {/* Rewards Progress */}
        {!searchResults && <RewardsProgress />}

        {/* Trust Indicators */}
        {!searchResults && <CarTrustIndicators />}

        {/* Live Chat Widget */}
        <LiveChatWidget />
        
        {/* Social Proof Ticker */}
        <SocialProofTicker />
        
        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </main>

      {/* Selected Car Summary */}
      {selectedCar && bookingStep === "details" && (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-24 md:right-6 md:left-auto md:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300">
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
        </div>
      )}

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
