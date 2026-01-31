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
import { Plane, Shield, Clock, Globe, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dynamic SEO landing page for flights
 * Supports routes:
 * - /flights (main page)
 * - /flights/from-{city} (departure city)
 * - /flights/to-{city} (destination city)
 * - /flights/{from}-{to} (specific route)
 */
const FlightLanding = () => {
  const { fromCity, toCity, route } = useParams<{ 
    fromCity?: string; 
    toCity?: string;
    route?: string;
  }>();
  const navigate = useNavigate();

  // Parse route parameter (e.g., "los-angeles-new-york" or "lax-jfk")
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
    { icon: Shield, text: "Secure Booking", color: "text-emerald-500" },
    { icon: Globe, text: "500+ Airlines", color: "text-sky-500" },
    { icon: Clock, text: "24/7 Support", color: "text-amber-500" },
    { icon: TrendingUp, text: "Real-Time Prices", color: "text-purple-500" },
  ];

  const handleSearch = (searchParams: URLSearchParams) => {
    navigate(`/flights/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={title}
        description={description}
        canonical={`https://myzivo.lovable.app/flights${route ? `/${route}` : fromCity ? `/from-${fromCity}` : toCity ? `/to-${toCity}` : ''}`}
      />
      <OrganizationSchema />
      <Header />

      <main className="pt-16">
        {/* Hero Section with Search */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-sky-950 to-blue-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/20 via-blue-500/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10 py-12">
            {/* Page Title */}
            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge className="mb-4 px-4 py-2 bg-sky-500/20 text-sky-400 border-sky-500/40 gap-2 backdrop-blur-xl">
                <Plane className="w-4 h-4" />
                ZIVO Flights — Search & Compare
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">
                {h1}
              </h1>
              <p className="text-lg text-white/70 max-w-xl mx-auto">
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
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {trustBadges.map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
                  >
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    <span className="text-sm text-white/80">{item.text}</span>
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
