/**
 * TopSearchCTA Component
 * MoR Model: Internal checkout flow
 */
import { Plane, Sparkles, Search, ShieldCheck, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FLIGHT_DISCLAIMERS, FLIGHT_CTA_TEXT } from "@/config/flightCompliance";
import { useCTAColor } from "@/hooks/useABTest";
import { cn } from "@/lib/utils";

interface TopSearchCTAProps {
  flightCount?: number;
  lowestPrice?: number;
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  offerId?: string;
  className?: string;
}

export default function TopSearchCTA({ 
  flightCount, 
  lowestPrice,
  origin,
  destination,
  departDate,
  returnDate,
  passengers = 1,
  cabinClass = 'economy',
  offerId,
  className 
}: TopSearchCTAProps) {
  const navigate = useNavigate();
  const { className: colorClassName, trackClick: trackColorClick } = useCTAColor('flights');

  const handleSearchClick = () => {
    trackColorClick();
    
    // Navigate to internal booking flow
    if (offerId) {
      navigate(`/flights/traveler-info?offer=${offerId}&passengers=${passengers}`);
    } else if (origin && destination && departDate) {
      const params = new URLSearchParams({
        origin,
        dest: destination,
        depart: departDate,
        passengers: passengers.toString(),
        cabin: cabinClass,
      });
      if (returnDate) params.set('return', returnDate);
      navigate(`/flights/results?${params.toString()}`);
    } else {
      navigate('/flights');
    }
  };

  return (
    <div className={cn(
      "p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-cyan-500/10 border border-sky-500/20",
      className
    )}>
      {/* Trust Text */}
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-600">Secure ZIVO checkout with licensed partners</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-sky-500/20 text-sky-500 border-sky-500/30 gap-1">
              <Sparkles className="w-3 h-3" />
              Best Prices
            </Badge>
            {lowestPrice && (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                From ${lowestPrice}
              </Badge>
            )}
            {flightCount && flightCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {flightCount} flights
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {FLIGHT_DISCLAIMERS.price}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button
            size="lg"
            className={cn(
              "gap-2 text-white shadow-lg shadow-sky-500/30 w-full sm:w-auto min-h-[48px] touch-manipulation",
              colorClassName
            )}
            onClick={handleSearchClick}
          >
            <Plane className="w-4 h-4" />
            {FLIGHT_CTA_TEXT.primary}
            <Lock className="w-4 h-4" />
          </Button>
          <p className="text-[10px] text-muted-foreground text-right">
            {FLIGHT_DISCLAIMERS.ticketingShort}
          </p>
        </div>
      </div>
    </div>
  );
}
