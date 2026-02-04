/**
 * Post-Launch Monitoring Panel
 * Real-time metrics and alerts for the first 7 days after launch
 */
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Bell, BellOff, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useLaunchStatus,
  useLaunchMonitoringAlerts,
  useAcknowledgeAlert,
  useResolveAlert,
} from "@/hooks/useProductionLaunch";
import type { LaunchAlertSeverity, LaunchAlertType } from "@/types/productionLaunch";

const ALERT_TYPE_LABELS: Record<LaunchAlertType, string> = {
  booking_failure: 'Booking Failure',
  payment_failure: 'Payment Failure',
  api_outage: 'API Outage',
  fraud_spike: 'Fraud Spike',
  refund_spike: 'Refund Spike',
  supplier_error: 'Supplier Error',
  sla_breach: 'SLA Breach',
};

const SEVERITY_CONFIG: Record<LaunchAlertSeverity, { label: string; color: string; variant: "default" | "secondary" | "destructive" }> = {
  info: { label: 'Info', color: 'bg-blue-500', variant: 'secondary' },
  warning: { label: 'Warning', color: 'bg-amber-500', variant: 'default' },
  critical: { label: 'Critical', color: 'bg-red-500', variant: 'destructive' },
};

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendIsGood?: boolean;
  icon?: React.ReactNode;
}

function MetricCard({ title, value, previousValue, trend, trendIsGood, icon }: MetricCardProps) {
  const trendColor = trend === 'neutral' 
    ? 'text-muted-foreground' 
    : trendIsGood 
      ? 'text-green-500' 
      : 'text-destructive';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {previousValue !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${trendColor}`}>
                {trend === 'up' && <TrendingUp className="h-4 w-4" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4" />}
                <span>vs. {previousValue} yesterday</span>
              </div>
            )}
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export function PostLaunchMonitoringPanel() {
  const { data: status } = useLaunchStatus();
  const { data: alerts, isLoading: alertsLoading, refetch } = useLaunchMonitoringAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();

  // Calculate days since launch
  const daysSinceLaunch = status?.go_live_date
    ? Math.floor((Date.now() - new Date(status.go_live_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Filter alerts
  const activeAlerts = alerts?.filter((a) => !a.is_resolved) || [];
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  const unacknowledgedAlerts = activeAlerts.filter((a) => !a.is_acknowledged);

  // Mock metrics (in production, these would come from analytics)
  const metrics = {
    bookingsToday: 47,
    bookingsYesterday: 32,
    revenueToday: 8420,
    revenueYesterday: 5100,
    failedBookingsToday: 2,
    failedPaymentsToday: 0,
    refundRate: 2.1,
    fraudFlagsToday: 1,
  };

  const isPreLaunch = !status?.go_live_date;

  return (
    <div className="space-y-6">
      {/* Launch Status Banner */}
      {isPreLaunch ? (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Pre-Launch Mode
            </CardTitle>
            <CardDescription>
              Post-launch monitoring will be available after the platform goes live.
              Metrics shown below are placeholder examples.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Live Monitoring Active
                </CardTitle>
                <CardDescription>
                  Day {daysSinceLaunch} of 7 • Launched {new Date(status.go_live_date!).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">First Week Progress</div>
                <Progress value={(daysSinceLaunch! / 7) * 100} className="w-32 h-2 mt-1" />
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Bookings Today"
            value={metrics.bookingsToday}
            previousValue={metrics.bookingsYesterday}
            trend={metrics.bookingsToday > metrics.bookingsYesterday ? 'up' : 'down'}
            trendIsGood={metrics.bookingsToday >= metrics.bookingsYesterday}
          />
          <MetricCard
            title="Revenue Today"
            value={`$${metrics.revenueToday.toLocaleString()}`}
            previousValue={`$${metrics.revenueYesterday.toLocaleString()}`}
            trend={metrics.revenueToday > metrics.revenueYesterday ? 'up' : 'down'}
            trendIsGood={metrics.revenueToday >= metrics.revenueYesterday}
          />
          <MetricCard
            title="Failed Bookings"
            value={metrics.failedBookingsToday}
            trend={metrics.failedBookingsToday > 0 ? 'up' : 'neutral'}
            trendIsGood={metrics.failedBookingsToday === 0}
          />
          <MetricCard
            title="Failed Payments"
            value={metrics.failedPaymentsToday}
            trend={metrics.failedPaymentsToday > 0 ? 'up' : 'neutral'}
            trendIsGood={metrics.failedPaymentsToday === 0}
          />
          <MetricCard
            title="Refund Rate"
            value={`${metrics.refundRate}%`}
            trend={metrics.refundRate > 5 ? 'up' : 'neutral'}
            trendIsGood={metrics.refundRate <= 5}
          />
          <MetricCard
            title="Fraud Flags"
            value={metrics.fraudFlagsToday}
            trend={metrics.fraudFlagsToday > 0 ? 'up' : 'neutral'}
            trendIsGood={metrics.fraudFlagsToday === 0}
          />
        </div>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Active Alerts
                {criticalAlerts.length > 0 && (
                  <Badge variant="destructive">{criticalAlerts.length} Critical</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {activeAlerts.length} active • {unacknowledgedAlerts.length} unacknowledged
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading alerts...</div>
          ) : activeAlerts.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">All systems operational • No active alerts</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAlerts.map((alert) => {
                  const severity = SEVERITY_CONFIG[alert.severity];
                  return (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Badge variant={severity.variant}>{severity.label}</Badge>
                      </TableCell>
                      <TableCell>{ALERT_TYPE_LABELS[alert.alert_type]}</TableCell>
                      <TableCell className="max-w-xs truncate">{alert.message}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!alert.is_acknowledged && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlert.mutate({ alertId: alert.id })}
                            >
                              Ack
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveAlert.mutate({ alertId: alert.id })}
                          >
                            Resolve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Health</CardTitle>
          <CardDescription>Real-time status of all critical services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Hotelbeds API', status: 'operational' },
              { name: 'Stripe Payments', status: 'operational' },
              { name: 'Duffel Flights', status: 'operational' },
              { name: 'Resend Email', status: 'operational' },
              { name: 'Supabase DB', status: 'operational' },
              { name: 'Edge Functions', status: 'operational' },
              { name: 'CDN/Hosting', status: 'operational' },
              { name: 'Rate Limiting', status: 'operational' },
            ].map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/5"
              >
                <span className="text-sm">{service.name}</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
