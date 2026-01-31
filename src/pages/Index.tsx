import { useNavigate } from "react-router-dom";
import { 
  Car, 
  UtensilsCrossed, 
  Star, 
  Clock,
  ChevronRight,
  ArrowRight,
  Plane,
  Hotel,
  CarFront,
  Package,
  Ticket,
  Shield,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MobileAppShell from "@/components/MobileAppShell";
import MobileLocationBar from "@/components/MobileLocationBar";
import MobilePromoBanner from "@/components/MobilePromoBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

// New conversion-focused components
import SimplifiedNav from "@/components/home/SimplifiedNav";
import ConversionHero from "@/components/home/ConversionHero";
import ServiceCards from "@/components/home/ServiceCards";
import WhyZivo from "@/components/home/WhyZivo";
import PopularDestinations from "@/components/home/PopularDestinations";
import PlanYourTrip from "@/components/home/PlanYourTrip";
import CrossSellBanner from "@/components/seo/CrossSellBanner";

// Quick services for mobile
const quickServices = [
  { id: "flights", label: "Flights", icon: Plane, href: "/book-flight", color: "text-sky-400", bgColor: "bg-sky-500/15" },
  { id: "hotels", label: "Hotels", icon: Hotel, href: "/book-hotel", color: "text-amber-400", bgColor: "bg-amber-500/15" },
  { id: "cars", label: "Cars", icon: CarFront, href: "/rent-car", color: "text-violet-400", bgColor: "bg-violet-500/15" },
  { id: "ride", label: "Ride", icon: Car, href: "/ride", color: "text-primary", bgColor: "bg-primary/15" },
  { id: "food", label: "Food", icon: UtensilsCrossed, href: "/food", color: "text-eats", bgColor: "bg-eats/15" },
  { id: "package", label: "Delivery", icon: Package, href: "/package-delivery", color: "text-rose-400", bgColor: "bg-rose-500/15" },
  { id: "events", label: "Events", icon: Ticket, href: "/events", color: "text-pink-400", bgColor: "bg-pink-500/15" },
  { id: "insurance", label: "Insurance", icon: Shield, href: "/travel-insurance", color: "text-blue-400", bgColor: "bg-blue-500/15" },
];

// Featured restaurants for mobile
const featuredRestaurants = [
  { id: 1, name: "Burger Joint", cuisine: "American", rating: 4.8, time: "15-25", image: "🍔", promo: "Free Delivery" },
  { id: 2, name: "Sakura Sushi", cuisine: "Japanese", rating: 4.9, time: "25-35", image: "🍣" },
  { id: 3, name: "Pizza Palace", cuisine: "Italian", rating: 4.7, time: "20-30", image: "🍕", promo: "20% Off" },
  { id: 4, name: "Taco Fiesta", cuisine: "Mexican", rating: 4.6, time: "15-20", image: "🌮" },
  { id: 5, name: "Thai Spice", cuisine: "Thai", rating: 4.8, time: "25-35", image: "🍜" },
];

// Stats for mobile
const mobileStats = [
  { value: "500+", label: "Airlines", icon: Plane },
  { value: "1M+", label: "Hotels", icon: Hotel },
  { value: "4.9", label: "Rating", icon: Star },
];

const MobileHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <MobileAppShell>
      {/* Welcome & Location */}
      <div className="pt-2 pb-4">
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <p className="text-muted-foreground text-sm">
                {user ? `Hello, ${user.email?.split('@')[0]}` : 'Good morning'} 👋
              </p>
              <h1 className="font-display text-xl font-bold">Search & Compare Travel</h1>
            </div>
          </div>
        </div>

        <MobileLocationBar variant="search" onSearchClick={() => navigate("/book-flight")} />
      </div>

      {/* Travel Quick Actions - Priority CTAs */}
      <section className="px-4 pb-6">
        <h2 className="font-display font-bold text-lg mb-4">Book Travel</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/book-flight")}
            className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-500/30 text-center touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-sm">Flights</h3>
            <p className="text-[10px] text-muted-foreground">Compare prices</p>
          </button>

          <button
            onClick={() => navigate("/book-hotel")}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-center touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-sm">Hotels</h3>
            <p className="text-[10px] text-muted-foreground">Best rates</p>
          </button>

          <button
            onClick={() => navigate("/rent-car")}
            className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30 text-center touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
              <CarFront className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-sm">Cars</h3>
            <p className="text-[10px] text-muted-foreground">Rent a car</p>
          </button>
        </div>
        
        {/* Trust Line */}
        <div className="mt-4 py-3 px-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>No booking fees • Compare 500+ partners</span>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <MobilePromoBanner />

      {/* Services Grid */}
      <section className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">All Services</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {quickServices.map((service, index) => (
            <button
              key={service.id}
              onClick={() => navigate(service.href)}
              className="flex flex-col items-center gap-2 touch-manipulation active:scale-90 transition-transform animate-in fade-in zoom-in-95 duration-300"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                service.bgColor
              )}>
                <service.icon className={cn("w-6 h-6", service.color)} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{service.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-teal-500/5 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold">Why ZIVO?</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {mobileStats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-in fade-in zoom-in-95 duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-display text-xl font-bold text-primary">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Eats */}
      <section className="py-6">
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-eats/10">
              <UtensilsCrossed className="w-4 h-4 text-eats" />
            </div>
            <h2 className="font-display font-bold text-lg">Popular Near You</h2>
          </div>
          <button 
            onClick={() => navigate('/food')}
            className="text-sm text-eats font-semibold flex items-center gap-1 touch-manipulation"
          >
            See all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {featuredRestaurants.map((restaurant, index) => (
            <button
              key={restaurant.id}
              onClick={() => navigate('/food')}
              className="flex-shrink-0 w-36 p-3 rounded-2xl bg-card/80 border border-border/50 text-left touch-manipulation active:scale-[0.98] transition-transform animate-in fade-in slide-in-from-right-4 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative mb-2">
                <div className="w-full aspect-square bg-muted/50 rounded-xl flex items-center justify-center text-4xl">
                  {restaurant.image}
                </div>
                {restaurant.promo && (
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 text-[9px] font-bold bg-eats text-white rounded-lg">
                    {restaurant.promo}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm truncate">{restaurant.name}</h4>
              <p className="text-xs text-muted-foreground truncate mb-1.5">{restaurant.cuisine}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-eats text-eats" />
                  <span className="text-[11px] font-bold">{restaurant.rating}</span>
                </div>
                <div className="flex items-center gap-0.5 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-[11px]">{restaurant.time}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Drive With Us CTA */}
      <section className="px-4 pb-8">
        <button
          onClick={() => navigate("/drive")}
          className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-4 touch-manipulation active:scale-[0.98] transition-transform animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold">Drive with ZIVO</h3>
            <p className="text-sm text-muted-foreground">Earn money on your schedule</p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </section>
    </MobileAppShell>
  );
};

// Desktop version - Conversion focused
const DesktopHomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SimplifiedNav />
      <main>
        {/* Hero Section */}
        <ConversionHero />
        
        {/* Service Cards - Above the fold entry points */}
        <ServiceCards />
        
        {/* Why ZIVO - Trust & Value */}
        <WhyZivo />
        
        {/* Popular Destinations */}
        <PopularDestinations />
        
        {/* Plan Your Trip - Cross-sell */}
        <PlanYourTrip />
        
        {/* Cross Sell Banner */}
        <CrossSellBanner />
      </main>
      <Footer />
    </div>
  );
};

const Index = () => {
  const isMobile = useIsMobile();

  // Render mobile layout for mobile devices
  if (isMobile) {
    return <MobileHomePage />;
  }

  // Render desktop layout for larger screens
  return <DesktopHomePage />;
};

export default Index;
