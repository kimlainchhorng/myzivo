/**
 * Admin Flight Debug Page
 * Shows Duffel search logs for diagnosing issues
 * ADMIN ONLY - Non-admins are redirected
 */

import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Plane, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  ArrowRight,
  ArrowLeft,
  TestTube,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useFlightSearchLogs, useFlightSearchStats, type FlightSearchLog } from "@/hooks/useFlightSearchLogs";
import { isSandboxMode, DUFFEL_SANDBOX_ROUTES } from "@/config/duffelConfig";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function FlightDebugPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();

  // Redirect non-admins
  if (!authLoading && !isAdmin) {
    return <Navigate to="/flights" replace />;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const [routeFilter, setRouteFilter] = useState("");
  const { data: logs, isLoading, refetch } = useFlightSearchLogs(50);
  const { stats } = useFlightSearchStats();
  const sandboxMode = isSandboxMode();

  // Filter logs by route
  const filteredLogs = logs?.filter(log => {
    if (!routeFilter) return true;
    const route = `${log.origin_iata}-${log.destination_iata}`.toLowerCase();
    return route.includes(routeFilter.toLowerCase());
  });

  const handleReplaySearch = (log: FlightSearchLog) => {
    const params = new URLSearchParams({
      origin: log.origin_iata,
      dest: log.destination_iata,
      depart: log.departure_date,
      passengers: String(log.passengers),
      cabin: log.cabin_class,
    });
    if (log.return_date) {
      params.set('return', log.return_date);
    }
    navigate(`/flights/results?${params.toString()}`);
  };

  const handleQuickSearch = (from: string, to: string) => {
    const departDate = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const params = new URLSearchParams({
      origin: from,
      dest: to,
      depart: departDate,
      passengers: '1',
      cabin: 'economy',
    });
    navigate(`/flights/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back nav */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
        </div>
      </div>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Plane className="w-6 h-6 text-sky-500" />
              Flight Search Debug
            </h1>
            <p className="text-muted-foreground text-sm">
              Diagnose Duffel OTA search issues and view request logs
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sandboxMode && (
              <Badge variant="secondary" className="gap-1">
                <TestTube className="w-3 h-3" />
                Sandbox Mode
              </Badge>
            )}
            <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.total_searches}</p>
                <p className="text-xs text-muted-foreground">Total Searches</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className={cn("text-2xl font-bold", stats.success_rate > 50 ? "text-emerald-500" : "text-amber-500")}>
                  {stats.success_rate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{Math.round(stats.avg_response_time)}ms</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">{stats.zero_results_count}</p>
                <p className="text-xs text-muted-foreground">Zero Results</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{stats.error_count}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sandbox Quick Test */}
        {sandboxMode && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TestTube className="w-4 h-4 text-amber-500" />
                Quick Test Routes (Sandbox)
              </CardTitle>
              <CardDescription>
                These routes have reliable test data in Duffel sandbox
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DUFFEL_SANDBOX_ROUTES.map((route) => (
                  <Button
                    key={`${route.from}-${route.to}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch(route.from, route.to)}
                    className="gap-1.5"
                  >
                    {route.from} <ArrowRight className="w-3 h-3" /> {route.to}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter by route (e.g., LAX-JFK)"
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !filteredLogs?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No search logs yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Pax</TableHead>
                      <TableHead>Cabin</TableHead>
                      <TableHead>Offers</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.duffel_error ? (
                            <XCircle className="w-4 h-4 text-destructive" />
                          ) : log.offers_count > 0 ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.origin_iata} → {log.destination_iata}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.departure_date}
                          {log.return_date && (
                            <span className="text-muted-foreground"> / {log.return_date}</span>
                          )}
                        </TableCell>
                        <TableCell>{log.passengers}</TableCell>
                        <TableCell className="capitalize text-xs">{log.cabin_class}</TableCell>
                        <TableCell>
                          <Badge variant={log.offers_count > 0 ? "default" : "secondary"}>
                            {log.offers_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.response_time_ms ? `${log.response_time_ms}ms` : '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-destructive">
                          {log.duffel_error || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), 'MMM d, HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReplaySearch(log)}
                            className="gap-1 text-xs"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Replay
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
