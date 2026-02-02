/**
 * Admin Revenue Assumptions Module
 * Single source of truth for commission rates and forecast logic
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import {
  Plane,
  Building,
  Car,
  Calculator,
  Info,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  Users,
  MousePointerClick,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  COMMISSION_RATES,
  AOV_ASSUMPTIONS,
  REVENUE_EXAMPLES,
  REVENUE_ASSUMPTIONS_META,
  TRAFFIC_ASSUMPTIONS,
  CONVERSION_RATES,
  formatCommissionRate,
  forecastRevenue,
  calculateMonthlyProjection,
  getAllMonthlyProjections,
  getAnnualRunRate,
} from "@/config/revenueAssumptions";

const serviceIcons = {
  flights: Plane,
  hotels: Building,
  cars: Car,
};

const serviceColors = {
  flights: "text-sky-500",
  hotels: "text-violet-500",
  cars: "text-emerald-500",
};

const serviceBgColors = {
  flights: "bg-sky-500/10",
  hotels: "bg-violet-500/10",
  cars: "bg-emerald-500/10",
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminRevenueAssumptionsModule() {
  const [forecastInputs, setForecastInputs] = useState({
    flights: 100,
    hotels: 50,
    cars: 30,
  });

  const projections = useMemo(() => getAllMonthlyProjections(), []);
  const annualRunRate = useMemo(() => getAnnualRunRate(), []);
  const month6 = useMemo(() => calculateMonthlyProjection(6), []);
  const month12 = useMemo(() => calculateMonthlyProjection(12), []);

  const chartData = useMemo(() => 
    projections.map(p => ({
      month: MONTH_NAMES[p.month - 1],
      visits: p.visits,
      flights: p.flights.revenue,
      hotels: p.hotels.revenue,
      cars: p.cars.revenue,
      total: p.totalRevenue,
    })), [projections]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10">
            <Calculator className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Revenue Assumptions</h1>
            <p className="text-muted-foreground">
              Commission rates and forecast logic (single source of truth)
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Clock className="h-3 w-3" />
          Updated: {REVENUE_ASSUMPTIONS_META.lastUpdated}
        </Badge>
      </div>

      {/* Important Notice */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-600 dark:text-amber-400">
                Hizovo is NOT the merchant of record
              </p>
              <p className="text-muted-foreground mt-1">
                Partners handle ticketing, payment, and fulfillment. These rates reflect 
                affiliate/white-label partner agreements. This update does NOT change payment flows.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Rates Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {COMMISSION_RATES.map((rate) => {
          const Icon = serviceIcons[rate.service];
          return (
            <Card key={rate.service} className="relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 right-0 h-1", serviceBgColors[rate.service])} />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("p-2 rounded-lg", serviceBgColors[rate.service])}>
                    <Icon className={cn("h-5 w-5", serviceColors[rate.service])} />
                  </div>
                  <CardTitle className="capitalize">{rate.service}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">
                    {formatCommissionRate(rate.service)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rate.description}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="secondary" className="capitalize">
                      {rate.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Case</span>
                    <span className="font-medium">
                      {rate.type === 'fixed' ? `$${rate.baseCase}` : `${rate.baseCase}%`}
                    </span>
                  </div>
                  {rate.min !== rate.max && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Range</span>
                      <span className="font-medium">
                        {rate.type === 'fixed' 
                          ? `$${rate.min}–$${rate.max}` 
                          : `${rate.min}–${rate.max}%`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AOV Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AOV Assumptions
          </CardTitle>
          <CardDescription>
            Average Order Value assumptions used for revenue forecasting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {AOV_ASSUMPTIONS.map((aov) => {
              const Icon = serviceIcons[aov.service];
              const isApplicable = aov.baseCase > 0;
              
              return (
                <div
                  key={aov.service}
                  className={cn(
                    "p-4 rounded-lg border",
                    isApplicable ? "bg-card" : "bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={cn("h-4 w-4", serviceColors[aov.service])} />
                    <span className="font-medium capitalize">{aov.service}</span>
                  </div>
                  
                  {isApplicable ? (
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        ${aov.baseCase.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Range: ${aov.min}–${aov.max}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      N/A (fixed per booking)
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Traffic & Conversion Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Traffic & Conversion Assumptions
          </CardTitle>
          <CardDescription>
            Conservative traffic and conversion rate projections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">Traffic Growth</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">25K</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-2xl font-bold">75K</span>
                <span className="text-sm text-muted-foreground">visits/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Month 6 → Month 12</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">Partner Completion Rate</p>
              <p className="text-2xl font-bold">65%</p>
              <p className="text-xs text-muted-foreground mt-1">Of checkout clicks complete booking</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {CONVERSION_RATES.map((rate) => {
              const Icon = serviceIcons[rate.service];
              return (
                <div key={rate.service} className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("h-4 w-4", serviceColors[rate.service])} />
                    <span className="font-medium capitalize">{rate.service}</span>
                  </div>
                  <p className="text-2xl font-bold">{(rate.checkoutClickRate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">checkout click rate</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Projections Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            12-Month Revenue Projection
          </CardTitle>
          <CardDescription>
            Projected monthly revenue by service category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Legend />
                <Bar dataKey="flights" name="Flights" fill="hsl(200, 95%, 50%)" stackId="a" />
                <Bar dataKey="hotels" name="Hotels" fill="hsl(262, 83%, 58%)" stackId="a" />
                <Bar dataKey="cars" name="Cars" fill="hsl(152, 76%, 45%)" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Projections */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-sky-500/10 to-blue-500/5">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-sky-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-sky-500">${month6.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Month 6 Revenue</p>
            <p className="text-xs text-muted-foreground mt-1">{month6.visits.toLocaleString()} visits</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/5">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-violet-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-violet-500">${month12.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Month 12 Revenue</p>
            <p className="text-xs text-muted-foreground mt-1">{month12.visits.toLocaleString()} visits</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-emerald-500">${(annualRunRate / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-muted-foreground">Annual Run Rate</p>
            <p className="text-xs text-muted-foreground mt-1">At Month 12 scale</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Month 6 & 12 Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Detailed Projections
          </CardTitle>
          <CardDescription>
            Month 6 and Month 12 revenue breakdown by service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {[{ label: "Month 6", data: month6 }, { label: "Month 12", data: month12 }].map(({ label, data }) => (
              <div key={label} className="p-4 rounded-lg border">
                <h4 className="font-semibold mb-4">{label} ({data.visits.toLocaleString()} visits)</h4>
                <div className="space-y-3">
                  {(['flights', 'hotels', 'cars'] as const).map((service) => {
                    const Icon = serviceIcons[service];
                    const svc = data[service];
                    return (
                      <div key={service} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", serviceColors[service])} />
                          <span className="capitalize">{service}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">${svc.revenue.toLocaleString()}</span>
                          <span className="text-muted-foreground text-xs ml-2">
                            ({svc.bookings} bookings)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-emerald-500">${data.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calculation Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Commission Calculation Examples
          </CardTitle>
          <CardDescription>
            How commission is calculated for each service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {REVENUE_EXAMPLES.map((example) => {
              const Icon = serviceIcons[example.service];
              return (
                <div
                  key={example.service}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30"
                >
                  <div className={cn("p-2 rounded-lg", serviceBgColors[example.service])}>
                    <Icon className={cn("h-5 w-5", serviceColors[example.service])} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{example.service}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {example.calculation}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-500">
                      ${example.commission}
                    </p>
                    <p className="text-xs text-muted-foreground">per booking</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Document Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">{REVENUE_ASSUMPTIONS_META.version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{REVENUE_ASSUMPTIONS_META.lastUpdated}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Updated By</span>
                <span className="font-medium">{REVENUE_ASSUMPTIONS_META.updatedBy}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Notes:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {REVENUE_ASSUMPTIONS_META.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
