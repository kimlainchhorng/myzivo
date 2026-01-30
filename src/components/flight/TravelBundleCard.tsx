import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  Plane,
  Building2,
  Car,
  TrendingDown,
  Shield,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface TravelBundleCardProps {
  flightPrice: number;
  origin: string;
  destination: string;
  departDate?: Date;
  returnDate?: Date;
  passengers?: number;
  className?: string;
}

interface BundleOption {
  id: string;
  name: string;
  icon: React.ElementType;
  basePrice: number;
  discountPercent: number;
  features: string[];
  route: string;
}

export const TravelBundleCard = ({
  flightPrice,
  origin,
  destination,
  departDate,
  returnDate,
  passengers = 1,
  className,
}: TravelBundleCardProps) => {
  const navigate = useNavigate();
  const [selectedBundles, setSelectedBundles] = useState<string[]>([]);

  const bundles: BundleOption[] = [
    {
      id: 'hotel',
      name: 'Hotel Stay',
      icon: Building2,
      basePrice: Math.round(flightPrice * 0.8),
      discountPercent: 15,
      features: ['3-5★ hotels', 'Free cancellation', 'Breakfast included'],
      route: '/book-hotel',
    },
    {
      id: 'car',
      name: 'Car Rental',
      icon: Car,
      basePrice: Math.round(flightPrice * 0.4),
      discountPercent: 20,
      features: ['All car classes', 'Unlimited miles', 'Full insurance'],
      route: '/book-car',
    },
  ];

  const toggleBundle = (id: string) => {
    setSelectedBundles(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const calculateSavings = () => {
    return bundles
      .filter(b => selectedBundles.includes(b.id))
      .reduce((acc, b) => acc + Math.round(b.basePrice * (b.discountPercent / 100)), 0);
  };

  const calculateBundleTotal = () => {
    const bundlesCost = bundles
      .filter(b => selectedBundles.includes(b.id))
      .reduce((acc, b) => acc + Math.round(b.basePrice * (1 - b.discountPercent / 100)), 0);
    return (flightPrice + bundlesCost) * passengers;
  };

  const handleNavigateToBundle = (route: string) => {
    // Store flight context for the bundle booking
    sessionStorage.setItem('bundleContext', JSON.stringify({
      origin,
      destination,
      departDate,
      returnDate,
      passengers,
      flightPrice,
    }));
    navigate(route);
  };

  if (selectedBundles.length === 0) {
    return (
      <Card className={cn("overflow-hidden border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-blue-500/5", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                Bundle & Save
                <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Up to 20% off</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">Add hotel or car rental to your flight</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {bundles.map((bundle) => (
              <motion.button
                key={bundle.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleBundle(bundle.id)}
                className={cn(
                  "relative p-4 rounded-xl border text-left transition-all",
                  selectedBundles.includes(bundle.id)
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : "border-border/50 hover:border-border bg-card/30"
                )}
              >
                <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px]">
                  <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                  {bundle.discountPercent}% off
                </Badge>

                <bundle.icon className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="font-medium">{bundle.name}</p>
                <p className="text-sm text-muted-foreground">
                  From ${Math.round(bundle.basePrice * (1 - bundle.discountPercent / 100))}
                </p>

                <div className="mt-3 space-y-1">
                  {bundle.features.slice(0, 2).map((feature, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-semibold">Your Bundle</h4>
              <p className="text-sm text-emerald-400">Save ${calculateSavings()} total</p>
            </div>
          </div>
          <Badge className="bg-emerald-500 text-white">
            <TrendingDown className="w-3 h-3 mr-1" />
            Bundle Discount
          </Badge>
        </div>

        {/* Selected bundles */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-500/10 border border-sky-500/30">
            <Plane className="w-5 h-5 text-sky-400" />
            <div className="flex-1">
              <p className="font-medium text-sm">Flight</p>
              <p className="text-xs text-muted-foreground">{origin} → {destination}</p>
            </div>
            <span className="font-bold">${flightPrice}</span>
          </div>

          {bundles
            .filter(b => selectedBundles.includes(b.id))
            .map((bundle) => (
              <div 
                key={bundle.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <bundle.icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{bundle.name}</p>
                  <p className="text-xs text-emerald-400">-{bundle.discountPercent}% bundle discount</p>
                </div>
                <div className="text-right">
                  <span className="font-bold">${Math.round(bundle.basePrice * (1 - bundle.discountPercent / 100))}</span>
                  <p className="text-xs text-muted-foreground line-through">${bundle.basePrice}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBundle(bundle.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Remove
                </Button>
              </div>
            ))}
        </div>

        {/* Total */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total for {passengers} traveler{passengers > 1 ? 's' : ''}</p>
              <p className="text-2xl font-bold">${calculateBundleTotal().toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                You save ${calculateSavings() * passengers}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setSelectedBundles([])}
          >
            Clear Bundle
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            onClick={() => {
              const firstBundle = bundles.find(b => selectedBundles.includes(b.id));
              if (firstBundle) {
                handleNavigateToBundle(firstBundle.route);
              }
            }}
          >
            Continue with Bundle
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelBundleCard;
