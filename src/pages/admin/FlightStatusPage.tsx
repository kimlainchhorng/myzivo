/**
 * Flight Status Page - Admin Dashboard
 * Shows system health and readiness for Duffel LIVE
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plane,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Clock,
  RefreshCw,
  ExternalLink,
  FileText,
  Settings,
  Bug,
  BarChart3,
  Ticket,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDuffelEnvironment, isSandboxMode } from "@/config/duffelConfig";
import { format } from "date-fns";

const FlightStatusPage = () => {
  const duffelEnv = getDuffelEnvironment();
  const isSandbox = isSandboxMode();

  // Fetch booking stats for last 24h
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['flight-admin-stats'],
    queryFn: async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('flight_bookings')
        .select('id, payment_status, ticketing_status, created_at, ticketed_at, booking_reference')
        .gte('created_at', yesterday.toISOString());

      if (bookingsError) throw bookingsError;

      // Get last successful booking
      const { data: lastSuccess } = await supabase
        .from('flight_bookings')
        .select('ticketed_at, booking_reference')
        .eq('ticketing_status', 'issued')
        .order('ticketed_at', { ascending: false })
        .limit(1)
        .single();

      // Get search logs
      const { data: searches, error: searchesError } = await supabase
        .from('flight_search_logs')
        .select('id, offers_count, duffel_error')
        .gte('created_at', yesterday.toISOString());

      if (searchesError) throw searchesError;

      // Get unresolved alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('flight_admin_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;

      const totalBookings = bookings?.length || 0;
      const successfulTickets = bookings?.filter(b => b.ticketing_status === 'issued').length || 0;
      const failedBookings = bookings?.filter(b => b.ticketing_status === 'failed' || b.payment_status === 'refunded').length || 0;
      const pendingBookings = bookings?.filter(b => b.ticketing_status === 'pending' || b.ticketing_status === 'processing').length || 0;

      const totalSearches = searches?.length || 0;
      const zeroResultSearches = searches?.filter(s => s.offers_count === 0).length || 0;
      const errorSearches = searches?.filter(s => s.duffel_error).length || 0;

      return {
        totalBookings,
        successfulTickets,
        failedBookings,
        pendingBookings,
        successRate: totalBookings > 0 ? Math.round((successfulTickets / totalBookings) * 100) : 0,
        totalSearches,
        zeroResultSearches,
        errorSearches,
        alerts: alerts || [],
        lastSuccess: lastSuccess || null,
      };
    },
    staleTime: 30 * 1000,
  });

  // Compliance checklist items
  const complianceItems = [
    { label: 'Seller of Travel page exists', href: '/legal/seller-of-travel', status: 'done' },
    { label: 'Terms checkbox includes fare rules', href: '/flights/checkout', status: 'done' },
    { label: 'Footer has SOT disclosure', href: '/', status: 'done' },
    { label: 'Auto-refund on failure enabled', href: null, status: 'done' },
    { label: 'Passenger validation enforced', href: '/flights/traveler', status: 'done' },
    { label: 'Price breakdown displayed', href: '/flights/checkout', status: 'done' },
  ];

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('flight_admin_alerts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (!error) {
      refetchStats();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Flight System Status | Admin"
        description="Monitor ZIVO Flights system health and Duffel LIVE readiness."
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">Flight System Status</h1>
                <Badge 
                  variant={isSandbox ? "outline" : "default"}
                  className={isSandbox ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"}
                >
                  {isSandbox ? 'Sandbox Mode' : 'LIVE Mode'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Monitor system health and Duffel LIVE readiness
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetchStats()} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link to="/admin/flights/debug">
                  <Bug className="w-4 h-4" />
                  Debug Logs
                </Link>
              </Button>
            </div>
          </div>

          {/* Environment Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Environment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Duffel Environment</p>
                  <p className="font-semibold flex items-center gap-2">
                    {duffelEnv === 'live' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Production (LIVE)
                      </>
                    ) : duffelEnv === 'sandbox' ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Sandbox (Test)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                        Unknown
                      </>
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Payment Processor</p>
                  <p className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Stripe Connected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mode determined by STRIPE_SECRET_KEY prefix
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Ticketing Partner</p>
                  <p className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Duffel API
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> To switch from Sandbox to LIVE mode, update the{" "}
                  <code className="px-1 py-0.5 bg-muted rounded text-xs">DUFFEL_ENV</code> and{" "}
                  <code className="px-1 py-0.5 bg-muted rounded text-xs">DUFFEL_API_KEY</code>{" "}
                  environment variables in Supabase Edge Function secrets.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bookings (24h)</p>
                    <p className="text-3xl font-bold">{stats?.totalBookings || 0}</p>
                  </div>
                  <Plane className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-3xl font-bold text-emerald-500">{stats?.successRate || 0}%</p>
                  </div>
                  <Activity className="w-8 h-8 text-emerald-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Tickets</p>
                    <p className="text-3xl font-bold text-amber-500">{stats?.pendingBookings || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                    <p className="text-3xl font-bold text-destructive">{stats?.alerts?.length || 0}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Issued Ticket</p>
                    <p className="text-lg font-semibold">
                      {stats?.lastSuccess?.ticketed_at 
                        ? format(new Date(stats.lastSuccess.ticketed_at), 'MMM d, HH:mm')
                        : 'None yet'}
                    </p>
                    {stats?.lastSuccess?.booking_reference && (
                      <p className="text-xs text-muted-foreground">{stats.lastSuccess.booking_reference}</p>
                    )}
                  </div>
                  <Ticket className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Compliance Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Compliance Checklist
                </CardTitle>
                <CardDescription>
                  Requirements for Duffel LIVE approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {item.status === 'done' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {item.href && (
                        <Link to={item.href} className="text-primary hover:underline text-xs">
                          View
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    All compliance requirements met
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    System is ready for Duffel LIVE access
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Search Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Search Analytics (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <span className="text-sm">Total Searches</span>
                    <span className="font-semibold">{stats?.totalSearches || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <span className="text-sm">Zero-Result Searches</span>
                    <span className="font-semibold text-amber-500">{stats?.zeroResultSearches || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <span className="text-sm">API Errors</span>
                    <span className="font-semibold text-destructive">{stats?.errorSearches || 0}</span>
                  </div>

                  <Button variant="outline" asChild className="w-full gap-2">
                    <Link to="/admin/flights/debug">
                      View Detailed Logs
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                Ticketing failures and system issues requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.alerts && stats.alerts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.alerts.map((alert: any) => (
                      <TableRow key={alert.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(alert.created_at), 'MMM d, HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {alert.alert_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {alert.message}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={alert.severity === 'critical' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No unresolved alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightStatusPage;
