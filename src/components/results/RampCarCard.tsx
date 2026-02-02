/**
 * Ramp-Style Car Rental Result Card
 * Premium, clean design with always-visible pricing
 * Follows enterprise-grade SaaS travel UI patterns
 */

import { Users, Briefcase, Snowflake, Cog, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { brandedCarModels, BrandedCarModel } from "@/config/photos";
import { useMemo } from "react";

export interface RampCarCardData {
  id: string;
  category: string;
  company: string;
  companyLogo?: string;
  seats: number | string;
  bags: number | string;
  transmission: "Automatic" | "Manual";
  hasAC: boolean;
  pricePerDay: number;
  totalPrice: number;
  days: number;
  features: string[];
  mileage?: string;
  fuelPolicy?: string;
  freeCancellation?: boolean;
  isBestDeal?: boolean;
}

interface RampCarCardProps {
  car: RampCarCardData;
  onViewDeal: (car: RampCarCardData) => void;
  className?: string;
}

// Map car categories to brandedCarModels categories
const categoryMapping: Record<string, string[]> = {
  economy: ["compact", "economy"],
  compact: ["compact"],
  midsize: ["midsize", "sedan"],
  fullsize: ["sedan", "luxury"],
  suv: ["suv"],
  luxury: ["luxury", "exotic"],
  electric: ["electric"],
  van: ["van", "minivan"],
  convertible: ["luxury", "exotic"],
  premium: ["luxury"],
  minivan: ["van", "minivan"],
};

function getBrandedCarForCategory(category: string, index: number = 0): BrandedCarModel | null {
  const categoryKey = category.toLowerCase().split(" ")[0];
  const mappedCategories = categoryMapping[categoryKey] || [categoryKey];
  
  const matchingCars = brandedCarModels.filter(car => 
    mappedCategories.includes(car.category)
  );
  
  if (matchingCars.length === 0) return null;
  return matchingCars[index % matchingCars.length];
}

export function RampCarCard({ car, onViewDeal, className }: RampCarCardProps) {
  const { getDisplay } = useCurrency();
  
  const brandedCar = useMemo(() => {
    const hash = car.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return getBrandedCarForCategory(car.category, hash);
  }, [car.id, car.category]);
  
  const { formatted: dailyPrice } = getDisplay(car.pricePerDay, "USD");
  const { formatted: totalPriceFormatted } = getDisplay(car.totalPrice, "USD");

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border/60",
        "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
        "transition-all duration-300 ease-out",
        "overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="sm:w-56 h-44 sm:h-auto bg-muted/30 flex items-center justify-center p-6 relative">
          {brandedCar ? (
            <img
              src={brandedCar.src}
              alt={`${brandedCar.brand} ${brandedCar.model}`}
              className="w-full h-full object-contain max-h-36"
              loading="lazy"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-muted flex items-center justify-center">
              <span className="text-5xl">🚗</span>
            </div>
          )}
          
          {/* Brand badge */}
          {brandedCar && (
            <span className="absolute bottom-3 left-3 text-[11px] text-muted-foreground font-medium">
              {brandedCar.brand}
            </span>
          )}
        </div>

        {/* Details Section */}
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-foreground">{car.category}</h3>
                <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border/60">
                  or similar
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{car.company}</p>
            </div>
            
            {car.isBestDeal && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-medium">
                Best Deal
              </Badge>
            )}
          </div>

          {/* Specs Row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{car.seats} seats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span>{car.bags} bags</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cog className="w-4 h-4" />
              <span>{car.transmission}</span>
            </div>
            {car.hasAC && (
              <div className="flex items-center gap-1.5">
                <Snowflake className="w-4 h-4" />
                <span>A/C</span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {car.freeCancellation && (
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50 gap-1 font-normal">
                <CheckCircle className="w-3 h-3" />
                Free Cancellation
              </Badge>
            )}
            {car.mileage && (
              <Badge variant="outline" className="text-xs font-normal border-border/60">
                {car.mileage}
              </Badge>
            )}
            {car.features.slice(0, 2).map((feature, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal border-border/60">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price Section - Always Visible */}
        <div className="sm:w-52 p-5 sm:p-6 flex flex-col justify-between items-end border-t sm:border-t-0 sm:border-l border-border/40 bg-muted/20">
          <div className="text-right w-full">
            {/* Vehicle make/model */}
            {brandedCar && (
              <p className="text-xs text-muted-foreground mb-2">
                {brandedCar.brand} {brandedCar.model}
              </p>
            )}
            
            {/* Price - Always Visible */}
            <p className="text-2xl font-bold text-foreground">
              {dailyPrice}
              <span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {totalPriceFormatted} total · {car.days} day{car.days !== 1 ? "s" : ""}
            </p>
            
            {/* Indicative price notice */}
            <p className="text-[10px] text-muted-foreground/70 mt-2 leading-tight">
              Indicative price · Final price on partner site
            </p>
          </div>
          
          <Button
            onClick={() => onViewDeal(car)}
            className="mt-4 w-full gap-2 font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue to secure booking
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Footer Disclosure */}
      <div className="px-5 py-2.5 bg-muted/30 border-t border-border/30">
        <p className="text-[10px] text-muted-foreground text-center">
          Powered by licensed travel partners · Final price confirmed before payment
        </p>
      </div>
    </div>
  );
}
