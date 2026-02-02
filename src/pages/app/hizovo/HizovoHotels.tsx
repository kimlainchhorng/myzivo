/**
 * Hizovo Travel App - Hotels Tab
 * Mobile hotel search with results and partner handoff
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Hotel, Search, Calendar, Users, MapPin, ArrowRight, 
  Shield, Star, Loader2, Wifi, Coffee, Car, UtensilsCrossed
} from "lucide-react";
import HizovoAppLayout from "@/components/app/HizovoAppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createNewSearchSession } from "@/config/trackingParams";

// Demo hotel results
const hotelResults = [
  { 
    id: "1", name: "Marriott Downtown", rating: 4.5, stars: 4, 
    price: 189, location: "City Center", image: "🏨",
    amenities: ["wifi", "breakfast", "parking"],
    refundable: true
  },
  { 
    id: "2", name: "Hilton Beach Resort", rating: 4.7, stars: 5, 
    price: 279, location: "Beachfront", image: "🏖️",
    amenities: ["wifi", "breakfast", "pool", "spa"],
    refundable: true
  },
  { 
    id: "3", name: "Holiday Inn Express", rating: 4.2, stars: 3, 
    price: 99, location: "Airport Area", image: "🏠",
    amenities: ["wifi", "breakfast"],
    refundable: false
  },
  { 
    id: "4", name: "The Ritz-Carlton", rating: 4.9, stars: 5, 
    price: 459, location: "Downtown", image: "👑",
    amenities: ["wifi", "breakfast", "pool", "spa", "gym"],
    refundable: true
  },
];

const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  breakfast: Coffee,
  parking: Car,
  pool: UtensilsCrossed,
};

const HizovoHotels = () => {
  const navigate = useNavigate();
  
  // Search state
  const [destination, setDestination] = useState("Miami, FL");
  const [checkIn, setCheckIn] = useState("Feb 15, 2026");
  const [checkOut, setCheckOut] = useState("Feb 18, 2026");
  const [guests, setGuests] = useState("2 Adults, 1 Room");
  
  // UI state
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = async () => {
    createNewSearchSession();
    setIsSearching(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSearching(false);
    setHasSearched(true);
  };

  const handleViewDeal = (hotel: typeof hotelResults[0]) => {
    navigate(`/app/hotels/${hotel.id}`, { 
      state: { hotel, searchParams: { destination, checkIn, checkOut, guests } } 
    });
  };

  return (
    <HizovoAppLayout title="Hotels">
      <div className="pb-4">
        {/* Search Form */}
        <div className="p-4 space-y-4 bg-hotels/5">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hotels" />
            <Input 
              placeholder="Where are you going?" 
              className="pl-9 h-12 rounded-xl" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Check-in" 
                className="pl-9 h-12 rounded-xl" 
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Check-out" 
                className="pl-9 h-12 rounded-xl" 
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Guests & Rooms" 
              className="pl-9 h-12 rounded-xl" 
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full h-14 rounded-xl font-bold text-lg gap-2 bg-hotels hover:bg-hotels/90"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Hotels
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="px-4 space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Disclosure */}
            <div className="py-3 px-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground text-center">
                <Shield className="w-3 h-3 inline mr-1" />
                Prices are indicative. Final price confirmed on partner site.
              </p>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {hotelResults.length} hotels found
              </p>
              <button className="text-sm text-hotels font-medium">
                Sort & Filter
              </button>
            </div>

            {/* Hotel Cards */}
            <div className="space-y-3">
              {hotelResults.map((hotel) => (
                <div 
                  key={hotel.id}
                  className="p-4 rounded-2xl bg-card border border-border/50 space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                      {hotel.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{hotel.name}</h3>
                      <p className="text-sm text-muted-foreground">{hotel.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(hotel.stars)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-hotels text-hotels" />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {hotel.amenities.slice(0, 3).map((amenity) => {
                          const Icon = amenityIcons[amenity] || Wifi;
                          return (
                            <div key={amenity} className="p-1 bg-muted rounded">
                              <Icon className="w-3 h-3 text-muted-foreground" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div>
                      <p className="text-xl font-bold text-hotels">${hotel.price}</p>
                      <p className="text-xs text-muted-foreground">per night</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {hotel.refundable && (
                        <span className="text-xs text-emerald-600 font-medium">Free cancellation</span>
                      )}
                      <Button 
                        size="sm"
                        className="rounded-xl gap-1 bg-hotels hover:bg-hotels/90"
                        onClick={() => handleViewDeal(hotel)}
                      >
                        View Deal <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="px-4 py-12 text-center">
            <div className="w-20 h-20 bg-hotels/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hotel className="w-10 h-10 text-hotels" />
            </div>
            <h3 className="font-bold text-lg mb-2">Search for Hotels</h3>
            <p className="text-sm text-muted-foreground">
              Enter your destination and dates to find the best hotel deals.
            </p>
          </div>
        )}
      </div>
    </HizovoAppLayout>
  );
};

export default HizovoHotels;
