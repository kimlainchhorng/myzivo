/**
 * Hizovo Travel App - Home Screen
 * Travel-focused home with Flights, Hotels, Cars quick access
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plane, Hotel, CarFront, ChevronRight, Shield, MapPin,
  ExternalLink, Sparkles
} from "lucide-react";
import HizovoAppLayout from "@/components/app/HizovoAppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Travel quick actions
const travelActions = [
  { id: "flights", label: "Flights", icon: Plane, href: "/app/flights", color: "bg-flights", textColor: "text-flights" },
  { id: "hotels", label: "Hotels", icon: Hotel, href: "/app/hotels", color: "bg-hotels", textColor: "text-hotels" },
  { id: "cars", label: "Cars", icon: CarFront, href: "/app/cars", color: "bg-cars", textColor: "text-cars" },
];

// Popular destinations
const popularDestinations = [
  { id: 1, city: "New York", country: "USA", code: "JFK", type: "flights" },
  { id: 2, city: "Miami", country: "USA", code: "MIA", type: "hotels" },
  { id: 3, city: "Los Angeles", country: "USA", code: "LAX", type: "cars" },
  { id: 4, city: "Las Vegas", country: "USA", code: "LAS", type: "hotels" },
];

// Current deals
const currentDeals = [
  { id: 1, title: "Summer Sale", subtitle: "Up to 40% off flights", badge: "Limited", color: "bg-flights/10 border-flights/30" },
  { id: 2, title: "Weekend Getaway", subtitle: "Hotels from $89/night", badge: "Popular", color: "bg-hotels/10 border-hotels/30" },
];

const HizovoHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <HizovoAppLayout hideHeader>
      <div className="space-y-6 pb-24">
        {/* Header with Branding */}
        <div className="px-4 pt-4 safe-area-top">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Hizovo
                </span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  Travel
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                {greeting()}{user ? `, ${user.email?.split('@')[0]}` : ''}
              </p>
            </div>
            <button 
              onClick={() => navigate('/app/trips')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted border border-border text-sm font-medium touch-manipulation active:scale-95"
            >
              <MapPin className="w-4 h-4 text-primary" />
              My Trips
            </button>
          </div>
        </div>

        {/* Travel Services Grid */}
        <section className="px-4">
          <div className="grid grid-cols-3 gap-3">
            {travelActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.href)}
                className="p-5 rounded-2xl bg-card border border-border text-center touch-manipulation active:scale-[0.97] hover:border-primary/20 hover:shadow-sm transition-all duration-200"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3",
                  action.color
                )}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold">{action.label}</h3>
              </button>
            ))}
          </div>
        </section>

        {/* Trust Banner */}
        <section className="px-4">
          <div className="py-3 px-4 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                Compare & book with <span className="font-semibold text-foreground">trusted partners</span>
              </span>
            </div>
          </div>
        </section>

        {/* Current Deals */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Deals & Offers
            </h2>
          </div>
          
          <div className="space-y-3">
            {currentDeals.map((deal) => (
              <button
                key={deal.id}
                onClick={() => navigate('/app/flights')}
                className={cn(
                  "w-full p-4 rounded-2xl border text-left touch-manipulation active:scale-[0.99] transition-transform flex items-center gap-4",
                  deal.color
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{deal.title}</h3>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                      {deal.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{deal.subtitle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Popular Destinations</h2>
            <button 
              onClick={() => navigate("/app/flights")}
              className="text-sm text-primary font-semibold flex items-center gap-1"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {popularDestinations.map((dest) => (
              <button
                key={dest.id}
                onClick={() => navigate(`/app/${dest.type}`)}
                className="flex-shrink-0 w-32 p-3 rounded-2xl bg-card border border-border text-left touch-manipulation active:scale-[0.98] transition-transform"
              >
                <div className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center mb-2">
                  <MapPin className="w-8 h-8 text-primary/60" />
                </div>
                <h4 className="font-bold text-sm truncate">{dest.city}</h4>
                <p className="text-xs text-muted-foreground">{dest.country} • {dest.code}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ZIVO Driver Link */}
        <section className="px-4">
          <div className="p-4 rounded-2xl bg-muted border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Rides · Eats · Move</p>
                  <p className="text-xs text-muted-foreground">Local services on ZIVO Driver</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => window.open('https://zivodriver.com', '_blank')}
              >
                Open <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </section>

        {/* Partner Disclosure */}
        <section className="px-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              Hizovo is not the merchant of record. Travel bookings are fulfilled by licensed third-party providers.
            </p>
          </div>
        </section>
      </div>
    </HizovoAppLayout>
  );
};

export default HizovoHome;
