import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plane, 
  Hotel, 
  Car, 
  MapPin, 
  Calendar as CalendarIcon,
  Users,
  ArrowRight,
  Sparkles,
  Search,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface QuickBookingFlowProps {
  defaultTab?: "flight" | "hotel" | "car";
  className?: string;
}

const QuickBookingFlow = ({ defaultTab = "flight", className }: QuickBookingFlowProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Form states
  const [flightFrom, setFlightFrom] = useState("");
  const [flightTo, setFlightTo] = useState("");
  const [hotelLocation, setHotelLocation] = useState("");
  const [carLocation, setCarLocation] = useState("");

  const handleSearch = () => {
    switch (activeTab) {
      case "flight":
        navigate("/book-flight");
        break;
      case "hotel":
        navigate("/book-hotel");
        break;
      case "car":
        navigate("/rent-car");
        break;
    }
  };

  const popularDestinations = [
    { name: "Paris", code: "CDG", emoji: "🇫🇷" },
    { name: "Tokyo", code: "NRT", emoji: "🇯🇵" },
    { name: "New York", code: "JFK", emoji: "🇺🇸" },
    { name: "London", code: "LHR", emoji: "🇬🇧" },
  ];

  return (
    <Card className={cn("overflow-hidden border-2 border-primary/20", className)}>
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 via-teal-500/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-teal-500 shadow-lg shadow-primary/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Quick Book</CardTitle>
            <p className="text-sm text-muted-foreground">Start your journey in seconds</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="flight" className="gap-2">
              <Plane className="w-4 h-4" />
              <span className="hidden sm:inline">Flights</span>
            </TabsTrigger>
            <TabsTrigger value="hotel" className="gap-2">
              <Hotel className="w-4 h-4" />
              <span className="hidden sm:inline">Hotels</span>
            </TabsTrigger>
            <TabsTrigger value="car" className="gap-2">
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Cars</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="flight" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="From where?"
                  value={flightFrom}
                  onChange={(e) => setFlightFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input 
                  placeholder="Where to?"
                  value={flightTo}
                  onChange={(e) => setFlightTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Popular Destinations */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Popular destinations</p>
              <div className="flex flex-wrap gap-2">
                {popularDestinations.map((dest) => (
                  <button
                    key={dest.code}
                    onClick={() => setFlightTo(`${dest.name} (${dest.code})`)}
                    className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1.5 active:scale-[0.97] touch-manipulation"
                  >
                    <span>{dest.emoji}</span>
                    {dest.name}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hotel" className="space-y-4 mt-0">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="City or hotel name"
                value={hotelLocation}
                onChange={(e) => setHotelLocation(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Check-in" className="pl-10" readOnly />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Check-out" className="pl-10" readOnly />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="car" className="space-y-4 mt-0">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Pickup location"
                value={carLocation}
                onChange={(e) => setCarLocation(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Pickup date" className="pl-10" readOnly />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Return date" className="pl-10" readOnly />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Button 
          className="w-full mt-4 bg-gradient-to-r from-primary to-teal-500 hover:opacity-90"
          onClick={handleSearch}
        >
          <Search className="w-4 h-4 mr-2" />
          Search {activeTab === "flight" ? "Flights" : activeTab === "hotel" ? "Hotels" : "Cars"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickBookingFlow;
