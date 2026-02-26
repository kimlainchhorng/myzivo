import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plane, Shield, Clock, Globe, ShieldCheck, Bell, TrendingDown, CalendarDays, Sparkles, Package, Hotel, Car, Star, CheckCircle, Zap, DollarSign, BadgePercent, Heart, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { FlightSearchFormPro } from "@/components/search";
import WhyCompareSection from "@/components/seo/WhyCompareSection";
import HowItWorksSection from "@/components/seo/HowItWorksSection";
import TrustedPartnersSection from "@/components/seo/TrustedPartnersSection";
import FlightFAQWithSchema from "@/components/seo/FlightFAQWithSchema";
import PopularRoutesGrid from "@/components/seo/PopularRoutesGrid";
import CrossSellBanner from "@/components/seo/CrossSellBanner";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import { InternalLinkGrid } from "@/components/seo";
import ImageHero from "@/components/shared/ImageHero";
import UserTestimonials from "@/components/shared/UserTestimonials";
import PhotoDestinationGrid from "@/components/shared/PhotoDestinationGrid";
import PartnerLogosStrip from "@/components/shared/PartnerLogosStrip";
import GlobalTrustBar from "@/components/shared/GlobalTrustBar";
import { formatRouteTitle } from "@/utils/seoUtils";
import { FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { HowBookingWorks, FlightTrustBadgesBar } from "@/components/flight";
import FlightAirlinePartners from "@/components/flight/FlightAirlinePartners";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

/**
 * Dynamic SEO landing page for flights
 * CheapOair + Expedia inspired features
 */
const FlightLanding = () => {
  const { fromCity, toCity, route } = useParams<{ 
    fromCity?: string; 
    toCity?: string;
    route?: string;
  }>();
  const navigate = useNavigate();

  // === CheapOair/Expedia-inspired state ===
  const [showPriceCalendar, setShowPriceCalendar] = useState(false);
  const [fareAlertEmail, setFareAlertEmail] = useState("");
  const [fareAlertSet, setFareAlertSet] = useState(false);
  const [showBundleDeals, setShowBundleDeals] = useState(false);
  const [showTravelInsurance, setShowTravelInsurance] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<"none" | "basic" | "premium">("none");
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [showFlexDates, setShowFlexDates] = useState(false);
  const [priceDropProtection, setPriceDropProtection] = useState(false);
  const [showMemberDeals, setShowMemberDeals] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  // Mock price calendar data
  const priceCalendarData = [
    { day: "Mon", date: "Mar 3", price: 189, cheapest: false },
    { day: "Tue", date: "Mar 4", price: 156, cheapest: true },
    { day: "Wed", date: "Mar 5", price: 172, cheapest: false },
    { day: "Thu", date: "Mar 6", price: 198, cheapest: false },
    { day: "Fri", date: "Mar 7", price: 245, cheapest: false },
    { day: "Sat", date: "Mar 8", price: 234, cheapest: false },
    { day: "Sun", date: "Mar 9", price: 167, cheapest: false },
  ];

  // Mock bundle deals
  const bundleDeals = [
    { id: "flight-hotel", label: "Flight + Hotel", savings: "Save up to 30%", icon: Hotel, color: "text-amber-500" },
    { id: "flight-car", label: "Flight + Car", savings: "Save up to 25%", icon: Car, color: "text-violet-500" },
    { id: "flight-hotel-car", label: "Flight + Hotel + Car", savings: "Save up to 40%", icon: Package, color: "text-emerald-500" },
  ];

  // Mock price comparison
  const priceComparisonData = [
    { partner: "ZIVO Best Price", price: 156, savings: null, badge: "Best Deal" },
    { partner: "Partner A", price: 189, savings: null, badge: null },
    { partner: "Partner B", price: 198, savings: null, badge: null },
    { partner: "Partner C", price: 212, savings: null, badge: null },
  ];

  // Insurance tiers
  const insuranceTiers = [
    { id: "none" as const, name: "No Protection", price: "$0", features: [] },
    { id: "basic" as const, name: "Basic Coverage", price: "$19.99", features: ["Trip cancellation up to $500", "Baggage delay $200", "24/7 assistance"] },
    { id: "premium" as const, name: "Premium Coverage", price: "$39.99", features: ["Trip cancellation up to $5,000", "Medical emergency $50,000", "Baggage loss $1,500", "Flight delay $500", "24/7 concierge"] },
  ];

  // Recent searches mock
  const recentSearches = [
    { from: "NYC", to: "LAX", date: "Mar 5", price: "$156" },
    { from: "SFO", to: "MIA", date: "Mar 12", price: "$198" },
    { from: "CHI", to: "LAS", date: "Apr 1", price: "$134" },
  ];

  // Map common SEO city slugs to valid IATA/city codes
  const slugToIata: Record<string, string> = {
    "new york": "NYC", "new york city": "NYC", "los angeles": "LAX",
    "san francisco": "SFO", "chicago": "CHI", "miami": "MIA",
    "atlanta": "ATL", "dallas": "DFW", "houston": "IAH",
    "las vegas": "LAS", "london": "LON", "paris": "PAR", "tokyo": "TYO",
  };

  let from = "";
  let to = "";
  
  if (route) {
    const parts = route.split("-to-");
    if (parts.length === 2) {
      from = parts[0].replace(/-/g, " ");
      to = parts[1].replace(/-/g, " ");
    }
  } else if (fromCity) {
    from = fromCity.replace(/-/g, " ");
  } else if (toCity) {
    to = toCity.replace(/-/g, " ");
  }

  const { title, description, h1 } = formatRouteTitle(from, to);

  const normalizeCityKey = (s: string) => s.trim().toLowerCase();
  const fromIata = from.match(/\(([A-Z]{3})\)/)?.[1] || slugToIata[normalizeCityKey(from)] || "";
  const toIata = to.match(/\(([A-Z]{3})\)/)?.[1] || slugToIata[normalizeCityKey(to)] || "";

  const handleSetFareAlert = () => {
    if (fareAlertEmail) {
      setFareAlertSet(true);
      toast.success("🔔 Fare alert set! We'll notify you when prices drop.");
    }
  };

  const handleSaveRoute = () => {
    const routeKey = `${from || "Any"}-${to || "Any"}`;
    if (!savedRoutes.includes(routeKey)) {
      setSavedRoutes(prev => [...prev, routeKey]);
      toast.success("❤️ Route saved to favorites!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={title}
        description={description}
        canonical={`https://hizivo.com/flights${route ? `/${route}` : fromCity ? `/from-${fromCity}` : toCity ? `/to-${toCity}` : ''}`}
      />
      <OrganizationSchema />
      <Header />

      <main className="pt-16">
        {/* Hero Section with Full-Width Photo */}
        <ImageHero service="flights" icon={Plane}>
          <FlightSearchFormPro 
            initialFrom={fromIata} 
            initialTo={toIata}
            navigateOnSearch={true}
          />
        </ImageHero>

        {/* Flight Disclaimer Banner - LOCKED TEXT (REQUIRED) */}
        <section className="border-b border-amber-500/20 py-2.5 bg-amber-500/5">
          <div className="container mx-auto px-4">
            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              {FLIGHT_DISCLAIMERS.ticketing}
            </p>
          </div>
        </section>

        {/* === NEW: CheapOair/Expedia Features === */}

        {/* Price Calendar Strip (CheapOair) */}
        <section className="py-6 border-b border-border/30 bg-muted/10">
          <div className="container mx-auto px-4">
            <button onClick={() => setShowPriceCalendar(!showPriceCalendar)}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4">
              <CalendarDays className="w-4 h-4 text-sky-500" /> Flexible Dates — Find the Cheapest Day to Fly
              <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", showPriceCalendar && "rotate-90")} />
            </button>
            <AnimatePresence>
              {showPriceCalendar && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {priceCalendarData.map(d => (
                      <button key={d.date} className={cn(
                        "flex-shrink-0 w-24 p-3 rounded-xl border text-center transition-all hover:scale-105",
                        d.cheapest ? "border-emerald-500 bg-emerald-500/10" : "border-border/40 bg-card"
                      )}>
                        <p className="text-[10px] text-muted-foreground">{d.day}</p>
                        <p className="text-xs font-bold text-foreground">{d.date}</p>
                        <p className={cn("text-sm font-bold mt-1", d.cheapest ? "text-emerald-500" : "text-foreground")}>${d.price}</p>
                        {d.cheapest && <Badge className="mt-1 bg-emerald-500/20 text-emerald-500 border-0 text-[8px]">Cheapest</Badge>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Fare Alert + Price Drop Protection (CheapOair/Expedia) */}
        <section className="py-6 border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {/* Fare Alert */}
              <div className="rounded-2xl bg-gradient-to-br from-sky-500/5 to-blue-500/5 border border-sky-500/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-5 h-5 text-sky-500" />
                  <h3 className="text-sm font-bold text-foreground">Price Drop Alert</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Get notified when prices drop for this route</p>
                {!fareAlertSet ? (
                  <div className="flex gap-2">
                    <input type="email" placeholder="Your email" value={fareAlertEmail}
                      onChange={(e) => setFareAlertEmail(e.target.value)}
                      className="flex-1 h-10 rounded-xl border border-border/40 bg-card px-3 text-sm" />
                    <button onClick={handleSetFareAlert}
                      className="px-4 h-10 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-all active:scale-95">
                      Set Alert
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                    <CheckCircle className="w-4 h-4" /> Alert active — we'll email you!
                  </div>
                )}
              </div>

              {/* Price Drop Protection */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-foreground">Price Drop Protection</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[9px]">NEW</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Book now — if price drops, get the difference as ZIVO credit</p>
                <button onClick={() => { setPriceDropProtection(!priceDropProtection); if (!priceDropProtection) toast.success("✅ Price drop protection enabled!"); }}
                  className={cn("w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95",
                    priceDropProtection ? "bg-emerald-500 text-white" : "bg-card border border-border/40 text-foreground hover:bg-muted/50")}>
                  {priceDropProtection ? "✓ Protection Active — +$4.99" : "Enable for $4.99"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bundle & Save (Expedia) */}
        <section className="py-8 border-b border-border/30 bg-muted/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Bundle & Save
              </h2>
              <p className="text-sm text-muted-foreground">Combine your flight with hotel or car rental for extra savings</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {bundleDeals.map(deal => (
                <motion.button key={deal.id} whileHover={{ scale: 1.02 }}
                  className="rounded-2xl bg-card border border-border/40 p-5 text-center hover:border-primary/40 transition-all">
                  <deal.icon className={cn("w-8 h-8 mx-auto mb-3", deal.color)} />
                  <p className="text-sm font-bold text-foreground mb-1">{deal.label}</p>
                  <p className="text-xs font-bold text-emerald-500">{deal.savings}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Travel Insurance Upsell (CheapOair) */}
        <section className="py-8 border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-sky-500" /> Travel Protection Plans
              </h2>
              <p className="text-sm text-muted-foreground">Protect your trip against cancellations, delays, and emergencies</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {insuranceTiers.map(tier => (
                <button key={tier.id} onClick={() => setSelectedInsurance(tier.id)}
                  className={cn("rounded-2xl p-5 text-left transition-all border",
                    selectedInsurance === tier.id ? "border-sky-500 bg-sky-500/5 shadow-lg" : "border-border/40 bg-card hover:border-border")}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground">{tier.name}</h3>
                    <span className="text-sm font-bold text-sky-500">{tier.price}</span>
                  </div>
                  {tier.features.length > 0 ? (
                    <ul className="space-y-1.5">
                      {tier.features.map(f => (
                        <li key={f} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No coverage — travel at your own risk</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Price Comparison Chart (Expedia) */}
        <section className="py-8 border-b border-border/30 bg-muted/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" /> Price Comparison
              </h2>
              <p className="text-sm text-muted-foreground">See how ZIVO compares to other booking sites</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-2">
              {priceComparisonData.map((item, i) => (
                <div key={item.partner}
                  className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all",
                    i === 0 ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/40 bg-card")}>
                  <div className="flex-1">
                    <p className={cn("text-sm font-bold", i === 0 ? "text-emerald-500" : "text-foreground")}>{item.partner}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-lg font-bold", i === 0 ? "text-emerald-500" : "text-foreground")}>${item.price}</span>
                    {item.badge && <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[9px]">{item.badge}</Badge>}
                  </div>
                  {i === 0 && (
                    <div className="h-full w-1 rounded-full bg-emerald-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Searches (CheapOair) */}
        <section className="py-6 border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setShowRecentSearches(!showRecentSearches)}
                className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4">
                <Clock className="w-4 h-4 text-muted-foreground" /> Recent Searches
                <ChevronRight className={cn("w-4 h-4 transition-transform", showRecentSearches && "rotate-90")} />
              </button>
              <AnimatePresence>
                {showRecentSearches && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                      {recentSearches.map(s => (
                        <button key={`${s.from}-${s.to}`}
                          className="flex-shrink-0 p-3 rounded-xl border border-border/40 bg-card hover:border-primary/40 transition-all text-left">
                          <p className="text-xs font-bold text-foreground">{s.from} → {s.to}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">{s.date}</span>
                            <span className="text-xs font-bold text-primary">{s.price}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Save Route / Favorite */}
        <section className="py-4 border-b border-border/30">
          <div className="container mx-auto px-4 text-center">
            <button onClick={handleSaveRoute}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/40 bg-card text-sm font-bold text-foreground hover:border-primary/40 transition-all active:scale-95">
              <Heart className={cn("w-4 h-4", savedRoutes.length > 0 ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
              {savedRoutes.length > 0 ? `${savedRoutes.length} Route(s) Saved` : "Save This Route"}
            </button>
          </div>
        </section>

        {/* Trust Bar */}
        <GlobalTrustBar variant="compact" />

        {/* Partner Logos */}
        <PartnerLogosStrip service="flights" />

        {/* Popular Routes Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <PopularRoutesGrid 
              fromCity={from} 
              toCity={to}
              onSelectRoute={(fromCode, toCode) => {
                navigate(`/flights/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}`);
              }}
            />
          </div>
        </section>

        <PhotoDestinationGrid service="flights" title="Popular Destinations" subtitle="Discover cheap flights to top cities" limit={8} />
        <WhyCompareSection />
        <HowBookingWorks />
        <FlightAirlinePartners />
        <FlightTrustBadgesBar />
        <HowItWorksSection />
        <CrossSellBanner />
        <UserTestimonials />
        <InternalLinkGrid currentService="flights" />
        <TrustedPartnersSection />
        <FlightFAQWithSchema />

        {/* SEO Content Block */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-invert max-w-none text-center">
              <h2 className="text-2xl font-bold mb-4">
                {from && to 
                  ? `Flights from ${from} to ${to}`
                  : from 
                    ? `Cheap Flights from ${from}`
                    : to 
                      ? `Find Flights to ${to}`
                      : "Search & Compare Flights Worldwide"
                }
              </h2>
              <p className="text-muted-foreground">
                ZIVO helps travelers find the best flight deals by connecting directly to airline ticketing systems. 
                Search real-time prices, view final fares, and book securely on ZIVO. 
                Tickets are issued instantly after payment by our licensed ticketing partners.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                ZIVO sells flight tickets as a sub-agent of licensed ticketing providers. 
                Tickets are issued by authorized partners under airline rules.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FlightLanding;
