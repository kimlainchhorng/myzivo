import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Crown, 
  Star, 
  Sparkles, 
  Check, 
  X,
  Luggage,
  Coffee,
  Wifi,
  Armchair,
  Car,
  ShieldCheck,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FareClass {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
  features: {
    label: string;
    included: boolean;
    detail?: string;
  }[];
  highlights: string[];
  icon: React.ReactNode;
  accentColor: string;
  popular?: boolean;
}

const fareClasses: FareClass[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Essential travel at great value',
    priceMultiplier: 1,
    features: [
      { label: 'Carry-on bag (8kg)', included: true },
      { label: 'Personal item', included: true },
      { label: 'Checked bag', included: false, detail: 'Add from $35' },
      { label: 'Seat selection', included: false, detail: 'Add from $15' },
      { label: 'In-flight meals', included: false, detail: 'Purchase onboard' },
      { label: 'Priority boarding', included: false },
      { label: 'Flight changes', included: false, detail: 'Fee applies' },
      { label: 'Refundable', included: false }
    ],
    highlights: ['Best value', 'Standard legroom'],
    icon: <Sparkles className="w-5 h-5" />,
    accentColor: 'emerald'
  },
  {
    id: 'premium-economy',
    name: 'Premium Economy',
    description: 'Extra comfort for longer journeys',
    priceMultiplier: 1.6,
    features: [
      { label: 'Carry-on bag (10kg)', included: true },
      { label: 'Personal item', included: true },
      { label: 'Checked bag (23kg)', included: true },
      { label: 'Seat selection', included: true, detail: 'Standard seats' },
      { label: 'Premium meals', included: true },
      { label: 'Priority boarding', included: true },
      { label: 'Flight changes', included: true, detail: 'Reduced fee' },
      { label: 'Refundable', included: false }
    ],
    highlights: ['Extra legroom (34")', 'Larger screens', 'Premium meals'],
    icon: <Star className="w-5 h-5" />,
    accentColor: 'sky',
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    description: 'The complete premium experience',
    priceMultiplier: 3.2,
    features: [
      { label: 'Carry-on + personal item', included: true },
      { label: '2 checked bags (32kg each)', included: true },
      { label: 'Any seat selection', included: true },
      { label: 'Gourmet dining', included: true },
      { label: 'Lounge access', included: true },
      { label: 'Priority everything', included: true },
      { label: 'Free flight changes', included: true },
      { label: 'Full refund option', included: true }
    ],
    highlights: ['Lie-flat seats', 'Lounge access', 'Fast track security'],
    icon: <Crown className="w-5 h-5" />,
    accentColor: 'amber'
  },
  {
    id: 'first',
    name: 'First Class',
    description: 'Ultimate luxury in the sky',
    priceMultiplier: 6.5,
    features: [
      { label: 'Unlimited baggage', included: true },
      { label: 'Private suite', included: true },
      { label: 'Chauffeur service', included: true },
      { label: 'Fine dining', included: true },
      { label: 'Private lounge', included: true },
      { label: 'Concierge service', included: true },
      { label: 'Anytime changes', included: true },
      { label: 'Full flexibility', included: true }
    ],
    highlights: ['Private suite', 'Onboard shower', 'Personal concierge'],
    icon: <Crown className="w-5 h-5" />,
    accentColor: 'rose'
  }
];

interface FareClassSelectorProps {
  selectedFare: string;
  onSelectFare: (fareId: string) => void;
  basePrice: number;
  compact?: boolean;
}

const FareClassSelector = ({ 
  selectedFare, 
  onSelectFare, 
  basePrice,
  compact = false
}: FareClassSelectorProps) => {
  const getAccentClasses = (color: string, selected: boolean) => {
    const colors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
      emerald: {
        bg: selected ? 'bg-emerald-500/10' : 'bg-card/60',
        border: selected ? 'border-emerald-500' : 'border-border/50',
        text: 'text-emerald-500',
        glow: 'shadow-emerald-500/30'
      },
      sky: {
        bg: selected ? 'bg-sky-500/10' : 'bg-card/60',
        border: selected ? 'border-sky-500' : 'border-border/50',
        text: 'text-sky-500',
        glow: 'shadow-sky-500/30'
      },
      amber: {
        bg: selected ? 'bg-amber-500/10' : 'bg-card/60',
        border: selected ? 'border-amber-500' : 'border-border/50',
        text: 'text-amber-500',
        glow: 'shadow-amber-500/30'
      },
      rose: {
        bg: selected ? 'bg-rose-500/10' : 'bg-card/60',
        border: selected ? 'border-rose-500' : 'border-border/50',
        text: 'text-rose-500',
        glow: 'shadow-rose-500/30'
      }
    };
    return colors[color] || colors.sky;
  };

  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {fareClasses.map((fare) => {
          const isSelected = selectedFare === fare.id;
          const colors = getAccentClasses(fare.accentColor, isSelected);
          const price = Math.round(basePrice * fare.priceMultiplier);
          
          return (
            <button
              key={fare.id}
              onClick={() => onSelectFare(fare.id)}
              className={cn(
                "flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all duration-200",
                colors.bg,
                colors.border,
                isSelected && `shadow-lg ${colors.glow}`
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("p-1 rounded-xl", isSelected ? colors.text : 'text-muted-foreground')}>
                  {fare.icon}
                </span>
                <span className="font-semibold text-sm">{fare.name}</span>
                {fare.popular && (
                  <Badge className="bg-sky-500/20 text-sky-500 text-[9px] px-1.5 py-0">
                    Popular
                  </Badge>
                )}
              </div>
              <p className={cn("text-xl font-bold", colors.text)}>${price}</p>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {fareClasses.map((fare) => {
        const isSelected = selectedFare === fare.id;
        const colors = getAccentClasses(fare.accentColor, isSelected);
        const price = Math.round(basePrice * fare.priceMultiplier);
        
        return (
          <Card
            key={fare.id}
            onClick={() => onSelectFare(fare.id)}
            className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02]",
              colors.bg,
              isSelected ? `border-2 ${colors.border} shadow-xl ${colors.glow}` : 'border border-border/50 hover:border-sky-500/50'
            )}
          >
            {fare.popular && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-sky-500 text-white text-xs font-semibold rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isSelected ? `${colors.text} bg-current/10` : 'bg-muted text-muted-foreground'
                )}>
                  {fare.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{fare.name}</h3>
                  <p className="text-xs text-muted-foreground">{fare.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4 pb-4 border-b border-border/50">
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-3xl font-bold", colors.text)}>${price}</span>
                  <span className="text-sm text-muted-foreground">/person</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {fare.features.slice(0, 5).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <span className={cn(
                      feature.included ? 'text-foreground' : 'text-muted-foreground/70'
                    )}>
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-1.5">
                {fare.highlights.map((highlight, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium",
                      isSelected && colors.border
                    )}
                  >
                    {highlight}
                  </Badge>
                ))}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-1",
                  `bg-${fare.accentColor}-500`
                )} />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export { fareClasses };
export default FareClassSelector;
