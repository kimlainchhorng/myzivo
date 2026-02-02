import { useState } from "react";
import { Scale, X, Plus, Users, Briefcase, Fuel, Zap, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brandedCarModels, BrandedCarModel } from "@/config/photos";

interface CompareCar extends BrandedCarModel {
  price: number;
  features: string[];
}

// Extend branded models with pricing and features for comparison
const sampleCars: CompareCar[] = [
  { ...brandedCarModels.find(c => c.id === "toyota-rav4")!, price: 65, features: ["GPS", "Bluetooth", "Cruise Control"] },
  { ...brandedCarModels.find(c => c.id === "tesla-model3")!, price: 89, features: ["Autopilot", "Supercharger", "Premium Sound"] },
  { ...brandedCarModels.find(c => c.id === "jeep-wrangler")!, price: 95, features: ["4WD", "Removable Top", "Off-Road"] },
].filter(c => c.brand); // Filter out any undefined

const CarCompareWidget = () => {
  const [compareList, setCompareList] = useState<CompareCar[]>(sampleCars.slice(0, 2));

  const addToCompare = (car: CompareCar) => {
    if (compareList.length < 3 && !compareList.find(c => c.id === car.id)) {
      setCompareList([...compareList, car]);
    }
  };

  const removeFromCompare = (id: string) => {
    setCompareList(compareList.filter(c => c.id !== id));
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-background to-emerald-500/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <Scale className="w-3 h-3 mr-1" /> Smart Compare
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Compare Vehicles Side by Side
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {compareList.map((car, index) => (
            <div key={car.id} className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
              <button
                onClick={() => removeFromCompare(car.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <Badge className="mb-3" variant="secondary">{car.category}</Badge>
              <div className="h-32 mb-4 rounded-lg overflow-hidden">
                <img
                  src={car.src}
                  alt={car.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-lg text-center mb-4">{car.brand} {car.model}</h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{car.passengers} seats</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{car.bags} bags</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span>{car.transmission}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Fuel className="w-4 h-4 text-muted-foreground" />
                  <span>{car.fuelType}</span>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                {car.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-green-400" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-primary">${car.price}</span>
                <span className="text-muted-foreground">/day</span>
              </div>

              <Button className="w-full" variant={index === 0 ? "default" : "outline"}>
                {index === 0 ? "Best Value" : "Select"}
              </Button>
            </div>
          ))}

          {compareList.length < 3 && (
            <button
              onClick={() => addToCompare(sampleCars[2])}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/50 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="font-semibold">Add Vehicle to Compare</p>
              <p className="text-sm text-muted-foreground">Up to 3 vehicles</p>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CarCompareWidget;
