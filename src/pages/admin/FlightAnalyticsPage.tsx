/**
 * Flight Analytics Dashboard
 * OTA-grade analytics with KPIs, funnel, revenue, and failure visibility
 */

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Download, ArrowLeft, Search, Ticket, DollarSign, TrendingUp, Percent } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFlightKPIs, useFlightRevenue, useFlightTopRoutes, useFlightFailures, useFlightChartData, type TimeRange } from "@/hooks/useFlightAnalytics";
import { useFlightHealthAlerts } from "@/hooks/useFlightHealthAlerts";
import { FlightFunnelChart } from "@/components/admin/FlightFunnelChart";
import { FlightRevenueChart } from "@/components/admin/FlightRevenueChart";
import { FlightTopRoutes } from "@/components/admin/FlightTopRoutes";
import { FlightFailuresTable } from "@/components/admin/FlightFailuresTable";
import { FlightAlertBanner } from "@/components/admin/FlightAlertBanner";
import { exportBookingsCSV, exportRevenueReportCSV, exportFailedTransactionsCSV } from "@/lib/flightExports";
import { useToast } from "@/hooks/use-toast";

const FlightAnalyticsPage = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  // Data hooks
  const { data: kpis, isLoading: kpisLoading, refetch: refetchKPIs } = useFlightKPIs(timeRange);
  const { data: revenue, isLoading: revenueLoading } = useFlightRevenue(timeRange);
  const { data: routes, isLoading: routesLoading } = useFlightTopRoutes(timeRange);
  const { data: failures, isLoading: failuresLoading } = useFlightFailures(timeRange);
  const { data: chartData, isLoading: chartLoading } = useFlightChartData(timeRange);
  const { data: alerts } = useFlightHealthAlerts();

  // Redirect non-admins
  if (!authLoading && !isAdmin) {
    return <Navigate to="/flights" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleExport = async (type: "bookings" | "revenue" | "failures") => {
    try {
      if (type === "bookings") await exportBookingsCSV();
      else if (type === "revenue") await exportRevenueReportCSV();
      else await exportFailedTransactionsCSV();
      toast({ title: "Export complete", description: "CSV file downloaded" });
    } catch (error) {
      toast({ title: "Export failed", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Flight Analytics | Admin" description="Flight booking analytics and revenue tracking" />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link to="/admin/flights/status">
                <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Flight Analytics</h1>
                <p className="text-muted-foreground">Revenue, conversions, and booking funnel</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetchKPIs()}><RefreshCw className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Health Alerts */}
          <FlightAlertBanner alerts={alerts || []} />

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Searches</span>
                </div>
                <p className="text-2xl font-bold">{kpis?.searchesTotal?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">{kpis?.searchesToday || 0} today</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Bookings</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{kpis?.bookingsCompleted || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Revenue</span>
                </div>
                <p className="text-2xl font-bold">${revenue?.revenueTotal?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">${revenue?.revenueToday || 0} today</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Avg Value</span>
                </div>
                <p className="text-2xl font-bold">${revenue?.avgBookingValue?.toFixed(0) || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Conversion</span>
                </div>
                <p className="text-2xl font-bold text-primary">{kpis?.conversionRate?.toFixed(2) || 0}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="funnel" className="space-y-6">
            <TabsList>
              <TabsTrigger value="funnel">Funnel</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="failures">Failures</TabsTrigger>
            </TabsList>

            <TabsContent value="funnel">
              <FlightFunnelChart
                searches={kpis?.searchesTotal || 0}
                resultsShown={kpis?.resultsShown || 0}
                checkoutsStarted={kpis?.checkoutsStarted || 0}
                bookingsCompleted={kpis?.bookingsCompleted || 0}
              />
            </TabsContent>

            <TabsContent value="charts">
              <FlightRevenueChart data={chartData || []} isLoading={chartLoading} />
            </TabsContent>

            <TabsContent value="routes">
              <FlightTopRoutes
                topSearched={routes?.topSearched || []}
                topBooked={routes?.topBooked || []}
                zeroResults={routes?.zeroResults || []}
                isLoading={routesLoading}
              />
            </TabsContent>

            <TabsContent value="failures">
              <FlightFailuresTable data={failures} isLoading={failuresLoading} />
            </TabsContent>
          </Tabs>

          {/* Export Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" onClick={() => handleExport("bookings")}>Export Bookings CSV</Button>
              <Button variant="outline" onClick={() => handleExport("revenue")}>Export Revenue Report</Button>
              <Button variant="outline" onClick={() => handleExport("failures")}>Export Failed Transactions</Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FlightAnalyticsPage;
