/**
 * App Home Screen
 * Mobile-first home with quick actions, popular carousel, trust strip
 */
import { useNavigate } from "react-router-dom";
import { 
  Plane, Hotel, CarFront, Car, UtensilsCrossed, Ticket, Shield, Star, 
  ChevronRight, Sparkles, Clock, MapPin
} from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Quick action cards (2 rows of 3)
const quickActions = [
  { id: "flights", label: "Flights", icon: Plane, href: "/travel?tab=flights", gradient: "from-sky-500 to-blue-600", bgColor: "bg-sky-500/15" },
  { id: "hotels", label: "Hotels", icon: Hotel, href: "/travel?tab=hotels", gradient: "from-amber-500 to-orange-500", bgColor: "bg-amber-500/15" },
  { id: "cars", label: "Car Rental", icon: CarFront, href: "/travel?tab=cars", gradient: "from-violet-500 to-purple-600", bgColor: "bg-violet-500/15" },
  { id: "rides", label: "Rides", icon: Car, href: "/rides", gradient: "from-primary to-teal-400", bgColor: "bg-primary/15" },
  { id: "eats", label: "Eats", icon: UtensilsCrossed, href: "/eats", gradient: "from-eats to-orange-500", bgColor: "bg-eats/15" },
  { id: "extras", label: "Extras", icon: Ticket, href: "/more", gradient: "from-pink-500 to-rose-500", bgColor: "bg-pink-500/15" },
];

// Popular destinations/services carousel
const popularItems = [
  { id: 1, title: "New York", subtitle: "Flights from $99", image: "✈️", type: "flights" },
  { id: 2, title: "Miami Beach", subtitle: "Hotels from $129/night", image: "🏨", type: "hotels" },
  { id: 3, title: "Los Angeles", subtitle: "Cars from $35/day", image: "🚗", type: "cars" },
  { id: 4, title: "Airport Transfer", subtitle: "From $25", image: "🚐", type: "extras" },
  { id: 5, title: "City Tours", subtitle: "From $45", image: "🎫", type: "extras" },
];

// Featured restaurants
const featuredRestaurants = [
  { id: 1, name: "Burger Joint", cuisine: "American", rating: 4.8, eta: "15-25 min", image: "🍔" },
  { id: 2, name: "Sakura Sushi", cuisine: "Japanese", rating: 4.9, eta: "25-35 min", image: "🍣" },
  { id: 3, name: "Pizza Palace", cuisine: "Italian", rating: 4.7, eta: "20-30 min", image: "🍕" },
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
      <div className="px-4 py-4 space-y-6">
        {/* Welcome Section */}
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-muted-foreground text-sm">
            {greeting()}{user ? `, ${user.email?.split('@')[0]}` : ''} 👋
          </p>
          <h1 className="font-display text-2xl font-bold">Where to today?</h1>
        </div>

        {/* Quick Action Cards - 2 rows */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-100">
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={action.id}
                onClick={() => navigate(action.href)}
                className="p-3 rounded-2xl bg-card border border-border/50 text-center touch-manipulation active:scale-[0.97] transition-transform hover:border-primary/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-2 shadow-lg",
                  action.gradient
                )}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-xs">{action.label}</h3>
              </button>
            ))}
          </div>
        </section>

        {/* Trust Strip */}
        <section className="py-3 px-4 rounded-2xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 delay-200">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-medium">Search & compare. Book on partner sites.</span>
          </div>
        </section>

        {/* Popular Now Carousel */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-300">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Popular Now
            </h2>
            <button 
              onClick={() => navigate("/travel")}
              className="text-sm text-primary font-semibold flex items-center gap-1 touch-manipulation"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {popularItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => navigate(`/travel?tab=${item.type}`)}
                className="flex-shrink-0 w-32 p-3 rounded-2xl bg-card border border-border/50 text-left touch-manipulation active:scale-[0.98] transition-transform"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-full aspect-square bg-muted/50 rounded-xl flex items-center justify-center text-3xl mb-2">
                  {item.image}
                </div>
                <h4 className="font-bold text-sm truncate">{item.title}</h4>
                <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Nearby Eats */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-400">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-eats" />
              Nearby Eats
            </h2>
            <button 
              onClick={() => navigate("/eats")}
              className="text-sm text-eats font-semibold flex items-center gap-1 touch-manipulation"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {featuredRestaurants.map((restaurant, index) => (
              <button
                key={restaurant.id}
                onClick={() => navigate("/eats")}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50 text-left touch-manipulation active:scale-[0.99] transition-transform"
              >
                <div className="w-14 h-14 bg-muted/50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {restaurant.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{restaurant.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{restaurant.cuisine}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-eats text-eats" />
                      <span className="text-[11px] font-bold">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-[11px]">{restaurant.eta}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Need a Ride CTA */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-500">
          <button
            onClick={() => navigate("/rides")}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-teal-500/5 border border-primary/20 flex items-center gap-4 touch-manipulation active:scale-[0.99] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold">Need a Ride?</h3>
              <p className="text-sm text-muted-foreground">Request now, pay later</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </section>
      </div>
    </AppLayout>
  );
};

export default AppHome;
