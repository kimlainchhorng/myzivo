import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { affiliatePartners, type AffiliatePartner, type AffiliateUrlParams } from '@/data/affiliatePartners';
import { trackAffiliateClick } from '@/lib/affiliateTracking';

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
  const [selectedPartner, setSelectedPartner] = useState<string>('skyscanner');

  const handlePartnerClick = (partner: AffiliatePartner) => {
    const params: AffiliateUrlParams = {
      origin,
      destination,
      departDate,
      returnDate,
      passengers,
      cabinClass,
    };

    const url = partner.urlTemplate(params);

    // Track the click using existing interface
    trackAffiliateClick({
      flightId: flightNumber || `${origin}-${destination}`,
      airline: airline,
      airlineCode: airlineCode,
      origin,
      destination,
      price: price || 0,
      passengers,
      cabinClass,
      affiliatePartner: partner.id,
      referralUrl: url,
      source: 'partner_selector',
    });

    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const topPartners = affiliatePartners.slice(0, 6);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-sky-500" />
        <h3 className="font-semibold">Compare Prices on Partner Sites</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {topPartners.map((partner) => (
          <Card
            key={partner.id}
            className={cn(
              "cursor-pointer transition-all hover:scale-[1.02]",
              selectedPartner === partner.id 
                ? "border-sky-500 bg-sky-500/10" 
                : "hover:border-sky-500/50"
            )}
            onClick={() => setSelectedPartner(partner.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{partner.logo}</span>
                  <div>
                    <p className="font-medium text-sm">{partner.name}</p>
                    <p className="text-[10px] text-muted-foreground">{partner.commissionRate}</p>
                  </div>
                </div>
                {selectedPartner === partner.id && (
                  <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {partner.features.slice(0, 2).map((feature) => (
                  <Badge 
                    key={feature} 
                    variant="secondary" 
                    className="text-[9px] px-1.5 py-0"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>

              <Button
                size="sm"
                className={cn("w-full h-8 text-xs gap-1", partner.color, "hover:opacity-90 text-white")}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePartnerClick(partner);
                }}
              >
                <ExternalLink className="w-3 h-3" />
                Search on {partner.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        ZIVO may earn a commission when you book through partner links. Prices shown are estimates.{' '}
        <a href="/affiliate-disclosure" className="text-sky-500 hover:underline">Learn more</a>
      </p>
    </div>
  );
}
