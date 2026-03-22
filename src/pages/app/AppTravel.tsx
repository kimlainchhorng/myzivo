/**
 * App Travel Tab — Premium 2026
 * Flights | Hotels | Cars with premium search forms & results
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plane, Hotel, CarFront, Search, Calendar, Users, MapPin, ArrowRight, Shield, Building2, Umbrella, Home, Car, Truck, Crown, Star, Sparkles } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type TravelTab = "flights" | "hotels" | "cars";

const tabs: { id: TravelTab; label: string; icon: typeof Plane; gradient: string; color: string }[] = [
  { id: "flights", label: "Flights", icon: Plane, gradient: "from-sky-500 to-blue-600", color: "text-sky-500" },
  { id: "hotels", label: "Hotels", icon: Hotel, gradient: "from-amber-500 to-orange-500", color: "text-amber-500" },
  { id: "cars", label: "Cars", icon: CarFront, gradient: "from-emerald-500 to-teal-600", color: "text-emerald-500" },
];

// Demo results for each tab
const flightResults = [
  { id: 1, airline: "Delta", from: "JFK", to: "LAX", price: 199, duration: "5h 30m", stops: "Nonstop", badge: "Best Value" },
  { id: 2, airline: "United", from: "JFK", to: "LAX", price: 215, duration: "5h 45m", stops: "Nonstop", badge: null },
  { id: 3, airline: "American", from: "JFK", to: "LAX", price: 189, duration: "6h 15m", stops: "1 stop", badge: "Cheapest" },
];

const hotelResults = [
  { id: 1, name: "Marriott Downtown", rating: 4.5, price: 159, location: "City Center", badge: "Popular" },
  { id: 2, name: "Hilton Beach Resort", rating: 4.7, price: 229, location: "Beachfront", badge: "Top Rated" },
  { id: 3, name: "Budget Inn Express", rating: 4.0, price: 89, location: "Airport Area", badge: null },
];

const carResults = [
  { id: 1, type: "Economy", model: "Toyota Corolla", price: 35, seats: 5, badge: "Best Value" },
  { id: 2, type: "SUV", model: "Ford Explorer", price: 65, seats: 7, badge: null },
  { id: 3, type: "Premium", model: "BMW 5 Series", price: 95, seats: 5, badge: "Luxury" },
];

const AppTravel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TravelTab>("flights");
  const [hasSearched, setHasSearched] = useState(false);

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

  const handleSearch = () => setHasSearched(true);

  const handleBookNow = () => {
    import("@/lib/openExternalUrl").then(({ openExternalUrl: oe }) => oe("https://www.skyscanner.com"));
  };

  const activeTabConfig = tabs.find(t => t.id === activeTab)!;

  return (
    <AppLayout title="Travel">
      <div className="pb-4">
        {/* Tab Switcher - Premium pills */}
        <div className="px-4 pt-3 pb-2 sticky top-14 bg-background/95 backdrop-blur-xl z-10">
          <div className="flex gap-1.5 bg-muted/50 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 touch-manipulation",
                  activeTab === tab.id 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Form - Premium Glass */}
        <div className="p-4 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {activeTab === "flights" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="From" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="New York (JFK)" />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                      <Input placeholder="To" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="Los Angeles (LAX)" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Departure" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="Feb 15" />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Return" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="Feb 22" />
                    </div>
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Passengers" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="1 Adult, Economy" />
                  </div>
                </>
              )}

              {activeTab === "hotels" && (
                <>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <Input placeholder="Destination" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="Miami, FL" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Check-in" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="Feb 15" />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Check-out" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="Feb 18" />
                    </div>
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Guests & Rooms" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="2 Guests, 1 Room" />
                  </div>
                </>
              )}

              {activeTab === "cars" && (
                <>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <Input placeholder="Pickup Location" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="LAX Airport" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Pickup" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="Feb 15, 10:00" />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Return" className="pl-9 h-12 rounded-xl bg-card border-border/40 font-medium" defaultValue="Feb 18, 10:00" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <Button
            onClick={handleSearch}
            className={cn(
              "w-full h-13 rounded-xl font-bold gap-2 text-base shadow-lg transition-all duration-200",
              `bg-gradient-to-r ${activeTabConfig.gradient} hover:opacity-90 text-primary-foreground`
            )}
          >
            <Search className="w-5 h-5" />
            Search {activeTabConfig.label}
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="px-4 space-y-4"
            >
              {/* Partner disclosure */}
              <div className="py-2.5 px-4 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  You'll be redirected to our trusted travel partner for booking.
                </p>
              </div>

              {/* Results */}
              <div className="space-y-3">
                {activeTab === "flights" && flightResults.map((flight, i) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-2xl bg-card border border-border/40 space-y-3 hover:border-sky-500/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  >
                    {flight.badge && (
                      <Badge className="absolute top-3 right-3 text-[9px] bg-sky-500/10 text-sky-600 border-sky-500/20 font-bold">
                        {flight.badge}
                      </Badge>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/15 to-blue-500/10 flex items-center justify-center">
                        <Plane className="w-5 h-5 text-sky-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{flight.airline}</p>
                        <p className="text-[11px] text-muted-foreground">{flight.stops} · {flight.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">{flight.from}</span>
                      <div className="flex-1 mx-3 border-t border-dashed border-border relative">
                        <Plane className="w-3.5 h-3.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card text-muted-foreground" />
                      </div>
                      <span className="font-bold">{flight.to}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xl text-sky-500">${flight.price}</p>
                      <Button size="sm" className="rounded-xl gap-1 bg-gradient-to-r from-sky-500 to-blue-600 text-primary-foreground shadow-md font-bold" onClick={handleBookNow}>
                        View Deal <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {activeTab === "hotels" && hotelResults.map((hotel, i) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-2xl bg-card border border-border/40 space-y-3 hover:border-amber-500/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  >
                    {hotel.badge && (
                      <Badge className="absolute top-3 right-3 text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
                        {hotel.badge}
                      </Badge>
                    )}
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-8 h-8 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{hotel.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{hotel.location}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: Math.floor(hotel.rating) }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                          <span className="text-xs font-bold ml-1">{hotel.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="font-bold text-xl text-amber-500">${hotel.price}</p>
                        <p className="text-[10px] text-muted-foreground">per night</p>
                      </div>
                      <Button size="sm" className="rounded-xl gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-primary-foreground shadow-md font-bold" onClick={handleBookNow}>
                        View Deal <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {activeTab === "cars" && carResults.map((car, i) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-2xl bg-card border border-border/40 space-y-3 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  >
                    {car.badge && (
                      <Badge className="absolute top-3 right-3 text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                        {car.badge}
                      </Badge>
                    )}
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center shrink-0">
                        <Car className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{car.type}</p>
                        <h3 className="font-bold text-sm">{car.model}</h3>
                        <p className="text-[11px] text-muted-foreground">{car.seats} seats · Automatic</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="font-bold text-xl text-emerald-500">${car.price}</p>
                        <p className="text-[10px] text-muted-foreground">per day</p>
                      </div>
                      <Button size="sm" className="rounded-xl gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-primary-foreground shadow-md font-bold" onClick={handleBookNow}>
                        View Deal <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default AppTravel;
