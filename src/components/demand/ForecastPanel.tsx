/**
 * Forecast Panel Component
 * Displays next-hour predictions per zone
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, Users, Clock } from "lucide-react";
import { ZoneForecast } from "@/hooks/useDemandForecast";
import { formatDistanceToNow } from "date-fns";

interface ForecastPanelProps {
  forecasts: ZoneForecast[];
  isLoading: boolean;
}

const ForecastPanel = ({ forecasts, isLoading }: ForecastPanelProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Next Hour Forecasts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get only the nearest forecast per zone
  const zoneMap = new Map<string, ZoneForecast>();
  for (const f of forecasts) {
    if (!zoneMap.has(f.zone_code)) {
      zoneMap.set(f.zone_code, f);
    }
  }
  const uniqueForecasts = Array.from(zoneMap.values());

  if (uniqueForecasts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Next Hour Forecasts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p>No forecasts available</p>
            <p className="text-sm">Generate forecasts to see predictions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Next Hour Forecasts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {uniqueForecasts.map((forecast) => {
            const driverRatio =
              forecast.predicted_drivers_needed > 0
                ? (forecast.current_drivers_online / forecast.predicted_drivers_needed) * 100
                : 100;
            const isAtRisk = driverRatio < 100;
            const isCritical = driverRatio < 70;

            return (
              <div
                key={forecast.id}
                className={`p-4 rounded-lg border ${
                  isCritical
                    ? "border-destructive/50 bg-destructive/5"
                    : isAtRisk
                      ? "border-amber-500/50 bg-amber-500/5"
                      : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{forecast.zone_code}</h4>
                  {forecast.surge_predicted && (
                    <Badge variant="destructive" className="text-xs">
                      Surge
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Predicted Orders */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Orders
                    </span>
                    <span className="font-medium">{forecast.predicted_orders}</span>
                  </div>

                  {/* Driver Status */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Drivers
                      </span>
                      <span className="font-medium">
                        {forecast.current_drivers_online}/{forecast.predicted_drivers_needed}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(driverRatio, 100)}
                      className={`h-2 ${
                        isCritical
                          ? "[&>div]:bg-destructive"
                          : isAtRisk
                            ? "[&>div]:bg-amber-500"
                            : "[&>div]:bg-green-500"
                      }`}
                    />
                  </div>

                  {/* Forecast Time */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(forecast.forecast_for), { addSuffix: true })}
                    </span>
                    <span>
                      {Math.round(forecast.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastPanel;
