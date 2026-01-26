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
  Filter, 
  Star, 
  Wifi, 
  Coffee, 
  Plug,
  RefreshCw,
  ArrowUpRight
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
    { value: "500+", label: "Routes" },
    { value: "50+", label: "Operators" },
    { value: "100+", label: "Cities" },
    { value: "4.5★", label: "Avg Rating" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-violet-500/10 via-transparent to-transparent opacity-50" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <Badge className="mb-4 bg-violet-500/10 text-violet-500">New Service</Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Bus & Train <span className="text-violet-500">Tickets</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Compare and book intercity buses and trains. Best prices, e-tickets, 
                and flexible booking options.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap justify-center gap-8 mb-12"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-3xl font-bold text-violet-500">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="p-6">
                <div className="grid md:grid-cols-5 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="font-semibold">From</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="New York" className="pl-11 h-12" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center md:mt-6">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">To</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-500" />
                      <Input placeholder="Boston" className="pl-11 h-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="date" className="pl-11 h-12" />
                    </div>
                  </div>
                  <Button className="h-12 bg-violet-500 hover:bg-violet-600">
                    Search
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  <div className="relative w-32">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" min="1" defaultValue="1" className="pl-10 h-10" placeholder="1 passenger" />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Round trip
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
            >
              <div>
                <h2 className="font-display text-2xl font-bold">Available Routes</h2>
                <p className="text-muted-foreground">New York → Boston • {filteredRoutes.length} options</p>
              </div>
              <div className="flex items-center gap-4">
                <Tabs value={transportType} onValueChange={setTransportType}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="train" className="gap-2">
                      <Train className="h-4 w-4" /> Trains
                    </TabsTrigger>
                    <TabsTrigger value="bus" className="gap-2">
                      <Bus className="h-4 w-4" /> Buses
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" className="gap-2">
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
                >
                  <Card className="hover:border-violet-500/50 transition-colors cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Icon & Operator */}
                        <div className="flex items-center gap-4 lg:min-w-[120px]">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            route.type === "train" ? "bg-violet-500/10" : "bg-primary/10"
                          }`}>
                            {route.type === "train" ? (
                              <Train className="h-6 w-6 text-violet-500" />
                            ) : (
                              <Bus className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{route.operator}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              {route.rating}
                            </div>
                          </div>
                        </div>

                        {/* Times & Route */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-xl lg:text-2xl font-bold">{route.departureTime}</p>
                              <p className="text-sm text-muted-foreground">{route.departure}</p>
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <div className="h-px flex-1 bg-border" />
                              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-xs font-medium">
                                <Clock className="h-3 w-3" />
                                {route.duration}
                              </div>
                              <div className="h-px flex-1 bg-border" />
                            </div>
                            <div className="text-center">
                              <p className="text-xl lg:text-2xl font-bold">{route.arrivalTime}</p>
                              <p className="text-sm text-muted-foreground">{route.arrival}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                              {route.amenities.map((amenity) => (
                                <span 
                                  key={amenity} 
                                  className="p-1.5 rounded bg-muted text-muted-foreground"
                                  title={amenity}
                                >
                                  {getAmenityIcon(amenity)}
                                </span>
                              ))}
                            </div>
                            {route.badge && (
                              <Badge variant="secondary" className={
                                route.badge === "Fastest" ? "bg-violet-500/10 text-violet-500" :
                                route.badge === "Cheapest" ? "bg-emerald-500/10 text-emerald-500" :
                                ""
                              }>
                                {route.badge}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between lg:flex-col lg:items-end lg:min-w-[140px]">
                          <div className="lg:text-right">
                            <p className="text-3xl font-bold text-violet-500">${route.price}</p>
                            <p className="text-xs text-muted-foreground">per person</p>
                          </div>
                          <Button className="gap-2 bg-violet-500 hover:bg-violet-600 lg:mt-3">
                            Select <ArrowRight className="h-4 w-4" />
                          </Button>
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
