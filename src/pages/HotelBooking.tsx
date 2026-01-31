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
  Hotel,
  Search,
  CalendarIcon,
  Users,
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  Utensils,
  Heart,
  ChevronRight,
  Bed
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
import HotelStatsBar from "@/components/hotel/HotelStatsBar";
import HotelPromoSection from "@/components/hotel/HotelPromoSection";
import HotelTestimonialsSection from "@/components/hotel/HotelTestimonialsSection";
import HotelTrustIndicators from "@/components/hotel/HotelTrustIndicators";
import HotelFeaturedProperties from "@/components/hotel/HotelFeaturedProperties";
import HotelAmenitiesShowcase from "@/components/hotel/HotelAmenitiesShowcase";
import HotelRewardsSection from "@/components/hotel/HotelRewardsSection";
import HotelPopularDestinations from "@/components/hotel/HotelPopularDestinations";
import HotelNewsletterSection from "@/components/hotel/HotelNewsletterSection";
import HotelFAQSection from "@/components/hotel/HotelFAQSection";
import HotelSavingsCalculator from "@/components/hotel/HotelSavingsCalculator";
import HotelMobileAppPromo from "@/components/hotel/HotelMobileAppPromo";
import HotelLoyaltyProgram from "@/components/hotel/HotelLoyaltyProgram";
import HotelCompareWidget from "@/components/hotel/HotelCompareWidget";
import HotelLastMinuteDeals from "@/components/hotel/HotelLastMinuteDeals";
import HotelSeasonalPromos from "@/components/hotel/HotelSeasonalPromos";
import HotelSocialProof from "@/components/hotel/HotelSocialProof";
import HotelPriceGuarantee from "@/components/hotel/HotelPriceGuarantee";
import HotelRoomTypesShowcase from "@/components/hotel/HotelRoomTypesShowcase";
import HotelGuestReviews from "@/components/hotel/HotelGuestReviews";
import HotelPropertyHighlights from "@/components/hotel/HotelPropertyHighlights";
import HotelBookingTips from "@/components/hotel/HotelBookingTips";
import HotelDestinationGuides from "@/components/hotel/HotelDestinationGuides";
import HotelPriceCalendar from "@/components/hotel/HotelPriceCalendar";
import HotelNearbyAttractions from "@/components/hotel/HotelNearbyAttractions";
import HotelAwardsShowcase from "@/components/hotel/HotelAwardsShowcase";
import HotelTestimonials from "@/components/hotel/HotelTestimonials";
import HotelComparisonTool from "@/components/hotel/HotelComparisonTool";
import HotelLoyaltyRewards from "@/components/hotel/HotelLoyaltyRewards";
import HotelPremiumAccess from "@/components/hotel/HotelPremiumAccess";
import HotelEventSpaces from "@/components/hotel/HotelEventSpaces";
import HotelDiningOptions from "@/components/hotel/HotelDiningOptions";
import HotelRoomTour from "@/components/hotel/HotelRoomTour";
import HotelConciergeServices from "@/components/hotel/HotelConciergeServices";
import HotelCheckInOut from "@/components/hotel/HotelCheckInOut";
import LiveChatWidget from "@/components/shared/LiveChatWidget";
import PromoCodeBanner from "@/components/shared/PromoCodeBanner";
import LocalExperiences from "@/components/shared/LocalExperiences";
import TravelBlog from "@/components/shared/TravelBlog";
import DestinationGuides from "@/components/shared/DestinationGuides";
import UserTestimonials from "@/components/shared/UserTestimonials";
import AppFeatures from "@/components/shared/AppFeatures";
import HotelNeighborhood from "@/components/hotel/HotelNeighborhood";
import HotelSustainability from "@/components/hotel/HotelSustainability";
import HotelPetFriendly from "@/components/hotel/HotelPetFriendly";
import HotelSpaServices from "@/components/hotel/HotelSpaServices";
import HotelLoyaltyCalculator from "@/components/hotel/HotelLoyaltyCalculator";
import HotelKidsAmenities from "@/components/hotel/HotelKidsAmenities";
import WeatherWidget from "@/components/shared/WeatherWidget";
import PackingList from "@/components/shared/PackingList";
import TripPlanner from "@/components/shared/TripPlanner";
import EmergencyContacts from "@/components/shared/EmergencyContacts";
import CurrencyConverter from "@/components/shared/CurrencyConverter";
import TimeZoneConverter from "@/components/shared/TimeZoneConverter";
import TravelInsuranceCompare from "@/components/shared/TravelInsuranceCompare";
import HotelAccessibility from "@/components/hotel/HotelAccessibility";
import HotelParking from "@/components/hotel/HotelParking";
import SocialProofTicker from "@/components/shared/SocialProofTicker";
import RewardsProgress from "@/components/shared/RewardsProgress";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import TripFlowConnector from "@/components/shared/TripFlowConnector";
import HotelToCarBridge from "@/components/shared/HotelToCarBridge";
import TravelInsuranceWidget from "@/components/shared/TravelInsuranceWidget";
import GroupBookingManager from "@/components/shared/GroupBookingManager";
import PriceAlertWidget from "@/components/shared/PriceAlertWidget";
import BookingFlowStepper, { flightHotelFlow } from "@/components/shared/BookingFlowStepper";
import TripOverviewCard from "@/components/shared/TripOverviewCard";
import CompanionInvite from "@/components/shared/CompanionInvite";
import ServiceRecommendations from "@/components/shared/ServiceRecommendations";
import CrossSellBanner from "@/components/shared/CrossSellBanner";
import SmartSuggestions from "@/components/shared/SmartSuggestions";
import ServiceFlowHub from "@/components/shared/ServiceFlowHub";
import TripChecklistWidget from "@/components/shared/TripChecklistWidget";

// Popular destinations
const popularCities = [
  { city: "New York", country: "USA", image: "🏙️", hotels: 1250, avgPrice: 189 },
  { city: "Paris", country: "France", image: "🗼", hotels: 890, avgPrice: 165 },
  { city: "Tokyo", country: "Japan", image: "🏯", hotels: 1100, avgPrice: 142 },
  { city: "London", country: "UK", image: "🎡", hotels: 980, avgPrice: 175 },
  { city: "Dubai", country: "UAE", image: "🌴", hotels: 650, avgPrice: 225 },
  { city: "Bali", country: "Indonesia", image: "🏝️", hotels: 420, avgPrice: 95 },
];

// Sample hotels
const sampleHotels = [
  {
    id: 1,
    name: "The Grand Plaza Hotel",
    location: "Manhattan, New York",
    rating: 4.9,
    reviews: 2340,
    stars: 5,
    image: "🏨",
    pricePerNight: 299,
    originalPrice: 399,
    amenities: ["wifi", "pool", "gym", "restaurant", "parking"],
    roomType: "Deluxe King Room",
    freeCancellation: true,
    breakfast: true,
  },
  {
    id: 2,
    name: "Skyline Suites",
    location: "Times Square, New York",
    rating: 4.7,
    reviews: 1890,
    stars: 4,
    image: "🌆",
    pricePerNight: 219,
    originalPrice: 279,
    amenities: ["wifi", "gym", "restaurant"],
    roomType: "Executive Suite",
    freeCancellation: true,
    breakfast: false,
  },
  {
    id: 3,
    name: "Central Park Inn",
    location: "Upper West Side, New York",
    rating: 4.8,
    reviews: 1560,
    stars: 4,
    image: "🌳",
    pricePerNight: 249,
    originalPrice: 299,
    amenities: ["wifi", "pool", "restaurant", "parking"],
    roomType: "Park View Room",
    freeCancellation: false,
    breakfast: true,
  },
  {
    id: 4,
    name: "Boutique Hotel Brooklyn",
    location: "Brooklyn, New York",
    rating: 4.6,
    reviews: 980,
    stars: 3,
    image: "🏘️",
    pricePerNight: 159,
    originalPrice: null,
    amenities: ["wifi", "restaurant"],
    roomType: "Standard Double",
    freeCancellation: true,
    breakfast: false,
  },
  {
    id: 5,
    name: "Harbor View Resort",
    location: "Staten Island, New York",
    rating: 4.5,
    reviews: 650,
    stars: 4,
    image: "⚓",
    pricePerNight: 189,
    originalPrice: 229,
    amenities: ["wifi", "pool", "gym", "parking"],
    roomType: "Ocean View Suite",
    freeCancellation: true,
    breakfast: true,
  },
];

type BookingStep = "search" | "select" | "details" | "confirmation";

const HotelBooking = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [rooms, setRooms] = useState("1");
  const [searchResults, setSearchResults] = useState<typeof sampleHotels | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<typeof sampleHotels[0] | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>("search");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");

  const handleSearch = () => {
    setSearchResults(sampleHotels);
    setBookingStep("select");
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSelectHotel = (hotel: typeof sampleHotels[0]) => {
    setSelectedHotel(hotel);
    setBookingStep("details");
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsCheckoutOpen(false);
    setConfirmationNumber(`HTL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setBookingStep("confirmation");
  };

  const handleReset = () => {
    setSearchResults(null);
    setSelectedHotel(null);
    setBookingStep("search");
    navigate("/book-hotel");
  };

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 1;
  const roomCount = parseInt(rooms);
  const subtotal = selectedHotel ? selectedHotel.pricePerNight * nights * roomCount : 0;
  const taxes = subtotal * 0.15;
  const grandTotal = subtotal + taxes;

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi": return <Wifi className="w-4 h-4" />;
      case "pool": return <Waves className="w-4 h-4" />;
      case "gym": return <Dumbbell className="w-4 h-4" />;
      case "restaurant": return <Utensils className="w-4 h-4" />;
      case "parking": return <Car className="w-4 h-4" />;
      default: return null;
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
    ));
  };

  // Show confirmation screen
  if (bookingStep === "confirmation" && selectedHotel) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BookingConfirmation
          confirmationNumber={confirmationNumber}
          title="Your stay is confirmed!"
          subtitle={selectedHotel.name}
          details={[
            { label: "Check-in", value: checkIn ? format(checkIn, "MMM d, yyyy") : "Selected date", icon: <CalendarIcon className="w-4 h-4" /> },
            { label: "Check-out", value: checkOut ? format(checkOut, "MMM d, yyyy") : "Selected date", icon: <CalendarIcon className="w-4 h-4" /> },
            { label: "Room", value: `${roomCount} × ${selectedHotel.roomType}`, icon: <Bed className="w-4 h-4" /> },
            { label: "Guests", value: `${guests} guest${parseInt(guests) > 1 ? 's' : ''}`, icon: <Users className="w-4 h-4" /> },
          ]}
          totalAmount={grandTotal}
          onGoHome={handleReset}
          accentColor="amber"
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
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/12 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-gradient-to-bl from-amber-500/18 to-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[150px] sm:w-[300px] h-[150px] sm:h-[300px] bg-gradient-to-tr from-yellow-500/12 to-amber-500/8 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-lg shadow-amber-500/30">
                <Hotel className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ZIVO Hotels
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
                Find your perfect
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">place to stay</span>
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-4">
                From cozy boutiques to luxurious resorts. Book the best deals.
              </p>
            </div>

            {/* Search Card */}
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Destination */}
                    <div className="lg:col-span-2">
                      <label className="text-sm text-muted-foreground mb-1 block">Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <Input
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="Where are you going?"
                          className="h-12 pl-10 bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Check-in */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Check-in</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-start bg-background/50">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "MMM d") : "Add date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Check-out */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Check-out</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-start bg-background/50">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "MMM d") : "Add date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Guests</label>
                      <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <Users className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Guest</SelectItem>
                          <SelectItem value="2">2 Guests</SelectItem>
                          <SelectItem value="3">3 Guests</SelectItem>
                          <SelectItem value="4">4 Guests</SelectItem>
                          <SelectItem value="5">5+ Guests</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center mt-4">
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-sm text-muted-foreground mb-1 block">Rooms</label>
                      <Select value={rooms} onValueChange={setRooms}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Room</SelectItem>
                          <SelectItem value="2">2 Rooms</SelectItem>
                          <SelectItem value="3">3 Rooms</SelectItem>
                          <SelectItem value="4">4+ Rooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleSearch}
                      className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white mt-auto"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Hotels
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
                  {searchResults.length} hotels found
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

              <div className="space-y-3 sm:space-y-4">
                {searchResults.map((hotel, index) => (
                  <div
                    key={hotel.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="glass-card hover:border-amber-500/50 transition-all overflow-hidden touch-manipulation active:scale-[0.99]">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Image */}
                          <div className="relative md:w-64 h-48 md:h-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                            <span className="text-6xl">{hotel.image}</span>
                            <button
                              onClick={() => toggleFavorite(hotel.id)}
                              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                            >
                              <Heart className={cn(
                                "w-5 h-5 transition-colors",
                                favorites.includes(hotel.id) 
                                  ? "fill-red-500 text-red-500" 
                                  : "text-muted-foreground"
                              )} />
                            </button>
                            {hotel.originalPrice && (
                              <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                                {Math.round((1 - hotel.pricePerNight / hotel.originalPrice) * 100)}% OFF
                              </Badge>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex">{renderStars(hotel.stars)}</div>
                                  <span className="text-sm text-muted-foreground">{hotel.stars}-star hotel</span>
                                </div>
                                <h3 className="font-display text-xl font-bold mb-1">{hotel.name}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                                  <MapPin className="w-4 h-4" />
                                  {hotel.location}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="px-2 py-1 rounded bg-amber-500 text-white font-bold text-sm">
                                    {hotel.rating}
                                  </div>
                                  <span className="text-sm font-medium">
                                    {hotel.rating >= 4.8 ? "Exceptional" : hotel.rating >= 4.5 ? "Excellent" : "Very Good"}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    ({hotel.reviews} reviews)
                                  </span>
                                </div>

                                {/* Amenities */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {hotel.amenities.map((amenity) => (
                                    <div
                                      key={amenity}
                                      className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-sm text-muted-foreground"
                                    >
                                      {getAmenityIcon(amenity)}
                                      <span className="capitalize">{amenity}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                  {hotel.freeCancellation && (
                                    <Badge variant="outline" className="text-green-500 border-green-500">
                                      Free Cancellation
                                    </Badge>
                                  )}
                                  {hotel.breakfast && (
                                    <Badge variant="outline" className="text-amber-500 border-amber-500">
                                      <Coffee className="w-3 h-3 mr-1" />
                                      Breakfast Included
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Price & Book */}
                              <div className="lg:text-right lg:min-w-[160px]">
                                <p className="text-sm text-muted-foreground mb-1">{hotel.roomType}</p>
                                <p className="text-sm text-muted-foreground">{nights} night{nights > 1 ? "s" : ""}</p>
                                {hotel.originalPrice && (
                                  <p className="text-sm text-muted-foreground line-through">
                                    ${hotel.originalPrice * nights}
                                  </p>
                                )}
                                <div className="flex items-baseline justify-end gap-1 mb-2">
                                  <span className="text-3xl font-bold text-amber-400">
                                    ${hotel.pricePerNight * nights}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">
                                  Includes taxes & fees
                                </p>
                                <Button
                                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                                  onClick={() => handleSelectHotel(hotel)}
                                >
                                  Book Now
                                </Button>
                              </div>
                            </div>
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
        {!searchResults && <HotelStatsBar />}

        {/* Popular Destinations */}
        {!searchResults && (
          <section className="py-8 sm:py-12">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold">Trending Destinations</h2>
                <Button variant="ghost" className="text-amber-500 text-sm sm:text-base">
                  Explore all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {popularCities.map((city, index) => (
                  <div
                    key={city.city}
                    onClick={() => setDestination(city.city)}
                    className="cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300 touch-manipulation active:scale-[0.98]"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <Card className="glass-card hover:border-amber-500/50 transition-all group overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative h-28 sm:h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                          <span className="text-4xl sm:text-6xl group-hover:scale-110 transition-transform">
                            {city.image}
                          </span>
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="font-display font-semibold text-base sm:text-lg">{city.city}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{city.country}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-sm text-muted-foreground">{city.hotels} hotels</span>
                            <span className="font-bold text-amber-400 text-xs sm:text-base">From ${city.avgPrice}/night</span>
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

        {/* Hotel to Car Bridge - Workflow Connector */}
        {!searchResults && (
          <section className="py-4">
            <div className="container mx-auto px-4 max-w-4xl">
              <HotelToCarBridge hotelLocation={destination || "Paris"} />
            </div>
          </section>
        )}

        {/* Trip Planning Tools */}
        {!searchResults && (
          <section className="py-8 border-t border-border/50">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <TripChecklistWidget destination={destination || "Paris"} />
                <CompanionInvite tripName={`${destination || "Paris"} Trip`} />
              </div>
            </div>
          </section>
        )}

        {/* Promo Section */}
        {!searchResults && (
          <HotelPromoSection 
            onPromoClick={(code) => toast.success(`Promo code ${code} copied!`)}
          />
        )}

        {/* Featured Properties */}
        {!searchResults && (
          <HotelFeaturedProperties 
            onSelect={(name) => toast.info(`Viewing ${name}`)}
          />
        )}

        {/* Amenities Showcase */}
        {!searchResults && <HotelAmenitiesShowcase />}

        {/* Popular Destinations */}
        {!searchResults && (
          <HotelPopularDestinations 
            onSelect={(city) => setDestination(city)}
          />
        )}

        {/* Rewards Section */}
        {!searchResults && <HotelRewardsSection />}

        {/* Room Types Showcase */}
        {!searchResults && <HotelRoomTypesShowcase />}

        {/* Virtual Room Tour */}
        {!searchResults && <HotelRoomTour />}

        {/* Concierge Services */}
        {!searchResults && <HotelConciergeServices />}

        {/* Check-In/Out Info */}
        {!searchResults && <HotelCheckInOut />}

        {/* Property Highlights */}
        {!searchResults && <HotelPropertyHighlights />}

        {/* Dining Options */}
        {!searchResults && <HotelDiningOptions />}

        {/* Event Spaces */}
        {!searchResults && <HotelEventSpaces />}

        {/* Nearby Attractions */}
        {!searchResults && <HotelNearbyAttractions />}

        {/* Guest Reviews */}
        {!searchResults && <HotelGuestReviews />}

        {/* Booking Tips */}
        {!searchResults && <HotelBookingTips />}

        {/* Destination Guides */}
        {!searchResults && <DestinationGuides />}

        {/* Hotel Destination Guides */}
        {!searchResults && <HotelDestinationGuides />}

        {/* Premium Access */}
        {!searchResults && <HotelPremiumAccess />}

        {/* Loyalty Program */}
        {!searchResults && <HotelLoyaltyProgram />}

        {/* Loyalty Rewards */}
        {!searchResults && <HotelLoyaltyRewards />}

        {/* Last Minute Deals */}
        {!searchResults && <HotelLastMinuteDeals />}

        {/* Comparison Tool */}
        {!searchResults && <HotelComparisonTool />}

        {/* Compare Widget */}
        {!searchResults && <HotelCompareWidget />}

        {/* Seasonal Promos */}
        {!searchResults && <HotelSeasonalPromos />}

        {/* Social Proof */}
        {!searchResults && <HotelSocialProof />}

        {/* Price Guarantee */}
        {!searchResults && <HotelPriceGuarantee />}

        {/* Awards Showcase */}
        {!searchResults && <HotelAwardsShowcase />}

        {/* Savings Calculator */}
        {!searchResults && <HotelSavingsCalculator />}

        {/* Travel Blog */}
        {!searchResults && <TravelBlog />}

        {/* Local Experiences */}
        {!searchResults && <LocalExperiences />}

        {/* Neighborhood Guide */}
        {!searchResults && <HotelNeighborhood />}

        {/* Sustainability */}
        {!searchResults && <HotelSustainability />}

        {/* Pet Friendly */}
        {!searchResults && <HotelPetFriendly />}

        {/* Spa Services */}
        {!searchResults && <HotelSpaServices />}

        {/* Loyalty Calculator */}
        {!searchResults && <HotelLoyaltyCalculator />}

        {/* Kids Amenities */}
        {!searchResults && <HotelKidsAmenities />}

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
        {!searchResults && <HotelNewsletterSection />}

        {/* FAQ Section */}
        {!searchResults && <HotelFAQSection />}

        {/* User Testimonials */}
        {!searchResults && <UserTestimonials />}

        {/* Mobile App Promo */}
        {!searchResults && <HotelMobileAppPromo />}

        {/* Hotel Testimonials */}
        {!searchResults && <HotelTestimonials />}

        {/* Testimonials */}
        {!searchResults && <HotelTestimonialsSection />}

        {/* Accessibility */}
        {!searchResults && <HotelAccessibility />}

        {/* Parking */}
        {!searchResults && <HotelParking />}

        {/* Rewards Progress */}
        {!searchResults && <RewardsProgress />}

        {/* Trust Indicators */}
        {!searchResults && <HotelTrustIndicators />}

        {/* Live Chat Widget */}
        <LiveChatWidget />
        
        {/* Social Proof Ticker */}
        <SocialProofTicker />
        
        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </main>

      {/* Selected Hotel Summary Sidebar */}
      {selectedHotel && bookingStep === "details" && (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-24 md:right-6 md:left-auto md:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <BookingSummaryCard
            title={selectedHotel.name}
            subtitle={selectedHotel.location}
            icon={<Hotel className="w-5 h-5" />}
            items={[
              { label: `${nights} night${nights > 1 ? 's' : ''} × ${roomCount} room${roomCount > 1 ? 's' : ''}`, amount: subtotal },
              { label: "Taxes & Fees (15%)", amount: taxes },
              { label: "Total", amount: grandTotal, isTotal: true },
            ]}
            ctaLabel={`Reserve for $${grandTotal.toFixed(0)}`}
            onConfirm={() => setIsCheckoutOpen(true)}
            accentColor="amber"
            features={[
              selectedHotel.freeCancellation ? "Free Cancellation" : "",
              selectedHotel.breakfast ? "Breakfast Included" : "",
            ].filter(Boolean)}
            estimatedTime={`Check-in: ${checkIn ? format(checkIn, "MMM d") : "Select date"}`}
          />
          <Button
            variant="ghost"
            className="w-full mt-2"
            onClick={() => {
              setSelectedHotel(null);
              setBookingStep("select");
            }}
          >
            Choose Different Hotel
          </Button>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        amount={grandTotal}
        serviceName={selectedHotel?.name || "Hotel"}
        serviceDetails={`${nights} night${nights > 1 ? 's' : ''} • ${guests} guest${parseInt(guests) > 1 ? 's' : ''}`}
        onConfirm={handleConfirmBooking}
        isProcessing={isProcessing}
        accentColor="amber"
      />

      <Footer />
    </div>
  );
};

export default HotelBooking;
