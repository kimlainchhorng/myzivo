import { Plane, ShieldCheck } from "lucide-react";
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

/**
 * ZIVO FLIGHTS - Top-Tier Travel Search
 * Skyscanner / Kayak / Google Flights quality
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

        {/* Legal Disclaimer - HIGH VISIBILITY near search */}
        <section className="border-b border-border/50 py-4 bg-amber-500/5">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-muted-foreground font-medium">
              <ShieldCheck className="w-4 h-4 inline mr-1.5 text-amber-500" />
              {FLIGHT_DISCLAIMERS.ticketing}
            </p>
          </div>
        </section>

        {/* How Booking Works - RIGHT AFTER SEARCH */}
        <HowBookingWorks className="border-b border-border/50" />

        {/* Flight Features Grid - Cabin Classes, Flight Types, Extras, Deals */}
        <FlightFeaturesGrid className="border-b border-border/50 bg-muted/5" />

        {/* SEO Content Block - H1 and intro for search engines */}
        <SEOContentBlock serviceType="flights" className="bg-muted/5" />

        {/* Popular Routes Grid with clickable cards */}
        <section className="container mx-auto px-4 py-10">
          <PopularRoutesGrid />
        </section>

        {/* Popular Destinations with Real Images */}
        <DestinationCardsGrid service="flights" />

        {/* Airline Logos Section - Trust building */}
        <section className="border-y border-border/30 bg-gradient-to-b from-muted/10 to-muted/5">
          <AirlineLogosCarousel />
        </section>

        {/* Trust Features */}
        <TrustFeatureCards columns={4} />

        {/* Trust Badges */}
        <FlightTrustBadgesBar />

        {/* Why Book Section */}
        <TrustSection service="flights" />

        {/* Travel Extras */}
        <TravelExtrasCTA currentService="flights" />

        {/* Internal Linking - Cross-sell to Hotels & Cars */}
        <InternalLinkGrid currentService="flights" />

        {/* FAQ Section with Schema */}
        <TravelFAQ serviceType="flights" className="bg-muted/20" />

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
