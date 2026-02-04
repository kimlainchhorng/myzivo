/**
 * ZIVO Mobile Search Screen
 * Unified search with Flights/Hotels/Cars tabs
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plane, Hotel, Car, ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import FlightSearchFormPro from "@/components/search/FlightSearchFormPro";
import HotelSearchFormPro from "@/components/search/HotelSearchFormPro";
import CarSearchFormPro from "@/components/search/CarSearchFormPro";

type ServiceTab = "flights" | "hotels" | "cars";

// Popular routes data
const popularRoutes = [
  { from: "NYC", to: "LAX", price: 99 },
  { from: "CHI", to: "MIA", price: 129 },
  { from: "SFO", to: "NYC", price: 149 },
  { from: "LAX", to: "LAS", price: 49 },
];

export default function MobileSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as ServiceTab) || "flights";
  const [activeTab, setActiveTab] = useState<ServiceTab>(initialTab);

  const serviceTabs = [
    { id: "flights" as ServiceTab, label: "Flights", icon: Plane, color: "text-flights", bgColor: "bg-flights/10", borderColor: "border-flights" },
    { id: "hotels" as ServiceTab, label: "Hotels", icon: Hotel, color: "text-hotels", bgColor: "bg-hotels/10", borderColor: "border-hotels" },
    { id: "cars" as ServiceTab, label: "Cars", icon: Car, color: "text-cars", bgColor: "bg-cars/10", borderColor: "border-cars" },
  ];

  const handleFlightSearch = (params: URLSearchParams) => {
    // Save to recent searches
    const origin = params.get("origin") || "";
    const destination = params.get("destination") || "";
    if (origin && destination) {
      const search = `${origin} → ${destination}`;
      const stored = localStorage.getItem("zivo_recent_searches");
      let searches: string[] = stored ? JSON.parse(stored) : [];
      searches = [search, ...searches.filter(s => s !== search)].slice(0, 5);
      localStorage.setItem("zivo_recent_searches", JSON.stringify(searches));
    }
    
    navigate(`/flights/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Search</h1>
        </div>
      </div>

      {/* Service Tabs */}
      <div className="px-4 py-4">
        <div className="flex gap-2">
          {serviceTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all touch-manipulation border-2",
                  isActive
                    ? cn(tab.bgColor, tab.color, tab.borderColor)
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Form */}
      <div className="px-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            {activeTab === "flights" && (
              <FlightSearchFormPro 
                onSearch={handleFlightSearch}
              />
            )}
            
            {activeTab === "hotels" && (
              <HotelSearchFormPro
                onSearch={(params) => {
                  const urlParams = new URLSearchParams({
                    city: params.citySlug,
                    checkIn: params.checkIn.toISOString().split('T')[0],
                    checkOut: params.checkOut.toISOString().split('T')[0],
                    adults: params.adults.toString(),
                    rooms: params.rooms.toString(),
                  });
                  navigate(`/hotels?${urlParams.toString()}`);
                }}
              />
            )}
            
            {activeTab === "cars" && (
              <CarSearchFormPro
                onSearch={(params) => {
                  navigate(`/rent-car/results?${params.toString()}`);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Routes (Flights only) */}
      {activeTab === "flights" && (
        <div className="mt-6 px-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Popular Routes</h2>
          </div>
          <div className="space-y-2">
            {popularRoutes.map((route, i) => (
              <Card 
                key={i} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 7);
                  navigate(`/flights/results?origin=${route.from}&destination=${route.to}&departDate=${tomorrow.toISOString().split('T')[0]}&passengers=1&cabinClass=economy`);
                }}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plane className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{route.from} → {route.to}</span>
                  </div>
                  <span className="text-primary font-semibold">From ${route.price}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <ZivoMobileNav />
    </div>
  );
}
