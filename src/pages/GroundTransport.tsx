import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Train, Bus, MapPin, Calendar, Users, Clock, ArrowRight, Filter, Star, Wifi, Coffee, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Train className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Bus & Train</h1>
              <p className="text-sm text-muted-foreground">Ground transportation booking</p>
            </div>
          </div>
          <Badge className="ml-auto bg-amber-500/10 text-amber-500">New Service</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <Label>From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="New York" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                    <Input placeholder="Boston" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Passengers</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" min="1" defaultValue="1" className="pl-10" />
                  </div>
                </div>
                <Button variant="hero" className="h-10">
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Filter Tabs */}
          <div className="flex items-center justify-between mb-6">
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

          {/* Results List */}
          <div className="space-y-4">
            {filteredRoutes.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-6">
                      {/* Icon & Operator */}
                      <div className="flex flex-col items-center gap-1 min-w-[80px]">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          route.type === "train" ? "bg-amber-500/10" : "bg-primary/10"
                        }`}>
                          {route.type === "train" ? (
                            <Train className="h-5 w-5 text-amber-500" />
                          ) : (
                            <Bus className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{route.operator}</span>
                      </div>

                      {/* Times & Route */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold">{route.departureTime}</p>
                            <p className="text-sm text-muted-foreground">{route.departure}</p>
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="h-0.5 flex-1 bg-border" />
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {route.duration}
                            </div>
                            <div className="h-0.5 flex-1 bg-border" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">{route.arrivalTime}</p>
                            <p className="text-sm text-muted-foreground">{route.arrival}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs">{route.rating}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {route.amenities.map((amenity) => (
                              <span key={amenity} className="text-muted-foreground" title={amenity}>
                                {getAmenityIcon(amenity)}
                              </span>
                            ))}
                          </div>
                          {route.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {route.badge}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${route.price}</p>
                        <p className="text-xs text-muted-foreground mb-2">per person</p>
                        <Button size="sm" className="gap-1">
                          Select <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GroundTransport;
