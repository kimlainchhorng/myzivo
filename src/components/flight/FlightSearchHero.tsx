import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plane,
  Search,
  CalendarIcon,
  Users,
  ArrowLeftRight,
  Shield,
  Star,
  Clock,
  Sparkles,
  Globe,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import AirportAutocomplete from "./AirportAutocomplete";
import PriceCalendar from "./PriceCalendar";
import flightHeroImage from "@/assets/flight-hero.jpg";

interface FlightSearchHeroProps {
  tripType: "roundtrip" | "oneway";
  setTripType: (type: "roundtrip" | "oneway") => void;
  fromCity: string;
  setFromCity: (city: string) => void;
  toCity: string;
  setToCity: (city: string) => void;
  departDate?: Date;
  setDepartDate: (date: Date | undefined) => void;
  returnDate?: Date;
  setReturnDate: (date: Date | undefined) => void;
  passengers: string;
  setPassengers: (passengers: string) => void;
  cabinClass: string;
  setCabinClass: (cabin: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  recentSearches: string[];
}

export default function FlightSearchHero({
  tripType,
  setTripType,
  fromCity,
  setFromCity,
  toCity,
  setToCity,
  departDate,
  setDepartDate,
  returnDate,
  setReturnDate,
  passengers,
  setPassengers,
  cabinClass,
  setCabinClass,
  onSearch,
  isSearching,
  recentSearches,
}: FlightSearchHeroProps) {
  const [showPriceCalendar, setShowPriceCalendar] = useState(false);

  // Extract airport codes
  const fromMatch = fromCity.match(/\(([A-Z]{3})\)/);
  const toMatch = toCity.match(/\(([A-Z]{3})\)/);
  const fromCode = fromMatch ? fromMatch[1] : "LAX";
  const toCode = toMatch ? toMatch[1] : "JFK";

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={flightHeroImage}
          alt="Airplane window view at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/60" />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-24 right-10 hidden lg:block animate-float">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/20 backdrop-blur-xl border border-sky-500/30 flex items-center justify-center">
          <Plane className="w-8 h-8 text-sky-400" />
        </div>
      </div>
      <div
        className="absolute top-40 right-32 hidden lg:block animate-float"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center">
          <Globe className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 pb-12">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 shadow-lg shadow-sky-500/30">
            <Sparkles className="w-4 h-4 mr-2" />
            ZIVO Flights — Premium Air Travel
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
            Your journey to
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              anywhere starts here
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Compare prices from 500+ airlines worldwide. Book premium flights at
            the best prices with our exclusive deals.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              { icon: Shield, text: "Free Cancellation" },
              { icon: Star, text: "Best Price Guarantee" },
              { icon: Clock, text: "24/7 Support" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-xl border border-border/50"
              >
                <item.icon className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Card */}
        <div
          className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="overflow-hidden border-0 bg-card/80 backdrop-blur-2xl shadow-2xl shadow-black/20">
            {/* Top accent line */}
            <div className="h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
            <CardContent className="p-6 sm:p-8">
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
                  <AirportAutocomplete
                    value={fromCity}
                    onChange={setFromCity}
                    label="From"
                    placeholder="City or airport"
                    recentSearches={recentSearches}
                    excludeCode={toCode}
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
                  <AirportAutocomplete
                    value={toCity}
                    onChange={setToCity}
                    label="To"
                    placeholder="Where to?"
                    recentSearches={recentSearches}
                    excludeCode={fromCode}
                  />
                </div>

                {/* Departure Date */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Departure
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start bg-background/50"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {departDate
                          ? format(departDate, "MMM d, yyyy")
                          : "Select date"}
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
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Return
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-start bg-background/50"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {returnDate
                            ? format(returnDate, "MMM d, yyyy")
                            : "Select date"}
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
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Passengers
                  </label>
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
                      <SelectItem value="5">5 Passengers</SelectItem>
                      <SelectItem value="6">6+ Passengers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Cabin Class
                  </label>
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
                  onClick={onSearch}
                  disabled={!fromCity || !toCity || !departDate || isSearching}
                  className="h-12 px-8 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-sky-500/30 transition-all hover:shadow-xl hover:shadow-sky-500/40"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search Flights
                    </>
                  )}
                </Button>
              </div>

              {/* Price Calendar Toggle */}
              {toCity && (
                <div className="pt-4 border-t border-border/30 mt-4">
                  <button
                    onClick={() => setShowPriceCalendar(!showPriceCalendar)}
                    className="flex items-center gap-2 text-sm text-sky-500 hover:text-sky-400 transition-colors"
                  >
                    <CalendarDays className="w-4 h-4" />
                    {showPriceCalendar ? "Hide" : "View"} Price Calendar
                    <Badge
                      variant="outline"
                      className="text-[10px] border-sky-500/40 text-sky-400"
                    >
                      <Sparkles className="w-2.5 h-2.5 mr-1" />
                      Find lowest fares
                    </Badge>
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Calendar */}
          {showPriceCalendar && toCity && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <PriceCalendar
                basePrice={299}
                selectedDate={departDate}
                onSelectDate={(date) => {
                  setDepartDate(date);
                  setShowPriceCalendar(false);
                }}
                fromCode={fromCode}
                toCode={toCode}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
