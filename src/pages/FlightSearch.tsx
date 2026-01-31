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
import ImageHero from "@/components/shared/ImageHero";
import BigSearchCard from "@/components/shared/BigSearchCard";
import DestinationCardsGrid from "@/components/shared/DestinationCardsGrid";
import TrustSection from "@/components/shared/TrustSection";
import TravelExtrasCTA from "@/components/shared/TravelExtrasCTA";
import TravelFAQ from "@/components/shared/TravelFAQ";
import { TrustFeatureCards } from "@/components/marketing";
import { OGImageMeta } from "@/components/marketing";
import { SEOContentBlock, InternalLinkGrid, PopularRoutesGrid } from "@/components/seo";
import { cn } from "@/lib/utils";

/**
 * ZIVO FLIGHTS - Top-Tier Travel Search
 * Skyscanner / Kayak / Google Flights quality
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
      <OGImageMeta pageType="flights" />
      <Header />

      <main className="pb-20">
        {/* Hero with Big Search */}
        <ImageHero service="flights" icon={Plane}>
          <BigSearchCard service="flights">
            {/* Trip Type Toggle */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: "roundtrip", label: "Round Trip", icon: RefreshCw },
                { id: "oneway", label: "One Way", icon: Plane },
                { id: "multicity", label: "Multi-City", icon: MapPin },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setTripType(type.id as typeof tripType)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm",
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

            {/* Main Search Fields - 2 Row Layout */}
            <div className="space-y-4">
              {/* Row 1: From / To */}
              <div className="grid md:grid-cols-[1fr,auto,1fr] gap-3 items-end">
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
                  className="h-12 w-12 rounded-full border-dashed border-2 hover:border-sky-500 hover:bg-sky-500/10 shrink-0 transition-all hover:rotate-180 duration-500 hidden md:flex"
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

              {/* Mobile swap button */}
              <Button
                variant="outline"
                onClick={swapCities}
                className="w-full h-10 md:hidden border-dashed gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Swap Airports
              </Button>

              {/* Row 2: Dates, Passengers, Class */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Departure Date */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Departure</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start text-left font-normal"
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
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Return</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal",
                          tripType !== "roundtrip" && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={tripType !== "roundtrip"}
                      >
                        <CalendarDays className="w-4 h-4 mr-2 text-orange-500" />
                        {tripType === "roundtrip" 
                          ? (returnDate ? format(returnDate, "EEE, MMM d") : "Select date")
                          : "One way"
                        }
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

                {/* Passengers */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Passengers</label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="h-12">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span>{passengers} {parseInt(passengers) === 1 ? "Traveler" : "Travelers"}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} {n === 1 ? "Traveler" : "Travelers"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cabin Class */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Class</label>
                  <Select value={cabinClass} onValueChange={setCabinClass}>
                    <SelectTrigger className="h-12">
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
            </div>

            {/* Search Button - Big & Prominent */}
            <Button
              onClick={handleSearch}
              disabled={!fromCity || !toCity || !departDate}
              size="lg"
              className={cn(
                "w-full h-14 font-bold text-lg mt-6",
                "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
                "shadow-xl shadow-sky-500/30 hover:shadow-sky-500/40",
                "transition-all duration-300 active:scale-[0.98]"
              )}
            >
              <Search className="w-5 h-5 mr-2" />
              Search Flights
            </Button>
          </BigSearchCard>
        </ImageHero>

        {/* SEO Content Block - H1 and intro for search engines */}
        <SEOContentBlock serviceType="flights" className="bg-muted/5" />

        {/* Popular Destinations with Real Images */}
        <DestinationCardsGrid 
          service="flights" 
          onSelect={handleDestinationSelect}
        />

        {/* Popular Routes Grid for SEO */}
        <PopularRoutesGrid />

        {/* Trust Features */}
        <TrustFeatureCards columns={4} />

        {/* Why Book Section */}
        <TrustSection service="flights" />

        {/* Travel Extras */}
        <TravelExtrasCTA currentService="flights" />

        {/* Internal Linking - Cross-sell to Hotels & Cars */}
        <InternalLinkGrid currentService="flights" />

        {/* FAQ Section with Schema */}
        <TravelFAQ serviceType="flights" className="bg-muted/20" />
      </main>

      <Footer />
    </div>
  );
};

export default FlightSearch;
