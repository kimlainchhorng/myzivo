// CSS animations used instead of framer-motion for mobile performance
import { useNavigate } from "react-router-dom";
import { 
  Car, 
  UtensilsCrossed, 
  Star, 
  Clock,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MapPin,
  Plane,
  Hotel,
  CarFront,
  Package,
  Ticket,
  Shield,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MobileAppShell from "@/components/MobileAppShell";
import MobileLocationBar from "@/components/MobileLocationBar";
import MobilePromoBanner from "@/components/MobilePromoBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TrustSection from "@/components/TrustSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import DriverCTASection from "@/components/DriverCTASection";
import AppDownloadSection from "@/components/AppDownloadSection";
import Footer from "@/components/Footer";
import StatsSection from "@/components/StatsSection";
import { QuickActionsSection, TrendingSection, LiveStatsSection, AllServicesSection } from "@/components/home/HomeSections";
import PromoBanner from "@/components/home/PromoBanner";
import HowItWorks from "@/components/home/HowItWorks";
import PartnersSection from "@/components/home/PartnersSection";
import CTASection from "@/components/home/CTASection";
import UnifiedSearchHub from "@/components/home/UnifiedSearchHub";
import TripBuilderWidget from "@/components/home/TripBuilderWidget";
import SavedTripsManager from "@/components/shared/SavedTripsManager";
import BundleDealsCarousel from "@/components/shared/BundleDealsCarousel";
import TripPlannerWizard from "@/components/shared/TripPlannerWizard";
import TravelHeroActions from "@/components/home/TravelHeroActions";
import HomepagePopularRoutes from "@/components/home/HomepagePopularRoutes";
import TrustCredibilityBar from "@/components/home/TrustCredibilityBar";
import { cn } from "@/lib/utils";

// Quick services for mobile
const quickServices = [
  { id: "ride", label: "Ride", icon: Car, href: "/ride", color: "text-primary", bgColor: "bg-primary/15" },
  { id: "food", label: "Food", icon: UtensilsCrossed, href: "/food", color: "text-eats", bgColor: "bg-eats/15" },
  { id: "flights", label: "Flights", icon: Plane, href: "/book-flight", color: "text-sky-400", bgColor: "bg-sky-500/15" },
  { id: "hotels", label: "Hotels", icon: Hotel, href: "/book-hotel", color: "text-amber-400", bgColor: "bg-amber-500/15" },
  { id: "cars", label: "Cars", icon: CarFront, href: "/rent-car", color: "text-emerald-400", bgColor: "bg-emerald-500/15" },
  { id: "package", label: "Delivery", icon: Package, href: "/package-delivery", color: "text-violet-400", bgColor: "bg-violet-500/15" },
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
  { value: "5M+", label: "Rides", icon: Car },
  { value: "10K+", label: "Drivers", icon: Users },
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
              <h1 className="font-display text-xl font-bold">Where to today?</h1>
            </div>
          </div>
        </div>

        <MobileLocationBar variant="search" onSearchClick={() => navigate("/ride")} />
      </div>

      {/* Promo Banner */}
      <MobilePromoBanner />

      {/* Services Grid */}
      <section className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">Services</h2>
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

      {/* Travel Quick Actions - Priority CTAs */}
      <section className="px-4 pb-6">
        <h2 className="font-display font-bold text-lg mb-4">Travel & Book</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/flights")}
            className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-500/30 text-center touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-2">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-xs">Flights</h3>
            <p className="text-[10px] text-muted-foreground">Compare prices</p>
          </button>

          <button
            onClick={() => navigate("/hotels")}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-center touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-2">
              <Hotel className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-xs">Hotels</h3>
            <p className="text-[10px] text-muted-foreground">Best rates</p>
          </button>

          <button
            onClick={() => navigate("/car-rental")}
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-center touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-2">
              <CarFront className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-xs">Cars</h3>
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

      {/* Quick Actions Cards */}
      <section className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/ride")}
            className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/10 border border-primary/20 text-left touch-manipulation active:scale-[0.98] transition-transform animate-in fade-in slide-in-from-left-4 duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-sm mb-1">Book a Ride</h3>
            <p className="text-xs text-muted-foreground">Get there fast</p>
          </button>

          <button
            onClick={() => navigate("/food")}
            className="p-4 rounded-2xl bg-gradient-to-br from-eats/20 to-orange-500/10 border border-eats/20 text-left touch-manipulation active:scale-[0.98] transition-transform animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-eats/20 flex items-center justify-center mb-3">
              <UtensilsCrossed className="w-5 h-5 text-eats" />
            </div>
            <h3 className="font-bold text-sm mb-1">Order Food</h3>
            <p className="text-xs text-muted-foreground">Delivered fast</p>
          </button>
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

      {/* Stats Section */}
      <section className="px-4 py-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-teal-500/5 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold">ZIVO Stats</h3>
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

// Desktop version (original layout)
const DesktopHomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <UnifiedSearchHub />
        
        {/* Travel Actions - Primary Conversion Focus */}
        <TravelHeroActions />
        
        {/* Trust & Credibility */}
        <TrustCredibilityBar />
        
        {/* Popular Routes - High Click Potential */}
        <HomepagePopularRoutes />
        
        <PromoBanner />
        <QuickActionsSection />
        
        {/* Trip Builder Section */}
        <section className="py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="lg:col-span-2">
                <TrendingSection />
              </div>
              <TripBuilderWidget />
            </div>
          </div>
        </section>

        {/* Bundle Deals & Saved Trips */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <BundleDealsCarousel />
              <div className="space-y-6">
                <SavedTripsManager />
                <TripPlannerWizard />
              </div>
            </div>
          </div>
        </section>
        
        <StatsSection />
        <LiveStatsSection />
        <FeaturesSection />
        <HowItWorks />
        <AllServicesSection />
        <TrustSection />
        <TestimonialsSection />
        <PartnersSection />
        <DriverCTASection />
        <CTASection />
        <AppDownloadSection />
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
