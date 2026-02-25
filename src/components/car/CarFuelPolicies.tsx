import { Fuel, Zap, Droplets, Leaf, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";

const fuelPolicies = [
  {
    id: "full-to-full",
    icon: Fuel,
    title: "Full to Full",
    description: "Pick up with a full tank, return it full",
    pros: ["Most economical option", "Only pay for fuel you use", "No hidden charges"],
    cons: ["Must find gas station before return", "Refueling time required"],
    savings: "Save up to 30%",
    recommended: true,
  },
  {
    id: "prepaid",
    icon: DollarSign,
    title: "Prepaid Fuel",
    description: "Pay for a full tank upfront at competitive rates",
    pros: ["No refueling needed", "Convenient for time-pressed travelers", "Fixed cost"],
    cons: ["Pay for full tank even if not used", "Slightly higher rate"],
    savings: "Time saver",
    recommended: false,
  },
  {
    id: "electric",
    icon: Zap,
    title: "Electric Charging",
    description: "EV rentals with charging solutions",
    pros: ["Eco-friendly", "Lower fuel costs", "Home charging option"],
    cons: ["Charging time needed", "Limited charging stations in some areas"],
    savings: "Save 50% on fuel",
    recommended: false,
  },
];

const fuelTypes = [
  { type: "Regular", price: "$3.49/gal", icon: Fuel, color: "text-blue-400" },
  { type: "Premium", price: "$4.19/gal", icon: Droplets, color: "text-purple-400" },
  { type: "Diesel", price: "$3.89/gal", icon: Fuel, color: "text-amber-400" },
  { type: "Electric", price: "$0.12/kWh", icon: Zap, color: "text-emerald-400" },
];

const CarFuelPolicies = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
              <Leaf className="w-4 h-4" />
              Fuel Options
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Fuel <span className="text-primary">Policies</span>
            </h2>
            <p className="text-muted-foreground">
              Choose the fuel option that fits your travel needs
            </p>
          </div>

          {/* Policy Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {fuelPolicies.map((policy) => {
              const Icon = policy.icon;
              return (
                <div
                  key={policy.id}
                  className={`relative p-6 rounded-2xl bg-card/50 border transition-all hover:-translate-y-1 ${
                    policy.recommended ? "border-primary" : "border-border/50"
                  }`}
                >
                  {policy.recommended && (
                    <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      Recommended
                    </span>
                  )}

                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{policy.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{policy.description}</p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Benefits</h4>
                      <div className="space-y-1">
                        {policy.pros.map((pro, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Consider</h4>
                      <div className="space-y-1">
                        {policy.cons.map((con, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                      {policy.savings}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Fuel Prices */}
          <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <h3 className="text-lg font-semibold mb-4">Current Fuel Prices (Avg)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {fuelTypes.map((fuel, index) => {
                const Icon = fuel.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                    <Icon className={`w-5 h-5 ${fuel.color}`} />
                    <div>
                      <div className="font-medium text-sm">{fuel.type}</div>
                      <div className="text-primary font-semibold">{fuel.price}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarFuelPolicies;
