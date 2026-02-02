/**
 * Post-Launch Monitoring Panel
 * Dashboard widgets for real-time monitoring after launch
 */

import { usePostLaunchStats } from "@/hooks/useLaunchSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CreditCard,
  AlertTriangle,
  ClipboardCheck,
  Car,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  variant?: "default" | "warning" | "danger" | "success";
  action?: { label: string; onClick: () => void };
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  action,
}: StatCardProps) {
  const variantStyles = {
    default: "border-border",
    warning: "border-amber-500/30 bg-amber-500/5",
    danger: "border-destructive/30 bg-destructive/5",
    success: "border-green-500/30 bg-green-500/5",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    warning: "text-amber-600",
    danger: "text-destructive",
    success: "text-green-600",
  };

  return (
    <Card className={cn("relative", variantStyles[variant])}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                {trend.value >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    trend.value >= 0 ? "text-green-600" : "text-red-500"
                  )}
                >
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value} {trend.label}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50",
              iconStyles[variant]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs text-primary hover:underline mt-2"
          >
            {action.label} →
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="w-10 h-10 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PostLaunchMonitoringPanel() {
  const { data: stats, isLoading, error } = usePostLaunchStats();

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-6 text-center text-destructive">
          Failed to load monitoring stats
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Post-Launch Monitoring</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const bookingTrend = stats.bookingsToday - stats.bookingsYesterday;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Post-Launch Monitoring</h3>
        <Badge variant="outline" className="text-xs">
          Auto-refreshes every minute
        </Badge>
      </div>

      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Bookings Today"
          value={stats.bookingsToday}
          icon={Calendar}
          trend={{ value: bookingTrend, label: "vs yesterday" }}
          variant="default"
        />

        <StatCard
          title="Failed Payments (24h)"
          value={stats.failedPayments24h}
          icon={CreditCard}
          variant={stats.failedPayments24h > 0 ? "danger" : "default"}
          action={
            stats.failedPayments24h > 0
              ? { label: "Investigate", onClick: () => {} }
              : undefined
          }
        />

        <StatCard
          title="Open Disputes"
          value={stats.openDisputes}
          icon={AlertTriangle}
          variant={stats.openDisputes > 0 ? "warning" : "default"}
          action={
            stats.openDisputes > 0
              ? { label: "Review", onClick: () => {} }
              : undefined
          }
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Pending Verifications"
          value={stats.pendingOwnerVerifications + stats.pendingRenterVerifications}
          icon={ClipboardCheck}
          variant={
            stats.pendingOwnerVerifications + stats.pendingRenterVerifications > 5
              ? "warning"
              : "default"
          }
        />

        <StatCard
          title="New Signups Today"
          value={stats.newOwnersToday + stats.newRentersToday}
          icon={Users}
          variant="success"
        />

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Car className="w-4 h-4" />
              Active Cars by City
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-1.5">
              {Object.entries(stats.activeCarsByCity)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([city, count]) => (
                  <div
                    key={city}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground truncate">{city}</span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              {Object.keys(stats.activeCarsByCity).length === 0 && (
                <p className="text-xs text-muted-foreground">No active cars</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown badges */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>
          Owners pending: <strong>{stats.pendingOwnerVerifications}</strong>
        </span>
        <span>•</span>
        <span>
          Renters pending: <strong>{stats.pendingRenterVerifications}</strong>
        </span>
        <span>•</span>
        <span>
          New owners today: <strong>{stats.newOwnersToday}</strong>
        </span>
        <span>•</span>
        <span>
          New renters today: <strong>{stats.newRentersToday}</strong>
        </span>
      </div>
    </div>
  );
}
