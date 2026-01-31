import { Zap, Car, MapPin, Clock, Battery, Leaf, ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const evBenefits = [
  "Free charging at all locations",
  "Reserved EV parking spots",
  "Pre-conditioned cabin",
  "Extended range options",
];

const evCars = [
  { name: "Tesla Model 3", range: "358 mi", price: 89, charging: "Free Supercharging" },
  { name: "Tesla Model Y", range: "330 mi", price: 109, charging: "Free Supercharging" },
  { name: "BMW iX", range: "324 mi", price: 149, charging: "Free charging" },
];

const CarElectricVehicles = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-card/50 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
                <Zap className="w-3 h-3 mr-1" /> Electric Vehicles
              </Badge>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Drive Electric, Drive Green
              </h2>
              <p className="text-muted-foreground mb-6">
                Explore our premium electric vehicle fleet with complimentary charging at all ZIVO locations.
              </p>

              <ul className="space-y-3 mb-6">
                {evBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Leaf className="w-4 h-4 mr-2" />
                Browse EV Fleet
              </Button>
            </div>

            <div className="space-y-4">
              {evCars.map((car) => (
                <div
                  key={car.name}
                  className="p-4 bg-card/60 backdrop-blur-xl border border-green-500/20 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold">{car.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Battery className="w-3 h-3" />
                        {car.range} range
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-green-400" />
                        {car.charging}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${car.price}</p>
                    <p className="text-xs text-muted-foreground">/day</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarElectricVehicles;
