import { Shield, ShieldCheck, ShieldPlus, Check, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const insuranceOptions = [
  {
    id: "basic",
    name: "Basic Protection",
    price: 0,
    priceLabel: "Included",
    icon: Shield,
    color: "from-slate-500 to-gray-500",
    description: "Standard liability coverage",
    features: [
      "Third-party liability",
      "Basic theft protection",
      "$1,500 deductible",
    ],
    notIncluded: [
      "Collision damage waiver",
      "Personal accident insurance",
      "Roadside assistance",
    ],
    recommended: false,
  },
  {
    id: "standard",
    name: "Standard Coverage",
    price: 15,
    priceLabel: "/day",
    icon: ShieldCheck,
    color: "from-emerald-500 to-green-500",
    description: "Most popular protection plan",
    features: [
      "Third-party liability",
      "Full theft protection",
      "Collision damage waiver",
      "$500 deductible",
      "Roadside assistance",
    ],
    notIncluded: [
      "Personal accident insurance",
      "Personal effects coverage",
    ],
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium Protection",
    price: 29,
    priceLabel: "/day",
    icon: ShieldPlus,
    color: "from-violet-500 to-purple-500",
    description: "Complete peace of mind",
    features: [
      "Third-party liability",
      "Full theft protection",
      "Collision damage waiver",
      "Zero deductible",
      "24/7 roadside assistance",
      "Personal accident insurance",
      "Personal effects coverage",
      "Key replacement",
    ],
    notIncluded: [],
    recommended: false,
  },
];

const CarInsuranceOptions = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Insurance Options</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Drive with Confidence
          </h2>
          <p className="text-muted-foreground">Choose the coverage that's right for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {insuranceOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className={cn(
                  "relative p-6 rounded-2xl bg-card/50 border backdrop-blur-sm",
                  "transition-all duration-200",
                  option.recommended 
                    ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10" 
                    : "border-border/50 hover:border-emerald-500/30",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {option.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-xs font-bold text-white">
                    Recommended
                  </div>
                )}

                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                  "bg-gradient-to-br", option.color
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="font-bold text-lg mb-1">{option.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{option.description}</p>

                <div className="mb-6">
                  {option.price === 0 ? (
                    <span className="text-2xl font-bold text-emerald-400">{option.priceLabel}</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-emerald-400">${option.price}</span>
                      <span className="text-sm text-muted-foreground">{option.priceLabel}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {option.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {option.notIncluded.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    {option.notIncluded.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                        <span className="line-through">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  className={cn(
                    "w-full mt-6 rounded-xl",
                    option.recommended 
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:opacity-90" 
                      : ""
                  )}
                  variant={option.recommended ? "default" : "outline"}
                >
                  Select Plan
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border/50 max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              All insurance options can be upgraded at pickup. Coverage terms and conditions apply. 
              Please review the full policy details before making a decision.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarInsuranceOptions;
