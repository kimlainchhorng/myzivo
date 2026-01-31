import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Car,
  Search,
  CalendarIcon,
  MapPin,
  Clock,
  ExternalLink,
  Info,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CarPartnerSelector from "@/components/car/CarPartnerSelector";
import AffiliateRedirectNotice from "@/components/shared/AffiliateRedirectNotice";
import CarPopularLocations from "@/components/car/CarPopularLocations";
import CarFAQSection from "@/components/car/CarFAQSection";
import CarTrustIndicators from "@/components/car/CarTrustIndicators";
import CarCategoriesGrid from "@/components/car/CarCategoriesGrid";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

// Car categories for visual display
const carCategories = [
  { name: "Economy", icon: "🚗", description: "Budget-friendly & fuel efficient" },
  { name: "Compact", icon: "🚙", description: "Perfect for city driving" },
  { name: "SUV", icon: "🚐", description: "Space for family trips" },
  { name: "Luxury", icon: "🏎️", description: "Premium driving experience" },
  { name: "Van", icon: "🚌", description: "Group travel & cargo" },
  { name: "Convertible", icon: "🚗", description: "Open-top adventure" },
];

const CarRentalBooking = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [driverAge, setDriverAge] = useState("25");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = () => {
    if (!pickupLocation.trim()) return;
    setHasSearched(true);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setTimeout(() => {
      document.getElementById('partner-selector')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <Header />
      
      <main className="pt-16 pb-20">
        {/* Hero Section */}
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
                Compare & Save on
                <br />
                <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">Car Rentals Worldwide</span>
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-4">
                Search across Rentalcars, Kayak, Expedia & more. Find the best deal from trusted providers.
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
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500" />
                        <Input
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="City, airport, or address"
                          className="h-12 pl-10 bg-background/50"
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {/* Pickup Time */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Pickup Time</label>
                      <Select value={pickupTime} onValueChange={setPickupTime}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <Clock className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>{hour}:00</SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Return Time */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Return Time</label>
                      <Select value={returnTime} onValueChange={setReturnTime}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <Clock className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>{hour}:00</SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Driver Age */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Driver Age</label>
                      <Select value={driverAge} onValueChange={setDriverAge}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="21">21-24</SelectItem>
                          <SelectItem value="25">25-29</SelectItem>
                          <SelectItem value="30">30-64</SelectItem>
                          <SelectItem value="65">65+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                      <Button 
                        onClick={handleSearch}
                        disabled={!pickupLocation.trim()}
                        className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* Affiliate Notice */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="w-3.5 h-3.5" />
                    <span>Compare prices from multiple rental companies. Book through our partners.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Search Results */}
        {hasSearched && (
          <section className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                Car Rentals in {pickupLocation}
              </h2>
              <p className="text-sm text-muted-foreground">
                Select a car type to compare prices across rental sites
              </p>
            </div>

            <AffiliateRedirectNotice variant="banner" className="mb-6" />

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Car Categories */}
              <div className="lg:col-span-2">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {carCategories.map((category) => (
                    <Card 
                      key={category.name}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-lg",
                        selectedCategory === category.name && "ring-2 ring-violet-500"
                      )}
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">{category.icon}</div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {category.description}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategorySelect(category.name);
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Compare Prices
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Info Cards */}
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <Card className="bg-violet-500/5 border-violet-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-violet-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm">Why Compare?</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Prices vary by up to 40% between rental sites. We help you find the best deal.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm">Free Cancellation</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Most partners offer free cancellation. Check terms before booking.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Partner Selector Sidebar */}
              <div className="lg:col-span-1">
                <div id="partner-selector" className="sticky top-20">
                  <Card className="glass-card">
                    <CardContent className="p-4">
                      {selectedCategory ? (
                        <>
                          <div className="mb-4 pb-4 border-b">
                            <h3 className="font-semibold">{selectedCategory} Cars</h3>
                            <p className="text-xs text-muted-foreground">
                              in {pickupLocation}
                            </p>
                          </div>
                          <CarPartnerSelector
                            pickupLocation={pickupLocation}
                            pickupDate={pickupDate ? format(pickupDate, "yyyy-MM-dd") : undefined}
                            returnDate={returnDate ? format(returnDate, "yyyy-MM-dd") : undefined}
                            pickupTime={pickupTime}
                            returnTime={returnTime}
                            driverAge={parseInt(driverAge)}
                            carName={`${selectedCategory} car`}
                          />
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Car className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Select a car type to compare prices across rental sites
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <AffiliateRedirectNotice className="mt-4" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Discovery Sections (show when no search) */}
        {!hasSearched && (
          <>
            <CarCategoriesGrid />
            <CarPopularLocations />
            <CarTrustIndicators />
            <CarFAQSection />
          </>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CarRentalBooking;
