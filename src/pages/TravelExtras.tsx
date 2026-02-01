/**
 * TRAVEL EXTRAS PAGE - /extras
 * EXCLUSIVE CENTRALIZED HUB for all travel add-on partner links
 * All partner links are consolidated here - NOT scattered on other pages
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Ticket, 
  Car, 
  Wifi, 
  Luggage, 
  Scale,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Shield,
  Clock,
  Globe,
  Headphones,
  Search,
  MapPin,
  Plane
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { openPartnerLink } from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroExtras from "@/assets/hero-extras.jpg";

// ============================================
// EXTRAS PARTNERS REGISTRY - ALL 13 PARTNERS
// ============================================
const EXTRAS_PARTNERS = [
  {
    id: 'klook',
    name: 'Klook',
    category: 'Activities & Tours',
    description: 'Book tours and attractions worldwide',
    icon: Ticket,
    logo: '🎟️',
    trackingUrl: 'https://klook.tpo.li/ToVcOax7',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    borderHover: 'hover:border-emerald-500/50',
  },
  {
    id: 'tiqets',
    name: 'Tiqets',
    category: 'Museums & Attractions',
    description: 'Skip-the-line museum tickets',
    icon: Ticket,
    logo: '🎫',
    trackingUrl: 'https://tiqets.tpo.li/5fqrcQWZ',
    gradient: 'from-violet-500/10 to-purple-500/10',
    borderHover: 'hover:border-violet-500/50',
  },
  {
    id: 'kiwitaxi',
    name: 'KiwiTaxi',
    category: 'Airport Transfers',
    description: 'Fixed-price airport pickups',
    icon: Car,
    logo: '🚕',
    trackingUrl: 'https://kiwitaxi.tpo.li/Bj6zghJH',
    gradient: 'from-amber-500/10 to-orange-500/10',
    borderHover: 'hover:border-amber-500/50',
  },
  {
    id: 'gettransfer',
    name: 'GetTransfer',
    category: 'Transfers Marketplace',
    description: 'Compare local transfer drivers',
    icon: Car,
    logo: '🚙',
    trackingUrl: 'https://gettransfer.tpo.li/FbrIguyh',
    gradient: 'from-amber-500/10 to-orange-500/10',
    borderHover: 'hover:border-amber-500/50',
  },
  {
    id: 'airalo',
    name: 'Airalo',
    category: 'eSIM',
    description: 'Instant eSIM for 190+ countries',
    icon: Wifi,
    logo: '📱',
    trackingUrl: 'https://airalo.tpo.li/zVRtp8Zt',
    gradient: 'from-cyan-500/10 to-blue-500/10',
    borderHover: 'hover:border-cyan-500/50',
  },
  {
    id: 'yesim',
    name: 'Yesim',
    category: 'eSIM',
    description: 'Budget-friendly travel eSIM',
    icon: Wifi,
    logo: '📶',
    trackingUrl: 'https://yesim.tpo.li/OpjeHJgH',
    gradient: 'from-cyan-500/10 to-blue-500/10',
    borderHover: 'hover:border-cyan-500/50',
  },
  {
    id: 'drimsim',
    name: 'Drimsim',
    category: 'SIM',
    description: 'Global SIM card with data',
    icon: Globe,
    logo: '🌐',
    trackingUrl: 'https://drimsim.tpo.li/A9yKO5oA',
    gradient: 'from-sky-500/10 to-indigo-500/10',
    borderHover: 'hover:border-sky-500/50',
  },
  {
    id: 'radicalstorage',
    name: 'Radical Storage',
    category: 'Luggage Storage',
    description: 'Store bags from $5.90/day',
    icon: Luggage,
    logo: '🧳',
    trackingUrl: 'https://radicalstorage.tpo.li/4W0KR99h',
    gradient: 'from-purple-500/10 to-pink-500/10',
    borderHover: 'hover:border-purple-500/50',
  },
  {
    id: 'wegotrip',
    name: 'WeGoTrip',
    category: 'Audio Tours',
    description: 'Self-guided audio experiences',
    icon: Headphones,
    logo: '🎧',
    trackingUrl: 'https://wegotrip.tpo.li/QSrOpIdV',
    gradient: 'from-rose-500/10 to-pink-500/10',
    borderHover: 'hover:border-rose-500/50',
  },
  {
    id: 'airhelp',
    name: 'AirHelp',
    category: 'Flight Compensation',
    description: 'Claim up to €600 for delays',
    icon: Scale,
    logo: '⚖️',
    trackingUrl: 'https://airhelp.tpo.li/7Z5saPi2',
    gradient: 'from-red-500/10 to-rose-500/10',
    borderHover: 'hover:border-red-500/50',
  },
  {
    id: 'compensair',
    name: 'Compensair',
    category: 'Flight Compensation',
    description: 'Free flight compensation check',
    icon: Plane,
    logo: '✈️',
    trackingUrl: 'https://compensair.tpo.li/npsp8pm0',
    gradient: 'from-red-500/10 to-rose-500/10',
    borderHover: 'hover:border-red-500/50',
  },
  {
    id: 'searadar',
    name: 'Searadar',
    category: 'Travel Radar',
    description: 'Compare all travel options',
    icon: Search,
    logo: '🔍',
    trackingUrl: 'https://searadar.tpo.li/iAbLlX9i',
    gradient: 'from-indigo-500/10 to-violet-500/10',
    borderHover: 'hover:border-indigo-500/50',
  },
  {
    id: 'ticketnetwork',
    name: 'TicketNetwork',
    category: 'Tickets Marketplace',
    description: 'Concerts, sports, live events',
    icon: Ticket,
    logo: '🎭',
    trackingUrl: 'https://ticketnetwork.tpo.li/utk3u8Vr',
    gradient: 'from-fuchsia-500/10 to-pink-500/10',
    borderHover: 'hover:border-fuchsia-500/50',
  },
];

export default function TravelExtras() {
  const [city, setCity] = useState('');
  
  const handlePartnerClick = (partner: typeof EXTRAS_PARTNERS[0]) => {
    // Map partner category to valid tracking service type
    const categoryToServiceType: Record<string, 'activities' | 'transfers' | 'esim' | 'luggage' | 'compensation'> = {
      'Activities & Tours': 'activities',
      'Museums & Attractions': 'activities',
      'Airport Transfers': 'transfers',
      'Transfers Marketplace': 'transfers',
      'eSIM': 'esim',
      'SIM': 'esim',
      'Luggage Storage': 'luggage',
      'Audio Tours': 'activities',
      'Flight Compensation': 'compensation',
      'Travel Radar': 'activities',
      'Tickets Marketplace': 'activities',
    };
    
    const serviceType = categoryToServiceType[partner.category] || 'activities';
    
    // Track the click with analytics
    trackAffiliateClick({
      flightId: `extras-${partner.id}`,
      airline: partner.name,
      airlineCode: partner.id.toUpperCase(),
      origin: city || '',
      destination: city || '',
      price: 0,
      passengers: 1,
      cabinClass: 'standard',
      affiliatePartner: partner.id,
      referralUrl: partner.trackingUrl,
      source: 'extras_page',
      ctaType: 'cross_sell',
      serviceType: serviceType,
    });
    
    // Open through /out for tracking
    openPartnerLink(partner.trackingUrl, {
      partnerId: partner.id,
      partnerName: partner.name,
      product: 'extras',
      pageSource: 'extras',
    });
    
    // Open through /out for tracking
    openPartnerLink(partner.trackingUrl, {
      partnerId: partner.id,
      partnerName: partner.name,
      product: 'extras',
      pageSource: 'extras',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroExtras}
              alt="Travel extras and services"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
          </div>
          
          <div className="relative container mx-auto px-4 py-16 sm:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Travel Add-Ons
              </Badge>
              
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                ZIVO{" "}
                <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                  Extras
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Tours, transfers, eSIM, luggage storage, and travel services — book on trusted partner sites.
              </p>
              
              {/* Optional City Input */}
              <div className="max-w-sm mx-auto">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Traveling to (city)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10 h-12 bg-background/80 backdrop-blur-sm border-border/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Optional: helps us personalize your experience
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Grid - All 13 Partners */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
              <TooltipProvider>
                {EXTRAS_PARTNERS.map((partner, index) => (
                  <Tooltip key={partner.id}>
                    <TooltipTrigger asChild>
                      <Card
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border/50",
                          partner.borderHover,
                          "animate-in fade-in slide-in-from-bottom-4"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => handlePartnerClick(partner)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform",
                              `bg-gradient-to-br ${partner.gradient}`
                            )}>
                              {partner.logo}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-0.5">
                                {partner.category}
                              </p>
                              <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                                {partner.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                {partner.description}
                              </p>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full gap-2 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors touch-manipulation"
                              >
                                Explore
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You will be redirected to a partner site.</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-8 border-t border-border/50 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
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
          </div>
        </section>

        {/* Affiliate Disclosure Footer */}
        <section className="py-10 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-sm text-muted-foreground mb-4">
                ZIVO may earn a commission when users book through partner links.
                <br />
                Bookings are completed on partner websites.
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
