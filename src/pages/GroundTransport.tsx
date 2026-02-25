import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Train, 
  Bus, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Filter, 
  Star, 
  Wifi, 
  Coffee, 
  Plug,
  RefreshCw,
  ArrowUpRight,
  ChevronLeft,
  Sparkles,
  Zap,
  Shield,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GroundTransport = () => {
  const navigate = useNavigate();
  const [transportType, setTransportType] = useState("all");

  const sampleRoutes = [
    {
      id: 1,
      type: "train",
      operator: "Amtrak",
      departure: "New York",
      arrival: "Boston",
      departureTime: "08:00 AM",
      arrivalTime: "12:30 PM",
      duration: "4h 30m",
      price: 89,
      amenities: ["wifi", "food", "power"],
      rating: 4.5,
    },
    {
      id: 2,
      type: "bus",
      operator: "Greyhound",
      departure: "New York",
      arrival: "Boston",
      departureTime: "09:00 AM",
      arrivalTime: "02:00 PM",
      duration: "5h 00m",
      price: 35,
      amenities: ["wifi", "power"],
      rating: 4.2,
    },
    {
      id: 3,
      type: "train",
      operator: "Acela Express",
      departure: "New York",
      arrival: "Boston",
      departureTime: "10:00 AM",
      arrivalTime: "01:30 PM",
      duration: "3h 30m",
      price: 149,
      amenities: ["wifi", "food", "power"],
      rating: 4.8,
      badge: "Fastest",
    },
    {
      id: 4,
      type: "bus",
      operator: "FlixBus",
      departure: "New York",
      arrival: "Boston",
      departureTime: "11:00 AM",
      arrivalTime: "04:30 PM",
      duration: "5h 30m",
      price: 25,
      amenities: ["wifi"],
      rating: 4.0,
      badge: "Cheapest",
    },
  ];

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi": return <Wifi className="h-4 w-4" />;
      case "food": return <Coffee className="h-4 w-4" />;
      case "power": return <Plug className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredRoutes = transportType === "all" 
    ? sampleRoutes 
    : sampleRoutes.filter(r => r.type === transportType);

  const stats = [
    { value: "500+", label: "Routes", icon: MapPin },
    { value: "50+", label: "Operators", icon: Bus },
    { value: "100+", label: "Cities", icon: Train },
    { value: "4.5★", label: "Rating", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <Header />

      <main className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden">
          {/* Enhanced background effects */}
          <div className="absolute inset-0 bg-gradient-radial from-violet-500/18 via-transparent to-transparent opacity-60" />
          <div className="absolute top-1/3 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-bl from-violet-500/25 to-purple-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-gradient-to-tr from-indigo-500/15 to-violet-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Back Navigation */}
            <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-left-2 duration-200">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-2 text-muted-foreground hover:text-foreground touch-manipulation active:scale-95 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </div>

            <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-14 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-500 border-violet-500/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Ground Transport
              </Badge>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                Bus & Train{" "}
                <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                  Tickets
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Compare and book intercity buses and trains. Best prices, e-tickets, 
                and flexible booking options.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto mb-10 sm:mb-14">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-in fade-in slide-in-from-bottom-4 duration-200"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-violet-500" />
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Premium Search Card */}
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <Card className="p-4 sm:p-6 lg:p-8 border-0 bg-gradient-to-br from-card/95 to-card shadow-2xl backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">From</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <Input placeholder="New York" className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl text-sm sm:text-base bg-muted/30 border-border/50 focus:border-violet-500/50" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center sm:hidden md:flex md:mt-6">
                    <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 hover:bg-violet-500/20 touch-manipulation active:scale-95">
                      <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-violet-500" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">To</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-violet-500" />
                      <Input placeholder="Boston" className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl text-sm sm:text-base bg-muted/30 border-border/50 focus:border-violet-500/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <Input type="date" className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl bg-muted/30 border-border/50 focus:border-violet-500/50" />
                    </div>
                  </div>
                  <Button className="h-12 sm:h-14 w-full text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30 hover:opacity-90 touch-manipulation active:scale-[0.98]">
                    Search
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/50">
                  <div className="relative w-full sm:w-36">
                    <Users className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" min="1" defaultValue="1" className="pl-10 sm:pl-11 h-11 sm:h-12 rounded-xl bg-muted/30 border-border/50" placeholder="Passengers" />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl h-11 sm:h-12 px-4 sm:px-5 touch-manipulation">
                    <RefreshCw className="h-4 w-4" />
                    Round trip
                  </Button>
                  <div className="flex items-center gap-3 sm:gap-4 ml-auto text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                      <span className="hidden sm:inline">Free cancellation</span>
                      <span className="sm:hidden">Cancel free</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                      <span>E-tickets</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-10 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Filter Tabs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 mb-6 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Available Routes</h2>
                <p className="text-sm sm:text-base text-muted-foreground">New York → Boston • {filteredRoutes.length} options</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                <Tabs value={transportType} onValueChange={setTransportType}>
                  <TabsList className="bg-muted/50 p-1 sm:p-1.5 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white touch-manipulation">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="train" className="gap-1.5 sm:gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white touch-manipulation">
                      <Train className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Trains
                    </TabsTrigger>
                    <TabsTrigger value="bus" className="gap-1.5 sm:gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white touch-manipulation">
                      <Bus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Buses
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl touch-manipulation flex-shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredRoutes.map((route, index) => (
                <div
                  key={route.id}
                  className="animate-in fade-in slide-in-from-left-4 duration-300 hover:-translate-y-1 transition-transform"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer group overflow-hidden">
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
                        {/* Icon & Operator */}
                        <div className="flex items-center gap-3 sm:gap-4 lg:min-w-[140px]">
                          <div 
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${
                              route.type === "train" 
                                ? "bg-gradient-to-br from-violet-500 to-purple-500 shadow-violet-500/30" 
                                : "bg-gradient-to-br from-primary to-teal-400 shadow-primary/30"
                            }`}
                          >
                            {route.type === "train" ? (
                              <Train className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                            ) : (
                              <Bus className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-base sm:text-lg">{route.operator}</p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 w-fit">
                              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-xs sm:text-sm font-semibold">{route.rating}</span>
                            </div>
                          </div>
                        </div>

                        {/* Times & Route */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <div className="text-center">
                              <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{route.departureTime}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{route.departure}</p>
                            </div>
                            <div className="flex-1 flex items-center gap-2 sm:gap-3">
                              <div className="h-px flex-1 bg-gradient-to-r from-border via-violet-500/50 to-border" />
                              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-violet-500/10 text-xs sm:text-sm font-semibold text-violet-500">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                {route.duration}
                              </div>
                              <div className="h-px flex-1 bg-gradient-to-r from-border via-violet-500/50 to-border" />
                            </div>
                            <div className="text-center">
                              <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{route.arrivalTime}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{route.arrival}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              {route.amenities.map((amenity) => (
                                <span 
                                  key={amenity} 
                                  className="p-1.5 sm:p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-500 transition-colors"
                                  title={amenity}
                                >
                                  {getAmenityIcon(amenity)}
                                </span>
                              ))}
                            </div>
                            {route.badge && (
                              <Badge className={`font-semibold text-xs ${
                                route.badge === "Fastest" 
                                  ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-500 border-violet-500/30" 
                                  : "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-500 border-emerald-500/30"
                              }`}>
                                <Zap className="w-3 h-3 mr-1" />
                                {route.badge}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between lg:flex-col lg:items-end lg:min-w-[160px] pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                          <div className="lg:text-right">
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                              ${route.price}
                            </p>
                            <p className="text-xs text-muted-foreground">per person</p>
                          </div>
                          <Button className="gap-2 h-10 sm:h-12 px-4 sm:px-6 font-bold rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30 lg:mt-3 touch-manipulation active:scale-[0.98] text-sm sm:text-base">
                            Select <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GroundTransport;
