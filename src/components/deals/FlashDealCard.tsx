/**
 * Flash Deal Card
 * Time-limited deal with countdown and social proof
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Flame, Users, ArrowRight, Plane, Hotel, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlashDeal } from "@/types/behaviorAnalytics";

interface FlashDealCardProps {
  deal: FlashDeal;
  onClaim?: (deal: FlashDeal) => void;
  className?: string;
}

const categoryIcons = {
  flights: Plane,
  hotels: Hotel,
  cars: Car,
};

const categoryColors = {
  flights: 'sky',
  hotels: 'amber',
  cars: 'violet',
};

const FlashDealCard = ({ deal, onClaim, className }: FlashDealCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(deal.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [deal.expiresAt]);

  const Icon = categoryIcons[deal.category];
  const color = categoryColors[deal.category];
  const claimedPercent = (deal.claimedCount / deal.totalAvailable) * 100;
  const remaining = deal.totalAvailable - deal.claimedCount;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5",
        isExpired && "opacity-60",
        className
      )}
    >
      {/* Urgency Header */}
      <div className={cn(
        "px-4 py-2 flex items-center justify-between",
        `bg-${color}-500/10`
      )}>
        <div className="flex items-center gap-2">
          <Flame className={cn("w-4 h-4", `text-${color}-500`)} />
          <span className="text-sm font-semibold">Flash Deal</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono font-bold">{timeLeft}</span>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Category & Title */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            `bg-${color}-500/20`
          )}>
            <Icon className={cn("w-5 h-5", `text-${color}-500`)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{deal.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{deal.subtitle}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold">${deal.discountedPrice}</span>
          <span className="text-muted-foreground line-through">${deal.originalPrice}</span>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            {deal.discountPercent}% OFF
          </Badge>
        </div>

        {/* Progress & Availability */}
        <div className="space-y-2">
          <Progress value={claimedPercent} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {deal.claimedCount} claimed
            </div>
            <span className="font-medium text-foreground">{remaining} left</span>
          </div>
        </div>

        {/* CTA */}
        <Button
          className="w-full gap-2 rounded-xl touch-manipulation active:scale-[0.98] min-h-[44px] transition-all duration-200"
          disabled={isExpired || remaining === 0}
          onClick={() => onClaim?.(deal)}
        >
          {isExpired ? 'Expired' : remaining === 0 ? 'Sold Out' : 'Claim Deal'}
          {!isExpired && remaining > 0 && <ArrowRight className="w-4 h-4" />}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FlashDealCard;
