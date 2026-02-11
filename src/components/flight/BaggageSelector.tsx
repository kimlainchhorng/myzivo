import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Briefcase, ShoppingBag, Luggage, Plus, Minus, Check, Lightbulb, Package, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface BaggageOption {
  id: string;
  type: 'personal' | 'carry-on' | 'checked';
  name: string;
  description: string;
  weight: string;
  dimensions: string;
  price: number;
  included: boolean;
  icon: typeof Briefcase;
}

interface BaggageSelectorProps {
  fareClass: 'economy' | 'premium-economy' | 'business' | 'first';
  onBaggageChange: (baggage: { [key: string]: number }) => void;
  selectedBaggage?: { [key: string]: number };
}

const getBaggageOptions = (fareClass: string): BaggageOption[] => {
  const isEconomy = fareClass === 'economy';
  const isPremium = fareClass === 'premium-economy';
  const isBusiness = fareClass === 'business';
  const isFirst = fareClass === 'first';
  
  return [
    {
      id: 'personal',
      type: 'personal',
      name: 'Personal Item',
      description: 'Fits under the seat in front of you',
      weight: '10 kg',
      dimensions: '40 × 30 × 15 cm',
      price: 0,
      included: true,
      icon: Briefcase
    },
    {
      id: 'carry-on',
      type: 'carry-on',
      name: 'Carry-On Bag',
      description: 'Fits in the overhead bin',
      weight: '12 kg',
      dimensions: '55 × 40 × 23 cm',
      price: isEconomy ? 35 : 0,
      included: !isEconomy,
      icon: ShoppingBag
    },
    {
      id: 'checked-1',
      type: 'checked',
      name: 'Checked Bag (23kg)',
      description: 'Standard checked luggage',
      weight: '23 kg',
      dimensions: '158 cm total',
      price: isEconomy ? 45 : isPremium ? 0 : 0,
      included: isBusiness || isFirst || isPremium,
      icon: Luggage
    },
    {
      id: 'checked-2',
      type: 'checked',
      name: 'Checked Bag (32kg)',
      description: 'Heavy checked luggage',
      weight: '32 kg',
      dimensions: '158 cm total',
      price: isEconomy ? 65 : isPremium ? 45 : isBusiness ? 0 : 0,
      included: isFirst,
      icon: Luggage
    },
    {
      id: 'extra-checked',
      type: 'checked',
      name: 'Extra Checked Bag',
      description: 'Additional checked bag',
      weight: '23 kg',
      dimensions: '158 cm total',
      price: isEconomy ? 75 : isPremium ? 55 : isBusiness ? 45 : 35,
      included: false,
      icon: Luggage
    }
  ];
};

export default function BaggageSelector({ 
  fareClass, 
  onBaggageChange,
  selectedBaggage = {}
}: BaggageSelectorProps) {
  const [baggage, setBaggage] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    getBaggageOptions(fareClass).forEach(opt => {
      initial[opt.id] = opt.included ? 1 : 0;
    });
    return { ...initial, ...selectedBaggage };
  });

  const options = getBaggageOptions(fareClass);

  const updateBaggage = (id: string, delta: number) => {
    const option = options.find(o => o.id === id);
    if (!option) return;
    
    const newValue = Math.max(option.included ? 1 : 0, Math.min(3, (baggage[id] || 0) + delta));
    const newBaggage = { ...baggage, [id]: newValue };
    setBaggage(newBaggage);
    onBaggageChange(newBaggage);
  };

  const getTotalPrice = () => {
    return options.reduce((total, opt) => {
      const count = baggage[opt.id] || 0;
      const paidCount = opt.included ? Math.max(0, count - 1) : count;
      return total + (paidCount * opt.price);
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
        <p className="text-sm text-primary">
          <Lightbulb className="w-4 h-4 inline mr-1.5 -mt-0.5" />Pre-booking baggage saves up to 40% compared to airport prices
        </p>
      </div>

      {/* Baggage options */}
      <div className="space-y-3">
        {options.map((option) => {
          const Icon = option.icon;
          const count = baggage[option.id] || 0;
          const isIncluded = option.included && count > 0;
          
          return (
            <div
              key={option.id}
              className={cn(
                "p-4 rounded-xl border transition-all",
                count > 0 
                  ? "bg-card border-primary/30" 
                  : "bg-card/50 border-border/50 hover:border-border"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  count > 0 ? "bg-primary/20" : "bg-muted/50"
                )}>
                  <Icon className={cn(
                    "w-6 h-6",
                    count > 0 ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{option.name}</h4>
                    {isIncluded && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <Check className="w-3 h-3 mr-1" />
                        Included
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" />{option.weight}</span>
                    <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{option.dimensions}</span>
                  </div>
                </div>

                {/* Price & quantity */}
                <div className="text-right">
                  {option.price > 0 ? (
                    <p className="font-semibold text-lg">${option.price}</p>
                  ) : (
                    <p className="text-sm text-emerald-400">Free</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateBaggage(option.id, -1)}
                      disabled={option.included ? count <= 1 : count <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center font-medium">{count}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateBaggage(option.id, 1)}
                      disabled={count >= 3}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Additional baggage total</p>
            <p className="text-2xl font-bold">
              {getTotalPrice() > 0 ? `$${getTotalPrice()}` : 'No extra charges'}
            </p>
          </div>
          <Button className="bg-primary">
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
