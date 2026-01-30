import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  X,
  Wifi,
  Tv,
  Coffee,
  Luggage,
  Power,
  Wine,
  Utensils,
  Bed,
  Armchair,
  BabyIcon,
  PlaneTakeoff,
  Star,
  Crown,
  Sparkles,
  ChevronDown,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAirlineLogo } from "@/data/airlines";

interface AirlineAmenities {
  airline: string;
  airlineCode: string;
  category: "premium" | "full-service" | "low-cost";
  fareClass: string;
  price: number;
  amenities: {
    wifi: boolean | "premium" | "basic";
    entertainment: boolean | "premium";
    meals: boolean | "premium" | "snacks";
    drinks: boolean | "premium" | "basic";
    power: boolean;
    seatPitch: string;
    seatWidth: string;
    recline: string;
    loungeAccess: boolean;
    priorityBoarding: boolean;
    checkedBaggage: string;
    carryOn: string;
    seatSelection: boolean | "premium";
    changePolicy: "free" | "fee" | "none";
    refundPolicy: "full" | "partial" | "none";
  };
}

interface FlightAmenityComparisonProps {
  flights: AirlineAmenities[];
  onSelect?: (flight: AirlineAmenities) => void;
  className?: string;
}

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  entertainment: Tv,
  meals: Utensils,
  drinks: Wine,
  power: Power,
  loungeAccess: Crown,
  priorityBoarding: PlaneTakeoff,
};

const categoryColors = {
  premium: "from-amber-500/20 to-yellow-500/10 border-amber-500/40",
  "full-service": "from-sky-500/20 to-blue-500/10 border-sky-500/40",
  "low-cost": "from-emerald-500/20 to-teal-500/10 border-emerald-500/40",
};

const categoryBadges = {
  premium: { color: "bg-amber-500/20 text-amber-400 border-amber-500/40", icon: Crown },
  "full-service": { color: "bg-sky-500/20 text-sky-400 border-sky-500/40", icon: Star },
  "low-cost": { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", icon: Sparkles },
};

const renderAmenityValue = (value: boolean | string | undefined, type: string) => {
  if (value === true) {
    return <Check className="w-5 h-5 text-emerald-500" />;
  }
  if (value === false || value === undefined) {
    return <X className="w-5 h-5 text-red-500/60" />;
  }
  if (value === "premium") {
    return (
      <div className="flex items-center gap-1">
        <Check className="w-4 h-4 text-amber-500" />
        <span className="text-xs text-amber-500 font-medium">Premium</span>
      </div>
    );
  }
  if (value === "basic") {
    return (
      <div className="flex items-center gap-1">
        <Check className="w-4 h-4 text-sky-500" />
        <span className="text-xs text-sky-500 font-medium">Basic</span>
      </div>
    );
  }
  if (value === "snacks") {
    return (
      <div className="flex items-center gap-1">
        <Coffee className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Snacks</span>
      </div>
    );
  }
  if (value === "free") {
    return <span className="text-xs text-emerald-500 font-semibold">Free</span>;
  }
  if (value === "fee") {
    return <span className="text-xs text-amber-500 font-medium">Fee</span>;
  }
  if (value === "full") {
    return <span className="text-xs text-emerald-500 font-semibold">Full</span>;
  }
  if (value === "partial") {
    return <span className="text-xs text-amber-500 font-medium">Partial</span>;
  }
  if (value === "none") {
    return <span className="text-xs text-red-500/60">None</span>;
  }
  return <span className="text-sm font-medium">{value}</span>;
};

export const FlightAmenityComparison = ({
  flights,
  onSelect,
  className,
}: FlightAmenityComparisonProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("comfort");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const sections = [
    {
      id: "comfort",
      title: "Seat & Comfort",
      items: [
        { key: "seatPitch", label: "Seat Pitch" },
        { key: "seatWidth", label: "Seat Width" },
        { key: "recline", label: "Recline" },
        { key: "power", label: "Power Outlet" },
      ],
    },
    {
      id: "entertainment",
      title: "Entertainment & Connectivity",
      items: [
        { key: "wifi", label: "Wi-Fi" },
        { key: "entertainment", label: "IFE System" },
      ],
    },
    {
      id: "food",
      title: "Food & Beverage",
      items: [
        { key: "meals", label: "Meals" },
        { key: "drinks", label: "Drinks" },
      ],
    },
    {
      id: "baggage",
      title: "Baggage",
      items: [
        { key: "checkedBaggage", label: "Checked Bag" },
        { key: "carryOn", label: "Carry-On" },
      ],
    },
    {
      id: "extras",
      title: "Extras & Policies",
      items: [
        { key: "loungeAccess", label: "Lounge Access" },
        { key: "priorityBoarding", label: "Priority Boarding" },
        { key: "seatSelection", label: "Seat Selection" },
        { key: "changePolicy", label: "Changes" },
        { key: "refundPolicy", label: "Refunds" },
      ],
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-sky-500" />
            Compare Airlines
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Side-by-side comparison of amenities and services
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1.5">
          {flights.length} flights compared
        </Badge>
      </div>

      {/* Airline Headers */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${flights.length}, 1fr)` }}>
        <div className="h-full" /> {/* Empty corner cell */}
        
        {flights.map((flight, index) => {
          const CategoryIcon = categoryBadges[flight.category].icon;
          return (
            <motion.div
              key={`${flight.airlineCode}-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-xl p-4 bg-gradient-to-br border cursor-pointer transition-all duration-300",
                categoryColors[flight.category],
                selectedIndex === index && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              onClick={() => {
                setSelectedIndex(index);
                onSelect?.(flight);
              }}
            >
              <Badge
                className={cn(
                  "absolute -top-2 right-2 text-xs",
                  categoryBadges[flight.category].color
                )}
              >
                <CategoryIcon className="w-3 h-3 mr-1" />
                {flight.category === "premium"
                  ? "Premium"
                  : flight.category === "full-service"
                  ? "Full-Service"
                  : "Low-Cost"}
              </Badge>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={getAirlineLogo(flight.airlineCode)}
                  alt={flight.airline}
                  className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                />
                <div>
                  <p className="font-semibold text-sm line-clamp-1">{flight.airline}</p>
                  <p className="text-xs text-muted-foreground">{flight.fareClass}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">${flight.price}</span>
                <span className="text-sm text-muted-foreground">/person</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
            <button
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
              onClick={() =>
                setExpandedSection(expandedSection === section.id ? null : section.id)
              }
            >
              <span className="font-semibold text-sm">{section.title}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSection === section.id && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {expandedSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Separator />
                  <div className="p-4 space-y-2">
                    {section.items.map((item) => (
                      <div
                        key={item.key}
                        className="grid gap-4 py-2"
                        style={{
                          gridTemplateColumns: `200px repeat(${flights.length}, 1fr)`,
                        }}
                      >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {amenityIcons[item.key] && (
                            <span className="w-4 h-4">
                              {(() => {
                                const Icon = amenityIcons[item.key];
                                return Icon ? <Icon className="w-4 h-4" /> : null;
                              })()}
                            </span>
                          )}
                          {item.label}
                        </div>
                        {flights.map((flight, index) => (
                          <div
                            key={`${flight.airlineCode}-${item.key}`}
                            className={cn(
                              "flex items-center justify-center py-1 rounded-lg",
                              selectedIndex === index && "bg-primary/5"
                            )}
                          >
                            {renderAmenityValue(
                              flight.amenities[item.key as keyof typeof flight.amenities],
                              item.key
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* Select Button */}
      {selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30"
            onClick={() => onSelect?.(flights[selectedIndex])}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Select {flights[selectedIndex].airline}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default FlightAmenityComparison;
