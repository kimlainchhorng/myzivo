/**
 * API Pending Notice
 * 
 * Displayed when the Flight Search API is not enabled (403 errors) or returns no results.
 * Provides white label CTA for live results on partner site.
 * 
 * COMPLIANCE: Contains required disclosure text for meta-search transparency.
 */

import { ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ApiPendingNoticeProps {
  whitelabelUrl: string;
  origin: string;
  destination: string;
  className?: string;
}

export default function ApiPendingNotice({
  whitelabelUrl,
  origin,
  destination,
  className,
}: ApiPendingNoticeProps) {
  const handleViewLiveResults = () => {
    window.open(whitelabelUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className={cn("border-sky-500/30 bg-sky-500/5", className)}>
      <CardContent className="p-6 sm:p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-4">
          <ExternalLink className="w-8 h-8 text-sky-500" />
        </div>

        <h2 className="text-xl font-bold mb-2">Live prices and availability open on our partner site.</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Click below to see real-time flight prices from {origin} to {destination} with our trusted partner.
        </p>

        {/* Primary CTA */}
        <Button
          size="lg"
          onClick={handleViewLiveResults}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white gap-2 shadow-lg shadow-sky-500/30"
        >
          <ExternalLink className="w-5 h-5" />
          View Live Results
        </Button>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground mt-4">
          Live prices and final booking on partner site.
        </p>

        {/* Trust element - REQUIRED compliance text */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            ZIVO compares prices from third-party partners. Booking completed on partner sites.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
