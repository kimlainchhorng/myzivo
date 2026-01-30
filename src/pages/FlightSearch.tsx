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
  Globe,
  Star,
  TrendingDown,
  MapPin,
  Percent,
  Crown,
  Heart,
  Compass,
  Sunrise,
  Sun,
} from "lucide-react";
import { format, addDays } from "date-fns";
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
    { icon: Shield, text: "Free Cancellation", color: "text-emerald-500" },
    { icon: Award, text: "Best Price Guarantee", color: "text-amber-500" },
    { icon: Clock, text: "24/7 Support", color: "text-sky-500" },
    { icon: Zap, text: "Instant Confirmation", color: "text-purple-500" },
  ];

  const popularRoutes = [
    { from: "LAX", to: "JFK", price: 129, savings: "32%" },
    { from: "SFO", to: "LHR", price: 449, savings: "28%" },
    { from: "NYC", to: "CDG", price: 399, savings: "25%" },
    { from: "MIA", to: "CUN", price: 89, savings: "40%" },
  ];

  const featuredDeals = [
    { city: "Paris", country: "France", price: 399, image: "🗼", tag: "Romance" },
    { city: "Tokyo", country: "Japan", price: 649, image: "🗾", tag: "Adventure" },
    { city: "Bali", country: "Indonesia", price: 499, image: "🏝️", tag: "Beach" },
    { city: "London", country: "UK", price: 349, image: "🎡", tag: "Culture" },
  ];

  const stats = [
    { value: "500+", label: "Airlines", icon: Plane },
    { value: "2M+", label: "Routes", icon: Globe },
    { value: "4.9", label: "Rating", icon: Star },
    { value: "$50M+", label: "Saved", icon: TrendingDown },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16 pb-20">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Enhanced Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-sky-950 to-blue-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/30 via-blue-500/10 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
            {/* Animated Stars */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* Floating Elements */}
          <div className="absolute top-24 right-10 hidden lg:block animate-float">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-500/30 to-blue-600/30 backdrop-blur-xl border border-sky-500/40 flex items-center justify-center shadow-2xl shadow-sky-500/30">
              <Plane className="w-10 h-10 text-sky-400" />
            </div>
          </div>
          <div className="absolute top-48 right-36 hidden lg:block animate-float" style={{ animationDelay: "0.5s" }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 backdrop-blur-xl border border-blue-500/40 flex items-center justify-center">
              <Globe className="w-7 h-7 text-blue-400" />
            </div>
          </div>
          <div className="absolute bottom-48 left-10 hidden lg:block animate-float" style={{ animationDelay: "0.8s" }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 backdrop-blur-xl border border-amber-500/40 flex items-center justify-center">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="absolute bottom-32 right-20 hidden lg:block animate-float" style={{ animationDelay: "1.2s" }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-600/30 backdrop-blur-xl border border-emerald-500/40 flex items-center justify-center">
              <Compass className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10 pt-8 pb-12">
            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Live Indicator */}
              <div className="flex justify-center gap-3 mb-4">
                <Badge className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/40 gap-2 backdrop-blur-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Live Prices from 500+ Airlines
                </Badge>
                <Badge className="px-4 py-2 bg-amber-500/20 text-amber-400 border-amber-500/40 gap-2 backdrop-blur-xl hidden sm:flex">
                  <Percent className="w-3.5 h-3.5" />
                  Up to 40% Off Today
                </Badge>
              </div>

              <Badge className="mb-6 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 shadow-lg shadow-sky-500/40">
                <Sparkles className="w-4 h-4 mr-2" />
                ZIVO Flights — Premium Air Travel
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight text-white">
                Find the best deals
                <br />
                <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  on flights worldwide
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8">
                Compare prices from 500+ airlines and book your next adventure with confidence.
                Save up to 40% on flights today.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                {stats.map((stat, idx) => (
                  <div 
                    key={stat.label}
                    className="text-center animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-2">
                      <stat.icon className="w-6 h-6 text-sky-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {trustBadges.map((item, index) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-sky-500/40 hover:bg-white/10 transition-all duration-300 animate-in fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    <span className="text-sm font-medium text-white/90">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Card */}
            <Card className="max-w-5xl mx-auto overflow-hidden border-0 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/40 ring-1 ring-white/10">
              <div className="h-2 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
              <CardContent className="p-6 sm:p-8">
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
                        "px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2",
                        tripType === type.id
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  ))}
                  
                  {/* Flexible Dates Toggle */}
                  <button
                    onClick={() => setFlexibleDates(!flexibleDates)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ml-auto",
                      flexibleDates
                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    Flexible Dates
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
                        className="h-14 justify-start text-left font-normal bg-background/50 hover:bg-background/80 transition-all"
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
                          className="h-14 justify-start text-left font-normal bg-background/50 hover:bg-background/80 transition-all"
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
                  className="w-full h-16 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-600 hover:via-blue-700 hover:to-sky-600 text-white font-bold text-lg shadow-2xl shadow-sky-500/40 transition-all hover:shadow-sky-500/60 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search className="w-6 h-6 mr-3" />
                  Search Flights
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>

                {/* Popular Routes */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                    Popular routes with best prices:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularRoutes.map((route) => (
                      <button
                        key={`${route.from}-${route.to}`}
                        onClick={() => {
                          setFromCity(`(${route.from})`);
                          setToCity(`(${route.to})`);
                        }}
                        className="px-4 py-2 rounded-full bg-muted/50 hover:bg-muted transition-all text-sm flex items-center gap-2 group"
                      >
                        <span className="font-medium">{route.from}</span>
                        <Plane className="w-3 h-3 text-muted-foreground group-hover:text-sky-500 transition-colors" />
                        <span className="font-medium">{route.to}</span>
                        <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">${route.price}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Deals Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-sky-500/20 text-sky-500 border-sky-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Featured Destinations
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Escape to your dream destination
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Handpicked deals on flights to the world's most exciting destinations
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDeals.map((deal, idx) => (
                <Card 
                  key={deal.city}
                  className="group cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => setToCity(`${deal.city} (${deal.city.substring(0, 3).toUpperCase()})`)}
                >
                  <div className="relative h-40 bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center">
                    <span className="text-6xl group-hover:scale-125 transition-transform duration-500">{deal.image}</span>
                    <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-xl text-white border-0">
                      {deal.tag}
                    </Badge>
                    <button className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Heart className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg">{deal.city}</h3>
                    <p className="text-sm text-muted-foreground">{deal.country}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="text-2xl font-bold text-sky-500">${deal.price}</p>
                      </div>
                      <Button size="sm" className="bg-sky-500 hover:bg-sky-600 gap-1">
                        View <Plane className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FlightSearch;