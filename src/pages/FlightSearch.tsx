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
import FlightAirlinePartners from "@/components/flight/FlightAirlinePartners";

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

        {/* Flexible Dates + Legal Disclaimer */}
        <section className="border-b border-border/50 py-4 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full">
                <Plane className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-xs font-semibold text-sky-600">Flexible Dates Available</span>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
              {FLIGHT_DISCLAIMERS.ticketing}
            </p>
          </div>
        </section>

        {/* Price Trends Section */}
        <section className="py-8 bg-muted/10 border-b border-border/50">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-bold text-center mb-6">Best Time to Book</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                { icon: "📅", title: "Book 3-4 Weeks Early", desc: "Domestic flights are cheapest 21-28 days out" },
                { icon: "📊", title: "Tuesdays Are Cheapest", desc: "Airlines release sales early in the week" },
                { icon: "🔔", title: "Set a Price Alert", desc: "Get notified when fares drop on your route" },
              ].map((tip) => (
                <div key={tip.title} className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border/50">
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{tip.title}</h3>
                    <p className="text-xs text-muted-foreground">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
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

        {/* Airline Partners Grid */}
        <FlightAirlinePartners />

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
