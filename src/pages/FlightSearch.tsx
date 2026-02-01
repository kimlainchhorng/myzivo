import { Plane } from "lucide-react";
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

/**
 * ZIVO FLIGHTS - Top-Tier Travel Search
 * Skyscanner / Kayak / Google Flights quality
 */

const FlightSearch = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="ZIVO Flights – Search & Compare Flights Worldwide"
        description="Search and compare flights from 500+ airlines worldwide. Find great options and book with trusted travel partners. No booking fees."
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

        {/* SEO Content Block - H1 and intro for search engines */}
        <SEOContentBlock serviceType="flights" className="bg-muted/5" />

        {/* Popular Destinations with Real Images */}
        <DestinationCardsGrid service="flights" />

        {/* Popular Routes Grid for SEO */}
        <PopularRoutesGrid />

        {/* Trust Features */}
        <TrustFeatureCards columns={4} />

        {/* Why Book Section */}
        <TrustSection service="flights" />

        {/* Travel Extras */}
        <TravelExtrasCTA currentService="flights" />

        {/* Internal Linking - Cross-sell to Hotels & Cars */}
        <InternalLinkGrid currentService="flights" />

        {/* FAQ Section with Schema */}
        <TravelFAQ serviceType="flights" className="bg-muted/20" />
      </main>

      <Footer />
    </div>
  );
};

export default FlightSearch;
