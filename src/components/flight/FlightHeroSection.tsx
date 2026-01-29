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
  Tv
} from "lucide-react";
import { format } from "date-fns";
import flightHeroImage from "@/assets/flight-hero.jpg";
import businessClassImage from "@/assets/flight-business-class.jpg";
import airplaneCloudsImage from "@/assets/airplane-clouds.jpg";

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
  { icon: Shield, label: "Free Cancellation", desc: "Up to 24h before" },
  { icon: Star, label: "Best Price Guarantee", desc: "Or we'll refund the difference" },
  { icon: Clock, label: "24/7 Support", desc: "Round the clock assistance" },
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
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <img 
          src={flightHeroImage} 
          alt="Airplane window view at sunset" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/60" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 hidden lg:block animate-float" style={{ animationDelay: "0s" }}>
        <div className="w-16 h-16 rounded-2xl bg-sky-500/20 backdrop-blur-xl border border-sky-500/30 flex items-center justify-center">
          <Plane className="w-8 h-8 text-sky-400" />
        </div>
      </div>
      <div className="absolute top-40 right-32 hidden lg:block animate-float" style={{ animationDelay: "0.5s" }}>
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center">
          <Globe className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 pb-12">
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            Compare prices from 500+ airlines worldwide. Book premium flights at the best prices with our exclusive deals.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-xl border border-border/50">
                <feature.icon className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Card */}
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.2s" }}>
          <Card className="overflow-hidden border-0 bg-card/80 backdrop-blur-2xl shadow-2xl shadow-black/20">
            {/* Top accent line */}
            <div className="h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
            
            <CardContent className="p-6 sm:p-8">
              {/* Trip Type Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setTripType("roundtrip")}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                    tripType === "roundtrip"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Round Trip
                </button>
                <button
                  onClick={() => setTripType("oneway")}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                    tripType === "oneway"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  One Way
                </button>
              </div>

              {/* Search Fields */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* From */}
                <div className="relative group">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">From</label>
                  <div className="relative">
                    <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-sky-500 transition-colors" />
                    <Input
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      placeholder="City or airport"
                      className="h-14 pl-10 bg-muted/50 border-0 focus:ring-2 focus:ring-sky-500/50 text-base"
                    />
                  </div>
                </div>

                {/* Swap Button - Desktop */}
                <button
                  onClick={swapCities}
                  className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-8 w-10 h-10 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:scale-110 transition-transform z-10 shadow-lg shadow-sky-500/30"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>

                {/* To */}
                <div className="relative group">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">To</label>
                  <div className="relative">
                    <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 group-focus-within:text-sky-500 transition-colors" />
                    <Input
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      placeholder="City or airport"
                      className="h-14 pl-10 bg-muted/50 border-0 focus:ring-2 focus:ring-sky-500/50 text-base"
                    />
                  </div>
                </div>

                {/* Departure Date */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Departure</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-14 justify-start bg-muted/50 border-0 hover:bg-muted text-base">
                        <CalendarIcon className="mr-3 h-4 w-4 text-sky-500" />
                        {departDate ? format(departDate, "MMM d, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
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
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Return</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-14 justify-start bg-muted/50 border-0 hover:bg-muted text-base">
                          <CalendarIcon className="mr-3 h-4 w-4 text-sky-500" />
                          {returnDate ? format(returnDate, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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

              {/* Bottom Row */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Travelers</label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="h-14 bg-muted/50 border-0 text-base">
                      <Users className="w-4 h-4 mr-2 text-sky-500" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Passenger</SelectItem>
                      <SelectItem value="2">2 Passengers</SelectItem>
                      <SelectItem value="3">3 Passengers</SelectItem>
                      <SelectItem value="4">4 Passengers</SelectItem>
                      <SelectItem value="5">5+ Passengers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Class</label>
                  <Select value={cabinClass} onValueChange={setCabinClass}>
                    <SelectTrigger className="h-14 bg-muted/50 border-0 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium">Premium Economy</SelectItem>
                      <SelectItem value="business">Business Class</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={onSearch}
                  className="h-14 px-8 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-sky-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-[1.02]"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Flights
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Airlines */}
        <div className="max-w-4xl mx-auto mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.4s" }}>
          <p className="text-sm text-muted-foreground mb-4">Trusted by millions • Partnered with world's best airlines</p>
          <div className="flex flex-wrap justify-center gap-6">
            {airlines.map((airline) => (
              <div key={airline.name} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/30 backdrop-blur-xl border border-border/30">
                <span className="text-xl">{airline.logo}</span>
                <span className="text-sm font-medium hidden sm:inline">{airline.name}</span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs">{airline.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Experience Cards */}
      <div className="container mx-auto px-4 pb-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Business Class */}
          <div className="group relative overflow-hidden rounded-2xl h-64 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.5s" }}>
            <img 
              src={businessClassImage} 
              alt="Business class experience" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-2">Premium</Badge>
              <h3 className="text-white font-bold text-lg">Business Class</h3>
              <p className="text-white/70 text-sm">Luxury travel experience</p>
            </div>
          </div>

          {/* Global Network */}
          <div className="group relative overflow-hidden rounded-2xl h-64 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.6s" }}>
            <img 
              src={airplaneCloudsImage} 
              alt="Airplane above clouds" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 mb-2">Worldwide</Badge>
              <h3 className="text-white font-bold text-lg">1000+ Routes</h3>
              <p className="text-white/70 text-sm">Fly anywhere in the world</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="group relative overflow-hidden rounded-2xl h-64 bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/20 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.7s" }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.sky.500/0.15),transparent)]" />
            <div className="absolute bottom-0 left-0 right-0 p-6 h-full flex flex-col justify-between">
              <div className="flex gap-3">
                {[Wifi, Tv, Coffee].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-sky-400" />
                  </div>
                ))}
              </div>
              <div>
                <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">Comfort</Badge>
                <h3 className="text-foreground font-bold text-lg">Premium Amenities</h3>
                <p className="text-muted-foreground text-sm">WiFi, entertainment & more</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightHeroSection;
