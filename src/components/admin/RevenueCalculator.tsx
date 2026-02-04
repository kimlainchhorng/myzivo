/**
 * Revenue Calculator
 * Interactive admin tool for revenue planning
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calculator, Plane, Building2, Car, Package, TrendingUp } from "lucide-react";
import { 
  calculateTotalRevenue, 
  getCommissionRate,
  formatCommissionRate 
} from "@/config/revenueAssumptions";
import { formatPrice } from "@/lib/currency";

interface RevenueCalculatorProps {
  className?: string;
}

export const RevenueCalculator = ({ className }: RevenueCalculatorProps) => {
  const [flightBookings, setFlightBookings] = useState(1000);
  const [hotelBookings, setHotelBookings] = useState(500);
  const [carBookings, setCarBookings] = useState(300);
  const [addonRevenue, setAddonRevenue] = useState(3000);

  const revenue = calculateTotalRevenue(flightBookings, hotelBookings, carBookings, addonRevenue);

  const inputs = [
    {
      id: 'flights',
      label: 'Flight Bookings',
      icon: Plane,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
      value: flightBookings,
      setValue: setFlightBookings,
      max: 5000,
      step: 100,
      rate: formatCommissionRate('flights'),
      revenue: revenue.breakdown.flights,
    },
    {
      id: 'hotels',
      label: 'Hotel Bookings',
      icon: Building2,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      value: hotelBookings,
      setValue: setHotelBookings,
      max: 2500,
      step: 50,
      rate: formatCommissionRate('hotels'),
      revenue: revenue.breakdown.hotels,
    },
    {
      id: 'cars',
      label: 'Car Rentals',
      icon: Car,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      value: carBookings,
      setValue: setCarBookings,
      max: 1500,
      step: 50,
      rate: formatCommissionRate('cars'),
      revenue: revenue.breakdown.cars,
    },
    {
      id: 'addons',
      label: 'Add-ons & Extras',
      icon: Package,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      value: addonRevenue,
      setValue: setAddonRevenue,
      max: 15000,
      step: 500,
      rate: 'Insurance, baggage, etc.',
      revenue: revenue.breakdown.addons,
      isRevenue: true,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Revenue Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        {inputs.map((input) => {
          const Icon = input.icon;
          return (
            <div key={input.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded ${input.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${input.color}`} />
                  </div>
                  {input.label}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={input.value}
                    onChange={(e) => input.setValue(Number(e.target.value))}
                    className="w-24 text-right"
                  />
                  <span className="text-sm text-muted-foreground w-16">
                    {input.isRevenue ? '' : '/mo'}
                  </span>
                </div>
              </div>
              
              <Slider
                value={[input.value]}
                onValueChange={([v]) => input.setValue(v)}
                max={input.max}
                step={input.step}
                className="w-full"
              />
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{input.rate}</span>
                <span className="font-semibold">{formatPrice(input.revenue)}</span>
              </div>
            </div>
          );
        })}

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Totals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-medium">Monthly Revenue</span>
            </div>
            <span className="text-2xl font-bold">
              {formatPrice(revenue.monthly)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Annual Revenue</span>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                × 12
              </Badge>
            </div>
            <span className="text-3xl font-bold">
              {revenue.annual >= 1000000 
                ? `$${(revenue.annual / 1000000).toFixed(2)}M`
                : formatPrice(revenue.annual)
              }
            </span>
          </div>
        </div>

        {/* Calculation Note */}
        <p className="text-xs text-muted-foreground text-center">
          Based on base-case commission rates. Actual revenue may vary by partner agreement.
        </p>
      </CardContent>
    </Card>
  );
};

export default RevenueCalculator;
