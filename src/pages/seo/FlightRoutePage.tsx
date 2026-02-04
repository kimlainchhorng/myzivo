import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plane, MapPin, Clock, DollarSign, ChevronRight, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FlightSearchSchema from "@/components/seo/FlightSearchSchema";
import { FLIGHT_SEO_H1, FLIGHT_SEO_INTRO, FLIGHT_SEO_DISCLAIMERS } from "@/config/flightSEOContent";

// Mock flight data for the route
const MOCK_FLIGHTS = [
  { airline: "Delta", price: 349, duration: "5h 30m", stops: 0, departure: "6:00 AM", arrival: "11:30 AM" },
  { airline: "United", price: 379, duration: "5h 45m", stops: 0, departure: "8:15 AM", arrival: "2:00 PM" },
  { airline: "American", price: 299, duration: "7h 15m", stops: 1, departure: "10:00 AM", arrival: "5:15 PM" },
  { airline: "JetBlue", price: 329, duration: "5h 35m", stops: 0, departure: "2:30 PM", arrival: "8:05 PM" },
];

const PRICE_CALENDAR = [
  { month: "Feb", avgPrice: 320 },
  { month: "Mar", avgPrice: 380 },
  { month: "Apr", avgPrice: 340 },
  { month: "May", avgPrice: 290 },
  { month: "Jun", avgPrice: 420 },
  { month: "Jul", avgPrice: 480 },
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
  const lowestPrice = Math.min(...MOCK_FLIGHTS.map((f) => f.price));

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* SEO Schema */}
      <FlightSearchSchema origin={originCity} destination={destCity} />

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
            <p className="text-xs text-muted-foreground">From ${lowestPrice} • Compare airlines</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 p-6 sm:p-10">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <DollarSign className="h-3 w-3 mr-1" />
                From ${lowestPrice}
              </Badge>
              <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                <Clock className="h-3 w-3 mr-1" />
                ~5h 30m
              </Badge>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              {h1Title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-6">
              {introText}
            </p>

            {/* Route visualization */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-card/50 backdrop-blur max-w-md">
              <div className="text-center">
                <p className="text-2xl font-bold">{originSlug.slice(0, 3).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">{originCity}</p>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-primary to-teal-400" />
                <Plane className="h-5 w-5 text-primary" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-teal-400 to-primary" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{destSlug.slice(0, 3).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">{destCity}</p>
              </div>
            </div>

            <Link to={`/flights?from=${originSlug}&to=${destSlug}`}>
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg">
                <Plane className="h-4 w-4 mr-2" />
                Search This Route
              </Button>
            </Link>
          </div>
        </section>

        {/* Available Flights */}
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Sample Flights on This Route
          </h2>
          <div className="space-y-3">
            {MOCK_FLIGHTS.map((flight, i) => (
              <Card key={i} className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center">
                        <Plane className="h-6 w-6 text-sky-500" />
                      </div>
                      <div>
                        <p className="font-semibold">{flight.airline}</p>
                        <p className="text-xs text-muted-foreground">
                          {flight.departure} - {flight.arrival}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{flight.duration}</p>
                        <p className="text-xs text-muted-foreground">
                          {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">${flight.price}</p>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {FLIGHT_SEO_DISCLAIMERS.priceNote}
          </p>
        </section>

        {/* Price Calendar */}
        <section className="bg-gradient-to-br from-card/90 to-card rounded-2xl p-6 shadow-xl">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Price Trends by Month
          </h2>
          <div className="grid grid-cols-6 gap-2">
            {PRICE_CALENDAR.map((month) => (
              <div
                key={month.month}
                className={`p-3 rounded-xl text-center ${
                  month.avgPrice === Math.min(...PRICE_CALENDAR.map((m) => m.avgPrice))
                    ? "bg-emerald-500/20 border border-emerald-500/30"
                    : "bg-muted/30"
                }`}
              >
                <p className="text-xs text-muted-foreground">{month.month}</p>
                <p className="font-bold">${month.avgPrice}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            <Badge className="bg-emerald-500/20 text-emerald-400 mr-2">Best Value</Badge>
            May typically offers the lowest prices for this route
          </p>
        </section>

        {/* Disclaimer */}
        <div className="bg-muted/20 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            {FLIGHT_SEO_DISCLAIMERS.otaClarification}
          </p>
        </div>

        {/* CTA */}
        <section className="text-center py-8">
          <h3 className="font-display text-2xl font-bold mb-3">
            Find the Best Fare for Your Trip
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Compare real-time prices from multiple airlines and book securely on ZIVO.
          </p>
          <Link to={`/flights?from=${originSlug}&to=${destSlug}`}>
            <Button size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg">
              <Plane className="h-5 w-5 mr-2" />
              Search {originCity} to {destCity}
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
