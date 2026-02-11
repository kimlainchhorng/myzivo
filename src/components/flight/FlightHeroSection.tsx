import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Star,
  Clock,
  Sparkles,
  Globe,
  Wifi,
  Coffee,
  Tv,
  Crown,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import flightHeroLuxury from "@/assets/flight-hero-luxury.jpg";
import flightHeroPremium from "@/assets/flight-hero-premium.jpg";
import flightFirstClass from "@/assets/flight-first-class.jpg";
import flightDestinations from "@/assets/flight-destinations.jpg";

interface FlightHeroSectionProps {
  onSearch?: () => void;
}

const airlines = [
  { name: "Emirates", logo: "🇦🇪", rating: 4.9 },
  { name: "Singapore Airlines", logo: "🇸🇬", rating: 4.9 },
  { name: "Qatar Airways", logo: "🇶🇦", rating: 4.8 },
  { name: "Lufthansa", logo: "🇩🇪", rating: 4.7 },
  { name: "British Airways", logo: "🇬🇧", rating: 4.6 },
];

const features = [
  { icon: Shield, label: "Secure Partners", desc: "Trusted travel providers" },
  { icon: Star, label: "Compare Prices", desc: "Search 500+ airlines instantly" },
  { icon: Clock, label: "Real-Time Search", desc: "Live availability & pricing" },
];

const stats = [
  { value: "500+", label: "Airlines" },
  { value: "10M+", label: "Travelers" },
  { value: "1000+", label: "Routes" },
  { value: "4.9★", label: "Rating" },
];

const FlightHeroSection = ({ onSearch }: FlightHeroSectionProps) => {
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

  return (
    <section className="relative min-h-[95vh] overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <img 
          src={flightHeroPremium} 
          alt="Airplane window view at sunset" 
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(200_80%_50%/0.1),transparent_50%)]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 hidden lg:block animate-float" style={{ animationDelay: "0s" }}>
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-500/40 to-blue-600/30 backdrop-blur-2xl border border-sky-400/50 flex items-center justify-center shadow-2xl shadow-sky-500/30">
          <Plane className="w-12 h-12 text-sky-300" />
        </div>
      </div>
      <div className="absolute top-48 right-40 hidden lg:block animate-float" style={{ animationDelay: "0.5s" }}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/40 to-yellow-600/30 backdrop-blur-2xl border border-amber-400/50 flex items-center justify-center shadow-xl shadow-amber-500/25">
          <Crown className="w-8 h-8 text-amber-300" />
        </div>
      </div>
      <div className="absolute top-36 left-10 hidden lg:block animate-float" style={{ animationDelay: "1s" }}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/40 to-teal-600/30 backdrop-blur-2xl border border-emerald-400/50 flex items-center justify-center shadow-xl shadow-emerald-500/25">
          <Globe className="w-7 h-7 text-emerald-300" />
        </div>
      </div>
      <div className="absolute bottom-40 left-20 hidden lg:block animate-float" style={{ animationDelay: "1.5s" }}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/40 to-sky-600/30 backdrop-blur-2xl border border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-6 h-6 text-cyan-300" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 pb-16">
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Badge className="mb-6 px-6 py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white border-0 shadow-xl shadow-sky-500/50 text-sm font-bold tracking-wide">
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            ZIVO Flights — World-Class Air Travel
          </Badge>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-tight tracking-tight">
            <span className="text-foreground">Discover the World</span>
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              in Premium Style
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
            Search and compare 500+ airlines instantly. Find great options for business class, 
            first class, and economy flights worldwide.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-10">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group" style={{ animationDelay: `${index * 100}ms` }}>
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">{stat.value}</p>
                <p className="text-sm text-foreground/70 font-semibold mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-lg hover:shadow-xl hover:border-sky-500/40 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/25 to-cyan-500/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-sky-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-foreground block">{feature.label}</span>
                  <span className="text-xs text-muted-foreground">{feature.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Card */}
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.2s" }}>
          <Card className="overflow-hidden border border-border/50 bg-card shadow-2xl shadow-black/40 ring-1 ring-white/5">
            <div className="h-2 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
            
            <CardContent className="p-6 sm:p-8 lg:p-10">
              {/* Trip Type Toggle */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => setTripType("roundtrip")}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                    tripType === "roundtrip"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-500/40 scale-105"
                      : "bg-muted text-foreground/70 hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Round Trip
                </button>
                <button
                  onClick={() => setTripType("oneway")}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                    tripType === "oneway"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-500/40 scale-105"
                      : "bg-muted text-foreground/70 hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <Plane className="w-4 h-4 -rotate-45" />
                  One Way
                </button>
              </div>

              {/* Search Fields */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 relative">
                {/* From */}
                <div className="relative group">
                  <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    From
                  </label>
                  <Input
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    placeholder="City or airport"
                    className="h-14 bg-muted border border-border focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 text-base font-medium rounded-xl"
                  />
                </div>

                {/* Swap Button */}
                <button
                  onClick={swapCities}
                  className="hidden lg:flex absolute left-[calc(25%-22px)] top-[calc(50%+8px)] -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:scale-110 active:scale-95 transition-all duration-200 z-10 shadow-xl shadow-sky-500/50 border-2 border-white/20"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>

                {/* To */}
                <div className="relative group">
                  <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-2">
                    <Plane className="w-4 h-4 text-sky-400 -rotate-45" />
                    To
                  </label>
                  <Input
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    placeholder="City or airport"
                    className="h-14 bg-muted border border-border focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 text-base font-medium rounded-xl"
                  />
                </div>

                {/* Departure Date */}
                <div>
                  <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-sky-400" />
                    Departure
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-14 justify-start bg-muted border border-border hover:border-sky-500 hover:bg-muted text-base font-medium rounded-xl">
                        {departDate ? format(departDate, "MMM d, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border border-border shadow-xl" align="start">
                      <Calendar mode="single" selected={departDate} onSelect={setDepartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Return Date */}
                {tripType === "roundtrip" && (
                  <div>
                    <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-sky-400" />
                      Return
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-14 justify-start bg-muted border border-border hover:border-sky-500 hover:bg-muted text-base font-medium rounded-xl">
                          {returnDate ? format(returnDate, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border border-border shadow-xl" align="start">
                        <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Bottom Row */}
              <div className="flex flex-wrap gap-5 items-end">
                <div className="flex-1 min-w-[160px]">
                  <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    Travelers
                  </label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="h-14 bg-muted border border-border text-base font-medium rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border shadow-xl">
                      <SelectItem value="1">1 Passenger</SelectItem>
                      <SelectItem value="2">2 Passengers</SelectItem>
                      <SelectItem value="3">3 Passengers</SelectItem>
                      <SelectItem value="4">4 Passengers</SelectItem>
                      <SelectItem value="5">5+ Passengers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[160px]">
                  <label className="text-sm font-bold text-foreground mb-2 block flex items-center gap-2">
                    <Crown className="w-4 h-4 text-sky-400" />
                    Class
                  </label>
                  <Select value={cabinClass} onValueChange={setCabinClass}>
                    <SelectTrigger className="h-14 bg-muted border border-border text-base font-medium rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border shadow-xl">
                      <SelectItem value="economy"><span className="flex items-center gap-2"><Plane className="w-4 h-4 text-sky-400" /> Economy</span></SelectItem>
                      <SelectItem value="premium"><span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" /> Premium Economy</span></SelectItem>
                      <SelectItem value="business"><span className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-400" /> Business Class</span></SelectItem>
                      <SelectItem value="first"><span className="flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400" /> First Class</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={onSearch}
                  className="h-14 px-12 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 hover:from-sky-600 hover:via-blue-700 hover:to-cyan-600 text-white font-bold text-lg shadow-xl shadow-sky-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/60 hover:scale-105 active:scale-[0.98] rounded-xl"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Flights
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Airlines */}
        <div className="max-w-5xl mx-auto mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-border" />
            <p className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Trusted by 10M+ travelers • Partnered with world's best airlines
            </p>
            <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-border" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {airlines.map((airline) => (
              <div key={airline.name} className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-card border border-border hover:border-sky-500/50 hover:bg-sky-500/5 transition-all duration-300 shadow-lg hover:shadow-xl group cursor-default">
                <span className="text-2xl group-hover:scale-110 transition-transform">{airline.logo}</span>
                <span className="text-sm font-bold text-foreground hidden sm:inline">{airline.name}</span>
                <div className="flex items-center gap-1 text-amber-400 bg-amber-500/15 px-2 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold">{airline.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Experience Cards */}
      <div className="container mx-auto px-4 pb-24 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-3">
            Experience <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Premium</span> Travel
          </h2>
          <p className="text-muted-foreground">Fly in comfort with world-class amenities</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* First Class */}
          <div className="group relative overflow-hidden rounded-2xl h-72 animate-in fade-in slide-in-from-bottom-4 duration-700 ring-1 ring-white/10 shadow-2xl" style={{ animationDelay: "0.5s" }}>
            <img 
              src={flightFirstClass} 
              alt="First class luxury cabin" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-400 border-amber-500/40 mb-3 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                First Class
              </Badge>
              <h3 className="text-white font-bold text-xl mb-1">Luxury Experience</h3>
              <p className="text-white/70 text-sm">Private suites & 5-star dining</p>
            </div>
          </div>

          {/* Global Network */}
          <div className="group relative overflow-hidden rounded-2xl h-72 animate-in fade-in slide-in-from-bottom-4 duration-700 ring-1 ring-white/10 shadow-2xl" style={{ animationDelay: "0.6s" }}>
            <img 
              src={flightDestinations} 
              alt="Airplane over tropical islands" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="bg-gradient-to-r from-sky-500/30 to-cyan-500/30 text-sky-400 border-sky-500/40 mb-3 shadow-lg">
                <Globe className="w-3 h-3 mr-1" />
                Worldwide
              </Badge>
              <h3 className="text-white font-bold text-xl mb-1">1000+ Destinations</h3>
              <p className="text-white/70 text-sm">Fly anywhere in the world</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="group relative overflow-hidden rounded-2xl h-72 bg-gradient-to-br from-sky-500/20 via-blue-600/10 to-cyan-500/20 border border-sky-500/30 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-2xl" style={{ animationDelay: "0.7s" }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_70%)]" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-sky-500/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 h-full flex flex-col justify-between">
              <div className="flex gap-3">
                {[
                  { icon: Wifi, label: "WiFi" },
                  { icon: Tv, label: "Entertainment" },
                  { icon: Coffee, label: "Meals" }
                ].map((item, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-sky-500/20 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${i * 100}ms` }}>
                    <item.icon className="w-6 h-6 text-sky-400" />
                  </div>
                ))}
              </div>
              <div>
                <Badge className="bg-gradient-to-r from-primary/30 to-cyan-500/30 text-primary border-primary/40 mb-3 shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Comfort
                </Badge>
                <h3 className="text-foreground font-bold text-xl mb-1">Premium Amenities</h3>
                <p className="text-muted-foreground text-sm">WiFi, entertainment & gourmet meals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightHeroSection;
