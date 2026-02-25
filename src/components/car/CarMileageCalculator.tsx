import { useState } from "react";
import { Calculator, TrendingUp, Car, Fuel, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const CarMileageCalculator = () => {
  const [distance, setDistance] = useState([300]);
  const [fuelPrice, setFuelPrice] = useState([3.50]);
  const [mpg, setMpg] = useState([30]);

  const fuelCost = (distance[0] / mpg[0]) * fuelPrice[0];
  const co2Saved = distance[0] * 0.21; // kg CO2 per mile for average car
  const electricSavings = fuelCost * 0.6; // EVs typically 60% cheaper

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Calculator className="w-4 h-4" />
              Trip Planner
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Mileage & Cost <span className="text-primary">Calculator</span>
            </h2>
            <p className="text-muted-foreground">
              Estimate your fuel costs and find the most economical option
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Calculator Inputs */}
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              <h3 className="text-lg font-semibold mb-6">Adjust Your Trip Details</h3>

              {/* Distance Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Trip Distance</label>
                  <span className="text-lg font-bold text-primary">{distance[0]} miles</span>
                </div>
                <Slider
                  value={distance}
                  onValueChange={setDistance}
                  max={1000}
                  min={50}
                  step={10}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50 mi</span>
                  <span>1,000 mi</span>
                </div>
              </div>

              {/* Fuel Price Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Fuel Price (per gallon)</label>
                  <span className="text-lg font-bold text-primary">${fuelPrice[0].toFixed(2)}</span>
                </div>
                <Slider
                  value={fuelPrice}
                  onValueChange={setFuelPrice}
                  max={6}
                  min={2}
                  step={0.1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$2.00</span>
                  <span>$6.00</span>
                </div>
              </div>

              {/* MPG Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Vehicle Efficiency (MPG)</label>
                  <span className="text-lg font-bold text-primary">{mpg[0]} mpg</span>
                </div>
                <Slider
                  value={mpg}
                  onValueChange={setMpg}
                  max={60}
                  min={15}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>15 mpg (SUV)</span>
                  <span>60 mpg (Hybrid)</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {/* Main Result */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 border border-primary/30">
                <div className="flex items-center gap-3 mb-4">
                  <Fuel className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">Estimated Fuel Cost</h3>
                </div>
                <div className="text-4xl font-bold text-primary mb-2">
                  ${fuelCost.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {(distance[0] / mpg[0]).toFixed(1)} gallons needed for your trip
                </p>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium">EV Savings</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ${electricSavings.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">vs gasoline vehicle</p>
                </div>

                <div className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-sky-400" />
                    <span className="text-sm font-medium">CO₂ Footprint</span>
                  </div>
                  <div className="text-2xl font-bold text-sky-400">
                    {co2Saved.toFixed(0)} kg
                  </div>
                  <p className="text-xs text-muted-foreground">estimated emissions</p>
                </div>
              </div>

              {/* Vehicle Recommendations */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <h4 className="text-sm font-medium mb-3">Recommended Vehicles</h4>
                <div className="space-y-2">
                  {[
                    { name: "Economy (45 mpg)", cost: ((distance[0] / 45) * fuelPrice[0]).toFixed(2) },
                    { name: "Standard (30 mpg)", cost: ((distance[0] / 30) * fuelPrice[0]).toFixed(2) },
                    { name: "SUV (22 mpg)", cost: ((distance[0] / 22) * fuelPrice[0]).toFixed(2) },
                  ].map((vehicle, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-card/50">
                      <span className="text-sm">{vehicle.name}</span>
                      <span className="font-medium text-primary">${vehicle.cost}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" size="lg">
                Find Cars for Your Trip
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarMileageCalculator;
