import { useParams, useNavigate } from "react-router-dom";
import { Plane, Shield, Clock, Globe, ShieldCheck } from "lucide-react";
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

  // Map common SEO city slugs to valid IATA/city codes for partner search.
  // (Aviasales/Jetradar supports city codes like NYC.)
  const slugToIata: Record<string, string> = {
    "new york": "NYC",
    "new york city": "NYC",
    "los angeles": "LAX",
    "san francisco": "SFO",
    "chicago": "CHI",
    "miami": "MIA",
    "atlanta": "ATL",
    "dallas": "DFW",
    "houston": "IAH",
    "las vegas": "LAS",
    "london": "LON",
    "paris": "PAR",
    "tokyo": "TYO",
  };

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

  // Extract IATA/city codes for pre-filling (avoid generating invalid codes like "NEW").
  const normalizeCityKey = (s: string) => s.trim().toLowerCase();
  const fromIata =
    from.match(/\(([A-Z]{3})\)/)?.[1] || slugToIata[normalizeCityKey(from)] || "";
  const toIata =
    to.match(/\(([A-Z]{3})\)/)?.[1] || slugToIata[normalizeCityKey(to)] || "";

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

        {/* How Booking Works - Trust Section */}
        <HowBookingWorks />

        {/* Trust Badges */}
        <FlightTrustBadgesBar />

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
