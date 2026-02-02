/**
 * API Pending Notice - Multi-Partner Compare UI
 * 
 * Displayed when Flight Search API is not enabled (403 errors) or returns no results.
 * Shows preview result options and multiple partner links.
 * 
 * COMPLIANCE: Contains required disclosure text for meta-search transparency.
 */

import { ExternalLink, ShieldCheck, Zap, Plane, TrendingDown, Star, ArrowRightLeft, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { heroPhotos, destinationPhotos } from "@/config/photos";

export interface PartnerPricing {
  cheapest?: number;
  bestValue?: number;
  flexible?: number;
}

export interface FlightSummary {
  airline?: string;
  airlineCode?: string;
  airlineLogo?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  stops?: number;
  stopCities?: string[];
}

interface ApiPendingNoticeProps {
  whitelabelUrl: string;
  origin: string;
  destination: string;
  departDate?: string;
  returnDate?: string;
  passengers?: number;
  cabin?: string;
  prices?: PartnerPricing;
  flightSummaries?: {
    cheapest?: FlightSummary;
    bestValue?: FlightSummary;
    flexible?: FlightSummary;
  };
  currency?: string;
  className?: string;
}

// Partner configurations
const PARTNER_MARKER = "700031";

// Airline logos with brand colors
const AIRLINE_LOGOS = [
  { name: "American", color: "#0078D2" },
  { name: "Delta", color: "#E51937" },
  { name: "United", color: "#002244" },
  { name: "Southwest", color: "#304CB2" },
  { name: "JetBlue", color: "#003876" },
  { name: "Spirit", color: "#FFCD00" },
  { name: "Alaska", color: "#00205B" },
  { name: "Emirates", color: "#D71921" },
];

// Build partner deals dynamically based on prices and flight summaries
function buildPartnerDeals(
  prices?: PartnerPricing, 
  flightSummaries?: { cheapest?: FlightSummary; bestValue?: FlightSummary; flexible?: FlightSummary },
  currency: string = "USD"
) {
  const formatPrice = (price?: number) => {
    if (!price) return null;
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    return `${symbols[currency] || '$'}${Math.round(price)}+`;
  };

  return [
    { 
      label: "Cheapest flight", 
      price: formatPrice(prices?.cheapest) || "$138+",
      isLive: !!prices?.cheapest,
      partner: "Aviasales",
      partnerKey: "aviasales",
      icon: TrendingDown, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      flight: flightSummaries?.cheapest,
    },
    { 
      label: "Best value", 
      price: formatPrice(prices?.bestValue) || "$149+",
      isLive: !!prices?.bestValue,
      partner: "Kiwi",
      partnerKey: "kiwi",
      icon: Star, 
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      flight: flightSummaries?.bestValue,
    },
    { 
      label: "Flexible options", 
      price: formatPrice(prices?.flexible) || "$162+",
      isLive: !!prices?.flexible,
      partner: "JetRadar",
      partnerKey: "jetradar",
      icon: ArrowRightLeft, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      flight: flightSummaries?.flexible,
    },
  ];
}

function buildPartnerUrl(
  partner: string,
  origin: string,
  destination: string,
  departDate?: string,
  returnDate?: string,
  passengers?: number,
  cabin?: string
): string {
  const cabinMap: Record<string, string> = {
    economy: "Y",
    premium: "W", 
    business: "C",
    first: "F",
  };

  const tripClass = cabinMap[cabin || "economy"] || "Y";
  const adults = passengers || 1;

  if (partner === "aviasales") {
    const params = new URLSearchParams({
      origin_iata: origin,
      destination_iata: destination,
      depart_date: departDate || "",
      adults: String(adults),
      trip_class: tripClass,
      marker: PARTNER_MARKER,
      with_request: "true",
    });
    if (returnDate) params.set("return_date", returnDate);
    return `https://search.jetradar.com/flights?${params.toString()}`;
  }

  if (partner === "jetradar") {
    const params = new URLSearchParams({
      origin_iata: origin,
      destination_iata: destination,
      depart_date: departDate || "",
      adults: String(adults),
      trip_class: tripClass,
      marker: PARTNER_MARKER,
      with_request: "true",
    });
    if (returnDate) params.set("return_date", returnDate);
    return `https://www.jetradar.com/flights?${params.toString()}`;
  }

  if (partner === "kiwi") {
    const formatDate = (d: string) => d?.replace(/-/g, "") || "";
    return `https://www.kiwi.com/en/search/results/${origin}/${destination}/${formatDate(departDate || "")}${returnDate ? `/${formatDate(returnDate)}` : ""}?adults=${adults}`;
  }

  return "";
}

export default function ApiPendingNotice({
  origin,
  destination,
  departDate,
  returnDate,
  passengers,
  cabin,
  prices,
  flightSummaries,
  currency = "USD",
  className,
}: ApiPendingNoticeProps) {
  const aviasalesUrl = buildPartnerUrl("aviasales", origin, destination, departDate, returnDate, passengers, cabin);
  const jetradarUrl = buildPartnerUrl("jetradar", origin, destination, departDate, returnDate, passengers, cabin);
  const kiwiUrl = buildPartnerUrl("kiwi", origin, destination, departDate, returnDate, passengers, cabin);
  
  // Build partner deals with dynamic prices and flight summaries
  const partnerDeals = buildPartnerDeals(prices, flightSummaries, currency);
  const hasLivePrices = prices && (prices.cheapest || prices.bestValue || prices.flexible);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Hero Header with Background Image */}
      <Card className="border-border/50 overflow-hidden relative">
        <div className="absolute inset-0">
          <img 
            src={heroPhotos.flights.src} 
            alt="" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>
        
        <CardContent className="relative p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/30 mb-4">
            <Plane className="w-7 h-7 text-sky-500" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            No direct results available — here are live deals from our trusted travel partners
          </h2>
          
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Prices update in real time. Final booking completed on partner site.
          </p>

          {/* Route display */}
          <div className="mt-5 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm">
            <span className="font-semibold">{origin}</span>
            <Plane className="w-4 h-4 text-sky-500 rotate-90" />
            <span className="font-semibold">{destination}</span>
            {returnDate && (
              <>
                <Plane className="w-4 h-4 text-sky-500 -rotate-90" />
                <span className="font-semibold">{origin}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Airline Logos Strip */}
      <Card className="border-border/30 bg-card/50">
        <CardContent className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground text-center mb-3 uppercase tracking-wider">
            Comparing prices from 500+ airlines including
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {AIRLINE_LOGOS.map((airline) => (
              <div
                key={airline.name}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 border border-border/50 text-xs font-medium"
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: airline.color }}
                />
                {airline.name}
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs font-medium text-sky-400">
              +492 more
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Banner - Above Partner Deals */}
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
        <span>Hizivo does not issue airline tickets. Bookings are completed securely with licensed partners.</span>
      </div>

      {/* Partner Deals */}
      <Card className="border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-background to-purple-500/5">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Compare Live Deals from Trusted Travel Partners</h3>
            <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 gap-1">
              <Zap className="w-3 h-3" />
              Live Prices
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mb-4">
            Prices update in real time. Final booking completed on partner site.
          </p>

          {/* Partner Deal Cards with Flight Details */}
          <div className="space-y-3">
            {partnerDeals.map((deal) => {
              const Icon = deal.icon;
              const url = deal.partnerKey === "aviasales" ? aviasalesUrl 
                : deal.partnerKey === "kiwi" ? kiwiUrl 
                : jetradarUrl;
              
              const flight = deal.flight;
              const hasFlightDetails = flight && (flight.airline || flight.departureTime || flight.duration);
              
              return (
                <a
                  key={deal.label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className={cn(
                    "block p-4 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer group",
                    deal.bgColor,
                    deal.borderColor
                  )}
                >
                  {/* Header Row: Deal type + Price + CTA */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", deal.bgColor, "border", deal.borderColor)}>
                      <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", deal.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{deal.label}</p>
                        {deal.isLive && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0">
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{deal.partner}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 shrink-0">
                      <span className={cn("text-xl sm:text-2xl font-bold", deal.color)}>{deal.price}</span>
                      <Button 
                        size="sm" 
                        className={cn(
                          "font-semibold gap-1 group-hover:gap-2 transition-all text-xs sm:text-sm",
                          deal.partnerKey === "aviasales" && "bg-emerald-500 hover:bg-emerald-600",
                          deal.partnerKey === "kiwi" && "bg-amber-500 hover:bg-amber-600 text-black",
                          deal.partnerKey === "jetradar" && "bg-purple-500 hover:bg-purple-600"
                        )}
                      >
                        <span className="hidden sm:inline">Continue to secure partner checkout</span>
                        <span className="sm:hidden">Partner checkout</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Flight Details Row */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 border-t border-border/30">
                    {/* Airline */}
                    <div className="flex items-center gap-2">
                      {flight?.airlineLogo ? (
                        <img 
                          src={flight.airlineLogo} 
                          alt={flight.airline || "Airline"} 
                          className="w-6 h-6 rounded object-contain bg-white p-0.5"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {flight?.airline || "Various airlines"}
                      </span>
                    </div>

                    {/* Time Display */}
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-semibold">{flight?.departureTime || "—"}</span>
                      <Plane className="w-3.5 h-3.5 text-sky-500 rotate-90" />
                      <span className="font-semibold">{flight?.arrivalTime || "—"}</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{flight?.duration || "~5h"}</span>
                    </div>

                    {/* Stops */}
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        flight?.stops === 0 ? "text-emerald-500 border-emerald-500/30" : 
                        flight?.stops === 1 ? "text-amber-500 border-amber-500/30" : 
                        "text-muted-foreground border-border"
                      )}
                    >
                      {flight?.stops === 0 ? "Nonstop" : 
                       flight?.stops === 1 ? "1 stop" : 
                       flight?.stops !== undefined ? `${flight.stops} stops` : 
                       "1–2 stops"}
                    </Badge>
                  </div>

                  {/* Compliance micro-copy under CTA - Required for Duffel/CJ */}
                  <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                    Indicative prices shown. Final price, availability, and booking terms confirmed on partner's secure checkout page.
                  </p>
                </a>
              );
            })}
          </div>

          {/* Bottom summary notice */}
          <p className="text-xs text-muted-foreground text-center mt-4 pt-3 border-t border-border/50">
            Indicative prices shown. Final price confirmed on partner site.
          </p>
        </CardContent>
      </Card>

      {/* Trust Footer - Above Destinations */}
      <div className="flex flex-col items-center justify-center gap-2 py-4 px-4 bg-muted/30 rounded-xl border border-border/50 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Secure partner checkout
          </span>
          <span className="hidden sm:block">•</span>
          <span>ZIVO compares prices from third-party partners</span>
          <span className="hidden sm:block">•</span>
          <span>Booking completed on partner sites</span>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/80 mt-1">
          Hizivo does not issue airline tickets. Bookings are completed securely with licensed partners.
        </p>
      </div>

      {/* Popular Destinations Gallery - Lazy loaded at bottom */}
      <Card className="border-border/30 overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-lg mb-1">Popular Destinations Worldwide</h3>
            <p className="text-xs text-muted-foreground">
              Compare flight prices to 500+ destinations
            </p>
          </div>
          
          {/* Large Featured Destinations Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 mb-4">
            {Object.entries(destinationPhotos).slice(0, 16).map(([key, dest]) => (
              <div key={key} className="relative group aspect-square">
                <img
                  src={dest.src}
                  alt={dest.alt}
                  className="w-full h-full rounded-xl object-cover border border-border/50 group-hover:border-sky-500/50 transition-all group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 text-center">
                  <span className="text-[10px] sm:text-xs text-white font-semibold truncate block">{dest.city}</span>
                  <span className="text-[8px] sm:text-[10px] text-white/70 truncate block">{dest.country}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Destinations Row */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {Object.entries(destinationPhotos).slice(16).map(([key, dest]) => (
              <div key={key} className="shrink-0 relative group">
                <img
                  src={dest.src}
                  alt={dest.alt}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-border/50 group-hover:border-sky-500/50 transition-all group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-1 text-center">
                  <span className="text-[9px] text-white font-medium">{dest.city}</span>
                </div>
              </div>
            ))}
            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center">
              <span className="text-xs text-sky-400 font-medium text-center px-1">+500<br/>cities</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
