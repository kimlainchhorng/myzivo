/**
 * SEO FLIGHT ROUTE PAGE
 * 
 * Dynamic landing page for routes like /flights/new-york-to-london
 * COMPLIANCE: No mock/hardcoded prices. Only shows booking tips and search CTA.
 * All price data comes from live API on results page.
 */
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plane, MapPin, Clock, Calendar, TrendingDown, Bell, Info, Sparkles, CheckCircle, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FlightSearchSchema from "@/components/seo/FlightSearchSchema";
 import DirectNDCBadge from "@/components/seo/DirectNDCBadge";
 import AnimatedRouteMap from "@/components/seo/AnimatedRouteMap";
 import { ScrollReveal, StaggerContainer, StaggerChild } from "@/components/ui/scroll-reveal";
import TravelFAQ from "@/components/shared/TravelFAQ";
import GlobalTrustBar from "@/components/shared/GlobalTrustBar";
import PartnerLogosStrip from "@/components/shared/PartnerLogosStrip";
import { FlightSearchFormPro } from "@/components/search";
import { FLIGHT_SEO_H1, FLIGHT_SEO_INTRO, FLIGHT_SEO_DISCLAIMERS } from "@/config/flightSEOContent";
import { cn } from "@/lib/utils";

// Booking tips (no prices - general guidance only)
const BOOKING_TIPS = [
  { 
    icon: TrendingDown, 
    title: "Book Early", 
    desc: "21-60 days ahead for best rates",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  },
  { 
    icon: Calendar, 
    title: "Flexible Dates", 
    desc: "Tue, Wed, Sat often cheaper",
    color: "text-sky-500 bg-sky-500/10 border-sky-500/20"
  },
  { 
    icon: Clock, 
    title: "Off-Peak Hours", 
    desc: "Early AM or late PM departures",
    color: "text-violet-500 bg-violet-500/10 border-violet-500/20"
  },
];

// Trust badges
const TRUST_BADGES = [
  { icon: ShieldCheck, text: "Secure booking" },
  { icon: CheckCircle, text: "No hidden fees" },
  { icon: Plane, text: "500+ airlines" },
];

export default function FlightRoutePage() {
  const params = useParams();
  const navigate = useNavigate();

  // Parse route from URL (e.g., "new-york-to-los-angeles")
  const routeParam = params["*"] || params["origin-to-destination"] || "";
  const parts = routeParam.split("-to-");
  
  const originSlug = parts[0] || "city";
  const destSlug = parts[1] || "city";

  // Convert slug to display name
  const formatCity = (slug: string) =>
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const originCity = formatCity(originSlug);
  const destCity = formatCity(destSlug);

  const h1Title = FLIGHT_SEO_H1.route(originCity, destCity);
  const introText = FLIGHT_SEO_INTRO.routeIntro(originCity, destCity);

  const pageTitle = `${h1Title} - Compare Prices | ZIVO`;
  const pageDescription = `Compare flights from ${originCity} to ${destCity}. Search real-time prices from 500+ airlines and book securely on ZIVO. No booking fees.`;

  // Build search URL
  const searchUrl = `/flights?from=${encodeURIComponent(originSlug)}&to=${encodeURIComponent(destSlug)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta */}
      <SEOHead 
        title={pageTitle} 
        description={pageDescription}
        canonical={`https://hizovo.com/flights/${originSlug}-to-${destSlug}`}
      />
      <FlightSearchSchema origin={originCity} destination={destCity} />
      
      <Header />

      <main className="pt-16">
        {/* Hero Section with enhanced animations */}
        <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-br from-sky-500/10 via-background to-blue-500/5">
          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link to="/flights" className="hover:text-foreground">Flights</Link>
              <span>/</span>
              <span className="text-foreground">{originCity} to {destCity}</span>
            </nav>
            
            <ScrollReveal animation="fade-up">
            <div className="max-w-3xl mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sm font-medium mb-6">
                <Plane className="w-4 h-4 text-sky-500" />
                <span className="text-muted-foreground">Compare flight prices</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {h1Title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                {introText}
              </p>

              {/* Route visualization */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50 max-w-md mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{originSlug.slice(0, 3).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{originCity}</p>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-sky-500 to-blue-500" />
                  <Plane className="h-5 w-5 text-sky-500" />
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-500 to-sky-500" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{destSlug.slice(0, 3).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{destCity}</p>
                </div>
              </div>

            </div>
            </ScrollReveal>

            {/* Direct NDC Badge */}
            <ScrollReveal animation="fade-up" delay={0.2}>
              <DirectNDCBadge variant="default" className="mb-6" />
            </ScrollReveal>

            <ScrollReveal animation="scale" delay={0.3}>
              <Link to={searchUrl}>
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-sky-500 to-blue-600 text-primary-foreground shadow-lg">
                  <Plane className="h-5 w-5 mr-2" />
                  Search {originCity} to {destCity}
                </Button>
              </Link>
            </ScrollReveal>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 mt-8">
                {TRUST_BADGES.map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <badge.icon className="w-4 h-4 text-sky-500" />
                    <span>{badge.text}</span>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Animated Route Map */}
        <section className="py-8 bg-muted/10">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-up" threshold={0.3}>
              <AnimatedRouteMap
                originCode={originSlug.slice(0, 3).toUpperCase()}
                destCode={destSlug.slice(0, 3).toUpperCase()}
                originCity={originCity}
                destCity={destCity}
              />
            </ScrollReveal>
          </div>
        </section>

        {/* Trust Bar */}
        <GlobalTrustBar variant="compact" />

        {/* Partner Logos */}
        <PartnerLogosStrip service="flights" />

        {/* Search Form Section */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl font-bold mb-6 text-center">
              Search Flights from {originCity} to {destCity}
            </h2>
            <FlightSearchFormPro 
              className="max-w-4xl mx-auto"
              initialFrom={originCity}
              initialTo={destCity}
            />
            <p className="text-xs text-muted-foreground text-center mt-4">
              Prices provided by trusted travel partners. {FLIGHT_SEO_DISCLAIMERS.priceNote}
            </p>
          </div>
        </section>

        {/* Booking Tips with staggered animation */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-up">
              <div className="text-center mb-8">
                <Badge className="mb-3 bg-sky-500/10 text-sky-500 border-sky-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Smart Booking Tips
                </Badge>
                <h2 className="font-display text-2xl font-bold mb-2">
                  When to Book for Best Prices
                </h2>
                <p className="text-muted-foreground">
                  General guidance based on industry trends — actual prices vary
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer staggerDelay={0.1} className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {BOOKING_TIPS.map((tip) => (
                <StaggerChild key={tip.title}>
                  <Card className={cn("border", tip.color.split(" ").slice(1).join(" "))}>
                    <CardContent className="p-4 text-center">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3", tip.color.split(" ").slice(0, 2).join(" "))}>
                        <tip.icon className={cn("w-5 h-5", tip.color.split(" ")[0])} />
                      </div>
                      <h3 className="font-semibold mb-1">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground">{tip.desc}</p>
                    </CardContent>
                  </Card>
                </StaggerChild>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Price Alert CTA */}
        <section className="py-12 bg-gradient-to-br from-sky-500/5 to-blue-500/5">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="scale" threshold={0.5}>
              <Card className="max-w-2xl mx-auto border-sky-500/20 bg-card/50">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center shrink-0">
                  <Bell className="w-8 h-8 text-sky-500" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="font-bold text-lg mb-1">Track Price Drops</h3>
                  <p className="text-sm text-muted-foreground">
                    Set a price alert and get notified when fares drop for {originCity} → {destCity}
                  </p>
                </div>
                <Link to={searchUrl}>
                  <Button className="bg-sky-500 hover:bg-sky-600">
                    Set Alert
                  </Button>
                </Link>
              </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </section>

        {/* Related Routes */}
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-up">
              <h2 className="font-display text-xl font-bold mb-6 text-center">
                More Flights from {originCity}
              </h2>
            </ScrollReveal>
            <ScrollReveal animation="slide-right" delay={0.1}>
              <div className="flex flex-wrap justify-center gap-3">
              {["London", "Paris", "Tokyo", "Miami", "Los Angeles", "Dubai"].map((city) => {
                if (city.toLowerCase() === destCity.toLowerCase()) return null;
                const slug = city.toLowerCase().replace(/\s+/g, "-");
                return (
                  <Link 
                    key={city}
                    to={`/flights/${originSlug}-to-${slug}`}
                    className="px-4 py-2 rounded-full bg-muted/50 hover:bg-muted border border-border/50 text-sm font-medium transition-colors"
                  >
                    {originCity} → {city}
                  </Link>
                );
              })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ with Schema */}
        <TravelFAQ serviceType="flights" className="bg-muted/20" />

        {/* Compliance Disclaimer */}
        <section className="py-6 bg-sky-500/5 border-y border-sky-500/20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 text-sky-500" />
              <span>{FLIGHT_SEO_DISCLAIMERS.otaClarification}</span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-bold mb-3">
              Ready to Book Your Flight?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Compare real-time prices from trusted travel partners and book securely on ZIVO.
            </p>
            <Link to={searchUrl}>
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-sky-500 to-blue-600 text-primary-foreground shadow-lg">
                <Plane className="h-5 w-5 mr-2" />
                Search Flights Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
