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
import { useIsMobile } from "@/hooks/use-mobile";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

// Import the new mobile app home
import AppHome from "@/pages/app/AppHome";

// New conversion-focused components for desktop
import SimplifiedNav from "@/components/home/SimplifiedNav";
import ConversionHero from "@/components/home/ConversionHero";
import ServiceCards from "@/components/home/ServiceCards";
import WhyZivo from "@/components/home/WhyZivo";
import PopularDestinations from "@/components/home/PopularDestinations";
import PlanYourTrip from "@/components/home/PlanYourTrip";
import LaunchBanner from "@/components/home/LaunchBanner";
import ZivoMoreSection from "@/components/home/ZivoMoreSection";
import { AdCreativeShowcase, OGImageMeta } from "@/components/marketing";

// Quick services for mobile (legacy - keeping for reference)
const quickServices = [
  { id: "flights", label: "Flights", icon: Plane, href: "/travel?tab=flights", color: "text-sky-400", bgColor: "bg-sky-500/15" },
  { id: "hotels", label: "Hotels", icon: Hotel, href: "/travel?tab=hotels", color: "text-amber-400", bgColor: "bg-amber-500/15" },
  { id: "cars", label: "Cars", icon: CarFront, href: "/travel?tab=cars", color: "text-violet-400", bgColor: "bg-violet-500/15" },
  { id: "ride", label: "Ride", icon: Car, href: "/rides", color: "text-primary", bgColor: "bg-primary/15" },
  { id: "food", label: "Food", icon: UtensilsCrossed, href: "/eats", color: "text-eats", bgColor: "bg-eats/15" },
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

// Desktop version - Conversion focused
const DesktopHomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <OGImageMeta pageType="homepage" />
      
      {/* Launch Banner - Top of page */}
      <LaunchBanner />
      
      <SimplifiedNav />
      <main>
        {/* Hero Section */}
        <ConversionHero />
        
        {/* Service Cards - Above the fold entry points */}
        <ServiceCards />
        
        {/* Ad Creative Showcase */}
        <AdCreativeShowcase />
        
        {/* Why ZIVO - Trust & Value */}
        <WhyZivo />
        
        {/* ZIVO More Section - Rides/Eats Coming Soon + Extras */}
        <ZivoMoreSection />
        
        {/* Popular Destinations */}
        <PopularDestinations />
        
        {/* Plan Your Trip - Cross-sell */}
        <PlanYourTrip />
      </main>
      <Footer />
    </div>
  );
};

const Index = () => {
  const isMobile = useIsMobile();

  // Render mobile layout for mobile devices - use new AppHome
  if (isMobile) {
    return <AppHome />;
  }

  // Render desktop layout for larger screens
  return <DesktopHomePage />;
};

export default Index;
