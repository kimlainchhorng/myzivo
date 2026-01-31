import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Check, Sparkles, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackAffiliateClick } from '@/lib/affiliateTracking';
import { AFFILIATE_LINKS, AFFILIATE_DISCLOSURE_TEXT } from '@/config/affiliateLinks';

interface AffiliatePartnerSelectorProps {
  origin: string;
  destination: string;
  departDate?: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: string;
  flightNumber?: string;
  price?: number;
  airline?: string;
  airlineCode?: string;
  className?: string;
}

export default function AffiliatePartnerSelector({
  origin,
  destination,
  departDate,
  returnDate,
  passengers = 1,
  cabinClass = 'economy',
  flightNumber,
  price,
  airline = 'Unknown',
  airlineCode = 'XX',
  className,
}: AffiliatePartnerSelectorProps) {
  const handleBookFlight = () => {
    // Track the click with consistent CTA type
    trackAffiliateClick({
      flightId: flightNumber || `${origin}-${destination}`,
      airline: airline,
      airlineCode: airlineCode,
      origin,
      destination,
      price: price || 0,
      passengers,
      cabinClass,
      affiliatePartner: 'searadar',
      referralUrl: AFFILIATE_LINKS.flights.url,
      source: 'partner_selector',
      ctaType: 'compare_prices',
      serviceType: 'flights',
    });

    // Open SAME affiliate link in new tab - consistent across all CTAs
    window.open(AFFILIATE_LINKS.flights.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main CTA */}
      <Card className="border-2 border-sky-500/30 bg-gradient-to-r from-sky-500/10 to-blue-500/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Plane className="w-6 h-6 text-sky-500" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg">Search & Compare Flights</h3>
                <p className="text-sm text-muted-foreground">
                  Powered by {AFFILIATE_LINKS.flights.name} • 728+ airlines
                </p>
              </div>
            </div>
            
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 hover:opacity-90"
              onClick={handleBookFlight}
            >
              <Sparkles className="w-4 h-4" />
              Search Flights
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Route info */}
          {origin && destination && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary" className="font-mono">
                  {origin}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="secondary" className="font-mono">
                  {destination}
                </Badge>
                {departDate && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{departDate}</span>
                  </>
                )}
                {passengers > 1 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{passengers} passengers</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Affiliate Disclosure */}
      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
        <div className="flex items-start gap-2">
          <ExternalLink className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            {AFFILIATE_DISCLOSURE_TEXT.short}{' '}
            <a href="/affiliate-disclosure" className="text-sky-500 hover:underline">Learn more</a>
          </p>
        </div>
      </div>
    </div>
  );
}
