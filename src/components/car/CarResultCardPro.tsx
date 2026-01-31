import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Users,
  Briefcase,
  Fuel,
  Gauge,
  ExternalLink,
  CheckCircle2,
  Snowflake,
  Cog
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PROFESSIONAL CAR RENTAL RESULT CARD
 * Expedia / Rentalcars quality design
 * Vehicle image with clear specs and pricing
 */

interface CarResultCardProProps {
  id: string;
  category: string;
  name?: string;
  image?: string;
  provider?: string;
  passengers: number;
  bags: number;
  transmission: 'Automatic' | 'Manual';
  hasAC: boolean;
  fuelPolicy?: string;
  mileage?: string;
  pricePerDay: number;
  totalPrice?: number;
  daysCount?: number;
  freeCancellation?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onBook?: () => void;
}

export default function CarResultCardPro({
  id,
  category,
  name,
  image,
  provider,
  passengers,
  bags,
  transmission,
  hasAC,
  fuelPolicy,
  mileage = 'Unlimited',
  pricePerDay,
  totalPrice,
  daysCount,
  freeCancellation = true,
  isSelected,
  onSelect,
  onBook,
}: CarResultCardProProps) {
  // Category to emoji mapping
  const categoryEmojis: Record<string, string> = {
    'Economy': '🚗',
    'Compact': '🚙',
    'SUV': '🚐',
    'Luxury': '🏎️',
    'Van': '🚌',
    'Convertible': '🏎️',
    'Midsize': '🚗',
    'Full-size': '🚙',
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 cursor-pointer group",
        "hover:shadow-lg hover:shadow-violet-500/5 hover:border-violet-500/30",
        isSelected && "ring-2 ring-violet-500 border-violet-500/50"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Vehicle Image */}
          <div className="sm:w-52 h-36 sm:h-auto relative shrink-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10">
            {image ? (
              <img 
                src={image} 
                alt={name || category}
                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">{categoryEmojis[category] || '🚗'}</span>
              </div>
            )}
            <Badge className="absolute top-3 left-3 bg-violet-500/90 text-white text-[10px]">
              {category}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-base sm:text-lg line-clamp-1 group-hover:text-violet-500 transition-colors">
                    {name || `${category} Car`}
                  </h3>
                  {provider && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {provider}
                    </p>
                  )}
                </div>
                {freeCancellation && (
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[10px] gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Free Cancel
                  </Badge>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="text-xs">{passengers} seats</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="text-xs">{bags} bags</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Cog className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="text-xs">{transmission}</span>
                </div>
                {hasAC && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Snowflake className="w-4 h-4 text-violet-500" />
                    </div>
                    <span className="text-xs">A/C</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Gauge className="w-3 h-3" />
                  {mileage} miles
                </Badge>
                {fuelPolicy && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Fuel className="w-3 h-3" />
                    {fuelPolicy}
                  </Badge>
                )}
              </div>

              {/* Footer: Price & CTA */}
              <div className="flex items-end justify-between pt-3 border-t border-border/50 mt-auto">
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-xl sm:text-2xl font-bold">${pricePerDay}</p>
                    <span className="text-sm text-muted-foreground">/day</span>
                  </div>
                  {totalPrice && daysCount && (
                    <p className="text-xs text-muted-foreground">
                      ${totalPrice} total for {daysCount} days
                    </p>
                  )}
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook?.();
                  }}
                  className={cn(
                    "gap-2 font-semibold",
                    "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700",
                    "shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                  )}
                >
                  Rent Now
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
