/**
 * BUNDLE BUILDER
 * 
 * Post-flight selection widget for bundling hotel + car
 * Shows savings percentage and bundle options
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Plane, Hotel, Car, Sparkles, ChevronRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BUNDLE_OPTIONS, BUNDLE_COPY, REVENUE_COMPLIANCE, type BundleType } from "@/config/revenueOptimization";
import { cn } from "@/lib/utils";

const SERVICE_ICONS = {
  flight: Plane,
  hotel: Hotel,
  car: Car,
};

interface BundleBuilderProps {
  className?: string;
  flightPrice?: number;
  destination?: string;
  dates?: string;
  onBundleSelect?: (bundle: BundleType) => void;
}

export default function BundleBuilder({
  className,
  flightPrice = 0,
  destination,
  dates,
  onBundleSelect,
}: BundleBuilderProps) {
  const [selectedBundle, setSelectedBundle] = useState<BundleType>('flight-only');

  const handleBundleChange = (value: BundleType) => {
    setSelectedBundle(value);
    onBundleSelect?.(value);
  };

  // Estimate bundle prices (in real implementation, fetch from API)
  const estimateBundlePrice = (bundle: BundleType): number => {
    const hotelEstimate = 150; // per night estimate
    const carEstimate = 45; // per day estimate
    const nights = 3; // default estimate
    
    switch (bundle) {
      case 'flight-only':
        return flightPrice;
      case 'flight-hotel':
        const flightHotelTotal = flightPrice + (hotelEstimate * nights);
        return Math.round(flightHotelTotal * 0.85); // 15% savings
      case 'flight-hotel-car':
        const fullBundleTotal = flightPrice + (hotelEstimate * nights) + (carEstimate * nights);
        return Math.round(fullBundleTotal * 0.75); // 25% savings
      default:
        return flightPrice;
    }
  };

  return (
    <Card className={cn("border-primary/20 bg-gradient-to-br from-primary/5 to-amber-500/5", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-primary" />
            {BUNDLE_COPY.headline}
          </CardTitle>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Save up to 25%
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{BUNDLE_COPY.subheadline}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <RadioGroup value={selectedBundle} onValueChange={(v) => handleBundleChange(v as BundleType)}>
          {BUNDLE_OPTIONS.map((bundle) => {
            const estimatedPrice = estimateBundlePrice(bundle.type);
            const savings = bundle.savingsPercentage > 0 
              ? Math.round((flightPrice * bundle.savingsPercentage) / 100) 
              : 0;
            
            return (
              <div
                key={bundle.type}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer active:scale-[0.98] touch-manipulation",
                  selectedBundle === bundle.type
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                    : "border-border hover:border-primary/30"
                )}
                onClick={() => handleBundleChange(bundle.type)}
              >
                <RadioGroupItem value={bundle.type} id={bundle.type} className="sr-only" />
                
                {/* Services Icons */}
                <div className="flex -space-x-2">
                  {bundle.services.map((service) => {
                    const Icon = SERVICE_ICONS[service];
                    return (
                      <div
                        key={service}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-2 border-background",
                          service === 'flight' && "bg-sky-500",
                          service === 'hotel' && "bg-amber-500",
                          service === 'car' && "bg-emerald-500"
                        )}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    );
                  })}
                </div>
                
                {/* Bundle Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={bundle.type} className="font-semibold cursor-pointer">
                      {bundle.label}
                    </Label>
                    {bundle.recommended && (
                      <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {bundle.services.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' + ')}
                  </p>
                </div>
                
                {/* Pricing */}
                <div className="text-right">
                  {bundle.savingsPercentage > 0 && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs mb-1">
                      Save {bundle.savingsPercentage}%
                    </Badge>
                  )}
                  <p className="font-bold">
                    {flightPrice > 0 ? `$${estimatedPrice}` : 'From $—'}
                  </p>
                </div>
                
                {/* Selection Indicator */}
                {selectedBundle === bundle.type && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-primary" />
                )}
              </div>
            );
          })}
        </RadioGroup>
        
        {/* CTA */}
        {selectedBundle !== 'flight-only' && (
          <div className="flex gap-2">
            {selectedBundle === 'flight-hotel' || selectedBundle === 'flight-hotel-car' ? (
              <Button asChild className="flex-1 gap-2">
                <Link to={`/book-hotel${destination ? `?destination=${destination}` : ''}`}>
                  Add Hotel
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : null}
            {selectedBundle === 'flight-hotel-car' && (
              <Button asChild variant="outline" className="flex-1 gap-2">
                <Link to="/rent-car">
                  Add Car
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
        
        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center">
          {REVENUE_COMPLIANCE.bundle}
        </p>
      </CardContent>
    </Card>
  );
}
