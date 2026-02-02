/**
 * API Pending Notice - Multi-Partner Compare UI
 * 
 * Displayed when Flight Search API is not enabled (403 errors) or returns no results.
 * Shows preview result options and multiple partner links.
 * 
 * COMPLIANCE: Contains required disclosure text for meta-search transparency.
 */

import { ExternalLink, ShieldCheck, Zap, Plane, TrendingDown, Clock, Star, ArrowRightLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { heroPhotos, destinationPhotos } from "@/config/photos";

interface ApiPendingNoticeProps {
  whitelabelUrl: string;
  origin: string;
  destination: string;
  departDate?: string;
  returnDate?: string;
  passengers?: number;
  cabin?: string;
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

// Preview result options (UI placeholders)
const PREVIEW_OPTIONS = [
  { 
    label: "Cheapest", 
    icon: TrendingDown, 
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "Lowest price available"
  },
  { 
    label: "Fastest", 
    icon: Clock, 
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    description: "Shortest flight time"
  },
  { 
    label: "Best Value", 
    icon: Star, 
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Price + comfort balance"
  },
  { 
    label: "Fewer Stops", 
    icon: ArrowRightLeft, 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Direct or 1-stop flights"
  },
];

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
  className,
}: ApiPendingNoticeProps) {
  const aviasalesUrl = buildPartnerUrl("aviasales", origin, destination, departDate, returnDate, passengers, cabin);
  const jetradarUrl = buildPartnerUrl("jetradar", origin, destination, departDate, returnDate, passengers, cabin);
  const kiwiUrl = buildPartnerUrl("kiwi", origin, destination, departDate, returnDate, passengers, cabin);

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
            Compare Live Prices From Our Travel Partners
          </h2>
          
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Live flight options available from multiple partners. Prices update in real time.
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

      {/* Results Preview List */}
      <Card className="border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-background to-purple-500/5">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Results Preview</h3>
            <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 gap-1">
              <Zap className="w-3 h-3" />
              Live Prices
            </Badge>
          </div>

          {/* Preview Options Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {PREVIEW_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <a
                  key={option.label}
                  href={aviasalesUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer",
                    option.bgColor,
                    option.borderColor
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", option.bgColor)}>
                    <Icon className={cn("w-5 h-5", option.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">from</p>
                    <p className={cn("font-bold", option.color)}>View →</p>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Primary CTA */}
          <div className="mt-5 text-center">
            <a
              href={aviasalesUrl}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="block"
            >
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/25 font-semibold px-8">
                <ExternalLink className="w-5 h-5" />
                View Live Results
              </Button>
            </a>
            
            {/* Secondary partner links */}
            <div className="mt-3 flex items-center justify-center gap-4 text-sm">
              <span className="text-muted-foreground">Also check:</span>
              <a
                href={jetradarUrl}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
              >
                JetRadar
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={kiwiUrl}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
              >
                Kiwi
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Live price notice */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            <Zap className="w-3 h-3 inline text-amber-500 mr-1" />
            Live prices confirmed on partner site. Final booking on partner.
          </p>
        </CardContent>
      </Card>

      {/* Popular Destinations Gallery */}
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

      {/* Trust Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Secure partner checkout
        </span>
        <span className="hidden sm:block">•</span>
        <span>ZIVO compares prices from third-party partners</span>
        <span className="hidden sm:block">•</span>
        <span>Booking completed on partner sites</span>
      </div>
    </div>
  );
}
