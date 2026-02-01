/**
 * App Travel Tab
 * Flights | Hotels | Cars with compact search forms
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plane, Hotel, CarFront, Search, Calendar, Users, MapPin, ArrowRight, Shield, ChevronDown } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TravelTab = "flights" | "hotels" | "cars";

const tabs: { id: TravelTab; label: string; icon: typeof Plane }[] = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "cars", label: "Cars", icon: CarFront },
];

// Demo results for each tab
const flightResults = [
  { id: 1, airline: "Delta", logo: "✈️", from: "JFK", to: "LAX", price: 199, duration: "5h 30m", stops: "Nonstop" },
  { id: 2, airline: "United", logo: "✈️", from: "JFK", to: "LAX", price: 215, duration: "5h 45m", stops: "Nonstop" },
  { id: 3, airline: "American", logo: "✈️", from: "JFK", to: "LAX", price: 189, duration: "6h 15m", stops: "1 stop" },
];

const hotelResults = [
  { id: 1, name: "Marriott Downtown", image: "🏨", rating: 4.5, price: 159, location: "City Center" },
  { id: 2, name: "Hilton Beach Resort", image: "🏖️", rating: 4.7, price: 229, location: "Beachfront" },
  { id: 3, name: "Budget Inn Express", image: "🏠", rating: 4.0, price: 89, location: "Airport Area" },
];

const carResults = [
  { id: 1, type: "Economy", model: "Toyota Corolla", image: "🚗", price: 35, seats: 5 },
  { id: 2, type: "SUV", model: "Ford Explorer", image: "🚙", price: 65, seats: 7 },
  { id: 3, type: "Premium", model: "BMW 5 Series", image: "🚘", price: 95, seats: 5 },
];

const AppTravel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TravelTab>("flights");
  const [hasSearched, setHasSearched] = useState(false);

  // Sync tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["flights", "hotels", "cars"].includes(tab)) {
      setActiveTab(tab as TravelTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TravelTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setHasSearched(false);
  };

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleBookNow = (item: any) => {
    // This would redirect to affiliate partner
    window.open("https://www.skyscanner.com", "_blank", "noopener,noreferrer");
  };

  return (
    <AppLayout title="Travel">
      <div className="pb-4">
        {/* Tab Switcher */}
        <div className="flex border-b border-border sticky top-14 bg-background z-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors touch-manipulation",
                activeTab === tab.id 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Form */}
        <div className="p-4 space-y-4">
          {activeTab === "flights" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="From" className="pl-9 h-11" defaultValue="New York (JFK)" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input placeholder="To" className="pl-9 h-11" defaultValue="Los Angeles (LAX)" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Departure" className="pl-9 h-11" defaultValue="Feb 15" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Return" className="pl-9 h-11" defaultValue="Feb 22" />
                </div>
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Passengers" className="pl-9 h-11" defaultValue="1 Adult, Economy" />
              </div>
            </div>
          )}

          {activeTab === "hotels" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input placeholder="Destination" className="pl-9 h-11" defaultValue="Miami, FL" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Check-in" className="pl-9 h-11" defaultValue="Feb 15" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Check-out" className="pl-9 h-11" defaultValue="Feb 18" />
                </div>
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Guests & Rooms" className="pl-9 h-11" defaultValue="2 Guests, 1 Room" />
              </div>
            </div>
          )}

          {activeTab === "cars" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input placeholder="Pickup Location" className="pl-9 h-11" defaultValue="LAX Airport" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Pickup" className="pl-9 h-11" defaultValue="Feb 15, 10:00" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Return" className="pl-9 h-11" defaultValue="Feb 18, 10:00" />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleSearch}
            className={cn(
              "w-full h-12 rounded-xl font-bold gap-2",
              activeTab === "flights" && "bg-flights hover:bg-flights/90",
              activeTab === "hotels" && "bg-hotels hover:bg-hotels/90",
              activeTab === "cars" && "bg-cars hover:bg-cars/90"
            )}
          >
            <Search className="w-5 h-5" />
            Search {activeTab === "flights" ? "Flights" : activeTab === "hotels" ? "Hotels" : "Cars"}
          </Button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="px-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Affiliate Disclosure */}
            <div className="py-2 px-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <p className="text-xs text-muted-foreground">
                <Shield className="w-3 h-3 inline mr-1" />
                You will be redirected to our trusted travel partner.
              </p>
            </div>

            {/* Results Grid */}
            <div className="space-y-3">
              {activeTab === "flights" && flightResults.map((flight) => (
                <div 
                  key={flight.id}
                  className="p-4 rounded-2xl bg-card border border-border/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-xl">
                        {flight.logo}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{flight.airline}</p>
                        <p className="text-xs text-muted-foreground">{flight.stops}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">${flight.price}</p>
                      <p className="text-xs text-muted-foreground">per person</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{flight.from}</span>
                    <div className="flex-1 mx-3 border-t border-dashed border-border relative">
                      <Plane className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card text-muted-foreground" />
                    </div>
                    <span className="font-medium">{flight.to}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{flight.duration}</span>
                    <Button 
                      size="sm" 
                      className="rounded-xl gap-1"
                      onClick={() => handleBookNow(flight)}
                    >
                      View Deal <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {activeTab === "hotels" && hotelResults.map((hotel) => (
                <div 
                  key={hotel.id}
                  className="p-4 rounded-2xl bg-card border border-border/50 space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {hotel.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{hotel.name}</h3>
                      <p className="text-xs text-muted-foreground">{hotel.location}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {"⭐".repeat(Math.floor(hotel.rating))}
                        <span className="text-xs font-medium ml-1">{hotel.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">${hotel.price}</p>
                      <p className="text-xs text-muted-foreground">/night</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full rounded-xl gap-1"
                    onClick={() => handleBookNow(hotel)}
                  >
                    View Deal <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              {activeTab === "cars" && carResults.map((car) => (
                <div 
                  key={car.id}
                  className="p-4 rounded-2xl bg-card border border-border/50 space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {car.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-primary font-semibold">{car.type}</p>
                      <h3 className="font-bold text-sm">{car.model}</h3>
                      <p className="text-xs text-muted-foreground">{car.seats} seats</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">${car.price}</p>
                      <p className="text-xs text-muted-foreground">/day</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full rounded-xl gap-1"
                    onClick={() => handleBookNow(car)}
                  >
                    View Deal <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AppTravel;
