/**
 * Traffic Quality Monitor Component
 * Real-time monitoring of traffic quality indicators
 */

import { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  Globe,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TRAFFIC_QUALITY_RULES } from "@/config/riskManagement";
import { cn } from "@/lib/utils";

interface TrafficMetrics {
  totalSessions: number;
  botScore: number;
  suspiciousClicks: number;
  clickToBookingRatio: number;
  geographicAnomalies: number;
  vpnTraffic: number;
  spikeDetected: boolean;
}

interface TrafficQualityMonitorProps {
  metrics?: TrafficMetrics;
  variant?: "full" | "compact" | "inline";
  className?: string;
}

const DEFAULT_METRICS: TrafficMetrics = {
  totalSessions: 0,
  botScore: 0,
  suspiciousClicks: 0,
  clickToBookingRatio: 0,
  geographicAnomalies: 0,
  vpnTraffic: 0,
  spikeDetected: false,
};

export function TrafficQualityMonitor({
  metrics = DEFAULT_METRICS,
  variant = "full",
  className,
}: TrafficQualityMonitorProps) {
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const newAlerts: string[] = [];

    // Check for bot threshold
    if (metrics.botScore >= TRAFFIC_QUALITY_RULES.botDetection.threshold) {
      newAlerts.push("High bot traffic detected");
    }

    // Check for click farm indicators
    if (metrics.clickToBookingRatio > 100) {
      newAlerts.push("High clicks with zero bookings - potential click farm");
    }

    // Check for traffic spike
    if (metrics.spikeDetected) {
      newAlerts.push("Unusual traffic spike detected");
    }

    setAlerts(newAlerts);
  }, [metrics]);

  const getHealthStatus = () => {
    if (alerts.length === 0) return { status: "healthy", color: "text-emerald-500" };
    if (alerts.length <= 2) return { status: "warning", color: "text-amber-500" };
    return { status: "critical", color: "text-red-500" };
  };

  const health = getHealthStatus();

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Shield className={cn("w-4 h-4", health.color)} />
        <span className="text-sm">
          Traffic Quality: <span className={health.color}>{health.status}</span>
        </span>
        {alerts.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {alerts.length} alert{alerts.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className={cn("w-5 h-5", health.color)} />
              <span className="font-medium text-sm">Traffic Quality</span>
            </div>
            <Badge
              variant={health.status === "healthy" ? "default" : "destructive"}
              className="text-xs"
            >
              {health.status}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold">{metrics.totalSessions}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div>
              <p className="text-xl font-bold">{metrics.botScore}%</p>
              <p className="text-xs text-muted-foreground">Bot Score</p>
            </div>
            <div>
              <p className="text-xl font-bold">{metrics.suspiciousClicks}</p>
              <p className="text-xs text-muted-foreground">Flagged</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className={cn("w-5 h-5", health.color)} />
            Traffic Quality Monitor
          </CardTitle>
          <Badge
            variant={health.status === "healthy" ? "default" : "destructive"}
          >
            {health.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alerts */}
        {alerts.length > 0 && (
          <Alert variant="destructive" className="border-red-500/20">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <ul className="list-disc list-inside text-sm">
                {alerts.map((alert, i) => (
                  <li key={i}>{alert}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MetricCard
            icon={Users}
            label="Total Sessions"
            value={metrics.totalSessions.toLocaleString()}
          />
          <MetricCard
            icon={Bot}
            label="Bot Score"
            value={`${metrics.botScore}%`}
            status={
              metrics.botScore >= TRAFFIC_QUALITY_RULES.botDetection.threshold
                ? "danger"
                : "ok"
            }
          />
          <MetricCard
            icon={Zap}
            label="Suspicious Clicks"
            value={metrics.suspiciousClicks.toString()}
            status={metrics.suspiciousClicks > 10 ? "warning" : "ok"}
          />
          <MetricCard
            icon={TrendingUp}
            label="Click:Booking Ratio"
            value={`${metrics.clickToBookingRatio}:1`}
            status={metrics.clickToBookingRatio > 100 ? "danger" : "ok"}
          />
          <MetricCard
            icon={Globe}
            label="Geo Anomalies"
            value={metrics.geographicAnomalies.toString()}
            status={metrics.geographicAnomalies > 5 ? "warning" : "ok"}
          />
          <MetricCard
            icon={Activity}
            label="VPN Traffic"
            value={`${metrics.vpnTraffic}%`}
          />
        </div>

        {/* Bot Score Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bot Detection Score</span>
            <span className="font-medium">{metrics.botScore}%</span>
          </div>
          <Progress
            value={metrics.botScore}
            className={cn(
              "h-2",
              metrics.botScore >= 70 && "[&>div]:bg-red-500",
              metrics.botScore >= 50 && metrics.botScore < 70 && "[&>div]:bg-amber-500"
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Threshold: {TRAFFIC_QUALITY_RULES.botDetection.threshold}%</span>
            <span>Captcha: {TRAFFIC_QUALITY_RULES.botDetection.captchaThreshold}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  status?: "ok" | "warning" | "danger";
}

function MetricCard({ icon: Icon, label, value, status = "ok" }: MetricCardProps) {
  const statusColors = {
    ok: "text-foreground",
    warning: "text-amber-500",
    danger: "text-red-500",
  };

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-lg font-semibold", statusColors[status])}>{value}</p>
    </div>
  );
}

export default TrafficQualityMonitor;
