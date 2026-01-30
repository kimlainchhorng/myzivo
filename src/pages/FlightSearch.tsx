import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  CalendarIcon,
  Users,
  ArrowLeftRight,
  Shield,
  Award,
  Clock,
  Zap,
  Sparkles,
  RefreshCw,
  MapPin,
  Globe,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import AirportAutocomplete from "@/components/flight/AirportAutocomplete";
import { cn } from "@/lib/utils";

const FlightSearch = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
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
    // Build query params
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

  const trustBadges = [
    { icon: Shield, text: "Free Cancellation", color: "text-emerald-500" },
    { icon: Award, text: "Best Price Guarantee", color: "text-amber-500" },
    { icon: Clock, text: "24/7 Support", color: "text-sky-500" },
    { icon: Zap, text: "Instant Confirmation", color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16 pb-20">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-blue-900 to-slate-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/20 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* Floating Elements */}
          <div className="absolute top-24 right-10 hidden lg:block animate-float">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 backdrop-blur-xl border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Plane className="w-8 h-8 text-sky-400" />
            </div>
          </div>
          <div className="absolute top-40 right-32 hidden lg:block animate-float" style={{ animationDelay: "0.5s" }}>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="absolute bottom-40 left-10 hidden lg:block animate-float" style={{ animationDelay: "0.8s" }}>
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 flex items-center justify-center">
              <Star className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10 pt-12 pb-12">
            <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Live Indicator */}
              <div className="flex justify-center mb-4">
                <Badge className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Prices from 500+ Airlines
                </Badge>
              </div>

              <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 shadow-lg shadow-sky-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                ZIVO Flights — Premium Air Travel
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
                Find the best deals
                <br />
                <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  on flights worldwide
                </span>
              </h1>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
                Compare prices from 500+ airlines and book your next adventure with confidence.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {trustBadges.map((item, index) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-sky-500/30 transition-all duration-300 animate-in fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    <span className="text-sm font-medium text-white/90">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Card */}
            <Card className="max-w-4xl mx-auto overflow-hidden border-0 bg-card/90 backdrop-blur-2xl shadow-2xl shadow-black/30 ring-1 ring-white/10">
              <div className="h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
              <CardContent className="p-6 sm:p-8">
                {/* Trip Type Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setTripType("roundtrip")}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-semibold transition-all duration-300",
                      tripType === "roundtrip"
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <RefreshCw className="w-4 h-4 inline-block mr-2" />
                    Round Trip
                  </button>
                  <button
                    onClick={() => setTripType("oneway")}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-semibold transition-all duration-300",
                      tripType === "oneway"
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Plane className="w-4 h-4 inline-block mr-2" />
                    One Way
                  </button>
                </div>

                {/* Search Fields */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                      className="h-12 w-12 rounded-full border-dashed hover:border-sky-500 hover:bg-sky-500/10 shrink-0"
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
                        className="h-12 justify-start text-left font-normal bg-background/50"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {departDate ? format(departDate, "MMM d, yyyy") : "Depart date"}
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
                          className="h-12 justify-start text-left font-normal bg-background/50"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {returnDate ? format(returnDate, "MMM d, yyyy") : "Return date"}
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
                    <label className="text-sm text-muted-foreground mb-1 block">Passengers</label>
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger className="h-12 bg-background/50">
                        <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue />
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
                    <label className="text-sm text-muted-foreground mb-1 block">Cabin Class</label>
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
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  disabled={!fromCity || !toCity || !departDate}
                  size="lg"
                  className="w-full h-14 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-600 hover:via-blue-700 hover:to-sky-600 text-white font-bold text-lg shadow-xl shadow-sky-500/30 transition-all hover:shadow-2xl hover:shadow-sky-500/40"
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
