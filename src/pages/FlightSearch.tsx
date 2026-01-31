import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Shield,
  Clock,
  Zap,
  RefreshCw,
  Globe,
  MapPin,
  Crown,
  Sunrise,
  Sun,
} from "lucide-react";
import { format } from "date-fns";
import AirportAutocomplete from "@/components/flight/AirportAutocomplete";
import { cn } from "@/lib/utils";

const FlightSearch = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"roundtrip" | "oneway" | "multicity">("roundtrip");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState("economy");
  const [flexibleDates, setFlexibleDates] = useState(false);

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
      flexible: flexibleDates ? "1" : "0",
    });
    if (returnDate && tripType === "roundtrip") {
      params.set("return", format(returnDate, "yyyy-MM-dd"));
    }
    navigate(`/flights/results?${params.toString()}`);
  };

  const trustBadges = [
    { icon: Shield, text: "Secure Search", color: "text-emerald-500" },
    { icon: Globe, text: "500+ Airlines", color: "text-sky-500" },
    { icon: Clock, text: "24/7 Support", color: "text-amber-500" },
    { icon: Zap, text: "Real-Time Prices", color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="ZIVO Flights – Search & Compare Flights Worldwide"
        description="Search and compare flights from 500+ airlines worldwide. Find the best deals and book with trusted travel partners. No booking fees."
      />
      <Header />

      <main className="pt-16 pb-20">
        {/* Hero Section - Search Only */}
        <section className="relative min-h-[70vh] flex items-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-sky-950 to-blue-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/20 via-blue-500/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10 py-12">
            {/* Page Title */}
            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge className="mb-4 px-4 py-2 bg-sky-500/20 text-sky-400 border-sky-500/40 gap-2 backdrop-blur-xl">
                <Plane className="w-4 h-4" />
                ZIVO Flights — Search & Compare
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">
                Compare prices from
                <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {" "}500+ airlines
                </span>
              </h1>
              <p className="text-lg text-white/70 max-w-xl mx-auto">
                Search and compare flight options to find the best deals for your next trip.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {trustBadges.map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
                  >
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    <span className="text-sm text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Card */}
            <Card className="max-w-4xl mx-auto overflow-hidden border-0 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/40 ring-1 ring-white/10">
              <div className="h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
              <CardContent className="p-6">
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
                        "px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm",
                        tripType === type.id
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
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
                  {/* From/To with Swap */}
                  <div className="md:col-span-2 grid md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
                    <AirportAutocomplete
                      value={fromCity}
                      onChange={setFromCity}
                      placeholder="From where?"
                      label="From"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={swapCities}
                      className="h-12 w-12 rounded-full border-dashed hover:border-sky-500 hover:bg-sky-500/10 shrink-0 transition-all hover:rotate-180 duration-500"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </Button>
                    <AirportAutocomplete
                      value={toCity}
                      onChange={setToCity}
                      placeholder="To where?"
                      label="To"
                      excludeCode={fromCity.match(/\(([A-Z]{3})\)/)?.[1]}
                    />
                  </div>

                  {/* Dates */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-14 justify-start text-left font-normal bg-background/50 hover:bg-background/80"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                            <Sunrise className="h-5 w-5 text-sky-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Departure</p>
                            <p className="font-medium">{departDate ? format(departDate, "EEE, MMM d") : "Select date"}</p>
                          </div>
                        </div>
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

                  {tripType === "roundtrip" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-14 justify-start text-left font-normal bg-background/50 hover:bg-background/80"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                              <Sun className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Return</p>
                              <p className="font-medium">{returnDate ? format(returnDate, "EEE, MMM d") : "Select date"}</p>
                            </div>
                          </div>
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
                  )}

                  {/* Passengers */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Passengers</label>
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger className="h-14 bg-background/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-500" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-muted-foreground">Travelers</p>
                            <p className="font-medium">{passengers} {parseInt(passengers) === 1 ? "Passenger" : "Passengers"}</p>
                          </div>
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
                    <label className="text-sm text-muted-foreground mb-2 block">Cabin Class</label>
                    <Select value={cabinClass} onValueChange={setCabinClass}>
                      <SelectTrigger className="h-14 bg-background/50">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            cabinClass === "first" ? "bg-amber-500/10" :
                            cabinClass === "business" ? "bg-blue-500/10" : "bg-emerald-500/10"
                          )}>
                            <Crown className={cn(
                              "w-5 h-5",
                              cabinClass === "first" ? "text-amber-500" :
                              cabinClass === "business" ? "text-blue-500" : "text-emerald-500"
                            )} />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-muted-foreground">Class</p>
                            <p className="font-medium capitalize">{cabinClass}</p>
                          </div>
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
                  className="w-full h-14 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-600 hover:via-blue-700 hover:to-sky-600 text-white font-bold text-lg shadow-xl shadow-sky-500/30 transition-all hover:shadow-sky-500/50"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Flights
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FlightSearch;
