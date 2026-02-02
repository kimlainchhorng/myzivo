/**
 * Cross-sell banner promoting ZIVO Driver services
 * Appears after travel search results or booking confirmation
 */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Package, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DriverCrossSellProps {
  variant?: 'compact' | 'full';
  className?: string;
  source?: string; // Page source for tracking
}

const DRIVER_CROSSSELL_URL = "https://zivodriver.com";

const buildCrossSellUrl = (source: string = 'travel') => {
  return `${DRIVER_CROSSSELL_URL}?utm_source=hizovo&utm_medium=crosssell&utm_campaign=${source}`;
};

export default function DriverCrossSell({ 
  variant = 'full', 
  className,
  source = 'travel'
}: DriverCrossSellProps) {
  const url = buildCrossSellUrl(source);

  if (variant === 'compact') {
    return (
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "block p-4 rounded-xl bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 hover:border-primary/40 transition-all group",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Need a ride or delivery?</p>
              <p className="text-xs text-muted-foreground">Book instantly with ZIVO Driver</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </a>
    );
  }

  return (
    <Card className={cn("overflow-hidden border-primary/20", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
      <CardContent className="p-6 relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
            Complete Your Trip
          </span>
        </div>
        
        <h3 className="text-lg font-bold mb-2">
          Need a ride or delivery?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Book instantly with ZIVO Driver for airport transfers, local rides, or package delivery.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-2">
              <Car className="w-4 h-4" />
              Book a Ride
              <ArrowRight className="w-3 h-3" />
            </Button>
          </a>
          <a href={`${url}&service=delivery`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-2">
              <Package className="w-4 h-4" />
              Send a Package
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
