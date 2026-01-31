import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingDown, Percent, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotelSavingsCalculatorProps {
  className?: string;
}

export default function HotelSavingsCalculator({ className }: HotelSavingsCalculatorProps) {
  const [nights, setNights] = useState([3]);
  const [avgRate, setAvgRate] = useState([150]);

  const regularTotal = nights[0] * avgRate[0];
  const savingsPercent = 25; // Average ZIVO savings
  const zivoTotal = regularTotal * (1 - savingsPercent / 100);
  const totalSavings = regularTotal - zivoTotal;

  return (
    <section className={cn("py-10 sm:py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-4 px-4 py-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <Calculator className="w-4 h-4 mr-2" />
            Savings Calculator
          </Badge>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            See How Much You'll Save
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compare prices and discover your potential savings with ZIVO Hotels
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium">Number of Nights</label>
                      <span className="text-lg font-bold text-primary">{nights[0]} nights</span>
                    </div>
                    <Slider
                      value={nights}
                      onValueChange={setNights}
                      min={1}
                      max={14}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium">Average Nightly Rate</label>
                      <span className="text-lg font-bold text-primary">${avgRate[0]}</span>
                    </div>
                    <Slider
                      value={avgRate}
                      onValueChange={setAvgRate}
                      min={50}
                      max={500}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Percent className="w-4 h-4" />
                      Average ZIVO Discount
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">{savingsPercent}% off</p>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <p className="text-sm text-muted-foreground mb-1">Regular Price</p>
                    <p className="text-2xl font-bold line-through text-muted-foreground">${regularTotal.toFixed(0)}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-teal-500/10 border border-primary/20">
                    <p className="text-sm text-primary mb-1">ZIVO Price</p>
                    <p className="text-3xl font-bold text-primary">${zivoTotal.toFixed(0)}</p>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-emerald-500" />
                      <p className="text-sm font-medium text-emerald-500">Your Total Savings</p>
                    </div>
                    <p className="text-4xl font-bold text-emerald-500">${totalSavings.toFixed(0)}</p>
                    <p className="text-sm text-emerald-400 mt-1">on this {nights[0]}-night stay</p>
                  </div>

                  <Button className="w-full h-12 bg-gradient-to-r from-primary to-teal-500 hover:opacity-90 touch-manipulation active:scale-[0.98]">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Find Hotels & Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
