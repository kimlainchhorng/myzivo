/**
 * Car Rental Category Grid
 * 
 * Grid of car categories (Economy, SUV, Luxury, etc.) with affiliate deep links
 */

import { Users, Briefcase, Cog, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCarRedirect } from "@/hooks/useAffiliateRedirect";
import { format, addDays } from "date-fns";

const categories = [
  { 
    id: 'economy',
    name: "Economy", 
    icon: "🚗",
    description: "Fuel-efficient & affordable",
    seats: 5,
    bags: 2,
    priceFrom: 25,
    popular: true,
    features: ["Great mileage", "Easy parking"],
  },
  { 
    id: 'compact',
    name: "Compact", 
    icon: "🚙",
    description: "Perfect for city trips",
    seats: 5,
    bags: 3,
    priceFrom: 35,
    popular: false,
    features: ["City friendly", "Good trunk space"],
  },
  { 
    id: 'midsize',
    name: "Midsize", 
    icon: "🚗",
    description: "Comfort & value balance",
    seats: 5,
    bags: 4,
    priceFrom: 45,
    popular: false,
    features: ["Family trips", "Highway comfort"],
  },
  { 
    id: 'suv',
    name: "SUV", 
    icon: "🚐",
    description: "Space & versatility",
    seats: 7,
    bags: 5,
    priceFrom: 65,
    popular: true,
    features: ["All terrain", "Extra cargo"],
  },
  { 
    id: 'luxury',
    name: "Luxury", 
    icon: "🏎️",
    description: "Premium travel experience",
    seats: 5,
    bags: 3,
    priceFrom: 120,
    popular: true,
    features: ["Top brands", "Full features"],
  },
  { 
    id: 'van',
    name: "Van / Minivan", 
    icon: "🚌",
    description: "Groups & families",
    seats: 12,
    bags: 8,
    priceFrom: 85,
    popular: false,
    features: ["Group travel", "Max space"],
  },
];

interface CarCategoryGridProps {
  className?: string;
  pickupLocation?: string;
}

export default function CarCategoryGrid({ className, pickupLocation = "" }: CarCategoryGridProps) {
  const { redirectWithParams, redirectSimple } = useCarRedirect('category_grid', 'result_card');

  // Default dates: tomorrow pickup, 1 week rental
  const pickupDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const returnDate = format(addDays(new Date(), 8), 'yyyy-MM-dd');

  const handleCategoryClick = (category: typeof categories[0]) => {
    if (pickupLocation) {
      redirectWithParams({
        pickupLocation,
        pickupDate,
        returnDate,
        vehicleType: category.id as any,
      });
    } else {
      redirectSimple();
    }
  };

  return (
    <section className={cn("py-12 sm:py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
            Choose Your <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">Vehicle Type</span>
          </h2>
          <p className="text-muted-foreground">
            From economy to luxury, find the perfect car for your trip
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              className={cn(
                "overflow-hidden cursor-pointer group transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1 hover:border-violet-500/50",
                "touch-manipulation active:scale-[0.98]"
              )}
              onClick={() => handleCategoryClick(cat)}
            >
              <CardContent className="p-0">
                {/* Icon header */}
                <div className="h-24 bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center relative">
                  <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
                    {cat.icon}
                  </span>
                  {cat.popular && (
                    <Badge className="absolute top-3 right-3 bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px] gap-1">
                      <Sparkles className="w-3 h-3" />
                      Popular
                    </Badge>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg group-hover:text-violet-500 transition-all duration-200">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {cat.description}
                  </p>
                  
                  {/* Specs */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-violet-500" />
                      {cat.seats}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="w-3.5 h-3.5 text-violet-500" />
                      {cat.bags}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Cog className="w-3.5 h-3.5 text-violet-500" />
                      Auto
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cat.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] py-0">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      <span className="text-xs text-muted-foreground">From</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-violet-500">${cat.priceFrom}</span>
                        <span className="text-xs text-muted-foreground">* /day</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Cars <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Price disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center mt-4">
          *Prices are indicative and may change. Final price shown on partner site.
        </p>
      </div>
    </section>
  );
}
