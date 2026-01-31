import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Hotel,
  Search,
  CalendarDays,
  Users,
  Loader2,
  AlertCircle,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTripadvisorSearch, type TripadvisorLocation } from "@/hooks/useTripadvisorSearch";
import HotelResultCardPro from "@/components/hotel/HotelResultCardPro";
import HotelPartnerSelector from "@/components/hotel/HotelPartnerSelector";
import AffiliateRedirectNotice from "@/components/shared/AffiliateRedirectNotice";
import HotelTopSearchCTA from "@/components/hotel/HotelTopSearchCTA";
import HotelStickyBookingCTA from "@/components/hotel/HotelStickyBookingCTA";
import ProfessionalHero from "@/components/shared/ProfessionalHero";
import ProfessionalSearchCard from "@/components/shared/ProfessionalSearchCard";
import PopularDestinationsGrid from "@/components/shared/PopularDestinationsGrid";
import WhyBookSection from "@/components/shared/WhyBookSection";
import TravelExtrasCTA from "@/components/shared/TravelExtrasCTA";
import TravelFAQ from "@/components/shared/TravelFAQ";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { hotelAffiliatePartners } from "@/data/hotelAffiliatePartners";

/**
 * ZIVO HOTELS - Professional Booking Page
 * Booking.com quality UX/UI
 */

const HotelBooking = () => {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [rooms, setRooms] = useState("1");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<TripadvisorLocation | null>(null);

  const { isLoading, error, results, searchHotels } = useTripadvisorSearch();

  const handleSearch = async () => {
    if (!destination.trim()) return;
    setHasSearched(true);
    setSelectedHotel(null);
    await searchHotels(destination);
  };

  const handleSelectHotel = (hotel: TripadvisorLocation) => {
    setSelectedHotel(hotel);
    setTimeout(() => {
      document.getElementById('partner-selector')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBookHotel = (hotel: TripadvisorLocation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const partner = hotelAffiliatePartners[0];
    const url = partner.urlTemplate({
      destination: hotel.name,
      checkIn: checkIn ? format(checkIn, "yyyy-MM-dd") : undefined,
      checkOut: checkOut ? format(checkOut, "yyyy-MM-dd") : undefined,
      guests: parseInt(guests),
      rooms: parseInt(rooms),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDestinationSelect = (city: string) => {
    setDestination(city);
  };

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <SEOHead 
        title="ZIVO Hotels – Compare & Book Hotels Worldwide"
        description="Compare hotel prices from leading booking platforms. Find the best deals on hotels, resorts, and vacation rentals. Book with trusted partners."
      />
      <Header />
      
      <main className="pb-32 lg:pb-20">
        <ProfessionalHero
          service="hotels"
          icon={Hotel}
          title="Search & Compare Hotels"
          subtitle="Compare prices from Booking.com, Hotels.com, Expedia & more."
        >
          <ProfessionalSearchCard service="hotels">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Destination */}
              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Destination</label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="City, region, or hotel name"
                  className="h-11"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Check-in */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Check-in</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-11 justify-start">
                      <CalendarDays className="mr-2 h-4 w-4 text-amber-500" />
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
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Check-out</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-11 justify-start">
                      <CalendarDays className="mr-2 h-4 w-4 text-orange-500" />
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
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Guests</label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="h-11">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
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
                <Select value={rooms} onValueChange={setRooms}>
                  <SelectTrigger className="h-11">
                    <Hotel className="w-4 h-4 mr-2 text-amber-500" />
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
                disabled={isLoading || !destination.trim()}
                className={cn(
                  "h-11 px-8 font-semibold",
                  "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
                  "shadow-lg shadow-amber-500/25"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search Hotels
                  </>
                )}
              </Button>
            </div>
          </ProfessionalSearchCard>
        </ProfessionalHero>

        {/* Error State */}
        {error && (
          <div className="container mx-auto px-4 mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <section className="container mx-auto px-4 py-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                <p className="text-muted-foreground">Searching hotels in {destination}...</p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">
                      Hotels in {destination}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {results.length} properties found • Compare prices across booking sites
                    </p>
                  </div>
                  <Badge variant="outline" className="hidden sm:flex">
                    Powered by TripAdvisor
                  </Badge>
                </div>

                <HotelTopSearchCTA 
                  hotelCount={results.length}
                  destination={destination}
                  checkIn={checkIn ? format(checkIn, "yyyy-MM-dd") : undefined}
                  checkOut={checkOut ? format(checkOut, "yyyy-MM-dd") : undefined}
                  guests={parseInt(guests)}
                  rooms={parseInt(rooms)}
                  className="mb-6"
                />

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {results.map((hotel) => (
                      <HotelResultCardPro
                        key={hotel.location_id}
                        id={hotel.location_id}
                        name={hotel.name}
                        image={hotel.photos?.[0]?.images?.medium?.url}
                        address={hotel.address_obj?.address_string || ""}
                        city={hotel.address_obj?.city || destination}
                        rating={parseFloat(hotel.rating || "0")}
                        reviewCount={parseInt(hotel.num_reviews || "0")}
                        priceLevel={hotel.price_level}
                        amenities={hotel.amenities || []}
                        isSelected={selectedHotel?.location_id === hotel.location_id}
                        onSelect={() => handleSelectHotel(hotel)}
                        onBook={() => handleBookHotel(hotel)}
                      />
                    ))}
                  </div>

                  <div className="space-y-6">
                    {selectedHotel && (
                      <div id="partner-selector">
                        <HotelPartnerSelector
                          hotelName={selectedHotel.name}
                          destination={destination}
                          checkIn={checkIn ? format(checkIn, "yyyy-MM-dd") : undefined}
                          checkOut={checkOut ? format(checkOut, "yyyy-MM-dd") : undefined}
                          guests={parseInt(guests)}
                          rooms={parseInt(rooms)}
                        />
                      </div>
                    )}

                    <AffiliateRedirectNotice variant="banner" />
                  </div>
                </div>

                {/* Price Disclaimer */}
                <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground text-center">
                    Prices shown are indicative and may vary. Final price will be confirmed on our travel partner's website.
                    ZIVO may earn a commission when you book through partner links.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Hotel className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No hotels found</h3>
                <p className="text-muted-foreground mb-4">Try searching for a different destination</p>
              </div>
            )}
          </section>
        )}

        {/* Discovery Sections (shown when no search) */}
        {!hasSearched && (
          <>
            <PopularDestinationsGrid 
              service="hotels" 
              onSelect={handleDestinationSelect}
            />
            <WhyBookSection service="hotels" />
            <TravelExtrasCTA currentService="hotels" />
            <TravelFAQ serviceType="hotels" className="bg-muted/20" />
          </>
        )}

        {/* Sticky CTA */}
        {hasSearched && results.length > 0 && (
          <HotelStickyBookingCTA
            destination={destination}
            checkIn={checkIn ? format(checkIn, "yyyy-MM-dd") : undefined}
            checkOut={checkOut ? format(checkOut, "yyyy-MM-dd") : undefined}
            guests={parseInt(guests)}
            rooms={parseInt(rooms)}
          />
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default HotelBooking;
