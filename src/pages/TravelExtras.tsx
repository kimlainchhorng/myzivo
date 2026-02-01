/**
 * TRAVEL EXTRAS PAGE - /extras
 * Organized hub for all travel add-on services
 * All partner links consolidated here
 */
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Ticket, 
  Wifi, 
  Luggage, 
  Scale,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Shield,
  Clock,
  Globe,
  Bus
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRANSFER_PARTNERS,
  ACTIVITY_PARTNERS,
  ESIM_PARTNERS,
  LUGGAGE_PARTNERS,
  COMPENSATION_PARTNERS,
  AFFILIATE_DISCLOSURE_TEXT,
  openPartnerLink
} from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RedirectDisclaimer } from "@/components/shared/RedirectDisclaimer";

interface ExtraCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  partners: Array<{ id: string; name: string; logo: string; features: string[]; trackingUrl: string }>;
  trackingCategory: 'transfers' | 'activities' | 'esim' | 'luggage' | 'compensation';
}

const categories: ExtraCategory[] = [
  {
    id: "transfers",
    title: "Airport Transfers",
    description: "Pre-book airport pickups and drop-offs worldwide",
    icon: Bus,
    gradient: "from-amber-500 to-orange-600",
    partners: TRANSFER_PARTNERS,
    trackingCategory: 'transfers',
  },
  {
    id: "activities",
    title: "Activities & Tours",
    description: "Discover tours, museums, and local experiences",
    icon: Ticket,
    gradient: "from-emerald-500 to-teal-600",
    partners: ACTIVITY_PARTNERS,
    trackingCategory: 'activities',
  },
  {
    id: "esim",
    title: "Travel eSIM",
    description: "Stay connected abroad with instant data plans",
    icon: Wifi,
    gradient: "from-cyan-500 to-blue-600",
    partners: ESIM_PARTNERS,
    trackingCategory: 'esim',
  },
  {
    id: "luggage",
    title: "Luggage Storage",
    description: "Store your bags safely while you explore",
    icon: Luggage,
    gradient: "from-violet-500 to-purple-600",
    partners: LUGGAGE_PARTNERS,
    trackingCategory: 'luggage',
  },
  {
    id: "compensation",
    title: "Flight Compensation",
    description: "Get up to €600 for delayed or cancelled flights",
    icon: Scale,
    gradient: "from-red-500 to-rose-600",
    partners: COMPENSATION_PARTNERS,
    trackingCategory: 'compensation',
  },
];

export default function TravelExtras() {
  const handlePartnerClick = (partner: { id: string; name: string; trackingUrl: string }, category: ExtraCategory['trackingCategory']) => {
    trackAffiliateClick({
      flightId: `extras-${partner.id}`,
      airline: partner.name,
      airlineCode: partner.id.toUpperCase(),
      origin: '',
      destination: '',
      price: 0,
      passengers: 1,
      cabinClass: 'standard',
      affiliatePartner: partner.id,
      referralUrl: partner.trackingUrl,
      source: 'extras_page',
      ctaType: 'cross_sell',
      serviceType: category,
    });
    
    openPartnerLink(partner.trackingUrl, {
      partnerId: partner.id,
      partnerName: partner.name,
      product: category,
      pageSource: 'travel-extras',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Travel Extras
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Everything You Need for Your Trip
              </h1>
              <p className="text-lg text-muted-foreground">
                From airport transfers to travel eSIMs - find all your travel essentials in one place
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories.map((category, index) => (
          <section 
            key={category.id} 
            className={cn(
              "py-12 border-b border-border",
              index % 2 === 1 && "bg-muted/20"
            )}
          >
            <div className="container mx-auto px-4">
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white",
                  category.gradient
                )}>
                  <category.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-xl">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>

              {/* Partner Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
                {category.partners.map((partner) => (
                  <Card
                    key={partner.id}
                    className="group cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                    onClick={() => handlePartnerClick(partner, category.trackingCategory)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {partner.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">
                            {partner.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {partner.features.slice(0, 2).join(' • ')}
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full gap-2 text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                          >
                            Explore <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Trust & Disclosure */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex flex-wrap items-center justify-center gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Trusted partners</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-sky-500" />
                  <span>Worldwide coverage</span>
                </div>
              </div>
              
              <RedirectDisclaimer variant="banner" className="mb-4" />
              
              <p className="text-xs text-muted-foreground">
                {AFFILIATE_DISCLOSURE_TEXT.short}
              </p>
            </div>
          </div>
        </section>

        {/* Back to Travel CTA */}
        <section className="py-8 border-t border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <p className="text-sm text-muted-foreground">Looking for travel?</p>
              <div className="flex gap-2">
                <Link to="/flights">
                  <Button variant="outline" size="sm" className="gap-2">
                    Flights <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
                <Link to="/hotels">
                  <Button variant="outline" size="sm" className="gap-2">
                    Hotels <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
                <Link to="/rent-car">
                  <Button variant="outline" size="sm" className="gap-2">
                    Cars <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
