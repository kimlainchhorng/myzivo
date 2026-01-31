import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
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
  Dumbbell,
  Waves,
  Utensils,
  ExternalLink,
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
import HotelPartnerSelector from "@/components/hotel/HotelPartnerSelector";
import AffiliateRedirectNotice from "@/components/shared/AffiliateRedirectNotice";
import HotelPopularDestinations from "@/components/hotel/HotelPopularDestinations";
import HotelFAQSection from "@/components/hotel/HotelFAQSection";
import HotelTrustIndicators from "@/components/hotel/HotelTrustIndicators";
import HotelTopSearchCTA from "@/components/hotel/HotelTopSearchCTA";
import HotelStickyBookingCTA from "@/components/hotel/HotelStickyBookingCTA";
import NoHotelsFound from "@/components/hotel/NoHotelsFound";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import TravelPageHero from "@/components/shared/TravelPageHero";
import TravelSearchCard from "@/components/shared/TravelSearchCard";
import { hotelAffiliatePartners } from "@/data/hotelAffiliatePartners";

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

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi className="w-3 h-3" />;
    if (lowerAmenity.includes('pool')) return <Waves className="w-3 h-3" />;
    if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return <Dumbbell className="w-3 h-3" />;
    if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('dining')) return <Utensils className="w-3 h-3" />;
    if (lowerAmenity.includes('parking')) return <Car className="w-3 h-3" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <SEOHead 
        title="ZIVO Hotels – Compare & Book Hotels Worldwide"
        description="Compare hotel prices from leading booking platforms. Find the best deals on hotels, resorts, and vacation rentals. Book with trusted partners."
      />
      <Header />
      
      <main className="pt-16 pb-32 lg:pb-20">
        <TravelPageHero
          service="hotels"
          icon={Hotel}
          serviceName="ZIVO Hotels"
          title="Search & Compare"
          highlightedText="Real-Time Hotel Prices"
          subtitle="Compare rates from Booking.com, Hotels.com, Expedia & more. Book directly with our trusted partners."
        >
          <TravelSearchCard
            service="hotels"
            disclaimer="Results powered by TripAdvisor. Book through our partner sites."
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Destination */}
              <div className="lg:col-span-2">
                <label className="text-sm text-muted-foreground mb-1 block">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="City, region, or hotel name"
                    className="h-12 pl-10 bg-background/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                <Select value={rooms} onValueChange={setRooms}>
                  <SelectTrigger className="h-12 bg-background/50">
                    <Hotel className="w-4 h-4 mr-2" />
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
                className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/30"
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
          </TravelSearchCard>
        </TravelPageHero>

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
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
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
                      {results.length} properties found • Powered by TripAdvisor
                    </p>
                  </div>
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
                      <Card 
                        key={hotel.location_id}
                        className={cn(
                          "overflow-hidden transition-all cursor-pointer hover:shadow-lg",
                          selectedHotel?.location_id === hotel.location_id && "ring-2 ring-amber-500"
                        )}
                        onClick={() => handleSelectHotel(hotel)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                              {hotel.photos?.[0]?.images?.medium?.url ? (
                                <img 
                                  src={hotel.photos[0].images.medium.url} 
                                  alt={hotel.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Hotel className="w-8 h-8 text-amber-500" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
                                    {hotel.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {hotel.address_obj?.address_string || hotel.address_obj?.city}
                                  </p>
                                </div>
                                {hotel.rating && (
                                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded shrink-0">
                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                    <span className="text-xs font-semibold">{hotel.rating}</span>
                                  </div>
                                )}
                              </div>

                              {hotel.num_reviews && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {parseInt(hotel.num_reviews).toLocaleString()} reviews
                                </p>
                              )}

                              {hotel.amenities && hotel.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-[9px] gap-1">
                                      {getAmenityIcon(amenity)}
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {hotel.amenities.length > 4 && (
                                    <Badge variant="outline" className="text-[9px]">
                                      +{hotel.amenities.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {hotel.price_level && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Price level: {hotel.price_level}
                                </p>
                              )}

                              <div className="mt-3 flex gap-2">
                                <Button
                                  size="sm"
                                  className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white gap-1"
                                  onClick={(e) => handleBookHotel(hotel, e)}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View Deals
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectHotel(hotel);
                                  }}
                                >
                                  Compare Prices
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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

                <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground text-center">
                    Prices shown are indicative and may vary. Final price will be confirmed on our travel partner's website.
                    ZIVO may earn a commission when you book through partner links.
                  </p>
                </div>
              </>
            ) : (
              <NoHotelsFound 
                onModifySearch={() => setHasSearched(false)}
                destination={destination}
                checkIn={checkIn ? format(checkIn, "yyyy-MM-dd") : undefined}
                checkOut={checkOut ? format(checkOut, "yyyy-MM-dd") : undefined}
                guests={parseInt(guests)}
                rooms={parseInt(rooms)}
              />
            )}
          </section>
        )}

        {/* Discovery Sections */}
        {!hasSearched && (
          <>
            <HotelPopularDestinations />
            <HotelTrustIndicators />
            <HotelFAQSection />
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
            hotelCount={results.length}
          />
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default HotelBooking;
