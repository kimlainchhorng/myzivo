/**
 * Admin System Status Page
 * Displays real-time health status for Duffel, Stripe, and booking systems
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  RefreshCw,
  Plane,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Ticket,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { useFlightSystemHealth, getStatusColor, getStatusBadgeVariant } from "@/hooks/useFlightSystemHealth";
import { getEnvironmentBadge } from "@/config/productionSafety";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const SystemStatusPage = () => {
  const navigate = useNavigate();
  const { data: health, isLoading, refetch, isFetching } = useFlightSystemHealth();
  const envBadge = getEnvironmentBadge();

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'down':
      case 'critical':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const StatusBadge = ({ status, label }: { status: string; label?: string }) => (
    <Badge 
      variant={getStatusBadgeVariant(status)} 
      className={cn("gap-1", getStatusColor(status as any))}
    >
      {label || status.toUpperCase()}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="System Status – Admin | ZIVO"
        description="Monitor ZIVO Flights system health and status."
      />
      <Header />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">System Status</h1>
                  <Badge variant={envBadge.variant as any}>{envBadge.text}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Real-time monitoring for ZIVO Flights infrastructure
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Overall Status */}
              {health && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border">
                  <StatusIcon status={health.overall} />
                  <span className="font-medium">
                    {health.overall === 'healthy' ? 'All Systems Operational' :
                     health.overall === 'degraded' ? 'Degraded Performance' :
                     'System Issues Detected'}
                  </span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Duffel API Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plane className="w-4 h-4 text-sky-500" />
                  Duffel API
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <StatusIcon status={health?.duffel.status || 'unknown'} />
                      <StatusBadge status={health?.duffel.status || 'unknown'} />
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Error Rate: <span className={cn(
                        health?.duffel.errorRate && health.duffel.errorRate > 10 ? "text-amber-500 font-medium" : ""
                      )}>{health?.duffel.errorRate || 0}%</span></p>
                      <p>Avg Response: {health?.duffel.avgResponseTime || 0}ms</p>
                      <p>Searches (1h): {health?.duffel.totalSearches || 0}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stripe Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="w-4 h-4 text-violet-500" />
                  Stripe Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <StatusIcon status={health?.stripe.status || 'unknown'} />
                      <StatusBadge status={health?.stripe.status || 'unknown'} />
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Mode: <span className="capitalize">{health?.stripe.mode || 'unknown'}</span></p>
                      <p>Failed Payments: {health?.stripe.failedPayments || 0}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Last Successful Ticket */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Ticket className="w-4 h-4 text-emerald-500" />
                  Last Issued Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">
                        {health?.bookings.lastSuccessAt 
                          ? formatDistanceToNow(new Date(health.bookings.lastSuccessAt), { addSuffix: true })
                          : 'No tickets issued'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Pending Tickets: {health?.bookings.pendingTickets || 0}</p>
                      <p>Total Today: {health?.bookings.totalToday || 0}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Failed Bookings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Failed Bookings (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-3xl font-bold",
                        (health?.bookings.failedToday || 0) > 0 ? "text-destructive" : "text-emerald-500"
                      )}>
                        {health?.bookings.failedToday || 0}
                      </span>
                      <StatusBadge status={health?.bookings.status || 'unknown'} />
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Payment→Failure Rate: {health?.bookings.paymentToFailureRate || 0}%</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Active Alerts
              </CardTitle>
              <CardDescription>
                Unresolved system alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-32" />
                  <Skeleton className="h-16 w-32" />
                  <Skeleton className="h-16 w-32" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <XCircle className="w-6 h-6 text-destructive" />
                    <div>
                      <p className="text-2xl font-bold text-destructive">{health?.alerts.critical || 0}</p>
                      <p className="text-sm text-muted-foreground">Critical</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold text-amber-500">{health?.alerts.warning || 0}</p>
                      <p className="text-sm text-muted-foreground">Warning</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border">
                    <Activity className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{health?.alerts.unresolved || 0}</p>
                      <p className="text-sm text-muted-foreground">Unresolved</p>
                    </div>
                  </div>

                  {(health?.alerts.unresolved || 0) > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin/flights/status")}
                      className="ml-auto"
                    >
                      View All Alerts
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => navigate("/admin/flights/status")}>
                  Flight Status Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/admin/flights/debug")}>
                  Debug Panel
                </Button>
                <Button variant="outline" onClick={() => navigate("/admin/travel/logs")}>
                  View Logs
                </Button>
                <Button variant="outline" onClick={() => navigate("/admin")}>
                  Admin Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SystemStatusPage;
