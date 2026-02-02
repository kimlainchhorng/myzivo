/**
 * Hizovo Travel App - Cars Tab
 * Mobile car rental search with results and partner handoff
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CarFront, Search, Calendar, MapPin, ArrowRight, 
  Shield, Users, Loader2, Fuel, Settings, Check
} from "lucide-react";
import HizovoAppLayout from "@/components/app/HizovoAppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createNewSearchSession } from "@/config/trackingParams";

// Demo car results
const carResults = [
  { 
    id: "1", type: "Economy", model: "Toyota Corolla", image: "🚗",
    price: 35, seats: 5, transmission: "Automatic", bags: 2,
    supplier: "Hertz", freeCancel: true, unlimitedMiles: true
  },
  { 
    id: "2", type: "Compact SUV", model: "Honda CR-V", image: "🚙",
    price: 55, seats: 5, transmission: "Automatic", bags: 3,
    supplier: "Enterprise", freeCancel: true, unlimitedMiles: true
  },
  { 
    id: "3", type: "Full-Size SUV", model: "Ford Explorer", image: "🚐",
    price: 75, seats: 7, transmission: "Automatic", bags: 4,
    supplier: "Budget", freeCancel: false, unlimitedMiles: true
  },
  { 
    id: "4", type: "Premium", model: "BMW 5 Series", image: "🚘",
    price: 120, seats: 5, transmission: "Automatic", bags: 3,
    supplier: "National", freeCancel: true, unlimitedMiles: false
  },
];

const HizovoCars = () => {
  const navigate = useNavigate();
  
  // Search state
  const [pickupLocation, setPickupLocation] = useState("LAX Airport");
  const [pickupDate, setPickupDate] = useState("Feb 15, 10:00");
  const [returnDate, setReturnDate] = useState("Feb 18, 10:00");
  const [driverAge, setDriverAge] = useState("25+");
  
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

  const handleViewDeal = (car: typeof carResults[0]) => {
    navigate(`/app/cars/${car.id}`, { 
      state: { car, searchParams: { pickupLocation, pickupDate, returnDate, driverAge } } 
    });
  };

  return (
    <HizovoAppLayout title="Car Rentals">
      <div className="pb-4">
        {/* Search Form */}
        <div className="p-4 space-y-4 bg-cars/5">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cars" />
            <Input 
              placeholder="Pickup Location" 
              className="pl-9 h-12 rounded-xl" 
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Pickup" 
                className="pl-9 h-12 rounded-xl" 
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Return" 
                className="pl-9 h-12 rounded-xl" 
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Driver Age" 
              className="pl-9 h-12 rounded-xl" 
              value={driverAge}
              onChange={(e) => setDriverAge(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full h-14 rounded-xl font-bold text-lg gap-2 bg-cars hover:bg-cars/90"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Cars
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
                {carResults.length} cars found
              </p>
              <button className="text-sm text-cars font-medium">
                Sort & Filter
              </button>
            </div>

            {/* Car Cards */}
            <div className="space-y-3">
              {carResults.map((car) => (
                <div 
                  key={car.id}
                  className="p-4 rounded-2xl bg-card border border-border/50 space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="w-24 h-20 bg-muted rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                      {car.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-cars font-semibold">{car.type}</p>
                      <h3 className="font-bold">{car.model}</h3>
                      <p className="text-sm text-muted-foreground">{car.supplier}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {car.seats}
                        </span>
                        <span className="flex items-center gap-1">
                          <Settings className="w-3 h-3" /> {car.transmission}
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel className="w-3 h-3" /> {car.bags} bags
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {car.unlimitedMiles && (
                      <span className="text-xs px-2 py-1 bg-cars/10 text-cars rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Unlimited miles
                      </span>
                    )}
                    {car.freeCancel && (
                      <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Free cancellation
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div>
                      <p className="text-xl font-bold text-cars">${car.price}</p>
                      <p className="text-xs text-muted-foreground">per day</p>
                    </div>
                    <Button 
                      size="sm"
                      className="rounded-xl gap-1 bg-cars hover:bg-cars/90"
                      onClick={() => handleViewDeal(car)}
                    >
                      View Deal <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="px-4 py-12 text-center">
            <div className="w-20 h-20 bg-cars/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CarFront className="w-10 h-10 text-cars" />
            </div>
            <h3 className="font-bold text-lg mb-2">Search for Cars</h3>
            <p className="text-sm text-muted-foreground">
              Enter pickup location and dates to find the best car rental deals.
            </p>
          </div>
        )}
      </div>
    </HizovoAppLayout>
  );
};

export default HizovoCars;
