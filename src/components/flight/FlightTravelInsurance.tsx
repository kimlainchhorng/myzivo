import { Shield, Plane, Heart, Briefcase, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const insurancePlans = [
  {
    id: "basic",
    name: "Basic Coverage",
    price: 29,
    icon: Shield,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    coverage: [
      { item: "Trip cancellation (up to $1,500)", covered: true },
      { item: "Trip interruption", covered: true },
      { item: "Flight delay (6+ hours)", covered: true },
      { item: "Lost baggage (up to $500)", covered: true },
      { item: "Medical emergency", covered: false },
      { item: "Emergency evacuation", covered: false },
      { item: "24/7 assistance", covered: false },
    ],
    recommended: false,
  },
  {
    id: "standard",
    name: "Standard Coverage",
    price: 59,
    icon: Plane,
    color: "text-primary",
    bgColor: "bg-primary/10",
    coverage: [
      { item: "Trip cancellation (up to $5,000)", covered: true },
      { item: "Trip interruption", covered: true },
      { item: "Flight delay (4+ hours)", covered: true },
      { item: "Lost baggage (up to $2,000)", covered: true },
      { item: "Medical emergency (up to $50,000)", covered: true },
      { item: "Emergency evacuation", covered: false },
      { item: "24/7 assistance", covered: true },
    ],
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium Coverage",
    price: 99,
    icon: Heart,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    coverage: [
      { item: "Trip cancellation (up to $10,000)", covered: true },
      { item: "Trip interruption (150%)", covered: true },
      { item: "Flight delay (2+ hours)", covered: true },
      { item: "Lost baggage (up to $5,000)", covered: true },
      { item: "Medical emergency (up to $250,000)", covered: true },
      { item: "Emergency evacuation ($500,000)", covered: true },
      { item: "24/7 concierge assistance", covered: true },
    ],
    recommended: false,
  },
];

const FlightTravelInsurance = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Peace of Mind
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Travel <span className="text-primary">Insurance</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Protect your trip with comprehensive coverage for unexpected events
            </p>
          </div>

          {/* Insurance Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            {insurancePlans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-2xl border transition-all cursor-pointer hover:-translate-y-1 ${
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-card/50 border-border/50 hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      Most Popular
                    </span>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${plan.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${plan.color}`} />
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-primary">${plan.price}</span>
                    <span className="text-sm text-muted-foreground">per person</span>
                  </div>

                  {/* Coverage List */}
                  <div className="space-y-2">
                    {plan.coverage.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        {item.covered ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={item.covered ? "" : "text-muted-foreground/50"}>
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <Button
                    className={`w-full mt-6 ${isSelected ? "bg-primary" : "bg-muted hover:bg-muted/80"}`}
                    variant={isSelected ? "default" : "secondary"}
                  >
                    {isSelected ? "Selected" : "Select Plan"}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Info Note */}
          <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-400 mb-1">Important Information</p>
              <p className="text-muted-foreground">
                Coverage is subject to terms and conditions. Pre-existing conditions may not be covered. 
                We recommend reviewing the full policy before purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightTravelInsurance;
