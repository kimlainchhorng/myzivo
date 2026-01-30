import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  Plane,
  Building2,
  Car,
  Utensils,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  TrendingDown,
  Star,
  Clock,
  Check,
  Plus,
  Minus,
  Shield,
  Wifi,
  Coffee
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageOption {
  id: string;
  name: string;
  destination: string;
  image: string;
  duration: string;
  includes: {
    flights: boolean;
    hotel: boolean;
    carRental: boolean;
    meals: boolean;
    tours: boolean;
  };
  basePrice: number;
  discountPercent: number;
  rating: number;
  reviews: number;
  highlights: string[];
}

interface TravelPackagesProps {
  origin?: string;
  className?: string;
}

const PACKAGES: PackageOption[] = [
  {
    id: 'pkg-1',
    name: 'Tropical Paradise',
    destination: 'Bali, Indonesia',
    image: '🏝️',
    duration: '7 nights',
    includes: { flights: true, hotel: true, carRental: false, meals: true, tours: true },
    basePrice: 2499,
    discountPercent: 25,
    rating: 4.9,
    reviews: 342,
    highlights: ['Luxury villa', 'Spa included', 'Temple tours', 'Private driver']
  },
  {
    id: 'pkg-2',
    name: 'European Adventure',
    destination: 'Paris & Rome',
    image: '🗼',
    duration: '10 nights',
    includes: { flights: true, hotel: true, carRental: true, meals: false, tours: true },
    basePrice: 3899,
    discountPercent: 20,
    rating: 4.8,
    reviews: 256,
    highlights: ['Eiffel Tower access', 'Colosseum VIP', 'Train transfers', 'City guides']
  },
  {
    id: 'pkg-3',
    name: 'Safari Experience',
    destination: 'Kenya & Tanzania',
    image: '🦁',
    duration: '8 nights',
    includes: { flights: true, hotel: true, carRental: false, meals: true, tours: true },
    basePrice: 4299,
    discountPercent: 15,
    rating: 4.9,
    reviews: 189,
    highlights: ['Game drives', 'Luxury lodges', 'Hot air balloon', 'All meals']
  },
  {
    id: 'pkg-4',
    name: 'Island Hopping',
    destination: 'Greek Islands',
    image: '⛵',
    duration: '9 nights',
    includes: { flights: true, hotel: true, carRental: false, meals: true, tours: true },
    basePrice: 3199,
    discountPercent: 22,
    rating: 4.7,
    reviews: 421,
    highlights: ['Santorini sunset', 'Mykonos parties', 'Ferry transfers', 'Wine tasting']
  },
];

const ADD_ONS = [
  { id: 'insurance', name: 'Travel Insurance', icon: Shield, price: 89 },
  { id: 'wifi', name: 'Global WiFi Device', icon: Wifi, price: 49 },
  { id: 'lounge', name: 'Airport Lounge Access', icon: Coffee, price: 75 },
];

export const TravelPackages = ({
  origin = "New York",
  className
}: TravelPackagesProps) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [travelers, setTravelers] = useState(2);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(['insurance']);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const selected = PACKAGES.find(p => p.id === selectedPackage);
  
  const calculateTotal = (pkg: PackageOption) => {
    const discountedPrice = pkg.basePrice * (1 - pkg.discountPercent / 100);
    const addOnsTotal = ADD_ONS
      .filter(a => selectedAddOns.includes(a.id))
      .reduce((acc, a) => acc + a.price, 0);
    return Math.round((discountedPrice + addOnsTotal) * travelers);
  };

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Travel Packages</CardTitle>
              <p className="text-sm text-muted-foreground">
                Bundle & save up to 25% on complete vacation packages
              </p>
            </div>
          </div>

          {/* Traveler Counter */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
            <Users className="w-4 h-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setTravelers(Math.max(1, travelers - 1))}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="font-medium w-4 text-center">{travelers}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setTravelers(Math.min(10, travelers + 1))}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Package Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {PACKAGES.map((pkg, i) => (
            <motion.button
              key={pkg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedPackage(pkg.id)}
              className={cn(
                "relative p-4 rounded-xl border text-left transition-all",
                selectedPackage === pkg.id
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border/50 hover:border-border bg-card/30"
              )}
            >
              {/* Discount Badge */}
              <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white">
                <TrendingDown className="w-3 h-3 mr-1" />
                {pkg.discountPercent}% OFF
              </Badge>

              <div className="flex items-start gap-3">
                <div className="text-4xl">{pkg.image}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{pkg.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {pkg.destination}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {pkg.duration}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {pkg.rating}
                    </div>
                  </div>
                </div>
              </div>

              {/* Includes Icons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                {pkg.includes.flights && (
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center" title="Flights">
                    <Plane className="w-3 h-3 text-sky-400" />
                  </div>
                )}
                {pkg.includes.hotel && (
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center" title="Hotel">
                    <Building2 className="w-3 h-3 text-violet-400" />
                  </div>
                )}
                {pkg.includes.carRental && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center" title="Car">
                    <Car className="w-3 h-3 text-emerald-400" />
                  </div>
                )}
                {pkg.includes.meals && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center" title="Meals">
                    <Utensils className="w-3 h-3 text-amber-400" />
                  </div>
                )}
                <div className="flex-1" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground line-through">
                    ${pkg.basePrice}
                  </p>
                  <p className="font-bold text-emerald-400">
                    ${Math.round(pkg.basePrice * (1 - pkg.discountPercent / 100))}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected Package Details */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold">{selected.name} Highlights</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selected.highlights.map((highlight, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {highlight}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Add-ons */}
        <div className="rounded-xl border border-border/50 p-4 mb-4">
          <h4 className="font-semibold mb-3">Enhance Your Trip</h4>
          <div className="space-y-2">
            {ADD_ONS.map(addon => (
              <button
                key={addon.id}
                onClick={() => toggleAddOn(addon.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                  selectedAddOns.includes(addon.id)
                    ? "bg-primary/10 border border-primary/40"
                    : "bg-muted/30 border border-transparent hover:border-border"
                )}
              >
                <Checkbox checked={selectedAddOns.includes(addon.id)} />
                <addon.icon className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-left text-sm">{addon.name}</span>
                <span className="font-medium">+${addon.price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Total & Book */}
        <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total for {travelers} traveler{travelers > 1 ? 's' : ''}</p>
              {selected && (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-amber-400">
                    ${calculateTotal(selected).toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${(selected.basePrice * travelers).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <Button
              size="lg"
              disabled={!selected}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Package className="w-4 h-4 mr-2" />
              Book Package
            </Button>
          </div>
          {selected && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              You save ${((selected.basePrice * travelers) - calculateTotal(selected)).toLocaleString()} with this bundle!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelPackages;
