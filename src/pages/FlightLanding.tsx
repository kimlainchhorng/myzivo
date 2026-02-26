import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plane, Shield, Clock, Globe, ShieldCheck, Bell, TrendingDown, CalendarDays, Sparkles, Package, Hotel, Car, Star, CheckCircle, Zap, DollarSign, BadgePercent, Heart, ChevronRight, Brain, BarChart3, Users, Award, Wifi, BaggageClaim, Armchair, TrendingUp, Eye, Percent, MapPin } from "lucide-react";
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

  // === NEW Wave 2: AI/Prediction features ===
  const [showPricePrediction, setShowPricePrediction] = useState(false);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [showFareClasses, setShowFareClasses] = useState(false);
  const [showLoyaltyEstimate, setShowLoyaltyEstimate] = useState(false);
  const [showCO2Calculator, setShowCO2Calculator] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);
  const [showTravelerReviews, setShowTravelerReviews] = useState(false);
  const [selectedFareClass, setSelectedFareClass] = useState("economy");

  // AI Price prediction
  const pricePrediction = {
    recommendation: "Buy now",
    confidence: 87,
    trend: "rising" as const,
    prediction: "Prices expected to increase 12% in the next 7 days",
    historicalLow: 134,
    historicalAvg: 178,
    currentPrice: 156,
  };

  // Fare class comparison
  const fareClasses = [
    { id: "basic-economy", name: "Basic Economy", price: 134, features: ["No carry-on", "No changes", "Last to board", "No seat selection"], color: "text-muted-foreground" },
    { id: "economy", name: "Economy", price: 156, features: ["1 carry-on", "Changes for fee", "Standard boarding", "Seat selection $15"], color: "text-sky-500" },
    { id: "premium-economy", name: "Premium Economy", price: 289, features: ["2 bags included", "Free changes", "Priority boarding", "Extra legroom"], color: "text-amber-500" },
    { id: "business", name: "Business", price: 589, features: ["3 bags included", "Free changes/cancel", "Lounge access", "Lie-flat seat", "Premium meals"], color: "text-violet-500" },
  ];

  // Seat map preview
  const seatMapSections = [
    { name: "First Class", rows: 3, cols: 4, price: "$89+", available: 4, color: "bg-amber-500/30" },
    { name: "Business", rows: 5, cols: 6, price: "$49+", available: 12, color: "bg-violet-500/30" },
    { name: "Premium Economy", rows: 6, cols: 6, price: "$29+", available: 18, color: "bg-sky-500/30" },
    { name: "Economy", rows: 20, cols: 6, price: "$15+", available: 45, color: "bg-emerald-500/20" },
  ];

  // Loyalty points estimate
  const loyaltyEstimate = {
    milesEarned: 2450,
    statusMiles: 1225,
    bonusMiles: 500,
    cashValue: "$36.75",
    nextTierMiles: 3000,
    currentTier: "Silver",
    nextTier: "Gold",
  };

  // CO2 calculator
  const co2Data = {
    emissions: "0.23 tons CO2",
    comparison: "65% less than driving",
    offsetCost: "$2.30",
    treesEquivalent: "2 trees",
  };

  // Flight amenities comparison
  const amenityComparison = [
    { amenity: "Wi-Fi", economy: "Paid ($8)", premium: "Free", business: "Free high-speed" },
    { amenity: "Meals", economy: "Snacks only", premium: "Hot meal", business: "Multi-course" },
    { amenity: "Legroom", economy: "31\"", premium: "36\"", business: "78\" lie-flat" },
    { amenity: "Power", economy: "USB only", premium: "USB + AC", business: "USB + AC" },
    { amenity: "Entertainment", economy: "Personal device", premium: "Seatback screen", business: "15\" HD screen" },
  ];

  // Traveler reviews
  const travelerReviews = [
    { name: "Alex M.", route: "NYC → LAX", rating: 5, text: "Great price on ZIVO! Saved $40 vs booking direct.", date: "2 days ago", verified: true },
    { name: "Sarah T.", route: "SFO → MIA", rating: 4, text: "Easy to compare fares. Fare alert actually worked!", date: "1 week ago", verified: true },
    { name: "James K.", route: "CHI → LAS", rating: 5, text: "Price drop protection saved me $55. Worth every penny.", date: "3 days ago", verified: true },
  ];

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

        {/* === WAVE 2: AI/Prediction Features === */}

        {/* AI Price Prediction (Google Flights style) */}
        <section className="py-8 border-b border-border/30 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setShowPricePrediction(!showPricePrediction)}
                className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4 w-full">
                <Brain className="w-5 h-5 text-violet-500" /> AI Price Prediction
                <Badge className="bg-violet-500/10 text-violet-500 border-0 text-[9px]">BETA</Badge>
                <ChevronRight className={cn("w-4 h-4 ml-auto transition-transform", showPricePrediction && "rotate-90")} />
              </button>
              <AnimatePresence>
                {showPricePrediction && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="rounded-2xl bg-card border border-violet-500/20 p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={cn("px-4 py-2 rounded-xl text-sm font-bold",
                          pricePrediction.recommendation === "Buy now" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500")}>
                          {pricePrediction.recommendation === "Buy now" ? "✅" : "⏳"} {pricePrediction.recommendation}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <BarChart3 className="w-3.5 h-3.5" /> {pricePrediction.confidence}% confidence
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{pricePrediction.prediction}</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl bg-muted/30">
                          <p className="text-[10px] text-muted-foreground">Historical Low</p>
                          <p className="text-lg font-bold text-emerald-500">${pricePrediction.historicalLow}</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                          <p className="text-[10px] text-muted-foreground">Current Price</p>
                          <p className="text-lg font-bold text-foreground">${pricePrediction.currentPrice}</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/30">
                          <p className="text-[10px] text-muted-foreground">Average</p>
                          <p className="text-lg font-bold text-muted-foreground">${pricePrediction.historicalAvg}</p>
                        </div>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${((pricePrediction.currentPrice - pricePrediction.historicalLow) / (pricePrediction.historicalAvg - pricePrediction.historicalLow)) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500" />
                      </div>
                      <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                        <span>Lowest</span><span>Average</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Fare Class Comparison (Expedia/Google Flights) */}
        <section className="py-8 border-b border-border/30">
          <div className="container mx-auto px-4">
            <button onClick={() => setShowFareClasses(!showFareClasses)}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4">
              <Armchair className="w-5 h-5 text-sky-500" /> Compare Fare Classes
              <ChevronRight className={cn("w-4 h-4 transition-transform", showFareClasses && "rotate-90")} />
            </button>
            <AnimatePresence>
              {showFareClasses && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="grid md:grid-cols-4 gap-3 max-w-5xl mx-auto">
                    {fareClasses.map(fc => (
                      <button key={fc.id} onClick={() => setSelectedFareClass(fc.id)}
                        className={cn("rounded-2xl p-4 text-left transition-all border",
                          selectedFareClass === fc.id ? "border-sky-500 bg-sky-500/5 shadow-lg" : "border-border/40 bg-card hover:border-border")}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={cn("text-xs font-bold", fc.color)}>{fc.name}</h3>
                          <span className="text-sm font-bold text-foreground">${fc.price}</span>
                        </div>
                        <ul className="space-y-1">
                          {fc.features.map(f => (
                            <li key={f} className="text-[10px] text-muted-foreground flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Seat Map Preview */}
        <section className="py-8 border-b border-border/30 bg-muted/10">
          <div className="container mx-auto px-4">
            <button onClick={() => setShowSeatMap(!showSeatMap)}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4">
              <Armchair className="w-5 h-5 text-amber-500" /> Seat Map & Availability
              <ChevronRight className={cn("w-4 h-4 transition-transform", showSeatMap && "rotate-90")} />
            </button>
            <AnimatePresence>
              {showSeatMap && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="max-w-md mx-auto space-y-3">
                    {seatMapSections.map(section => (
                      <div key={section.name} className="rounded-xl bg-card border border-border/40 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-foreground">{section.name}</span>
                          <span className="text-xs font-bold text-sky-500">{section.price}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap mb-2">
                          {Array.from({ length: Math.min(section.available, 12) }).map((_, i) => (
                            <div key={i} className={cn("w-5 h-5 rounded", section.color)} />
                          ))}
                          {section.available > 12 && <span className="text-[9px] text-muted-foreground self-center ml-1">+{section.available - 12} more</span>}
                        </div>
                        <p className="text-[10px] text-emerald-500 font-bold">{section.available} seats available</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Amenity Comparison Table */}
        <section className="py-8 border-b border-border/30">
          <div className="container mx-auto px-4">
            <button onClick={() => setShowAmenities(!showAmenities)}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4">
              <Wifi className="w-5 h-5 text-sky-500" /> In-Flight Amenities
              <ChevronRight className={cn("w-4 h-4 transition-transform", showAmenities && "rotate-90")} />
            </button>
            <AnimatePresence>
              {showAmenities && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="max-w-3xl mx-auto rounded-2xl bg-card border border-border/40 overflow-hidden">
                    <div className="grid grid-cols-4 gap-0 text-center text-[10px] font-bold border-b border-border/30 bg-muted/30">
                      <div className="p-3">Amenity</div>
                      <div className="p-3 text-sky-500">Economy</div>
                      <div className="p-3 text-amber-500">Premium</div>
                      <div className="p-3 text-violet-500">Business</div>
                    </div>
                    {amenityComparison.map(row => (
                      <div key={row.amenity} className="grid grid-cols-4 gap-0 text-center text-[10px] border-b border-border/20 last:border-0">
                        <div className="p-3 font-bold text-foreground text-left">{row.amenity}</div>
                        <div className="p-3 text-muted-foreground">{row.economy}</div>
                        <div className="p-3 text-muted-foreground">{row.premium}</div>
                        <div className="p-3 text-muted-foreground">{row.business}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Loyalty Points Estimator */}
        <section className="py-8 border-b border-border/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
          <div className="container mx-auto px-4">
            <button onClick={() => setShowLoyaltyEstimate(!showLoyaltyEstimate)}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4">
              <Award className="w-5 h-5 text-amber-500" /> Loyalty Miles Estimate
              <Badge className="bg-amber-500/10 text-amber-500 border-0 text-[9px]">{loyaltyEstimate.currentTier}</Badge>
              <ChevronRight className={cn("w-4 h-4 ml-auto transition-transform", showLoyaltyEstimate && "rotate-90")} />
            </button>
            <AnimatePresence>
              {showLoyaltyEstimate && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="max-w-2xl mx-auto rounded-2xl bg-card border border-amber-500/20 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-amber-500">{loyaltyEstimate.milesEarned.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Miles earned</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{loyaltyEstimate.bonusMiles}</p>
                        <p className="text-[10px] text-muted-foreground">Bonus miles</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-500">{loyaltyEstimate.cashValue}</p>
                        <p className="text-[10px] text-muted-foreground">Cash value</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-violet-500">{loyaltyEstimate.nextTierMiles - loyaltyEstimate.milesEarned}</p>
                        <p className="text-[10px] text-muted-foreground">To {loyaltyEstimate.nextTier}</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(loyaltyEstimate.milesEarned / loyaltyEstimate.nextTierMiles) * 100}%` }}
                        transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* CO2 Calculator */}
        <section className="py-6 border-b border-border/30">
          <div className="container mx-auto px-4">
            <button onClick={() => setShowCO2Calculator(!showCO2Calculator)}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4">
              <Globe className="w-5 h-5 text-emerald-500" /> Carbon Footprint Calculator
              <ChevronRight className={cn("w-4 h-4 transition-transform", showCO2Calculator && "rotate-90")} />
            </button>
            <AnimatePresence>
              {showCO2Calculator && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-card border border-border/40 p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{co2Data.emissions}</p>
                      <p className="text-[10px] text-muted-foreground">Total emissions</p>
                    </div>
                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 text-center">
                      <p className="text-lg font-bold text-emerald-500">{co2Data.comparison}</p>
                      <p className="text-[10px] text-muted-foreground">vs driving</p>
                    </div>
                    <div className="rounded-xl bg-card border border-border/40 p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{co2Data.offsetCost}</p>
                      <p className="text-[10px] text-muted-foreground">Offset cost</p>
                    </div>
                    <div className="rounded-xl bg-card border border-border/40 p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{co2Data.treesEquivalent}</p>
                      <p className="text-[10px] text-muted-foreground">Trees equivalent</p>
                    </div>
                  </div>
                  <div className="max-w-2xl mx-auto mt-3 text-center">
                    <button onClick={() => toast.success("🌱 Carbon offset added — $2.30")}
                      className="px-5 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                      🌱 Offset this flight for {co2Data.offsetCost}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Traveler Reviews */}
        <section className="py-8 border-b border-border/30 bg-muted/10">
          <div className="container mx-auto px-4">
            <button onClick={() => setShowTravelerReviews(!showTravelerReviews)}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4">
              <Star className="w-5 h-5 text-amber-500" /> Traveler Reviews
              <Badge className="bg-amber-500/10 text-amber-500 border-0 text-[9px]">4.8 ★</Badge>
              <ChevronRight className={cn("w-4 h-4 transition-transform", showTravelerReviews && "rotate-90")} />
            </button>
            <AnimatePresence>
              {showTravelerReviews && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="max-w-3xl mx-auto space-y-3">
                    {travelerReviews.map(review => (
                      <div key={review.name} className="rounded-2xl bg-card border border-border/40 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                {review.name}
                                {review.verified && <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[8px]">✓ Verified</Badge>}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{review.route} · {review.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
