import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
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
  Users,
  ArrowLeftRight,
  RefreshCw,
  MapPin,
  Crown,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import AirportAutocomplete from "@/components/flight/AirportAutocomplete";
import ProfessionalHero from "@/components/shared/ProfessionalHero";
import ProfessionalSearchCard from "@/components/shared/ProfessionalSearchCard";
import PopularDestinationsGrid from "@/components/shared/PopularDestinationsGrid";
import WhyBookSection from "@/components/shared/WhyBookSection";
import TravelExtrasCTA from "@/components/shared/TravelExtrasCTA";
import TravelFAQ from "@/components/shared/TravelFAQ";
import { cn } from "@/lib/utils";

/**
 * ZIVO FLIGHTS - Professional Search Page
 * Google Flights quality UX/UI
 */

const FlightSearch = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"roundtrip" | "oneway" | "multicity">("roundtrip");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState("economy");

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearch = () => {
    const params = new URLSearchParams({
      from: fromCity,
      to: toCity,
      depart: departDate ? format(departDate, "yyyy-MM-dd") : "",
      passengers,
      cabin: cabinClass,
      tripType,
    });
    if (returnDate && tripType === "roundtrip") {
      params.set("return", format(returnDate, "yyyy-MM-dd"));
    }
    navigate(`/flights/results?${params.toString()}`);
  };

  const handleDestinationSelect = (city: string) => {
    setToCity(city);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="ZIVO Flights – Search & Compare Flights Worldwide"
        description="Search and compare flights from 500+ airlines worldwide. Find great options and book with trusted travel partners. No booking fees."
      />
      <Header />

      <main className="pb-20">
        <ProfessionalHero
          service="flights"
          icon={Plane}
          title="Search & Compare Flights"
          subtitle="Compare prices from 500+ airlines. Book with our trusted travel partners."
        >
          <ProfessionalSearchCard service="flights">
            {/* Trip Type Toggle */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { id: "roundtrip", label: "Round Trip", icon: RefreshCw },
                { id: "oneway", label: "One Way", icon: Plane },
                { id: "multicity", label: "Multi-City", icon: MapPin },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setTripType(type.id as typeof tripType)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm",
                    tripType === type.id
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </button>
              ))}
            </div>

            {/* Search Fields */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* From/To Row */}
              <div className="md:col-span-2 grid md:grid-cols-[1fr,auto,1fr] gap-3 items-end">
                <AirportAutocomplete
                  value={fromCity}
                  onChange={setFromCity}
                  placeholder="Where from?"
                  label="From"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapCities}
                  className="h-11 w-11 rounded-full border-dashed hover:border-sky-500 hover:bg-sky-500/10 shrink-0 transition-all hover:rotate-180 duration-500"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </Button>
                <AirportAutocomplete
                  value={toCity}
                  onChange={setToCity}
                  placeholder="Where to?"
                  label="To"
                  excludeCode={fromCity.match(/\(([A-Z]{3})\)/)?.[1]}
                />
              </div>

              {/* Departure Date */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Departure</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-start text-left font-normal"
                    >
                      <CalendarDays className="w-4 h-4 mr-2 text-sky-500" />
                      {departDate ? format(departDate, "EEE, MMM d") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={departDate}
                      onSelect={setDepartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Return Date */}
              {tripType === "roundtrip" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Return</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 justify-start text-left font-normal"
                      >
                        <CalendarDays className="w-4 h-4 mr-2 text-orange-500" />
                        {returnDate ? format(returnDate, "EEE, MMM d") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        disabled={(date) => date < (departDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Passengers */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Passengers</label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>{passengers} {parseInt(passengers) === 1 ? "Passenger" : "Passengers"}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} {n === 1 ? "Passenger" : "Passengers"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cabin Class */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Cabin Class</label>
                <Select value={cabinClass} onValueChange={setCabinClass}>
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-2">
                      <Crown className={cn(
                        "w-4 h-4",
                        cabinClass === "first" ? "text-amber-500" :
                        cabinClass === "business" ? "text-blue-500" : "text-emerald-500"
                      )} />
                      <span className="capitalize">{cabinClass}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium">Premium Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={!fromCity || !toCity || !departDate}
              size="lg"
              className={cn(
                "w-full h-12 font-semibold text-base",
                "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
                "shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40",
                "transition-all duration-200"
              )}
            >
              <Search className="w-5 h-5 mr-2" />
              Search Flights
            </Button>
          </ProfessionalSearchCard>
        </ProfessionalHero>

        {/* Popular Destinations */}
        <PopularDestinationsGrid 
          service="flights" 
          onSelect={handleDestinationSelect}
        />

        {/* Why Book Section */}
        <WhyBookSection service="flights" />

        {/* Travel Extras */}
        <TravelExtrasCTA currentService="flights" />

        {/* FAQ Section */}
        <TravelFAQ serviceType="flights" className="bg-muted/20" />
      </main>

      <Footer />
    </div>
  );
};

export default FlightSearch;
