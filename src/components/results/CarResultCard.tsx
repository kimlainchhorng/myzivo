/**
 * Premium Car Rental Result Card
 * Unified design: Image left, specs center, price+CTA right
 * Mobile-first with clear visual hierarchy
 */

import { Users, Briefcase, Snowflake, Cog, ExternalLink, CheckCircle, Zap, Fuel, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { brandedCarModels, BrandedCarModel } from "@/config/photos";
import { useMemo } from "react";

export interface CarCardData {
  id: string;
  category: string;
  categoryIcon?: string;
  imageUrl?: string;
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

interface CarResultCardProps {
  car: CarCardData;
  onViewDeal: (car: CarCardData) => void;
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

// Get a branded car image for a category
function getBrandedCarForCategory(category: string, index: number = 0): BrandedCarModel | null {
  const categoryKey = category.toLowerCase().split(" ")[0];
  const mappedCategories = categoryMapping[categoryKey] || [categoryKey];
  
  const matchingCars = brandedCarModels.filter(car => 
    mappedCategories.includes(car.category)
  );
  
  if (matchingCars.length === 0) return null;
  return matchingCars[index % matchingCars.length];
}

export function CarResultCard({ car, onViewDeal, className }: CarResultCardProps) {
  const { getDisplay } = useCurrency();
  const isElectric = car.category.toLowerCase().includes("electric");
  
  // Get a consistent branded car based on the car ID hash
  const brandedCar = useMemo(() => {
    const hash = car.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return getBrandedCarForCategory(car.category, hash);
  }, [car.id, car.category]);
  
  const { formatted: dailyPrice, wasConverted } = getDisplay(car.pricePerDay, "USD");
  const { formatted: totalPriceFormatted } = getDisplay(car.totalPrice, "USD");

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-500/30",
        car.isBestDeal && "ring-2 ring-emerald-500/50",
        className
      )}
    >
      {/* Top badges */}
      {(car.isBestDeal || isElectric) && (
        <div className="flex gap-2 px-4 py-2 bg-muted/30 border-b border-border/50">
          {car.isBestDeal && (
            <Badge className="bg-emerald-500 text-white text-[10px] gap-1">
              Best Value
            </Badge>
          )}
          {isElectric && (
            <Badge className="bg-green-500 text-white text-[10px] gap-1">
              <Zap className="w-3 h-3" /> Electric
            </Badge>
          )}
        </div>
      )}

      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* LEFT: Car Image */}
          <div className="sm:w-52 h-40 sm:h-auto bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center p-4 shrink-0 relative overflow-hidden">
            {brandedCar ? (
              <img
                src={brandedCar.src}
                alt={`${brandedCar.brand} ${brandedCar.model}`}
                className="w-full h-full object-contain max-h-32 transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : car.imageUrl ? (
              <img
                src={car.imageUrl}
                alt={car.category}
                className="w-full h-full object-contain max-h-28"
                loading="lazy"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center">
                <Car className="w-10 h-10 text-emerald-500" />
              </div>
            )}
            {/* Brand badge */}
            {brandedCar && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded text-[10px] font-medium text-muted-foreground">
                {brandedCar.brand}
              </div>
            )}
          </div>

          {/* CENTER: Details & Specs */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{car.category}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {car.companyLogo && (
                    <img src={car.companyLogo} alt={car.company} className="h-4 object-contain" />
                  )}
                  {car.company}
                </p>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">via Rental Partner</p>
              </div>
              <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
                or similar
              </Badge>
            </div>

            {/* Specs row */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-violet-500" />
                <span>{car.seats} seats</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-violet-500" />
                <span>{car.bags} bags</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cog className="w-4 h-4 text-violet-500" />
                <span>{car.transmission}</span>
              </div>
              {car.hasAC && (
                <div className="flex items-center gap-1.5">
                  <Snowflake className="w-4 h-4 text-violet-500" />
                  <span>A/C</span>
                </div>
              )}
            </div>

            {/* Features/Policies */}
            <div className="flex flex-wrap gap-2">
              {car.freeCancellation && (
                <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30 bg-emerald-500/5 gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Free Cancellation
                </Badge>
              )}
              {car.mileage && (
                <Badge variant="outline" className="text-xs">
                  {car.mileage}
                </Badge>
              )}
              {car.fuelPolicy && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Fuel className="w-3 h-3" />
                  {car.fuelPolicy}
                </Badge>
              )}
              {car.features.slice(0, 2).map((feature, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* RIGHT: Price & CTA */}
          <div className="sm:w-48 p-4 flex flex-col justify-center items-end border-t sm:border-t-0 sm:border-l border-border/50">
            {/* Vehicle info */}
            {brandedCar && (
              <p className="text-xs text-muted-foreground text-right mb-2">
                {brandedCar.brand} {brandedCar.model}
              </p>
            )}
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">From</p>
              <p className="text-2xl font-bold text-primary">
                {dailyPrice}
                <span className="text-sm font-normal text-muted-foreground">/day</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalPriceFormatted} total ({car.days} day{car.days !== 1 ? "s" : ""})
              </p>
              {wasConverted && (
                <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                  Converted from USD
                </p>
              )}
            </div>
            <Button
              onClick={() => onViewDeal(car)}
              className="mt-3 w-full gap-2 font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 text-primary-foreground rounded-xl min-h-[44px] touch-manipulation active:scale-[0.97] transition-all duration-200"
            >
              Book with Provider
              <ExternalLink className="w-4 h-4" />
            </Button>
            <p className="text-[9px] text-muted-foreground mt-2 text-center">
              Continue to Partner
            </p>
          </div>
        </div>

        {/* Redirect notice */}
        <div className="px-4 py-2 bg-muted/30 border-t border-border/30 text-center">
          <p className="text-[10px] text-muted-foreground">
            Prices may change until booking is completed with the provider.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
