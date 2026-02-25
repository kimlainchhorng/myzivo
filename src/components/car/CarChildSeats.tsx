import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Baby, Plus, Minus, Shield, Check, Info, Heart, User, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const seatTypes = [
  {
    id: "infant",
    name: "Infant Seat",
    ageRange: "0-12 months",
    weightRange: "Up to 22 lbs",
    price: 12,
    icon: "infant" as const,
    description: "Rear-facing infant carrier",
    features: ["5-point harness", "Base included", "Canopy"]
  },
  {
    id: "toddler",
    name: "Toddler Seat",
    ageRange: "1-4 years",
    weightRange: "22-40 lbs",
    price: 10,
    icon: "toddler" as const,
    description: "Convertible car seat",
    features: ["Forward/rear facing", "Adjustable headrest", "Cup holder"]
  },
  {
    id: "booster",
    name: "Booster Seat",
    ageRange: "4-8 years",
    weightRange: "40-100 lbs",
    price: 8,
    icon: "booster" as const,
    description: "High-back booster",
    features: ["Height adjustable", "Armrests", "Lightweight"]
  }
];

export default function CarChildSeats() {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    infant: 0,
    toddler: 0,
    booster: 0
  });

  const updateQuantity = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, Math.min(3, prev[id] + delta))
    }));
  };

  const totalSeats = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalCost = seatTypes.reduce((total, seat) => 
    total + (quantities[seat.id] * seat.price), 0
  );

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center">
              <Baby className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Child Safety Seats</CardTitle>
              <p className="text-sm text-muted-foreground">Certified car seats for all ages</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
            <Shield className="w-3 h-3 mr-1" />
            Safety Certified
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {seatTypes.map((seat) => (
          <div
            key={seat.id}
            className={cn(
              "p-4 rounded-xl border transition-all",
              quantities[seat.id] > 0
                ? "border-pink-500/50 bg-pink-500/5"
                : "border-border/50 bg-muted/20"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  {seat.icon === "infant" ? <Baby className="w-5 h-5 text-pink-400" /> : seat.icon === "toddler" ? <Heart className="w-5 h-5 text-pink-400" /> : <UserRound className="w-5 h-5 text-pink-400" />}
                </div>
                <div>
                  <h4 className="font-medium">{seat.name}</h4>
                  <p className="text-xs text-muted-foreground">{seat.ageRange} • {seat.weightRange}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${seat.price}/day</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{seat.description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {seat.features.map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs gap-1">
                  <Check className="w-3 h-3" />
                  {feature}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Quantity</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl active:scale-[0.90] transition-all duration-200 touch-manipulation"
                  onClick={() => updateQuantity(seat.id, -1)}
                  disabled={quantities[seat.id] === 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantities[seat.id]}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl active:scale-[0.90] transition-all duration-200 touch-manipulation"
                  onClick={() => updateQuantity(seat.id, 1)}
                  disabled={quantities[seat.id] >= 3}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {totalSeats > 0 && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{totalSeats} seat(s) selected</span>
              <span className="text-lg font-bold">+${totalCost}/day</span>
            </div>
            <Button className="w-full rounded-xl h-11 shadow-md active:scale-[0.97] transition-all duration-200 touch-manipulation">Add to Booking</Button>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/30 text-sm text-muted-foreground">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>All seats are professionally cleaned and inspected before each rental. Installation assistance available at pickup.</p>
        </div>
      </CardContent>
    </Card>
  );
}
