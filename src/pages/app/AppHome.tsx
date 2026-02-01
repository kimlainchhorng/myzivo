/**
 * App Home Screen - Mobile
 * Clean, premium mobile-first design
 */
import { useNavigate } from "react-router-dom";
import { 
  Plane, Hotel, CarFront, Car, UtensilsCrossed, Sparkles,
  ChevronRight, Shield, Star, Clock
} from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Quick action cards (2 rows of 3)
const quickActions = [
  { id: "flights", label: "Flights", icon: Plane, href: "/travel?tab=flights", color: "bg-flights", textColor: "text-flights" },
  { id: "hotels", label: "Hotels", icon: Hotel, href: "/travel?tab=hotels", color: "bg-hotels", textColor: "text-hotels" },
  { id: "cars", label: "Car Rental", icon: CarFront, href: "/travel?tab=cars", color: "bg-cars", textColor: "text-cars" },
  { id: "rides", label: "Rides", icon: Car, href: "/rides", color: "bg-rides", textColor: "text-rides" },
  { id: "eats", label: "Eats", icon: UtensilsCrossed, href: "/eats", color: "bg-eats", textColor: "text-eats" },
  { id: "more", label: "More", icon: Sparkles, href: "/extras", color: "bg-more", textColor: "text-more" },
];

// Popular destinations
const popularItems = [
  { id: 1, title: "New York", subtitle: "Flights from $99", emoji: "✈️", type: "flights" },
  { id: 2, title: "Miami Beach", subtitle: "Hotels from $129", emoji: "🏨", type: "hotels" },
  { id: 3, title: "Los Angeles", subtitle: "Cars from $35/day", emoji: "🚗", type: "cars" },
  { id: 4, title: "Airport Transfer", subtitle: "From $25", emoji: "🚐", type: "extras" },
];

// Featured restaurants
const featuredRestaurants = [
  { id: 1, name: "Burger Joint", cuisine: "American", rating: 4.8, eta: "15-25 min", emoji: "🍔" },
  { id: 2, name: "Sakura Sushi", cuisine: "Japanese", rating: 4.9, eta: "25-35 min", emoji: "🍣" },
  { id: 3, name: "Pizza Palace", cuisine: "Italian", rating: 4.7, eta: "20-30 min", emoji: "🍕" },
];

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-6 pb-24">
        {/* Welcome Section */}
        <div>
          <p className="text-muted-foreground text-sm">
            {greeting()}{user ? `, ${user.email?.split('@')[0]}` : ''} 👋
          </p>
          <h1 className="text-2xl font-bold">Where to today?</h1>
        </div>

        {/* Quick Actions Grid */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.href)}
                className="p-4 rounded-2xl bg-card border border-border text-center touch-manipulation active:scale-[0.97] transition-transform"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2",
                  action.color
                )}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm">{action.label}</h3>
              </button>
            ))}
          </div>
        </section>

        {/* Trust Strip */}
        <section className="py-3 px-4 rounded-2xl bg-muted border border-border">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-medium">Search & compare. Book on partner sites.</span>
          </div>
        </section>

        {/* Popular Destinations */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Popular Now</h2>
            <button 
              onClick={() => navigate("/travel")}
              className="text-sm text-primary font-semibold flex items-center gap-1"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {popularItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/travel?tab=${item.type}`)}
                className="flex-shrink-0 w-32 p-3 rounded-2xl bg-card border border-border text-left touch-manipulation active:scale-[0.98] transition-transform"
              >
                <div className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center text-3xl mb-2">
                  {item.emoji}
                </div>
                <h4 className="font-bold text-sm truncate">{item.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Nearby Eats */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-eats" />
              Nearby Eats
            </h2>
            <button 
              onClick={() => navigate("/eats")}
              className="text-sm text-eats font-semibold flex items-center gap-1"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {featuredRestaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => navigate("/eats")}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border text-left touch-manipulation active:scale-[0.99] transition-transform"
              >
                <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {restaurant.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{restaurant.name}</h4>
                  <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-eats text-eats" />
                      <span className="text-xs font-bold">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{restaurant.eta}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Need a Ride CTA */}
        <section>
          <button
            onClick={() => navigate("/rides")}
            className="w-full p-4 rounded-2xl bg-rides-light border border-rides/20 flex items-center gap-4 touch-manipulation active:scale-[0.99] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-rides flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-rides">Need a Ride?</h3>
              <p className="text-sm text-muted-foreground">Request now</p>
            </div>
            <ChevronRight className="w-5 h-5 text-rides" />
          </button>
        </section>
      </div>
    </AppLayout>
  );
};

export default AppHome;
