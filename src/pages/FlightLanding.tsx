import { useParams, useNavigate } from "react-router-dom";
import { Plane, Shield, Clock, Globe } from "lucide-react";
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

/**
 * Dynamic SEO landing page for flights
 */
const FlightLanding = () => {
  const { fromCity, toCity, route } = useParams<{ 
    fromCity?: string; 
    toCity?: string;
    route?: string;
  }>();
  const navigate = useNavigate();

  // Parse route parameter
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

  // Generate dynamic SEO content
  const { title, description, h1 } = formatRouteTitle(from, to);

  // Extract IATA codes for pre-filling
  const fromIata = from.match(/\(([A-Z]{3})\)/)?.[1] || from.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  const toIata = to.match(/\(([A-Z]{3})\)/)?.[1] || to.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);

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

        {/* Popular Destinations with Photos */}
        <PhotoDestinationGrid
          service="flights"
          title="Popular Destinations"
          subtitle="Discover cheap flights to top cities"
          limit={8}
        />

        {/* Why Compare Section */}
        <WhyCompareSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Cross-Sell Banner */}
        <CrossSellBanner />

        {/* Testimonials */}
        <UserTestimonials />

        {/* Internal Linking - Cross-sell Hotels & Cars */}
        <InternalLinkGrid currentService="flights" />

        {/* Trusted Partners */}
        <TrustedPartnersSection />

        {/* FAQ with Schema */}
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
                ZIVO helps travelers find the best flight deals by searching across 500+ airlines and travel sites in real-time. 
                Whether you're looking for a last-minute getaway or planning ahead, our comparison engine finds you the lowest prices. 
                We don't sell tickets directly – instead, we redirect you to trusted partners where you can complete your booking securely.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                * Prices are indicative and may change. Final price is shown on partner site. 
                ZIVO may earn a commission when users book through partner links.
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
