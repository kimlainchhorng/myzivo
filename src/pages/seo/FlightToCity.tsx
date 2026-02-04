import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plane, MapPin, Calendar, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FlightSearchSchema from "@/components/seo/FlightSearchSchema";
import { FLIGHT_SEO_H1, FLIGHT_SEO_INTRO, FLIGHT_SEO_DISCLAIMERS } from "@/config/flightSEOContent";

// Mock data for popular routes from this city
const POPULAR_ROUTES = [
  { destination: "Los Angeles", code: "LAX", price: 199, duration: "5h 30m" },
  { destination: "Chicago", code: "ORD", price: 149, duration: "2h 15m" },
  { destination: "Miami", code: "MIA", price: 179, duration: "3h 00m" },
  { destination: "San Francisco", code: "SFO", price: 249, duration: "6h 00m" },
  { destination: "Seattle", code: "SEA", price: 229, duration: "5h 45m" },
  { destination: "Boston", code: "BOS", price: 129, duration: "1h 15m" },
];

const TRAVEL_TIPS = [
  "Book 2-3 weeks in advance for best prices",
  "Tuesday and Wednesday flights are often cheapest",
  "Consider nearby airports for more options",
  "Sign up for price alerts to track deals",
];

export default function FlightToCity() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();

  // Convert slug to city name (e.g., "new-york" -> "New York")
  const cityName = citySlug
    ?.split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "City";

  const h1Title = FLIGHT_SEO_H1.cityTo(cityName);
  const introText = FLIGHT_SEO_INTRO.cityIntro(cityName);

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* SEO Schema */}
      <FlightSearchSchema destination={cityName} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-lg">{h1Title}</h1>
            <p className="text-xs text-muted-foreground">Compare prices from top airlines</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 p-6 sm:p-10">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                <MapPin className="h-3 w-3 mr-1" />
                Popular Destination
              </Badge>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              {h1Title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-6">
              {introText}
            </p>
            <Link to={`/flights?to=${citySlug}`}>
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg">
                <Plane className="h-4 w-4 mr-2" />
                Search Flights to {cityName}
              </Button>
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-20">
            <Plane className="w-full h-full text-sky-500" />
          </div>
        </section>

        {/* Popular Routes */}
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Popular Routes to {cityName}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ROUTES.map((route) => (
              <Link
                key={route.code}
                to={`/flights?from=${route.code}&to=${citySlug}`}
              >
                <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center">
                          <Plane className="h-5 w-5 text-sky-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{route.destination}</p>
                          <p className="text-xs text-muted-foreground">{route.code} → {cityName}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{route.duration}</span>
                      <span className="font-bold text-primary">from ${route.price}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Travel Tips */}
        <section className="bg-gradient-to-br from-card/90 to-card rounded-2xl p-6 shadow-xl">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Tips for Flying to {cityName}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {TRAVEL_TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Disclaimer */}
        <div className="bg-muted/20 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            {FLIGHT_SEO_DISCLAIMERS.priceNote} {FLIGHT_SEO_DISCLAIMERS.otaClarification}
          </p>
        </div>

        {/* CTA */}
        <section className="text-center py-8">
          <h3 className="font-display text-2xl font-bold mb-3">
            Ready to Book Your Flight?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Compare prices from hundreds of airlines and book with confidence on ZIVO.
          </p>
          <Link to="/flights">
            <Button size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg">
              <Plane className="h-5 w-5 mr-2" />
              Search All Flights
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
