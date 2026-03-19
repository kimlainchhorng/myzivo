/**
 * Flight Results Page — /flights/results
 * Fetches and displays Duffel flight offers
 */

import { useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Plane, ArrowLeft, Clock, ArrowRight, Filter, SortAsc } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FlightResultsSkeleton from "@/components/flight/FlightResultsSkeleton";
import { useDuffelFlightSearch, getDuffelAirlineLogo, type DuffelOffer } from "@/hooks/useDuffelFlights";
import { getAirportByCode } from "@/data/airports";

type SortBy = "price" | "duration" | "departure";

const FlightResults = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortBy>("price");

  const origin = params.get("origin") || "";
  const destination = params.get("destination") || "";
  const departureDate = params.get("departureDate") || "";
  const returnDate = params.get("returnDate") || undefined;
  const adults = Number(params.get("adults") || 1);
  const children = Number(params.get("children") || 0);
  const infants = Number(params.get("infants") || 0);
  const cabinClass = (params.get("cabinClass") || "economy") as 'economy' | 'premium_economy' | 'business' | 'first';

  const originAirport = getAirportByCode(origin);
  const destAirport = getAirportByCode(destination);

  const { data, isLoading, error } = useDuffelFlightSearch({
    origin,
    destination,
    departureDate,
    returnDate,
    passengers: { adults, children, infants },
    cabinClass,
    enabled: !!origin && !!destination && !!departureDate,
  });

  const offers = data?.offers || [];

  const sorted = useMemo(() => {
    const copy = [...offers];
    switch (sortBy) {
      case "price":
        return copy.sort((a, b) => a.price - b.price);
      case "duration":
        return copy.sort((a, b) => a.durationMinutes - b.durationMinutes);
      case "departure":
        return copy.sort((a, b) => a.departure.time.localeCompare(b.departure.time));
      default:
        return copy;
    }
  }, [offers, sortBy]);

  const handleSelect = (offer: DuffelOffer) => {
    sessionStorage.setItem("zivo_selected_offer", JSON.stringify(offer));
    sessionStorage.setItem("zivo_search_params", JSON.stringify({
      origin, destination, departureDate, returnDate, adults, children, infants, cabinClass,
    }));
    navigate("/flights/traveler-info");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Flights ${origin} → ${destination} – ZIVO`}
        description={`Compare flight deals from ${origin} to ${destination}.`}
      />
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link to="/flights"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">
                {originAirport?.city || origin} → {destAirport?.city || destination}
              </h1>
              <p className="text-sm text-muted-foreground">
                {departureDate}{returnDate ? ` — ${returnDate}` : ""} · {adults + children + infants} traveler{(adults + children + infants) > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Sort bar */}
          {offers.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {offers.length} flight{offers.length > 1 ? "s" : ""} found
              </p>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger className="w-[160px] h-9">
                  <SortAsc className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Cheapest</SelectItem>
                  <SelectItem value="duration">Fastest</SelectItem>
                  <SelectItem value="departure">Earliest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Loading */}
          {isLoading && <FlightResultsSkeleton count={5} />}

          {/* Error */}
          {error && !isLoading && (
            <Card className="border-destructive/30">
              <CardContent className="p-8 text-center">
                <p className="text-destructive font-medium mb-2">Unable to search flights</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : "Something went wrong. Please try again."}
                </p>
                <Button variant="outline" asChild>
                  <Link to="/flights">New Search</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty */}
          {!isLoading && !error && offers.length === 0 && data && (
            <Card>
              <CardContent className="p-8 text-center">
                <Plane className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium mb-1">No flights found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Try different dates or airports.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/flights">Modify Search</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <div className="space-y-3">
            {sorted.map((offer, idx) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.3) }}
              >
                <Card className="hover:border-[hsl(var(--flights))]/40 transition-colors group cursor-pointer" onClick={() => handleSelect(offer)}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Airline */}
                      <div className="flex items-center gap-3 sm:w-36 shrink-0">
                        <img
                          src={getDuffelAirlineLogo(offer.airlineCode)}
                          alt={offer.airline}
                          className="w-9 h-9 rounded-lg object-contain bg-muted p-1"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{offer.airline}</p>
                          <p className="text-xs text-muted-foreground">{offer.flightNumber}</p>
                        </div>
                      </div>

                      {/* Route timeline */}
                      <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-center">
                        <div className="text-center">
                          <p className="text-lg font-bold">{offer.departure.time}</p>
                          <p className="text-xs text-muted-foreground font-medium">{offer.departure.code}</p>
                        </div>

                        <div className="flex flex-col items-center flex-1 max-w-[140px]">
                          <span className="text-[11px] text-muted-foreground">{offer.duration}</span>
                          <div className="w-full h-px bg-border relative my-1">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--flights))]" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--flights))]" />
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {offer.stops === 0 ? "Direct" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
                          </span>
                        </div>

                        <div className="text-center">
                          <p className="text-lg font-bold">{offer.arrival.time}</p>
                          <p className="text-xs text-muted-foreground font-medium">{offer.arrival.code}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right sm:w-32 shrink-0">
                        <p className="text-xl font-bold text-[hsl(var(--flights))]">
                          ${Math.round(offer.price)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">per person</p>
                        <Button
                          size="sm"
                          className="mt-2 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 text-xs h-8"
                          onClick={(e) => { e.stopPropagation(); handleSelect(offer); }}
                        >
                          Select
                        </Button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{offer.cabinClass}</Badge>
                      {offer.baggageIncluded && (
                        <Badge variant="outline" className="text-[10px]">{offer.baggageIncluded}</Badge>
                      )}
                      {offer.isRefundable && (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">Refundable</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightResults;
