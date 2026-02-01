import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FlightSearchForm from "@/components/seo/FlightSearchForm";
import WhyCompareSection from "@/components/seo/WhyCompareSection";
import HowItWorksSection from "@/components/seo/HowItWorksSection";
import TrustedPartnersSection from "@/components/seo/TrustedPartnersSection";
import FlightFAQWithSchema from "@/components/seo/FlightFAQWithSchema";
import PopularRoutesGrid from "@/components/seo/PopularRoutesGrid";
import PopularDestinationsGrid from "@/components/seo/PopularDestinationsGrid";
import CrossSellBanner from "@/components/seo/CrossSellBanner";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import { InternalLinkGrid } from "@/components/seo";
import { getCityFromCode, formatRouteTitle } from "@/utils/seoUtils";
import { Badge } from "@/components/ui/badge";
import { Plane, Shield, Clock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const trustBadges = [
    { icon: Shield, text: "Secure Booking" },
    { icon: Globe, text: "500+ Airlines" },
    { icon: Clock, text: "24/7 Support" },
  ];

  const handleSearch = (searchParams: URLSearchParams) => {
    navigate(`/flights/results?${searchParams.toString()}`);
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
        {/* Hero Section with Search */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-flights-light" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Page Title */}
            <div className="text-center mb-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-flights/10 border border-flights/20 text-sm font-medium mb-6">
                <Plane className="w-4 h-4 text-flights" />
                <span className="text-muted-foreground">Search & Compare Flights</span>
              </div>
              
              <h1 className="text-display mb-4">
                {h1}
              </h1>
              
              <p className="text-body-lg text-muted-foreground mb-8">
                {from && to 
                  ? `Compare prices from 500+ airlines for your trip from ${from} to ${to}.`
                  : from 
                    ? `Find the best flight deals departing from ${from}.`
                    : to 
                      ? `Discover cheap flights to ${to} from any city.`
                      : "Search and compare flight options to find the best deals for your next trip."
                }
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-4">
                {trustBadges.map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <item.icon className="w-4 h-4 text-flights" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Form */}
            <FlightSearchForm 
              defaultFrom={from} 
              defaultTo={to} 
              onSearch={handleSearch} 
            />
          </div>
        </section>

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

        {/* Popular Destinations */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <PopularDestinationsGrid />
          </div>
        </section>

        {/* Why Compare Section */}
        <WhyCompareSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Cross-Sell Banner */}
        <CrossSellBanner />

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
