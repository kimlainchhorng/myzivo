/**
 * Premium Car Rental Result Card
 * Unified design: Image left, specs center, price+CTA right
 * Mobile-first with clear visual hierarchy
 */

import { Users, Briefcase, Snowflake, Cog, ExternalLink, CheckCircle, Zap, Fuel } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

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

// Car category images with better fallbacks
const categoryImages: Record<string, string> = {
  economy: "🚗",
  compact: "🚙",
  midsize: "🚘",
  fullsize: "🚐",
  suv: "🚙",
  luxury: "🏎️",
  electric: "⚡",
  van: "🚐",
  convertible: "🚗",
  premium: "🏎️",
  minivan: "🚐",
};

export function CarResultCard({ car, onViewDeal, className }: CarResultCardProps) {
  const { format, getDisplay } = useCurrency();
  const categoryKey = car.category.toLowerCase().split(" ")[0];
  const carIcon = categoryImages[categoryKey] || "🚗";
  const isElectric = car.category.toLowerCase().includes("electric");
  
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
              Best Deal
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
          {/* LEFT: Car Image/Icon */}
          <div className="sm:w-52 h-40 sm:h-auto bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center p-6 shrink-0">
            {car.imageUrl ? (
              <img
                src={car.imageUrl}
                alt={car.category}
                className="w-full h-full object-contain max-h-28"
                loading="lazy"
              />
            ) : (
              <span className="text-7xl">{car.categoryIcon || carIcon}</span>
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
          <div className="sm:w-44 p-4 bg-gradient-to-br from-muted/30 to-muted/10 flex flex-col justify-center items-center sm:items-end border-t sm:border-t-0 sm:border-l border-border/50">
            <div className="text-center sm:text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">From</p>
              <p className="text-2xl font-bold text-violet-500">
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
              className="mt-3 w-full gap-2 font-semibold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 text-white"
            >
              View Deal
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Redirect notice */}
        <div className="px-4 py-2 bg-muted/30 border-t border-border/30 text-center">
          <p className="text-[10px] text-muted-foreground">
            Redirects to partner site to complete booking
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
