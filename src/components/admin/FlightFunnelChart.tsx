/**
 * Flight Funnel Visualization
 * Shows conversion from searches → results → checkout → bookings
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Search, ListFilter, ShoppingCart, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelStep {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface FlightFunnelChartProps {
  searches: number;
  resultsShown: number;
  checkoutsStarted: number;
  bookingsCompleted: number;
}

export function FlightFunnelChart({
  searches,
  resultsShown,
  checkoutsStarted,
  bookingsCompleted,
}: FlightFunnelChartProps) {
  const steps: FunnelStep[] = [
    { 
      label: "Searches", 
      value: searches, 
      icon: <Search className="w-5 h-5" />,
      color: "bg-sky-500/20 text-sky-600 border-sky-500/30"
    },
    { 
      label: "Results Viewed", 
      value: resultsShown, 
      icon: <ListFilter className="w-5 h-5" />,
      color: "bg-blue-500/20 text-blue-600 border-blue-500/30"
    },
    { 
      label: "Checkout Started", 
      value: checkoutsStarted, 
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "bg-purple-500/20 text-purple-600 border-purple-500/30"
    },
    { 
      label: "Tickets Issued", 
      value: bookingsCompleted, 
      icon: <Ticket className="w-5 h-5" />,
      color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
    },
  ];

  // Calculate percentages relative to searches
  const getPercentage = (value: number) => {
    if (searches === 0) return "0%";
    return `${((value / searches) * 100).toFixed(1)}%`;
  };

  // Calculate drop-off between steps
  const getDropoff = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((previous - current) / previous) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Booking Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-2">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2 flex-1">
              {/* Step Card */}
              <div 
                className={cn(
                  "flex-1 p-4 rounded-lg border-2 transition-colors",
                  step.color
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {step.icon}
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                <div className="text-2xl font-bold">{step.value.toLocaleString()}</div>
                <div className="text-xs opacity-80">
                  {getPercentage(step.value)} of searches
                </div>
              </div>

              {/* Arrow with dropoff */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex flex-col items-center px-1">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  {index > 0 && (
                    <span className="text-xs text-destructive font-medium">
                      -{getDropoff(steps[index + 1].value, step.value)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Search → Results</p>
            <p className="text-lg font-semibold text-blue-600">
              {searches > 0 ? `${((resultsShown / searches) * 100).toFixed(1)}%` : "0%"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Results → Checkout</p>
            <p className="text-lg font-semibold text-purple-600">
              {resultsShown > 0 ? `${((checkoutsStarted / resultsShown) * 100).toFixed(1)}%` : "0%"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Checkout → Booked</p>
            <p className="text-lg font-semibold text-emerald-600">
              {checkoutsStarted > 0 ? `${((bookingsCompleted / checkoutsStarted) * 100).toFixed(1)}%` : "0%"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Overall Conversion</p>
            <p className="text-lg font-bold text-primary">
              {searches > 0 ? `${((bookingsCompleted / searches) * 100).toFixed(2)}%` : "0%"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
