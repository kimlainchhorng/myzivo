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
import { Separator } from "@/components/ui/separator";
import { 
  Plane,
  Search,
  CalendarIcon,
  Users,
  ArrowRight,
  Clock,
  Luggage,
  Wifi,
  Coffee,
  Tv,
  ArrowLeftRight,
  MapPin,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStepIndicator, BookingSummaryCard, CheckoutModal, BookingConfirmation } from "@/components/booking";
import { toast } from "sonner";

// Popular destinations
const popularDestinations = [
  { city: "New York", code: "JFK", country: "USA", image: "🗽", price: 299 },
  { city: "London", code: "LHR", country: "UK", image: "🇬🇧", price: 449 },
  { city: "Tokyo", code: "NRT", country: "Japan", image: "🗼", price: 699 },
  { city: "Paris", code: "CDG", country: "France", image: "🗼", price: 399 },
  { city: "Dubai", code: "DXB", country: "UAE", image: "🏙️", price: 549 },
  { city: "Sydney", code: "SYD", country: "Australia", image: "🦘", price: 899 },
];

// Airlines
const airlines = [
  { id: 1, name: "ZIVO Air", logo: "✈️", rating: 4.8 },
  { id: 2, name: "SkyWings", logo: "🛫", rating: 4.6 },
  { id: 3, name: "Global Express", logo: "🌍", rating: 4.7 },
  { id: 4, name: "Pacific Airlines", logo: "🌊", rating: 4.5 },
];

// Sample flights
const sampleFlights = [
  {
    id: 1,
    airline: "ZIVO Air",
    airlineLogo: "✈️",
    flightNumber: "ZV-1234",
    departure: { time: "08:00", city: "Los Angeles", code: "LAX" },
    arrival: { time: "16:30", city: "New York", code: "JFK" },
    duration: "5h 30m",
    stops: 0,
    price: 299,
    class: "Economy",
    amenities: ["wifi", "entertainment", "meals"],
    seatsLeft: 5,
  },
  {
    id: 2,
    airline: "SkyWings",
    airlineLogo: "🛫",
    flightNumber: "SW-567",
    departure: { time: "10:15", city: "Los Angeles", code: "LAX" },
    arrival: { time: "19:00", city: "New York", code: "JFK" },
    duration: "5h 45m",
    stops: 1,
    stopCity: "Denver",
    price: 249,
    class: "Economy",
    amenities: ["wifi", "entertainment"],
    seatsLeft: 12,
  },
  {
    id: 3,
    airline: "Global Express",
    airlineLogo: "🌍",
    flightNumber: "GE-890",
    departure: { time: "14:30", city: "Los Angeles", code: "LAX" },
    arrival: { time: "22:45", city: "New York", code: "JFK" },
    duration: "5h 15m",
    stops: 0,
    price: 349,
    class: "Business",
    amenities: ["wifi", "entertainment", "meals", "lounge"],
    seatsLeft: 3,
  },
  {
    id: 4,
    airline: "ZIVO Air",
    airlineLogo: "✈️",
    flightNumber: "ZV-5678",
    departure: { time: "18:00", city: "Los Angeles", code: "LAX" },
    arrival: { time: "02:30", city: "New York", code: "JFK" },
    duration: "5h 30m",
    stops: 0,
    price: 279,
    class: "Economy",
    amenities: ["wifi", "entertainment", "meals"],
    seatsLeft: 8,
  },
];

type BookingStep = "search" | "select" | "details" | "confirmation";

const FlightBooking = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [fromCity, setFromCity] = useState("Los Angeles (LAX)");
  const [toCity, setToCity] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState("economy");
  const [searchResults, setSearchResults] = useState<typeof sampleFlights | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<typeof sampleFlights[0] | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>("search");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");

  const bookingSteps = [
    { id: "search", label: "Search" },
    { id: "select", label: "Select" },
    { id: "details", label: "Book" },
  ];

  const getCurrentStepIndex = () => {
    switch (bookingStep) {
      case "search": return 0;
      case "select": return 1;
      case "details": return 2;
      default: return 0;
    }
  };

  const handleSearch = () => {
    setSearchResults(sampleFlights);
    setBookingStep("select");
  };

  const handleSelectFlight = (flight: typeof sampleFlights[0]) => {
    setSelectedFlight(flight);
    setBookingStep("details");
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsCheckoutOpen(false);
    setConfirmationNumber(`ZV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setBookingStep("confirmation");
  };

  const handleReset = () => {
    setSearchResults(null);
    setSelectedFlight(null);
    setBookingStep("search");
    navigate("/book-flight");
  };

  const totalPrice = selectedFlight ? selectedFlight.price * parseInt(passengers) : 0;
  const taxes = totalPrice * 0.12;
  const grandTotal = totalPrice + taxes;

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi": return <Wifi className="w-4 h-4" />;
      case "entertainment": return <Tv className="w-4 h-4" />;
      case "meals": return <Coffee className="w-4 h-4" />;
      case "lounge": return <Luggage className="w-4 h-4" />;
      default: return null;
    }
  };

  // Show confirmation screen
  if (bookingStep === "confirmation" && selectedFlight) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BookingConfirmation
          confirmationNumber={confirmationNumber}
          title="Your flight is booked!"
          subtitle={`${selectedFlight.departure.city} → ${selectedFlight.arrival.city}`}
          details={[
            { label: "Flight", value: `${selectedFlight.airline} ${selectedFlight.flightNumber}`, icon: <Plane className="w-4 h-4" /> },
            { label: "Date", value: departDate ? format(departDate, "MMM d, yyyy") : "Selected date", icon: <CalendarIcon className="w-4 h-4" /> },
            { label: "Passengers", value: `${passengers} passenger${parseInt(passengers) > 1 ? 's' : ''}`, icon: <Users className="w-4 h-4" /> },
            { label: "Class", value: cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1), icon: <Luggage className="w-4 h-4" /> },
          ]}
          totalAmount={grandTotal}
          onGoHome={handleReset}
          accentColor="sky"
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
        <section className="relative py-12 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-sky-500/10 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/20 text-sky-400 text-sm font-medium mb-6">
                <Plane className="w-4 h-4" />
                ZIVO Flights
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Fly anywhere,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">save everywhere</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Compare prices from hundreds of airlines. Book your perfect flight in minutes.
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
                  {/* Trip Type Toggle */}
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setTripType("roundtrip")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        tripType === "roundtrip"
                          ? "bg-sky-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Round Trip
                    </button>
                    <button
                      onClick={() => setTripType("oneway")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        tripType === "oneway"
                          ? "bg-sky-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      One Way
                    </button>
                  </div>

                  {/* Search Fields */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* From */}
                    <div className="relative">
                      <label className="text-sm text-muted-foreground mb-1 block">From</label>
                      <Input
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        placeholder="City or airport"
                        className="h-12 bg-background/50"
                      />
                    </div>

                    {/* Swap Button */}
                    <button
                      onClick={swapCities}
                      className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors z-10"
                    >
                      <ArrowLeftRight className="w-5 h-5" />
                    </button>

                    {/* To */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">To</label>
                      <Input
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        placeholder="City or airport"
                        className="h-12 bg-background/50"
                      />
                    </div>

                    {/* Departure Date */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Departure</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-start bg-background/50">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {departDate ? format(departDate, "MMM d, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={departDate}
                            onSelect={setDepartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Return Date */}
                    {tripType === "roundtrip" && (
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Return</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-12 justify-start bg-background/50">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {returnDate ? format(returnDate, "MMM d, yyyy") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={returnDate}
                              onSelect={setReturnDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>

                  {/* Passengers & Class */}
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-sm text-muted-foreground mb-1 block">Passengers</label>
                      <Select value={passengers} onValueChange={setPassengers}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <Users className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Passenger</SelectItem>
                          <SelectItem value="2">2 Passengers</SelectItem>
                          <SelectItem value="3">3 Passengers</SelectItem>
                          <SelectItem value="4">4 Passengers</SelectItem>
                          <SelectItem value="5">5+ Passengers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                      <label className="text-sm text-muted-foreground mb-1 block">Class</label>
                      <Select value={cabinClass} onValueChange={setCabinClass}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economy">Economy</SelectItem>
                          <SelectItem value="premium">Premium Economy</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="first">First Class</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleSearch}
                      className="h-12 px-8 bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Flights
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
                  {searchResults.length} flights found
                </h2>
                <Select defaultValue="price">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Lowest Price</SelectItem>
                    <SelectItem value="duration">Shortest Duration</SelectItem>
                    <SelectItem value="departure">Departure Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {searchResults.map((flight, index) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card hover:border-sky-500/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          {/* Airline */}
                          <div className="flex items-center gap-3 lg:w-40">
                            <span className="text-3xl">{flight.airlineLogo}</span>
                            <div>
                              <p className="font-medium">{flight.airline}</p>
                              <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
                            </div>
                          </div>

                          {/* Flight Times */}
                          <div className="flex-1 flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{flight.departure.time}</p>
                              <p className="text-sm text-muted-foreground">{flight.departure.code}</p>
                            </div>

                            <div className="flex-1 flex flex-col items-center">
                              <p className="text-sm text-muted-foreground mb-1">{flight.duration}</p>
                              <div className="w-full flex items-center">
                                <div className="h-0.5 flex-1 bg-sky-500/30" />
                                <Plane className="w-5 h-5 text-sky-500 mx-2" />
                                <div className="h-0.5 flex-1 bg-sky-500/30" />
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                                {flight.stopCity && ` (${flight.stopCity})`}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-2xl font-bold">{flight.arrival.time}</p>
                              <p className="text-sm text-muted-foreground">{flight.arrival.code}</p>
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="flex items-center gap-2 lg:w-32">
                            {flight.amenities.map((amenity) => (
                              <div
                                key={amenity}
                                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"
                                title={amenity}
                              >
                                {getAmenityIcon(amenity)}
                              </div>
                            ))}
                          </div>

                          {/* Price & Book */}
                          <div className="lg:w-40 text-right">
                            <div className="flex items-baseline justify-end gap-1 mb-1">
                              <span className="text-3xl font-bold text-sky-400">${flight.price}</span>
                              <span className="text-sm text-muted-foreground">/person</span>
                            </div>
                            {flight.seatsLeft <= 5 && (
                              <p className="text-sm text-orange-500 mb-2">
                                Only {flight.seatsLeft} seats left
                              </p>
                            )}
                            <Button
                              className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                              onClick={() => handleSelectFlight(flight)}
                            >
                              Select
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

        {/* Popular Destinations */}
        {!searchResults && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl font-bold mb-6">Popular Destinations</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularDestinations.map((dest, index) => (
                  <motion.div
                    key={dest.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setToCity(`${dest.city} (${dest.code})`)}
                    className="cursor-pointer"
                  >
                    <Card className="glass-card hover:border-sky-500/50 transition-all group overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex items-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                            {dest.image}
                          </div>
                          <div className="flex-1 p-4">
                            <h3 className="font-display font-semibold text-lg">{dest.city}</h3>
                            <p className="text-sm text-muted-foreground">{dest.country} • {dest.code}</p>
                            <p className="text-sky-400 font-bold mt-1">From ${dest.price}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground mr-4 group-hover:text-sky-400 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Partner Airlines */}
        {!searchResults && (
          <section className="py-12 border-t border-border/50">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-xl font-bold mb-6 text-center">Trusted Airline Partners</h2>
              <div className="flex flex-wrap justify-center gap-8">
                {airlines.map((airline) => (
                  <div key={airline.id} className="flex items-center gap-3 px-6 py-3 glass-card rounded-lg">
                    <span className="text-2xl">{airline.logo}</span>
                    <div>
                      <p className="font-medium">{airline.name}</p>
                      <p className="text-sm text-muted-foreground">⭐ {airline.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Selected Flight Summary Sidebar */}
      <AnimatePresence>
        {selectedFlight && bookingStep === "details" && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-24 md:right-6 md:left-auto md:w-80 z-50"
          >
            <BookingSummaryCard
              title={`${selectedFlight.departure.code} → ${selectedFlight.arrival.code}`}
              subtitle={`${selectedFlight.airline} • ${selectedFlight.flightNumber}`}
              icon={<Plane className="w-5 h-5" />}
              items={[
                { label: `${passengers} × Flight Ticket`, amount: totalPrice },
                { label: "Taxes & Fees", amount: taxes },
                { label: "Total", amount: grandTotal, isTotal: true },
              ]}
              ctaLabel={`Book for $${grandTotal.toFixed(0)}`}
              onConfirm={() => setIsCheckoutOpen(true)}
              accentColor="sky"
              features={["Free Cancellation", "Seat Selection"]}
              estimatedTime={`${selectedFlight.duration} flight`}
            />
            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={() => {
                setSelectedFlight(null);
                setBookingStep("select");
              }}
            >
              Choose Different Flight
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        amount={grandTotal}
        serviceName={`${selectedFlight?.airline} ${selectedFlight?.flightNumber}`}
        serviceDetails={`${selectedFlight?.departure.city} → ${selectedFlight?.arrival.city} • ${passengers} passenger${parseInt(passengers) > 1 ? 's' : ''}`}
        onConfirm={handleConfirmBooking}
        isProcessing={isProcessing}
        accentColor="sky"
      />

      <Footer />
    </div>
  );
};

export default FlightBooking;
