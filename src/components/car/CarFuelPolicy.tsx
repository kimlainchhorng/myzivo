import { Fuel, Check, AlertCircle, DollarSign, Leaf, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const fuelOptions = [
  {
    id: "full-to-full",
    name: "Full to Full",
    description: "Pick up with full tank, return full",
    price: 0,
    savings: "Best Value",
    recommended: true,
    details: [
      "Most cost-effective option",
      "Pay only for gas you use",
      "Refuel at any station",
      "Return with full tank"
    ]
  },
  {
    id: "prepaid",
    name: "Prepaid Fuel",
    description: "We fill up, you don't worry",
    price: 65,
    savings: "Convenience",
    recommended: false,
    details: [
      "No need to refuel before return",
      "Competitive per-gallon rate",
      "Save time on return",
      "No receipt required"
    ]
  },
  {
    id: "pay-on-return",
    name: "Pay on Return",
    description: "Refuel charge added at return",
    price: 0,
    savings: "Flexible",
    recommended: false,
    details: [
      "Return at any fuel level",
      "Charged at premium rate",
      "Most convenient option",
      "Service fee applies"
    ]
  },
];

const CarFuelPolicy = () => {
  const [selectedOption, setSelectedOption] = useState("full-to-full");

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Fuel className="w-3 h-3 mr-1" /> Fuel Options
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Choose Your Fuel Policy
          </h2>
          <p className="text-muted-foreground">Select the option that works best for you</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {fuelOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                selectedOption === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-card/60 hover:border-border"
              }`}
            >
              {option.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Recommended
                </Badge>
              )}

              <div className="text-center mb-4 pt-2">
                <div className={`w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                  selectedOption === option.id ? "bg-primary/20" : "bg-muted/50"
                }`}>
                  <Fuel className={`w-7 h-7 ${selectedOption === option.id ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <h3 className="font-bold">{option.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                {option.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-border/50 text-center">
                {option.price > 0 ? (
                  <p className="text-lg font-bold">+${option.price}</p>
                ) : (
                  <p className="text-lg font-bold text-green-400">No Extra Cost</p>
                )}
                <Badge variant="outline" className="mt-1 text-xs">
                  {option.savings}
                </Badge>
              </div>

              {/* Selection indicator */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedOption === option.id ? "border-primary bg-primary" : "border-muted-foreground"
              }`}>
                {selectedOption === option.id && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
            </div>
          ))}
        </div>

        {/* EV Note */}
        <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
          <Zap className="w-5 h-5 text-green-400" />
          <p className="text-sm">
            <span className="font-medium">Electric Vehicle?</span>{" "}
            <span className="text-muted-foreground">EVs come with free charging at all our locations.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CarFuelPolicy;
