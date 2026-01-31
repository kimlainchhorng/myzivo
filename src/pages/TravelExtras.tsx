import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Hotel, 
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
  MapPin,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRANSFER_PARTNERS,
  CAR_PARTNERS,
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

/**
 * TRAVEL EXTRAS PAGE - /extras
 * Standalone page showcasing all travel add-ons in organized categories
 */

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
  badge?: string;
}

const mainServices: ServiceCard[] = [
  {
    id: "flights",
    title: "Flights",
    description: "Compare 500+ airlines",
    icon: Plane,
    href: "/flights",
    gradient: "from-sky-500 to-blue-600",
    badge: "Popular",
  },
  {
    id: "hotels",
    title: "Hotels",
    description: "2M+ accommodations",
    icon: Hotel,
    href: "/book-hotel",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "cars",
    title: "Car Rental",
    description: "500+ providers worldwide",
    icon: Car,
    href: "/rent-car",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "activities",
    title: "Things To Do",
    description: "Tours & attractions",
    icon: Ticket,
    href: "/things-to-do",
    gradient: "from-emerald-500 to-teal-600",
    badge: "New",
  },
];

export default function TravelExtras() {
  const handlePartnerClick = (partner: { id: string; name: string; trackingUrl: string }, category: 'flights' | 'hotels' | 'car_rental' | 'activities' | 'transfers' | 'esim' | 'luggage' | 'compensation') => {
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
    
    openPartnerLink(partner.trackingUrl);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-teal-500/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Travel Extras
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Everything You Need for Your{" "}
                <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                  Perfect Trip
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                From flights to activities, find all your travel essentials in one place
              </p>
            </div>

            {/* Main Services Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-8">
              {mainServices.map((service, index) => (
                <Link
                  key={service.id}
                  to={service.href}
                  className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="h-full border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
                    {service.badge && (
                      <div className={cn("text-white text-center py-1 text-xs font-medium bg-gradient-to-r", service.gradient)}>
                        {service.badge}
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br text-white group-hover:scale-110 transition-transform",
                        service.gradient
                      )}>
                        <service.icon className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">{service.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                      <div className="flex items-center justify-center gap-1 text-sm font-medium text-primary">
                        Search now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Airport Transfers Section */}
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Car className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Airport Transfers & Rides</h2>
                <p className="text-sm text-muted-foreground">Book airport transfers with trusted providers</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
              {TRANSFER_PARTNERS.map((partner, index) => (
                <Card
                  key={partner.id}
                  className="group cursor-pointer border-border/50 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300"
                  onClick={() => handlePartnerClick(partner, 'transfers')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {partner.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1 group-hover:text-amber-500 transition-colors">{partner.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {partner.features.slice(0, 2).join(' • ')}
                        </p>
                        <Button size="sm" variant="outline" className="w-full gap-2 text-xs group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-colors">
                          Book Transfer <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Things To Do Section */}
        <section className="py-12 border-t border-border/50 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Things To Do</h2>
                <p className="text-sm text-muted-foreground">Discover tours, museums & experiences</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
              {ACTIVITY_PARTNERS.map((partner, index) => (
                <Card
                  key={partner.id}
                  className="group cursor-pointer border-border/50 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300"
                  onClick={() => handlePartnerClick(partner, 'activities')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {partner.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1 group-hover:text-emerald-500 transition-colors">{partner.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {partner.features.slice(0, 2).join(' • ')}
                        </p>
                        <Button size="sm" variant="outline" className="w-full gap-2 text-xs group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-colors">
                          Explore Activities <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Travel Essentials Section */}
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Travel Essentials</h2>
                <p className="text-sm text-muted-foreground">Stay connected and travel light</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
              {/* eSIM Partners */}
              {ESIM_PARTNERS.map((partner) => (
                <Card
                  key={partner.id}
                  className="group cursor-pointer border-border/50 hover:border-cyan-500/50 hover:shadow-lg transition-all duration-300"
                  onClick={() => handlePartnerClick(partner, 'esim')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {partner.logo}
                    </div>
                    <h3 className="font-bold text-sm mb-1 group-hover:text-cyan-500 transition-colors">{partner.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">Travel eSIM</p>
                    <Button size="sm" variant="outline" className="w-full gap-2 text-xs group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-500 transition-colors">
                      Get eSIM <ExternalLink className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {/* Luggage Storage */}
              {LUGGAGE_PARTNERS.map((partner) => (
                <Card
                  key={partner.id}
                  className="group cursor-pointer border-border/50 hover:border-purple-500/50 hover:shadow-lg transition-all duration-300"
                  onClick={() => handlePartnerClick(partner, 'luggage')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {partner.logo}
                    </div>
                    <h3 className="font-bold text-sm mb-1 group-hover:text-purple-500 transition-colors">{partner.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">$5.90/day</p>
                    <Button size="sm" variant="outline" className="w-full gap-2 text-xs group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500 transition-colors">
                      Find Storage <ExternalLink className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Travel Support Section */}
        <section className="py-12 border-t border-border/50 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                <Scale className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Travel Support</h2>
                <p className="text-sm text-muted-foreground">Get help with flight delays and cancellations</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
              {COMPENSATION_PARTNERS.map((partner) => (
                <Card
                  key={partner.id}
                  className="group cursor-pointer border-border/50 hover:border-red-500/50 hover:shadow-lg transition-all duration-300"
                  onClick={() => handlePartnerClick(partner, 'compensation')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {partner.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1 group-hover:text-red-500 transition-colors">{partner.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Get up to €600 for delayed or cancelled flights. No win, no fee.
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {partner.features.slice(0, 3).map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{feature}</Badge>
                          ))}
                        </div>
                        <Button size="sm" className="w-full gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90">
                          Check Compensation <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Disclosure */}
        <section className="py-12 border-t border-border/50">
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
      </main>

      <Footer />
    </div>
  );
}
