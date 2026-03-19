/**
 * Flight Search Page — /flights
 * Full search form with airport autocomplete, dates, passengers, cabin class
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Plane, ArrowLeftRight, Users, CalendarIcon, ChevronDown, Search } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import AirportAutocomplete from "@/components/flight/AirportAutocomplete";

type TripType = "roundtrip" | "oneway";

const FlightLanding = () => {
  const navigate = useNavigate();
  const { fromCity, toCity } = useParams();

  const [tripType, setTripType] = useState<TripType>("roundtrip");
  const [origin, setOrigin] = useState(fromCity ? decodeURIComponent(fromCity) : "");
  const [destination, setDestination] = useState(toCity ? decodeURIComponent(toCity) : "");
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState("economy");
  const [passengersOpen, setPassengersOpen] = useState(false);

  const totalPassengers = adults + children + infants;

  // Extract IATA code from display string like "New York (JFK)"
  const extractCode = (val: string): string => {
    const match = val.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : val.trim().toUpperCase();
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = () => {
    const o = extractCode(origin);
    const d = extractCode(destination);
    if (!o || !d || !departureDate) return;

    const params = new URLSearchParams({
      origin: o,
      destination: d,
      departureDate: format(departureDate, "yyyy-MM-dd"),
      adults: String(adults),
      children: String(children),
      infants: String(infants),
      cabinClass,
    });

    if (tripType === "roundtrip" && returnDate) {
      params.set("returnDate", format(returnDate, "yyyy-MM-dd"));
    }

    navigate(`/flights/results?${params.toString()}`);
  };

  const isValid = extractCode(origin).length === 3 && extractCode(destination).length === 3 && !!departureDate;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Search Flights – ZIVO"
        description="Search and compare flights from 500+ airlines. Find the best deals on domestic and international flights."
      />
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto text-center pt-8 pb-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--flights))]/10 flex items-center justify-center mx-auto mb-4">
              <Plane className="w-7 h-7 text-[hsl(var(--flights))]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Search Flights</h1>
            <p className="text-muted-foreground text-base">
              Compare fares from 500+ airlines worldwide
            </p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-card rounded-2xl border border-border shadow-lg p-4 sm:p-6 space-y-4">
              {/* Trip Type Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTripType("roundtrip")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    tripType === "roundtrip"
                      ? "bg-[hsl(var(--flights))] text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  Round Trip
                </button>
                <button
                  onClick={() => { setTripType("oneway"); setReturnDate(undefined); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    tripType === "oneway"
                      ? "bg-[hsl(var(--flights))] text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  One Way
                </button>
              </div>

              {/* Origin / Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <AirportAutocomplete
                  value={origin}
                  onChange={setOrigin}
                  label="From"
                  placeholder="City or airport"
                  excludeCode={extractCode(destination)}
                />
                <button
                  onClick={handleSwap}
                  className="self-end h-10 sm:h-11 w-10 sm:w-11 rounded-xl border border-border bg-muted flex items-center justify-center hover:bg-accent transition-colors mx-auto"
                  aria-label="Swap origin and destination"
                >
                  <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <AirportAutocomplete
                  value={destination}
                  onChange={setDestination}
                  label="To"
                  placeholder="City or airport"
                  excludeCode={extractCode(origin)}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block font-medium">Departure</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-10 sm:h-11 justify-start text-left font-normal bg-muted/50",
                          !departureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {departureDate ? format(departureDate, "EEE, MMM d") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={setDepartureDate}
                        disabled={(d) => d < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {tripType === "roundtrip" && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-0.5 block font-medium">Return</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 sm:h-11 justify-start text-left font-normal bg-muted/50",
                            !returnDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {returnDate ? format(returnDate, "EEE, MMM d") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={returnDate}
                          onSelect={setReturnDate}
                          disabled={(d) => d < (departureDate || new Date())}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Passengers + Cabin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block font-medium">Passengers</label>
                  <Popover open={passengersOpen} onOpenChange={setPassengersOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-10 sm:h-11 justify-between font-normal bg-muted/50"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {totalPassengers} Traveler{totalPassengers > 1 ? "s" : ""}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 pointer-events-auto" align="start">
                      <div className="space-y-4 p-1">
                        {[
                          { label: "Adults", sublabel: "12+ years", value: adults, setter: setAdults, min: 1, max: 9 },
                          { label: "Children", sublabel: "2–11 years", value: children, setter: setChildren, min: 0, max: 8 },
                          { label: "Infants", sublabel: "Under 2", value: infants, setter: setInfants, min: 0, max: adults },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => item.setter(Math.max(item.min, item.value - 1))}
                                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-sm hover:bg-accent disabled:opacity-40"
                                disabled={item.value <= item.min}
                              >
                                −
                              </button>
                              <span className="w-6 text-center font-medium">{item.value}</span>
                              <button
                                onClick={() => item.setter(Math.min(item.max, item.value + 1))}
                                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-sm hover:bg-accent disabled:opacity-40"
                                disabled={item.value >= item.max}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => setPassengersOpen(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block font-medium">Cabin Class</label>
                  <Select value={cabinClass} onValueChange={setCabinClass}>
                    <SelectTrigger className="h-10 sm:h-11 bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium_economy">Premium Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <Button
                size="lg"
                onClick={handleSearch}
                disabled={!isValid}
                className="w-full h-12 text-base font-semibold gap-2 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90"
              >
                <Search className="w-5 h-5" />
                Search Flights
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightLanding;
