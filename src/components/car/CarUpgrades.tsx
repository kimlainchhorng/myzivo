import { Sparkles, ArrowUp, Star, Zap, Users, Fuel, Gauge, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const upgradeOptions = [
  {
    id: "comfort",
    currentClass: "Economy",
    upgradeClass: "Compact",
    currentCar: "Hyundai i10",
    upgradeCar: "Ford Focus",
    savings: 40,
    pricePerDay: 8,
    benefits: ["More luggage space", "Better fuel economy", "Cruise control"],
    image: "🚗"
  },
  {
    id: "premium",
    currentClass: "Economy",
    upgradeClass: "Premium",
    currentCar: "Hyundai i10",
    upgradeCar: "BMW 3 Series",
    savings: 25,
    pricePerDay: 25,
    popular: true,
    benefits: ["Leather seats", "Premium sound", "Navigation system", "Parking sensors"],
    image: "🚘"
  },
  {
    id: "suv",
    currentClass: "Economy",
    upgradeClass: "SUV",
    currentCar: "Hyundai i10",
    upgradeCar: "Toyota RAV4",
    savings: 30,
    pricePerDay: 18,
    benefits: ["7 passengers", "All-wheel drive", "Roof rack ready", "Higher ground clearance"],
    image: "🚙"
  },
];

const CarUpgrades = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-violet-500/20 text-violet-400 border-violet-500/30">
            <Sparkles className="w-3 h-3 mr-1" /> Upgrade Offer
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Upgrade Your Experience
          </h2>
          <p className="text-muted-foreground">Special upgrade rates available for your dates</p>
        </div>

        <div className="space-y-4">
          {upgradeOptions.map((option) => (
            <div
              key={option.id}
              className="relative p-6 bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-border transition-all"
            >
              {option.popular && (
                <Badge className="absolute -top-3 right-6 bg-violet-500 text-white border-0">
                  <Star className="w-3 h-3 mr-1" /> Best Value
                </Badge>
              )}

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Current vs Upgrade */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Current</p>
                    <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center text-3xl mb-1">
                      🚗
                    </div>
                    <p className="text-xs font-medium">{option.currentClass}</p>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <ArrowUp className="w-5 h-5 text-violet-400 rotate-90" />
                    <span className="text-xs text-violet-400 font-medium">Upgrade</span>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Upgrade to</p>
                    <div className="w-16 h-16 rounded-xl bg-violet-500/10 flex items-center justify-center text-3xl mb-1">
                      {option.image}
                    </div>
                    <p className="text-xs font-medium text-violet-400">{option.upgradeClass}</p>
                  </div>
                </div>

                {/* Car Details */}
                <div className="flex-1">
                  <p className="font-bold text-lg mb-2">{option.upgradeCar}</p>
                  <div className="flex flex-wrap gap-2">
                    {option.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-muted/50 rounded-full"
                      >
                        <Check className="w-3 h-3 text-green-400" />
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="text-right flex flex-col items-end gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Save {option.savings}%
                  </Badge>
                  <div>
                    <span className="text-2xl font-display font-bold text-violet-400">
                      +${option.pricePerDay}
                    </span>
                    <span className="text-sm text-muted-foreground">/day</span>
                  </div>
                  <Button className="bg-gradient-to-r from-violet-500 to-purple-500">
                    <Zap className="w-4 h-4 mr-1" /> Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Upgraded", value: "68%", sub: "of renters" },
            { icon: Star, label: "Rating", value: "4.9", sub: "avg satisfaction" },
            { icon: Fuel, label: "Efficiency", value: "+25%", sub: "better MPG" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-card/60 rounded-xl border border-border/50">
              <stat.icon className="w-5 h-5 text-violet-400 mx-auto mb-2" />
              <p className="text-xl font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarUpgrades;
