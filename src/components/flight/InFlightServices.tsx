import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UtensilsCrossed,
  Wifi,
  Tv,
  Music,
  Coffee,
  Wine,
  Salad,
  Baby,
  Leaf,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Clock,
  CheckCircle2,
  Plus,
  Minus,
  Gift,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface MealOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietary: string[];
  image?: string;
  popular?: boolean;
}

interface EntertainmentPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  icon: typeof Tv;
}

interface WifiPackage {
  id: string;
  name: string;
  speed: string;
  price: number;
  description: string;
  recommended?: boolean;
}

interface InFlightServicesProps {
  flightDuration: string;
  passengers: number;
  cabinClass: string;
  onServicesChange: (services: {
    meals: { passengerId: number; mealId: string }[];
    wifi: string | null;
    entertainment: string | null;
    extras: string[];
  }) => void;
}

const mealOptions: MealOption[] = [
  {
    id: "meal_chicken",
    name: "Grilled Herb Chicken",
    description: "Tender chicken breast with roasted vegetables and herb butter sauce",
    price: 18,
    category: "main",
    dietary: [],
    popular: true,
  },
  {
    id: "meal_beef",
    name: "Braised Beef Short Rib",
    description: "Slow-cooked beef with mashed potatoes and red wine jus",
    price: 24,
    category: "main",
    dietary: [],
  },
  {
    id: "meal_salmon",
    name: "Atlantic Salmon",
    description: "Pan-seared salmon with quinoa and lemon dill sauce",
    price: 22,
    category: "main",
    dietary: ["pescatarian"],
  },
  {
    id: "meal_vegan",
    name: "Buddha Bowl",
    description: "Quinoa, roasted chickpeas, avocado, and tahini dressing",
    price: 16,
    category: "main",
    dietary: ["vegan", "vegetarian"],
    popular: true,
  },
  {
    id: "meal_pasta",
    name: "Truffle Mushroom Pasta",
    description: "Fresh fettuccine with wild mushrooms and truffle cream",
    price: 20,
    category: "main",
    dietary: ["vegetarian"],
  },
  {
    id: "meal_kids",
    name: "Kids Meal Box",
    description: "Chicken nuggets, fries, fruit, and a cookie",
    price: 12,
    category: "kids",
    dietary: [],
  },
  {
    id: "snack_cheese",
    name: "Artisan Cheese Board",
    description: "Selection of fine cheeses with crackers and fruits",
    price: 14,
    category: "snack",
    dietary: ["vegetarian"],
  },
  {
    id: "snack_fruit",
    name: "Fresh Fruit Platter",
    description: "Seasonal fresh fruits with honey yogurt",
    price: 10,
    category: "snack",
    dietary: ["vegan", "vegetarian"],
  },
];

const wifiPackages: WifiPackage[] = [
  {
    id: "wifi_basic",
    name: "Basic Browsing",
    speed: "2 Mbps",
    price: 8,
    description: "Email, messaging, and light browsing",
  },
  {
    id: "wifi_standard",
    name: "Standard",
    speed: "10 Mbps",
    price: 15,
    description: "Streaming, video calls, and downloads",
    recommended: true,
  },
  {
    id: "wifi_premium",
    name: "Premium Unlimited",
    speed: "50+ Mbps",
    price: 25,
    description: "Blazing fast, unlimited data, HD streaming",
  },
];

const entertainmentPackages: EntertainmentPackage[] = [
  {
    id: "ent_movies",
    name: "Movie Bundle",
    description: "Access to 200+ new releases and classics",
    price: 12,
    duration: "Full flight",
    features: ["New releases", "4K streaming", "Multiple genres"],
    icon: Tv,
  },
  {
    id: "ent_music",
    name: "Music Premium",
    description: "Ad-free music with offline downloads",
    price: 6,
    duration: "Full flight",
    features: ["50M+ songs", "Podcasts", "Curated playlists"],
    icon: Music,
  },
  {
    id: "ent_complete",
    name: "Complete Entertainment",
    description: "Movies, music, games, and exclusive content",
    price: 18,
    duration: "Full flight",
    features: ["All movies", "Music", "Games", "Live TV"],
    icon: Sparkles,
  },
];

const extraServices = [
  { id: "extra_blanket", name: "Premium Blanket & Pillow", price: 15, Icon: Coffee },
  { id: "extra_amenity", name: "Amenity Kit", price: 20, Icon: Sparkles },
  { id: "extra_champagne", name: "Welcome Champagne", price: 35, Icon: Wine },
  { id: "extra_flowers", name: "Celebration Flowers", price: 45, Icon: Heart },
];

const InFlightServices = ({
  flightDuration,
  passengers,
  cabinClass,
  onServicesChange,
}: InFlightServicesProps) => {
  const [selectedMeals, setSelectedMeals] = useState<{ passengerId: number; mealId: string }[]>([]);
  const [selectedWifi, setSelectedWifi] = useState<string | null>(null);
  const [selectedEntertainment, setSelectedEntertainment] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [mealFilter, setMealFilter] = useState<string>("all");
  const [activePassenger, setActivePassenger] = useState(0);

  const handleMealSelect = (passengerId: number, mealId: string) => {
    setSelectedMeals((prev) => {
      const existing = prev.findIndex((m) => m.passengerId === passengerId);
      if (existing >= 0) {
        if (prev[existing].mealId === mealId) {
          // Deselect
          return prev.filter((_, i) => i !== existing);
        }
        // Replace
        const updated = [...prev];
        updated[existing] = { passengerId, mealId };
        return updated;
      }
      // Add new
      return [...prev, { passengerId, mealId }];
    });
  };

  const handleExtrasToggle = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    );
  };

  const calculateTotal = () => {
    let total = 0;

    // Meals
    selectedMeals.forEach((selection) => {
      const meal = mealOptions.find((m) => m.id === selection.mealId);
      if (meal) total += meal.price;
    });

    // WiFi
    if (selectedWifi) {
      const wifi = wifiPackages.find((w) => w.id === selectedWifi);
      if (wifi) total += wifi.price;
    }

    // Entertainment
    if (selectedEntertainment) {
      const ent = entertainmentPackages.find((e) => e.id === selectedEntertainment);
      if (ent) total += ent.price;
    }

    // Extras
    selectedExtras.forEach((extraId) => {
      const extra = extraServices.find((e) => e.id === extraId);
      if (extra) total += extra.price;
    });

    return total;
  };

  const filteredMeals =
    mealFilter === "all"
      ? mealOptions
      : mealOptions.filter((meal) => meal.dietary.includes(mealFilter) || meal.category === mealFilter);

  const getPassengerMeal = (passengerId: number) => {
    const selection = selectedMeals.find((m) => m.passengerId === passengerId);
    return selection ? mealOptions.find((m) => m.id === selection.mealId) : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Pre-order In-Flight Services
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enhance your {flightDuration} flight • {cabinClass} class
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Order by 24h before departure
        </Badge>
      </div>

      <Tabs defaultValue="meals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meals" className="gap-1.5">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="hidden sm:inline">Meals</span>
          </TabsTrigger>
          <TabsTrigger value="wifi" className="gap-1.5">
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">Wi-Fi</span>
          </TabsTrigger>
          <TabsTrigger value="entertainment" className="gap-1.5">
            <Tv className="h-4 w-4" />
            <span className="hidden sm:inline">Entertainment</span>
          </TabsTrigger>
          <TabsTrigger value="extras" className="gap-1.5">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Extras</span>
          </TabsTrigger>
        </TabsList>

        {/* Meals Tab */}
        <TabsContent value="meals" className="space-y-4 mt-4">
          {/* Passenger Selector */}
          {passengers > 1 && (
            <Card className="border-dashed">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-sm text-muted-foreground flex-shrink-0">Select for:</span>
                  {Array.from({ length: passengers }).map((_, idx) => {
                    const meal = getPassengerMeal(idx);
                    return (
                      <Button
                        key={idx}
                        variant={activePassenger === idx ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActivePassenger(idx)}
                        className="gap-1.5 flex-shrink-0"
                      >
                        Passenger {idx + 1}
                        {meal && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dietary Filters */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {[
                { id: "all", label: "All", icon: UtensilsCrossed },
                { id: "main", label: "Main Courses", icon: UtensilsCrossed },
                { id: "snack", label: "Snacks", icon: Coffee },
                { id: "vegetarian", label: "Vegetarian", icon: Salad },
                { id: "vegan", label: "Vegan", icon: Leaf },
                { id: "kids", label: "Kids", icon: Baby },
              ].map((filter) => {
                const Icon = filter.icon;
                return (
                  <Button
                    key={filter.id}
                    variant={mealFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMealFilter(filter.id)}
                    className="gap-1.5"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {filter.label}
                  </Button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Meal Grid */}
          <div className="grid gap-3 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredMeals.map((meal) => {
                const isSelected = selectedMeals.some(
                  (m) => m.passengerId === activePassenger && m.mealId === meal.id
                );
                return (
                  <motion.div
                    key={meal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all overflow-hidden ${
                        isSelected
                          ? "ring-2 ring-primary shadow-lg"
                          : "hover:shadow-md hover:border-primary/30"
                      }`}
                      onClick={() => handleMealSelect(activePassenger, meal.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center"><UtensilsCrossed className="w-6 h-6 text-primary/60" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{meal.name}</span>
                                  {meal.popular && (
                                    <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {meal.description}
                                </p>
                              </div>
                              <span className="font-bold text-lg">${meal.price}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {meal.dietary.map((diet) => (
                                <Badge key={diet} variant="outline" className="text-[10px]">
                                  {diet === "vegan" && <Leaf className="h-3 w-3 mr-1" />}
                                  {diet === "vegetarian" && <Salad className="h-3 w-3 mr-1" />}
                                  {diet}
                                </Badge>
                              ))}
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Selected Meals Summary */}
          {selectedMeals.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Selected Meals</h4>
                <div className="space-y-2">
                  {Array.from({ length: passengers }).map((_, idx) => {
                    const meal = getPassengerMeal(idx);
                    return (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>Passenger {idx + 1}:</span>
                        <span className={meal ? "font-medium" : "text-muted-foreground"}>
                          {meal ? `${meal.name} ($${meal.price})` : "No meal selected"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* WiFi Tab */}
        <TabsContent value="wifi" className="space-y-4 mt-4">
          <RadioGroup value={selectedWifi || ""} onValueChange={setSelectedWifi}>
            <div className="grid gap-3 md:grid-cols-3">
              {wifiPackages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative cursor-pointer transition-all ${
                    selectedWifi === pkg.id
                      ? "ring-2 ring-primary shadow-lg"
                      : "hover:shadow-md hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedWifi(pkg.id)}
                >
                  {pkg.recommended && (
                    <Badge className="absolute -top-2 right-3 bg-emerald-500">
                      Recommended
                    </Badge>
                  )}
                  <CardContent className="p-5 text-center">
                    <RadioGroupItem value={pkg.id} className="sr-only" />
                    <Wifi className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold">{pkg.name}</h3>
                    <p className="text-2xl font-bold mt-2">${pkg.price}</p>
                    <Badge variant="outline" className="mt-2">
                      {pkg.speed}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-3">
                      {pkg.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>

          {selectedWifi && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedWifi(null)}
              className="w-full"
            >
              Remove WiFi Selection
            </Button>
          )}
        </TabsContent>

        {/* Entertainment Tab */}
        <TabsContent value="entertainment" className="space-y-4 mt-4">
          <RadioGroup
            value={selectedEntertainment || ""}
            onValueChange={setSelectedEntertainment}
          >
            <div className="grid gap-3 md:grid-cols-3">
              {entertainmentPackages.map((pkg) => {
                const Icon = pkg.icon;
                return (
                  <Card
                    key={pkg.id}
                    className={`cursor-pointer transition-all ${
                      selectedEntertainment === pkg.id
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:shadow-md hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedEntertainment(pkg.id)}
                  >
                    <CardContent className="p-5">
                      <RadioGroupItem value={pkg.id} className="sr-only" />
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{pkg.name}</h3>
                          <p className="text-xl font-bold">${pkg.price}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {pkg.description}
                      </p>
                      <div className="space-y-1.5">
                        {pkg.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </RadioGroup>

          {selectedEntertainment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEntertainment(null)}
              className="w-full"
            >
              Remove Entertainment Selection
            </Button>
          )}
        </TabsContent>

        {/* Extras Tab */}
        <TabsContent value="extras" className="space-y-4 mt-4">
          <div className="grid gap-3 md:grid-cols-2">
            {extraServices.map((extra) => {
              const isSelected = selectedExtras.includes(extra.id);
              return (
                <Card
                  key={extra.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-primary shadow-lg"
                      : "hover:shadow-md hover:border-primary/30"
                  }`}
                  onClick={() => handleExtrasToggle(extra.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={isSelected} className="pointer-events-none" />
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <extra.Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{extra.name}</span>
                      </div>
                      <span className="font-bold">+${extra.price}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Total Summary */}
      <AnimatePresence>
        {calculateTotal() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In-Flight Services Total</p>
                    <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedMeals.length > 0 && `${selectedMeals.length} meal(s)`}
                      {selectedWifi && " • WiFi"}
                      {selectedEntertainment && " • Entertainment"}
                      {selectedExtras.length > 0 && ` • ${selectedExtras.length} extra(s)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Pre-ordered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InFlightServices;
