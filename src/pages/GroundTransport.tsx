import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
            <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-left-2 duration-300">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-2 text-muted-foreground hover:text-foreground touch-manipulation active:scale-95 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto mb-14"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge className="mb-6 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-500 border-violet-500/30 px-4 py-2 text-sm font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ground Transport
                </Badge>
              </motion.div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Bus & Train{" "}
                <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                  Tickets
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Compare and book intercity buses and trains. Best prices, e-tickets, 
                and flexible booking options.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto mb-14"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-violet-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Premium Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <Card className="p-6 lg:p-8 border-0 bg-gradient-to-br from-card/95 to-card shadow-2xl backdrop-blur-sm">
                <div className="grid md:grid-cols-5 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">From</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="New York" className="pl-12 h-14 rounded-xl text-base bg-muted/30 border-border/50 focus:border-violet-500/50" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center md:mt-6">
                    <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                      <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 hover:bg-violet-500/20">
                        <RefreshCw className="h-5 w-5 text-violet-500" />
                      </Button>
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">To</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-500" />
                      <Input placeholder="Boston" className="pl-12 h-14 rounded-xl text-base bg-muted/30 border-border/50 focus:border-violet-500/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="date" className="pl-12 h-14 rounded-xl bg-muted/30 border-border/50 focus:border-violet-500/50" />
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="h-14 w-full text-lg font-bold rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30 hover:opacity-90">
                      Search
                    </Button>
                  </motion.div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-border/50">
                  <div className="relative w-36">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" min="1" defaultValue="1" className="pl-11 h-12 rounded-xl bg-muted/30 border-border/50" placeholder="Passengers" />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl h-12 px-5">
                    <RefreshCw className="h-4 w-4" />
                    Round trip
                  </Button>
                  <div className="flex items-center gap-4 ml-auto text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Free cancellation</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>E-tickets</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10"
            >
              <div>
                <h2 className="font-display text-3xl font-bold mb-2">Available Routes</h2>
                <p className="text-muted-foreground">New York → Boston • {filteredRoutes.length} options</p>
              </div>
              <div className="flex items-center gap-4">
                <Tabs value={transportType} onValueChange={setTransportType}>
                  <TabsList className="bg-muted/50 p-1.5 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="train" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                      <Train className="h-4 w-4" /> Trains
                    </TabsTrigger>
                    <TabsTrigger value="bus" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                      <Bus className="h-4 w-4" /> Buses
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </motion.div>

            {/* Results List */}
            <div className="space-y-4">
              {filteredRoutes.map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer group overflow-hidden">
                    <CardContent className="p-6 lg:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Icon & Operator */}
                        <div className="flex items-center gap-4 lg:min-w-[140px]">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                              route.type === "train" 
                                ? "bg-gradient-to-br from-violet-500 to-purple-500 shadow-violet-500/30" 
                                : "bg-gradient-to-br from-primary to-teal-400 shadow-primary/30"
                            }`}
                          >
                            {route.type === "train" ? (
                              <Train className="h-7 w-7 text-white" />
                            ) : (
                              <Bus className="h-7 w-7 text-white" />
                            )}
                          </motion.div>
                          <div>
                            <p className="font-bold text-lg">{route.operator}</p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 w-fit">
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-sm font-semibold">{route.rating}</span>
                            </div>
                          </div>
                        </div>

                        {/* Times & Route */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-2xl lg:text-3xl font-bold">{route.departureTime}</p>
                              <p className="text-sm text-muted-foreground">{route.departure}</p>
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <div className="h-px flex-1 bg-gradient-to-r from-border via-violet-500/50 to-border" />
                              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-500/10 text-sm font-semibold text-violet-500">
                                <Clock className="h-4 w-4" />
                                {route.duration}
                              </div>
                              <div className="h-px flex-1 bg-gradient-to-r from-border via-violet-500/50 to-border" />
                            </div>
                            <div className="text-center">
                              <p className="text-2xl lg:text-3xl font-bold">{route.arrivalTime}</p>
                              <p className="text-sm text-muted-foreground">{route.arrival}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              {route.amenities.map((amenity) => (
                                <span 
                                  key={amenity} 
                                  className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-500 transition-colors"
                                  title={amenity}
                                >
                                  {getAmenityIcon(amenity)}
                                </span>
                              ))}
                            </div>
                            {route.badge && (
                              <Badge className={`font-semibold ${
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
                        <div className="flex items-center justify-between lg:flex-col lg:items-end lg:min-w-[160px]">
                          <div className="lg:text-right">
                            <p className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                              ${route.price}
                            </p>
                            <p className="text-xs text-muted-foreground">per person</p>
                          </div>
                          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Button className="gap-2 h-12 px-6 font-bold rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30 lg:mt-3">
                              Select <ArrowRight className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
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
