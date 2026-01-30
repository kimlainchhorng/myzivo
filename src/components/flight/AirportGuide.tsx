import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Map,
  Search,
  Plane,
  Coffee,
  Utensils,
  ShoppingBag,
  Wifi,
  BatteryCharging,
  Armchair,
  Baby,
  Accessibility,
  Clock,
  MapPin,
  Navigation,
  Star,
  ChevronRight,
  Info,
  DollarSign,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Amenity {
  id: string;
  name: string;
  type: 'lounge' | 'restaurant' | 'shop' | 'service';
  terminal: string;
  gate?: string;
  rating: number;
  walkTime: number;
  priceRange: '$' | '$$' | '$$$';
  hours: string;
  features: string[];
}

interface AirportGuideProps {
  airportCode?: string;
  airportName?: string;
  terminal?: string;
  gate?: string;
  className?: string;
}

const MOCK_AMENITIES: Amenity[] = [
  {
    id: '1',
    name: 'Priority Pass Lounge',
    type: 'lounge',
    terminal: 'Terminal 4',
    gate: 'Near Gate B22',
    rating: 4.5,
    walkTime: 5,
    priceRange: '$$$',
    hours: '5:00 AM - 11:00 PM',
    features: ['Free WiFi', 'Showers', 'Food & Drinks', 'Quiet Zone']
  },
  {
    id: '2',
    name: 'Blue Bottle Coffee',
    type: 'restaurant',
    terminal: 'Terminal 4',
    gate: 'Gate B15',
    rating: 4.7,
    walkTime: 3,
    priceRange: '$$',
    hours: '6:00 AM - 8:00 PM',
    features: ['Specialty Coffee', 'Quick Service', 'Mobile Order']
  },
  {
    id: '3',
    name: 'Shake Shack',
    type: 'restaurant',
    terminal: 'Terminal 4',
    gate: 'Food Court',
    rating: 4.4,
    walkTime: 7,
    priceRange: '$$',
    hours: '7:00 AM - 9:00 PM',
    features: ['Fast Food', 'Mobile Order', 'Seating Area']
  },
  {
    id: '4',
    name: 'Hudson News',
    type: 'shop',
    terminal: 'Terminal 4',
    gate: 'Gate B20',
    rating: 4.0,
    walkTime: 2,
    priceRange: '$',
    hours: '24 Hours',
    features: ['Magazines', 'Snacks', 'Travel Essentials']
  },
  {
    id: '5',
    name: 'XpresSpa',
    type: 'service',
    terminal: 'Terminal 4',
    gate: 'Near Gate B25',
    rating: 4.6,
    walkTime: 8,
    priceRange: '$$$',
    hours: '7:00 AM - 7:00 PM',
    features: ['Massage', 'Manicure', 'Quick Services']
  },
  {
    id: '6',
    name: 'Admirals Club',
    type: 'lounge',
    terminal: 'Terminal 4',
    gate: 'Gate B10',
    rating: 4.3,
    walkTime: 10,
    priceRange: '$$$',
    hours: '5:30 AM - 10:00 PM',
    features: ['Premium Bar', 'Business Center', 'Showers', 'Premium WiFi']
  },
];

const SERVICES = [
  { id: 'wifi', icon: Wifi, label: 'Free WiFi', available: true },
  { id: 'charging', icon: BatteryCharging, label: 'Charging Stations', available: true },
  { id: 'nursing', icon: Baby, label: 'Nursing Rooms', available: true },
  { id: 'accessibility', icon: Accessibility, label: 'Accessibility', available: true },
];

const getAmenityIcon = (type: string) => {
  switch (type) {
    case 'lounge': return Armchair;
    case 'restaurant': return Utensils;
    case 'shop': return ShoppingBag;
    case 'service': return Sparkles;
    default: return MapPin;
  }
};

const getAmenityColor = (type: string) => {
  switch (type) {
    case 'lounge': return 'bg-violet-500/20 text-violet-400 border-violet-500/40';
    case 'restaurant': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'shop': return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
    case 'service': return 'bg-pink-500/20 text-pink-400 border-pink-500/40';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const AirportGuide = ({
  airportCode = "JFK",
  airportName = "John F. Kennedy International Airport",
  terminal = "Terminal 4",
  gate = "B22",
  className
}: AirportGuideProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);

  const filteredAmenities = MOCK_AMENITIES.filter(amenity => {
    const matchesTab = activeTab === 'all' || amenity.type === activeTab;
    const matchesSearch = searchQuery === '' ||
      amenity.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 border border-sky-500/40 flex items-center justify-center">
              <Map className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Airport Guide</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{airportCode}</Badge>
                <span>{terminal}</span>
                <span>•</span>
                <span>Gate {gate}</span>
              </div>
            </div>
          </div>

          {/* Current Location */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">You are here</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Quick Services */}
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            {SERVICES.map(service => (
              <div key={service.id} className="flex items-center gap-2 text-sm">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  service.available 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <service.icon className="w-4 h-4" />
                </div>
                <span className={service.available ? "" : "text-muted-foreground"}>
                  {service.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants, lounges, shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/50 px-4">
            <TabsList className="bg-transparent h-auto p-0">
              {[
                { value: 'all', label: 'All', icon: MapPin },
                { value: 'lounge', label: 'Lounges', icon: Armchair },
                { value: 'restaurant', label: 'Food', icon: Utensils },
                { value: 'shop', label: 'Shops', icon: ShoppingBag },
                { value: 'service', label: 'Services', icon: Sparkles },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4 gap-2"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-4">
            <div className="grid gap-3">
              {filteredAmenities.map((amenity, i) => {
                const Icon = getAmenityIcon(amenity.type);
                const isSelected = selectedAmenity === amenity.id;
                
                return (
                  <motion.div
                    key={amenity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedAmenity(isSelected ? null : amenity.id)}
                    className={cn(
                      "rounded-xl border p-4 cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-border bg-card/30"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
                        getAmenityColor(amenity.type)
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{amenity.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {amenity.gate}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-medium">{amenity.rating}</span>
                          </div>
                        </div>

                        {/* Quick Info */}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {amenity.walkTime} min walk
                          </span>
                          <span className="text-muted-foreground">
                            {amenity.priceRange}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {amenity.hours}
                          </Badge>
                        </div>

                        {/* Features (expanded) */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3 pt-3 border-t border-border/50"
                          >
                            <div className="flex flex-wrap gap-2">
                              {amenity.features.map((feature, j) => (
                                <Badge key={j} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            <Button size="sm" className="mt-3 gap-2">
                              <Navigation className="w-4 h-4" />
                              Get Directions
                            </Button>
                          </motion.div>
                        )}
                      </div>

                      <ChevronRight className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform shrink-0",
                        isSelected && "rotate-90"
                      )} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredAmenities.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No amenities found</p>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AirportGuide;
