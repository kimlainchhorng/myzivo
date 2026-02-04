/**
 * ZIVO Mobile Home Screen
 * Travel-focused discovery with search box, deals, and trending destinations
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Hotel, Car, ChevronRight, Shield, TrendingUp, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import FlightSearchFormPro from "@/components/search/FlightSearchFormPro";

type ServiceTab = "flights" | "hotels" | "cars";

// Sample trending destinations
const trendingDestinations = [
  { city: "Miami", image: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=400", price: 89 },
  { city: "Los Angeles", image: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400", price: 129 },
  { city: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400", price: 99 },
  { city: "Las Vegas", image: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400", price: 79 },
];

// Sample deals
const bestDeals = [
  { route: "NYC → LAX", price: 89, originalPrice: 149, airline: "Delta", date: "Feb 15" },
  { route: "CHI → MIA", price: 99, originalPrice: 179, airline: "United", date: "Feb 20" },
  { route: "SFO → SEA", price: 59, originalPrice: 99, airline: "Alaska", date: "Mar 1" },
];

export default function MobileHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ServiceTab>("flights");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("zivo_recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 3));
      } catch {
        // ignore
      }
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const serviceTabs = [
    { id: "flights" as ServiceTab, label: "Flights", icon: Plane, color: "text-flights" },
    { id: "hotels" as ServiceTab, label: "Hotels", icon: Hotel, color: "text-hotels" },
    { id: "cars" as ServiceTab, label: "Cars", icon: Car, color: "text-cars" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pt-safe-top px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-muted-foreground text-sm">Where to today?</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">Z</span>
          </div>
        </div>
      </div>

      {/* Service Tabs */}
      <div className="px-4 -mt-2">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
          {serviceTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all touch-manipulation",
                activeTab === tab.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id && tab.color)} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Form */}
      <div className="px-4 mt-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            {activeTab === "flights" && (
              <FlightSearchFormPro 
                onSearch={(params) => {
                  navigate(`/flights/results?${params.toString()}`);
                }}
              />
            )}
            {activeTab === "hotels" && (
              <div className="space-y-3">
                <p className="text-center text-muted-foreground py-8">
                  Hotel search coming soon
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/hotels")}
                >
                  Browse Hotels
                </Button>
              </div>
            )}
            {activeTab === "cars" && (
              <div className="space-y-3">
                <p className="text-center text-muted-foreground py-8">
                  Car rental search coming soon
                </p>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/rent-car")}
                >
                  Browse Car Rentals
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best Deals Today */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold">Best Deals Today</h2>
          </div>
          <button 
            onClick={() => navigate("/deals")}
            className="text-sm text-primary flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {bestDeals.map((deal, i) => (
            <Card 
              key={i} 
              className="min-w-[200px] flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/flights?route=${deal.route.replace(' → ', '-')}`)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{deal.route}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                    Save {Math.round((1 - deal.price / deal.originalPrice) * 100)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">${deal.price}</span>
                  <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{deal.airline}</span>
                  <span>·</span>
                  <span>{deal.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Destinations */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Trending Destinations</h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {trendingDestinations.map((dest, i) => (
            <div 
              key={i}
              className="min-w-[140px] flex-shrink-0 cursor-pointer group"
              onClick={() => navigate(`/flights/to/${dest.city.toLowerCase()}`)}
            >
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-2">
                <img 
                  src={dest.image} 
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white font-semibold text-sm">{dest.city}</p>
                  <p className="text-white/80 text-xs">From ${dest.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Searched */}
      {user && recentSearches.length > 0 && (
        <div className="mt-6 px-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Recently Searched</h2>
          </div>
          <div className="space-y-2">
            {recentSearches.map((search, i) => (
              <Card key={i} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plane className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Trust Strip */}
      <div className="mt-8 px-4 pb-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Compare prices from trusted travel partners</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <ZivoMobileNav />
    </div>
  );
}
