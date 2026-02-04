/**
 * CAR EXTRAS SELECTOR
 * 
 * Optional add-ons for car rentals
 * GPS, child seats, insurance upgrades
 */

import { useState } from "react";
import { Navigation, Baby, ShieldCheck, Fuel, Plus, Minus, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { REVENUE_COMPLIANCE } from "@/config/revenueOptimization";
import { cn } from "@/lib/utils";

interface CarExtra {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
  icon: typeof Navigation;
  badge?: string;
  popular?: boolean;
}

const CAR_EXTRAS: CarExtra[] = [
  {
    id: 'gps',
    name: 'GPS Navigation',
    description: 'Never get lost with in-car navigation',
    pricePerDay: 8,
    icon: Navigation,
  },
  {
    id: 'child-seat',
    name: 'Child Seat',
    description: 'Safe seating for young travelers',
    pricePerDay: 12,
    icon: Baby,
    popular: true,
  },
  {
    id: 'premium-insurance',
    name: 'Premium Insurance',
    description: 'Zero excess, full coverage',
    pricePerDay: 15,
    icon: ShieldCheck,
    badge: 'Recommended',
  },
  {
    id: 'prepaid-fuel',
    name: 'Prepaid Fuel',
    description: 'Return empty, skip the pump',
    pricePerDay: 0, // One-time fee handled separately
    icon: Fuel,
  },
];

interface CarExtrasSelectorProps {
  className?: string;
  rentalDays?: number;
  onExtrasChange?: (extras: { id: string; quantity: number }[]) => void;
}

export default function CarExtrasSelector({
  className,
  rentalDays = 3,
  onExtrasChange,
}: CarExtrasSelectorProps) {
  const [selectedExtras, setSelectedExtras] = useState<Map<string, number>>(new Map());

  const toggleExtra = (id: string) => {
    const newExtras = new Map(selectedExtras);
    if (newExtras.has(id)) {
      newExtras.delete(id);
    } else {
      newExtras.set(id, 1);
    }
    setSelectedExtras(newExtras);
    onExtrasChange?.(Array.from(newExtras.entries()).map(([id, quantity]) => ({ id, quantity })));
  };

  const updateQuantity = (id: string, delta: number) => {
    const newExtras = new Map(selectedExtras);
    const current = newExtras.get(id) || 0;
    const newQty = Math.max(0, Math.min(4, current + delta));
    
    if (newQty === 0) {
      newExtras.delete(id);
    } else {
      newExtras.set(id, newQty);
    }
    setSelectedExtras(newExtras);
    onExtrasChange?.(Array.from(newExtras.entries()).map(([id, quantity]) => ({ id, quantity })));
  };

  const totalExtras = Array.from(selectedExtras.entries()).reduce((sum, [id, qty]) => {
    const extra = CAR_EXTRAS.find(e => e.id === id);
    return sum + (extra ? extra.pricePerDay * rentalDays * qty : 0);
  }, 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5 text-primary" />
            Rental Extras
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{REVENUE_COMPLIANCE.extras}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {CAR_EXTRAS.map((extra) => {
          const isSelected = selectedExtras.has(extra.id);
          const quantity = selectedExtras.get(extra.id) || 0;
          const showQuantity = extra.id === 'child-seat'; // Only child seats can have quantity > 1
          
          return (
            <div
              key={extra.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                isSelected
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleExtra(extra.id)}
              />
              
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                isSelected ? "bg-primary/10" : "bg-muted"
              )}>
                <extra.icon className={cn(
                  "w-4 h-4",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{extra.name}</span>
                  {extra.badge && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px] px-1.5 py-0">
                      {extra.badge}
                    </Badge>
                  )}
                  {extra.popular && (
                    <Badge className="bg-amber-500/10 text-amber-500 text-[10px] px-1.5 py-0">
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{extra.description}</p>
              </div>
              
              {/* Quantity (for child seats) */}
              {showQuantity && isSelected && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); updateQuantity(extra.id, -1); }}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-4 text-center text-sm font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); updateQuantity(extra.id, 1); }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {/* Price */}
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm">
                  ${extra.pricePerDay}/day
                </p>
                {isSelected && (
                  <p className="text-xs text-muted-foreground">
                    ${extra.pricePerDay * rentalDays * (showQuantity ? quantity : 1)} total
                  </p>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Total */}
        {totalExtras > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
            <span className="text-sm text-muted-foreground">Extras total ({rentalDays} days)</span>
            <span className="font-bold">${totalExtras}</span>
          </div>
        )}
        
        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center pt-2">
          {REVENUE_COMPLIANCE.extras}
        </p>
      </CardContent>
    </Card>
  );
}
