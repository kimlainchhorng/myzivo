/**
 * Flight Alert Banner
 * Displays critical health alerts at top of analytics dashboard
 */

import { AlertTriangle, XCircle, Clock, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type HealthAlert, getAlertSeverityColor } from "@/hooks/useFlightHealthAlerts";
import { cn } from "@/lib/utils";

interface FlightAlertBannerProps {
  alerts: HealthAlert[];
  onDismiss?: (alertId: string) => void;
}

const alertIcons = {
  no_results: AlertTriangle,
  payment_failures: XCircle,
  ticketing_failures: XCircle,
  api_degradation: Activity,
};

export function FlightAlertBanner({ alerts, onDismiss }: FlightAlertBannerProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  // Sort by severity (critical first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    return 0;
  });

  return (
    <div className="space-y-3 mb-6">
      {sortedAlerts.map((alert) => {
        const Icon = alertIcons[alert.type];
        const colorClass = getAlertSeverityColor(alert.severity);

        return (
          <Alert 
            key={alert.id}
            className={cn("border-2", colorClass)}
          >
            <Icon className="h-5 w-5" />
            <AlertTitle className="flex items-center gap-2">
              {alert.title}
              <Badge 
                variant="outline" 
                className={cn(
                  "ml-2",
                  alert.severity === 'critical' 
                    ? "bg-destructive/10 text-destructive border-destructive/30" 
                    : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                )}
              >
                {alert.severity}
              </Badge>
            </AlertTitle>
            <AlertDescription className="flex items-center justify-between mt-2">
              <span>{alert.message}</span>
              {onDismiss && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDismiss(alert.id)}
                  className="ml-4"
                >
                  Dismiss
                </Button>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}

/**
 * Compact alert indicator for header/nav
 */
export function FlightAlertIndicator({ alertCount }: { alertCount: number }) {
  if (alertCount === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
    >
      {alertCount > 9 ? "9+" : alertCount}
    </Badge>
  );
}
