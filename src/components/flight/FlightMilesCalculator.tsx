import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Plane, ArrowRight, Calculator, Info, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const FlightMilesCalculator = () => {
  const [flightPrice, setFlightPrice] = useState([500]);
  const [milesRate] = useState(2); // 2 miles per $1
  const [bonusMultiplier] = useState(1.5); // 50% bonus

  const baseMiles = flightPrice[0] * milesRate;
  const bonusMiles = Math.floor(baseMiles * (bonusMultiplier - 1));
  const totalMiles = baseMiles + bonusMiles;
  
  // Estimate redemption value ($0.012 per mile average)
  const redemptionValue = (totalMiles * 0.012).toFixed(0);

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-primary/10 via-card/50 to-teal-500/10 border border-primary/20 rounded-3xl p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">
                <Award className="w-3 h-3 mr-1" /> ZIVO Miles
              </Badge>
              <h3 className="text-xl md:text-2xl font-display font-bold">
                Miles Calculator
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                See how many miles you'll earn on your flight
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Price Slider */}
          <div className="bg-card/50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Flight Price</span>
              <span className="text-2xl font-bold text-primary">${flightPrice[0]}</span>
            </div>
            <Slider
              value={flightPrice}
              onValueChange={setFlightPrice}
              min={100}
              max={2000}
              step={50}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$100</span>
              <span>$2,000</span>
            </div>
          </div>

          {/* Miles Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-card/80 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Plane className="w-4 h-4" />
                <span className="text-sm">Base Miles</span>
              </div>
              <p className="text-2xl font-bold">{baseMiles.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{milesRate}x miles per $1</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <Gift className="w-4 h-4" />
                <span className="text-sm font-medium">Bonus Miles</span>
              </div>
              <p className="text-2xl font-bold text-amber-500">+{bonusMiles.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">50% member bonus</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-primary/10 to-teal-500/10 rounded-xl border border-primary/30">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Total Miles</span>
              </div>
              <p className="text-2xl font-bold text-primary">{totalMiles.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">≈ ${redemptionValue} value</p>
            </div>
          </div>

          {/* Value Info */}
          <div className="flex items-start gap-3 p-4 bg-sky-500/10 rounded-xl border border-sky-500/20">
            <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-sky-500">Earn More, Travel More</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your {totalMiles.toLocaleString()} miles could get you a free domestic round-trip flight or upgrade your next international trip to business class.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 gap-2">
              <Award className="w-4 h-4" />
              Join ZIVO Miles Free
            </Button>
            <Button variant="outline" className="gap-2">
              Learn More <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightMilesCalculator;
