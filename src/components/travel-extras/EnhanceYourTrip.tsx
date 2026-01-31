import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Plane, 
  Hotel, 
  Ticket, 
  Wifi, 
  Luggage, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Shield,
  Clock,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  TRANSFER_PARTNERS,
  CAR_PARTNERS,
  ACTIVITY_PARTNERS,
  ESIM_PARTNERS,
  LUGGAGE_PARTNERS,
  openPartnerLink,
  AFFILIATE_DISCLOSURE_TEXT
} from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";

/**
 * ENHANCE YOUR TRIP - Unified Travel Add-ons Section
 * Appears after search results on Flights, Hotels, and Car Rental pages
 * 
 * Categories:
 * 1. Airport Transfers & Rides
 * 2. Car Rental (cross-sell)
 * 3. Things To Do / Activities
 * 4. Travel eSIM
 * 5. Luggage Storage
 */

export type CurrentService = "flights" | "hotels" | "cars";

interface EnhanceYourTripProps {
  currentService: CurrentService;
  destination?: string;
  className?: string;
  compact?: boolean;
}

type ServiceCategoryType = 'flights' | 'hotels' | 'car_rental' | 'activities' | 'transfers' | 'esim' | 'luggage' | 'compensation';

interface AddOnCategory {
  id: ServiceCategoryType;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  items: AddOnItem[];
}

interface AddOnItem {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  trackingUrl: string;
  features: string[];
}

export default function EnhanceYourTrip({ 
  currentService, 
  destination,
  className = '',
  compact = false
}: EnhanceYourTripProps) {
  
  const handleAffiliateClick = (item: AddOnItem, category: 'flights' | 'hotels' | 'car_rental' | 'activities' | 'transfers' | 'esim' | 'luggage' | 'compensation') => {
    trackAffiliateClick({
      flightId: `addon-${item.id}`,
      airline: item.name,
      airlineCode: item.id.toUpperCase(),
      origin: destination || '',
      destination: destination || '',
      price: 0,
      passengers: 1,
      cabinClass: 'standard',
      affiliatePartner: item.id,
      referralUrl: item.trackingUrl,
      source: 'enhance_your_trip',
      ctaType: 'cross_sell',
      serviceType: category,
    });
    
    openPartnerLink(item.trackingUrl);
  };

  // Build categories based on current service
  const categories: AddOnCategory[] = [];

  // Airport Transfers - Show for Flights and Hotels
  if (currentService === "flights" || currentService === "hotels") {
    categories.push({
      id: "transfers",
      title: "Airport Transfers & Rides",
      description: "Book airport transfers with trusted providers",
      icon: Car,
      gradient: "from-amber-500/10 to-orange-500/10",
      borderColor: "hover:border-amber-500/50",
      items: TRANSFER_PARTNERS.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        tagline: p.id === 'kiwitaxi' ? 'Fixed prices' : p.id === 'gettransfer' ? 'Compare drivers' : 'Shared shuttles',
        logo: p.logo,
        trackingUrl: p.trackingUrl,
        features: p.features.slice(0, 2),
      })),
    });
  }

  // Car Rental - Show for Flights and Hotels
  if (currentService === "flights" || currentService === "hotels") {
    categories.push({
      id: "car_rental",
      title: "Rent a Car",
      description: "Explore your destination on your terms",
      icon: Car,
      gradient: "from-violet-500/10 to-purple-500/10",
      borderColor: "hover:border-violet-500/50",
      items: CAR_PARTNERS.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        tagline: p.id === 'economybookings' ? 'Best value' : p.id === 'qeeq' ? 'Price match' : 'Local deals',
        logo: p.logo,
        trackingUrl: p.trackingUrl,
        features: p.features.slice(0, 2),
      })),
    });
  }

  // Things To Do - Show for all services
  categories.push({
    id: "activities",
    title: "Things To Do",
    description: "Discover tours, museums & experiences",
    icon: Ticket,
    gradient: "from-emerald-500/10 to-teal-500/10",
    borderColor: "hover:border-emerald-500/50",
    items: ACTIVITY_PARTNERS.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      tagline: p.id === 'tiqets' ? 'Skip-the-line' : p.id === 'wegotrip' ? 'Audio guides' : 'Live events',
      logo: p.logo,
      trackingUrl: p.trackingUrl,
      features: p.features.slice(0, 2),
    })),
  });

  // Travel eSIM - Show for all services
  categories.push({
    id: "esim",
    title: "Travel Internet",
    description: "Stay connected abroad",
    icon: Wifi,
    gradient: "from-cyan-500/10 to-teal-500/10",
    borderColor: "hover:border-cyan-500/50",
    items: ESIM_PARTNERS.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      tagline: p.id === 'airalo' ? 'From $4.50' : p.id === 'drimsim' ? 'Pay as you go' : 'Budget friendly',
      logo: p.logo,
      trackingUrl: p.trackingUrl,
      features: p.features.slice(0, 2),
    })),
  });

  // Luggage Storage - Show for Flights and Hotels
  if (currentService === "flights" || currentService === "hotels") {
    categories.push({
      id: "luggage",
      title: "Luggage Storage",
      description: "Store bags securely while you explore",
      icon: Luggage,
      gradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "hover:border-purple-500/50",
      items: LUGGAGE_PARTNERS.map(p => ({
        id: p.id,
        name: p.name,
        tagline: '$5.90/day',
        logo: p.logo,
        trackingUrl: p.trackingUrl,
        features: p.features.slice(0, 2),
      })),
    });
  }

  if (compact) {
    return (
      <section className={cn("py-8 border-t border-border/50", className)}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Enhance Your Trip</h3>
            </div>
            <Link to="/extras" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.slice(0, 4).map((category) => (
              <Card 
                key={category.id}
                className={cn(
                  "group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  category.borderColor
                )}
                onClick={() => category.items[0] && handleAffiliateClick(category.items[0], category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={cn(
                    "w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center",
                    `bg-gradient-to-br ${category.gradient}`
                  )}>
                    <category.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">{category.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            {AFFILIATE_DISCLOSURE_TEXT.short}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-12 sm:py-16 border-t border-border/50 bg-gradient-to-b from-transparent to-muted/20", className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Complete Your Trip
          </Badge>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            Enhance Your{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              {destination || "Travel"} Experience
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Add transfers, activities, and essentials to your trip
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-10 max-w-6xl mx-auto">
          {categories.map((category, categoryIndex) => (
            <div 
              key={category.id} 
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${categoryIndex * 100}ms` }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  `bg-gradient-to-br ${category.gradient}`
                )}>
                  <category.icon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>

              {/* Partner Cards */}
              <div className={cn(
                "grid gap-4",
                category.items.length === 1 ? "sm:grid-cols-1 max-w-md" : "sm:grid-cols-2 lg:grid-cols-3"
              )}>
                {category.items.map((item, itemIndex) => (
                  <Card
                    key={item.id}
                    className={cn(
                      "group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border/50",
                      category.borderColor
                    )}
                    onClick={() => handleAffiliateClick(item, category.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform",
                          `bg-gradient-to-br ${category.gradient}`
                        )}>
                          {item.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm group-hover:text-primary transition-colors">
                              {item.name}
                            </h4>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {item.tagline}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.features.map((feature, i) => (
                              <span key={i} className="text-xs text-muted-foreground">
                                {i > 0 && "•"} {feature}
                              </span>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full gap-2 text-xs group-hover:bg-primary group-hover:text-white transition-colors touch-manipulation"
                          >
                            {category.id === 'transfers' ? 'Book Transfer' :
                             category.id === 'car_rental' ? 'Rent a Car' :
                             category.id === 'activities' ? 'Explore Activities' :
                             category.id === 'esim' ? 'Get eSIM' :
                             'Find Storage'}
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Trusted partners</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Instant confirmation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-sky-500" />
            <span>Worldwide coverage</span>
          </div>
        </div>

        {/* Disclosure */}
        <p className="text-xs text-muted-foreground text-center mt-6 max-w-lg mx-auto">
          {AFFILIATE_DISCLOSURE_TEXT.short}
        </p>
        
        {/* View All Link */}
        <div className="text-center mt-6">
          <Link to="/extras">
            <Button variant="outline" className="gap-2">
              View All Travel Extras
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
