/**
 * API Pending Notice - Multi-Partner Compare UI
 * 
 * Displayed when Flight Search API is not enabled (403 errors) or returns no results.
 * Shows multiple partner options with clear comparison messaging.
 * 
 * COMPLIANCE: Contains required disclosure text for meta-search transparency.
 */

import { ExternalLink, ShieldCheck, Star, Zap, Globe, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

// Partner configurations with their specific URLs
const PARTNER_MARKER = "700031";

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
    // JetRadar uses same base but different styling/domain
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
    // Kiwi.com format
    const formatDate = (d: string) => d?.replace(/-/g, "") || "";
    return `https://www.kiwi.com/en/search/results/${origin}/${destination}/${formatDate(departDate || "")}${returnDate ? `/${formatDate(returnDate)}` : ""}?adults=${adults}`;
  }

  return "";
}

interface PartnerCardProps {
  name: string;
  tagline: string;
  badge: string;
  badgeVariant: "recommended" | "alternate" | "optional";
  icon: React.ReactNode;
  features: string[];
  url: string;
}

function PartnerCard({ name, tagline, badge, badgeVariant, icon, features, url }: PartnerCardProps) {
  const badgeStyles = {
    recommended: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    alternate: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    optional: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const cardStyles = {
    recommended: "border-sky-500/30 bg-gradient-to-br from-sky-500/5 via-background to-sky-500/10",
    alternate: "border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-background to-purple-500/10",
    optional: "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-background to-emerald-500/10",
  };

  const buttonStyles = {
    recommended: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/25",
    alternate: "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25",
    optional: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25",
  };

  return (
    <Card className={cn("overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl", cardStyles[badgeVariant])}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-card/80 border border-border/50 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">{tagline}</p>
            </div>
          </div>
          <Badge className={cn("text-xs border shrink-0", badgeStyles[badgeVariant])}>
            {badge}
          </Badge>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-5">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Price indicator */}
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-card/50 border border-border/30">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">Live price on partner site</span>
        </div>

        {/* CTA */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="block"
        >
          <Button className={cn("w-full gap-2 font-semibold", buttonStyles[badgeVariant])}>
            <ExternalLink className="w-4 h-4" />
            View Offers
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

export default function ApiPendingNotice({
  whitelabelUrl,
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
    <div className={cn("space-y-6", className)}>
      {/* Compare Header */}
      <Card className="border-border/50 bg-gradient-to-r from-sky-500/5 via-background to-purple-500/5">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/30 mb-4">
            <Plane className="w-8 h-8 text-sky-500" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Compare Flights
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
            We search multiple airlines and travel partners. Prices update in real time and can change quickly.
          </p>
          
          <p className="text-sm text-muted-foreground/80">
            Final booking happens on our trusted partner sites. We may earn a commission.
          </p>

          {/* Route display */}
          <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card/80 border border-border/50">
            <span className="font-semibold">{origin}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold">{destination}</span>
            {returnDate && (
              <>
                <span className="text-muted-foreground">→</span>
                <span className="font-semibold">{origin}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Partner Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <PartnerCard
          name="Aviasales"
          tagline="Compare 500+ airlines & sellers"
          badge="Recommended"
          badgeVariant="recommended"
          icon={<Star className="w-6 h-6 text-sky-500" />}
          features={[
            "Multiple airlines & sellers",
            "Best price comparison",
            "Flexible date search",
          ]}
          url={aviasalesUrl}
        />

        <PartnerCard
          name="JetRadar"
          tagline="Check additional partner offers"
          badge="Alternate"
          badgeVariant="alternate"
          icon={<Globe className="w-6 h-6 text-purple-500" />}
          features={[
            "Global airline coverage",
            "Alternative routing options",
            "Price alerts available",
          ]}
          url={jetradarUrl}
        />

        <PartnerCard
          name="Kiwi"
          tagline="Find different routing options"
          badge="More Options"
          badgeVariant="optional"
          icon={<Plane className="w-6 h-6 text-emerald-500" />}
          features={[
            "Virtual interlining",
            "Unique route combinations",
            "Budget airline coverage",
          ]}
          url={kiwiUrl}
        />
      </div>

      {/* Trust Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 text-xs text-muted-foreground">
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
