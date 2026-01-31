import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Car,
  Search,
  CalendarDays,
  MapPin,
  Clock,
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
import CarResultCardPro from "@/components/car/CarResultCardPro";
import CarPartnerSelector from "@/components/car/CarPartnerSelector";
import AffiliateRedirectNotice from "@/components/shared/AffiliateRedirectNotice";
import CarTopSearchCTA from "@/components/car/CarTopSearchCTA";
import CarStickyBookingCTA from "@/components/car/CarStickyBookingCTA";
import ProfessionalHero from "@/components/shared/ProfessionalHero";
import ProfessionalSearchCard from "@/components/shared/ProfessionalSearchCard";
import PopularDestinationsGrid from "@/components/shared/PopularDestinationsGrid";
import WhyBookSection from "@/components/shared/WhyBookSection";
import TravelExtrasCTA from "@/components/shared/TravelExtrasCTA";
import TravelFAQ from "@/components/shared/TravelFAQ";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { carAffiliatePartners } from "@/data/carAffiliatePartners";

/**
 * ZIVO CAR RENTAL - Professional Booking Page
 * Expedia / Rentalcars quality UX/UI
 */

const carCategories = [
  { name: "Economy", passengers: 4, bags: 2, priceFrom: 25, transmission: 'Automatic' as const, hasAC: true },
  { name: "Compact", passengers: 5, bags: 2, priceFrom: 30, transmission: 'Automatic' as const, hasAC: true },
  { name: "Midsize", passengers: 5, bags: 3, priceFrom: 38, transmission: 'Automatic' as const, hasAC: true },
  { name: "Full-size", passengers: 5, bags: 4, priceFrom: 42, transmission: 'Automatic' as const, hasAC: true },
  { name: "SUV", passengers: 7, bags: 4, priceFrom: 55, transmission: 'Automatic' as const, hasAC: true },
  { name: "Luxury", passengers: 5, bags: 3, priceFrom: 95, transmission: 'Automatic' as const, hasAC: true },
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

  const handleRentCar = (categoryName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const partner = carAffiliatePartners[0];
    const url = partner.urlTemplate({
      pickupLocation: pickupLocation,
      pickupDate: pickupDate ? format(pickupDate, "yyyy-MM-dd") : undefined,
      returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
      pickupTime,
      returnTime,
      driverAge: parseInt(driverAge),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleLocationSelect = (city: string) => {
    setPickupLocation(city);
  };

  // Calculate days for pricing
  const daysCount = pickupDate && returnDate 
    ? Math.max(1, Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)))
    : undefined;

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <SEOHead 
        title="ZIVO Car Rentals – Compare & Rent Cars Worldwide"
        description="Compare car rental prices from top providers worldwide. Find the best deals on economy, SUV, luxury and more. Book with trusted partners."
      />
      <Header />
      
      <main className="pb-32 lg:pb-20">
        <ProfessionalHero
          service="cars"
          icon={Car}
          title="Search & Compare Car Rentals"
          subtitle="Compare prices from Rentalcars, Kayak, Expedia & more."
        >
          <ProfessionalSearchCard service="cars">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pickup Location */}
              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
                  <Input
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="City, airport, or address"
                    className="h-11 pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Pickup Date */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Pickup Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-11 justify-start">
                      <CalendarDays className="mr-2 h-4 w-4 text-violet-500" />
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
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Return Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-11 justify-start">
                      <CalendarDays className="mr-2 h-4 w-4 text-purple-500" />
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
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Pickup Time</label>
                <Select value={pickupTime} onValueChange={setPickupTime}>
                  <SelectTrigger className="h-11">
                    <Clock className="w-4 h-4 mr-2 text-violet-500" />
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
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Return Time</label>
                <Select value={returnTime} onValueChange={setReturnTime}>
                  <SelectTrigger className="h-11">
                    <Clock className="w-4 h-4 mr-2 text-purple-500" />
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
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Driver Age</label>
                <Select value={driverAge} onValueChange={setDriverAge}>
                  <SelectTrigger className="h-11">
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
                  className={cn(
                    "w-full h-11 font-semibold",
                    "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700",
                    "shadow-lg shadow-violet-500/25"
                  )}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </ProfessionalSearchCard>
        </ProfessionalHero>

        {/* Search Results */}
        {hasSearched && (
          <section className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                Car Rentals in {pickupLocation}
              </h2>
              <p className="text-sm text-muted-foreground">
                {carCategories.length} categories available • Compare prices across rental sites
              </p>
            </div>

            <CarTopSearchCTA
              pickupLocation={pickupLocation}
              pickupDate={pickupDate ? format(pickupDate, "yyyy-MM-dd") : undefined}
              returnDate={returnDate ? format(returnDate, "yyyy-MM-dd") : undefined}
              pickupTime={pickupTime}
              returnTime={returnTime}
              driverAge={parseInt(driverAge)}
              className="mb-6"
            />

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {carCategories.map((category) => (
                  <CarResultCardPro
                    key={category.name}
                    id={category.name}
                    category={category.name}
                    passengers={category.passengers}
                    bags={category.bags}
                    transmission={category.transmission}
                    hasAC={category.hasAC}
                    mileage="Unlimited"
                    fuelPolicy="Full to Full"
                    pricePerDay={category.priceFrom}
                    totalPrice={daysCount ? category.priceFrom * daysCount : undefined}
                    daysCount={daysCount}
                    isSelected={selectedCategory === category.name}
                    onSelect={() => handleCategorySelect(category.name)}
                    onBook={() => handleRentCar(category.name)}
                  />
                ))}
              </div>

              <div className="space-y-6">
                {selectedCategory && (
                  <div id="partner-selector">
                    <CarPartnerSelector
                      carName={selectedCategory}
                      pickupLocation={pickupLocation}
                      pickupDate={pickupDate ? format(pickupDate, "yyyy-MM-dd") : undefined}
                      returnDate={returnDate ? format(returnDate, "yyyy-MM-dd") : undefined}
                      pickupTime={pickupTime}
                      returnTime={returnTime}
                      driverAge={parseInt(driverAge)}
                    />
                  </div>
                )}

                <AffiliateRedirectNotice variant="banner" />
              </div>
            </div>

            {/* Price Disclaimer */}
            <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                *Prices shown are indicative and may vary. Final price will be confirmed on our travel partner's website.
                ZIVO may earn a commission when you book through partner links.
              </p>
            </div>
          </section>
        )}

        {/* Discovery Sections (shown when no search) */}
        {!hasSearched && (
          <>
            <PopularDestinationsGrid 
              service="cars" 
              onSelect={handleLocationSelect}
            />
            <WhyBookSection service="cars" />
            <TravelExtrasCTA currentService="cars" />
            <TravelFAQ serviceType="cars" className="bg-muted/20" />
          </>
        )}

        {/* Sticky CTA */}
        {hasSearched && (
          <CarStickyBookingCTA
            pickupLocation={pickupLocation}
            pickupDate={pickupDate ? format(pickupDate, "yyyy-MM-dd") : undefined}
            returnDate={returnDate ? format(returnDate, "yyyy-MM-dd") : undefined}
            pickupTime={pickupTime}
            returnTime={returnTime}
            driverAge={parseInt(driverAge)}
          />
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CarRentalBooking;
