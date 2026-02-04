/**
 * Revenue Projection Card
 * Visual breakdown of revenue by service with commission rates
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Building2, Car, Package, TrendingUp } from "lucide-react";
import { REVENUE_EXAMPLES, MONTHLY_TOTALS, formatCommissionRate } from "@/config/revenueAssumptions";
import { formatPrice } from "@/lib/currency";

const serviceIcons = {
  flights: Plane,
  hotels: Building2,
  cars: Car,
  addons: Package,
};

const serviceLabels = {
  flights: 'Flight Bookings',
  hotels: 'Hotel Bookings',
  cars: 'Car Rentals',
  addons: 'Add-ons & Upsells',
};

const serviceColors = {
  flights: 'text-sky-500 bg-sky-500/10',
  hotels: 'text-amber-500 bg-amber-500/10',
  cars: 'text-violet-500 bg-violet-500/10',
  addons: 'text-emerald-500 bg-emerald-500/10',
};

interface RevenueProjectionCardProps {
  className?: string;
  showToggle?: boolean;
}

export const RevenueProjectionCard = ({ className, showToggle = true }: RevenueProjectionCardProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Revenue Projection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showToggle ? (
          <Tabs defaultValue="monthly">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual">Annual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly">
              <RevenueBreakdown multiplier={1} />
            </TabsContent>
            
            <TabsContent value="annual">
              <RevenueBreakdown multiplier={12} />
            </TabsContent>
          </Tabs>
        ) : (
          <RevenueBreakdown multiplier={1} />
        )}
      </CardContent>
    </Card>
  );
};

const RevenueBreakdown = ({ multiplier }: { multiplier: number }) => {
  const isAnnual = multiplier === 12;
  
  return (
    <div className="space-y-4">
      {REVENUE_EXAMPLES.map((example) => {
        const Icon = serviceIcons[example.service];
        const colorClass = serviceColors[example.service];
        const revenue = example.monthlyRevenue * multiplier;
        
        return (
          <div
            key={example.service}
            className="p-4 rounded-xl border border-border/50 bg-muted/20"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold">{serviceLabels[example.service]}</h3>
                  <span className="font-bold text-lg">
                    {formatPrice(revenue)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {formatCommissionRate(example.service)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {example.calculation}
                  {isAnnual && ' × 12'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Total */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {isAnnual ? 'Annual' : 'Monthly'} Total
            </p>
            <p className="text-3xl font-bold">
              {formatPrice(MONTHLY_TOTALS.total * multiplier)}
            </p>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
            Conservative
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default RevenueProjectionCard;
