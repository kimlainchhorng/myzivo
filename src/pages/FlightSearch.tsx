import { useState, useEffect } from "react";
import { Plane, ShieldCheck, Clock, TrendingUp, Star, Globe, Users } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ImageHero from "@/components/shared/ImageHero";
import BigSearchCard from "@/components/shared/BigSearchCard";
import DestinationCardsGrid from "@/components/shared/DestinationCardsGrid";
import TrustSection from "@/components/shared/TrustSection";
import TravelExtrasCTA from "@/components/shared/TravelExtrasCTA";
import TravelFAQ from "@/components/shared/TravelFAQ";
import { TrustFeatureCards } from "@/components/marketing";
import { OGImageMeta } from "@/components/marketing";
import { SEOContentBlock, InternalLinkGrid, PopularRoutesGrid } from "@/components/seo";
import { FlightSearchFormPro } from "@/components/search";
import ServiceDisclaimer from "@/components/shared/ServiceDisclaimer";
import { FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { 
  HowBookingWorks, 
  FlightTrustBadgesBar, 
  AirlineLogosCarousel,
  FlightFeaturesGrid,
  FlightComplianceFooter
} from "@/components/flight";
import FlightAirlinePartners from "@/components/flight/FlightAirlinePartners";

// Scroll animation wrapper
const FadeInSection = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, ease: "easeOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Flight Stats Bar
const FlightStatsBar = () => {
  const stats = [
    { icon: Plane, value: "500+", label: "Airlines" },
    { icon: Globe, value: "190+", label: "Countries" },
    { icon: Users, value: "2M+", label: "Searches/mo" },
    { icon: Star, value: "4.8", label: "Rating" },
  ];

  return (
    <section className="py-8 border-b border-border/30 bg-gradient-to-r from-sky-500/5 via-transparent to-blue-500/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-500/15 transition-all duration-300 float-gentle" style={{ animationDelay: `${i * 200}ms` }}>
                <stat.icon className="w-6 h-6 text-sky-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Recently Searched Chips Component
const RecentlySearchedChips = () => {
  const [searches, setSearches] = useState<Array<{ from: string; to: string }>>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zivo_recent_flights");
      if (stored) setSearches(JSON.parse(stored).slice(0, 5));
    } catch {}
  }, []);

  if (!searches.length) return null;

  return (
    <section className="py-3 border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground shrink-0">Recent:</span>
          {searches.map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium shrink-0 hover:bg-muted/80 cursor-pointer transition-colors"
            >
              {s.from} → {s.to}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * ZIVO FLIGHTS - Top-Tier Travel Search
 */
const FlightSearch = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="ZIVO Flights – Search Flights Worldwide"
        description="Search real-time flight prices from global airlines. Book securely on ZIVO with instant e-tickets. No booking fees."
      />
      <OGImageMeta pageType="flights" />
      <Header />

      <main className="pb-20">
        {/* Hero with Professional Search Form */}
        <ImageHero service="flights" icon={Plane}>
          <BigSearchCard service="flights">
            <FlightSearchFormPro />
          </BigSearchCard>
        </ImageHero>

        {/* Recently Searched Routes */}
        <RecentlySearchedChips />

        {/* Flight Stats Bar */}
        <FlightStatsBar />

        {/* Legal Disclaimer */}
        <FadeInSection>
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto p-3 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {FLIGHT_DISCLAIMERS.ticketing}
                </p>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* How Booking Works */}
        <FadeInSection>
          <HowBookingWorks className="border-b border-border/50" />
        </FadeInSection>

        {/* Flight Features Grid */}
        <FadeInSection>
          <FlightFeaturesGrid className="border-b border-border/50 bg-muted/5" />
        </FadeInSection>

        {/* SEO Content Block */}
        <FadeInSection>
          <SEOContentBlock serviceType="flights" className="bg-muted/5" />
        </FadeInSection>

        {/* Popular Routes Grid */}
        <FadeInSection>
          <section className="container mx-auto px-4 py-10">
            <PopularRoutesGrid />
          </section>
        </FadeInSection>

        {/* Popular Destinations */}
        <FadeInSection>
          <DestinationCardsGrid service="flights" />
        </FadeInSection>

        {/* Airline Partners */}
        <FadeInSection>
          <FlightAirlinePartners />
        </FadeInSection>

        {/* Airline Logos */}
        <FadeInSection>
          <section className="border-y border-border/30 bg-gradient-to-b from-muted/10 to-muted/5">
            <AirlineLogosCarousel />
          </section>
        </FadeInSection>

        {/* Trust Features */}
        <FadeInSection>
          <TrustFeatureCards columns={4} />
        </FadeInSection>

        {/* Trust Badges */}
        <FadeInSection>
          <FlightTrustBadgesBar />
        </FadeInSection>

        {/* Why Book Section */}
        <FadeInSection>
          <TrustSection service="flights" />
        </FadeInSection>

        {/* Travel Extras */}
        <FadeInSection>
          <TravelExtrasCTA currentService="flights" />
        </FadeInSection>

        {/* Internal Linking */}
        <FadeInSection>
          <InternalLinkGrid currentService="flights" />
        </FadeInSection>

        {/* FAQ */}
        <FadeInSection>
          <TravelFAQ serviceType="flights" className="bg-muted/20" />
        </FadeInSection>

        {/* Service Disclaimer */}
        <ServiceDisclaimer type="travel" />

        {/* Flight Compliance Footer */}
        <FlightComplianceFooter />
      </main>

      <Footer />
    </div>
  );
};

export default FlightSearch;
