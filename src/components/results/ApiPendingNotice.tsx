/**
 * API Pending Notice - Enhanced
 * 
 * Displayed when the Flight Search API is not enabled (403 errors) or returns no results.
 * Shows partner logos, comparison messaging, and white label CTA for live results.
 * 
 * COMPLIANCE: Contains required disclosure text for meta-search transparency.
 */

import { ExternalLink, ShieldCheck, Plane, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ApiPendingNoticeProps {
  whitelabelUrl: string;
  origin: string;
  destination: string;
  className?: string;
}

// Partner logos with example price ranges for visual credibility
const PARTNER_EXAMPLES = [
  { name: "Aviasales", priceRange: "$138+", color: "text-sky-500" },
  { name: "JetRadar", priceRange: "$162+", color: "text-purple-500" },
  { name: "Kiwi", priceRange: "$149+", color: "text-emerald-500" },
];

export default function ApiPendingNotice({
  whitelabelUrl,
  origin,
  destination,
  className,
}: ApiPendingNoticeProps) {
  return (
    <Card className={cn("border-sky-500/30 bg-gradient-to-br from-sky-500/5 via-background to-purple-500/5 overflow-hidden", className)}>
      <CardContent className="p-6 sm:p-8">
        {/* Header with Live Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 flex items-center justify-center">
            <Plane className="w-6 h-6 text-sky-500" />
          </div>
          <Badge className="bg-sky-500/20 text-sky-500 text-xs gap-1">
            <Zap className="w-3 h-3" />
            Real-Time Prices
          </Badge>
        </div>

        {/* Main Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
          Compare prices from multiple airlines and trusted travel partners.
        </h2>
        <p className="text-muted-foreground text-center mb-6 max-w-lg mx-auto">
          Prices update in real time. Final booking is completed securely on partner websites.
        </p>

        {/* Partner Preview Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-md mx-auto">
          {PARTNER_EXAMPLES.map((partner) => (
            <div
              key={partner.name}
              className="text-center p-3 rounded-xl bg-card/80 border border-border/50 hover:border-sky-500/30 transition-colors"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                {partner.name}
              </p>
              <p className={cn("text-lg font-bold", partner.color)}>
                {partner.priceRange}
              </p>
            </div>
          ))}
        </div>

        {/* Route Display */}
        <p className="text-center text-sm text-muted-foreground mb-6">
          {origin} → {destination}
        </p>

        {/* Primary CTA - Anchor tag to avoid popup blockers */}
        <div className="text-center">
          <a
            href={whitelabelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30 transition-all hover:shadow-sky-500/40 hover:scale-[1.02]"
          >
            <ExternalLink className="w-5 h-5" />
            View Live Results
          </a>
        </div>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Opens in new tab • Live prices and final booking on partner site
        </p>

        {/* Trust element - REQUIRED compliance text */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ZIVO compares prices from third-party partners. Booking completed on partner sites.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
