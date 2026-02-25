/**
 * Flight Incident Log - Admin Dashboard
 * View incident history, statistics, and resolution metrics
 */

import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveIncident, useIncidentHistory, useIncidentStats } from "@/hooks/useIncidentLogs";
import { INCIDENT_REASONS, type IncidentReasonCode } from "@/types/flightsLaunch";
import {
  Plane,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingDown,
  ArrowLeft,
  Loader2,
  Bell,
  XCircle,
  History,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const getReasonLabel = (code: IncidentReasonCode): string => {
  return INCIDENT_REASONS.find(r => r.code === code)?.label || code;
};

const FlightIncidentLog = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: activeIncident, isLoading: activeLoading } = useActiveIncident();
  const { data: history, isLoading: historyLoading } = useIncidentHistory(50);
  const { data: stats, isLoading: statsLoading } = useIncidentStats();

  // Redirect non-admins
  if (!authLoading && !isAdmin) {
    return <Navigate to="/flights" replace />;
  }

  const isLoading = authLoading || activeLoading || historyLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Flight Incident Log | Admin" 
        description="View flight incident history and metrics."
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 gap-2">
              <Link to="/admin/flights/launch">
                <ArrowLeft className="w-4 h-4" />
                Back to Launch Control
              </Link>
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <History className="w-6 h-6 text-primary" />
                  Flight Incident Log
                </h1>
                <p className="text-muted-foreground">Incident history and resolution metrics</p>
              </div>
            </div>
          </div>

          {/* Active Incident Banner */}
          {activeIncident && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>Active Incident:</strong>{" "}
                  {getReasonLabel(activeIncident.reason_code as IncidentReasonCode)}
                  <span className="text-xs ml-2 opacity-70">
                    (started {formatDistanceToNow(new Date(activeIncident.started_at), { addSuffix: true })})
                  </span>
                </div>
                <Button size="sm" variant="outline" asChild className="ml-4">
                  <Link to="/admin/flights/launch">Manage</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Overview */}
          {stats && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <p className="text-sm text-muted-foreground">Total Incidents</p>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalIncidents}</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <p className="text-sm text-muted-foreground">Resolved</p>
                    </div>
                    <p className="text-2xl font-bold">{stats.resolvedIncidents}</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <p className="text-sm text-muted-foreground">Avg Resolution</p>
                    </div>
                    <p className="text-2xl font-bold">{stats.avgResolutionMinutes}m</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Customers Notified</p>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalCustomersNotified}</p>
                  </div>
                </div>

                {/* Breakdown by reason */}
                {Object.keys(stats.byReason).length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-2">By Reason</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.byReason).map(([code, count]) => (
                        <Badge key={code} variant="outline" className="gap-1">
                          {getReasonLabel(code as IncidentReasonCode)}
                          <span className="bg-muted px-1.5 py-0.5 rounded text-xs ml-1">{count}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Incident History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Incident History
              </CardTitle>
              <CardDescription>
                All recorded incidents with resolution details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!history?.length ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No incidents recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((incident) => {
                    const isResolved = !!incident.resolved_at;
                    const duration = incident.resolved_at
                      ? Math.round((new Date(incident.resolved_at).getTime() - new Date(incident.started_at).getTime()) / 1000 / 60)
                      : null;

                    return (
                      <div 
                        key={incident.id} 
                        className={`p-4 rounded-xl border ${
                          isResolved ? 'bg-muted/20' : 'bg-destructive/5 border-destructive/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {isResolved ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-destructive" />
                              )}
                              <span className="font-medium">
                                {getReasonLabel(incident.reason_code as IncidentReasonCode)}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  incident.incident_type === 'auto_pause' 
                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                    : 'bg-muted'
                                }`}
                              >
                                {incident.incident_type === 'auto_pause' ? 'Auto' : 'Manual'}
                              </Badge>
                            </div>
                            
                            {incident.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {incident.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>
                                Started: {format(new Date(incident.started_at), 'MMM d, HH:mm')}
                              </span>
                              {isResolved && (
                                <span>
                                  Duration: {duration}m
                                </span>
                              )}
                              {incident.affected_bookings_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <TrendingDown className="w-3 h-3" />
                                  {incident.affected_bookings_count} booking{incident.affected_bookings_count > 1 ? 's' : ''} affected
                                </span>
                              )}
                              {incident.customers_notified > 0 && (
                                <span className="flex items-center gap-1">
                                  <Bell className="w-3 h-3" />
                                  {incident.customers_notified} notified
                                </span>
                              )}
                            </div>

                            {incident.resolution_notes && (
                              <p className="text-xs text-muted-foreground mt-2 p-2 rounded bg-muted/30">
                                Resolution: {incident.resolution_notes}
                              </p>
                            )}
                          </div>

                          <Badge 
                            variant={isResolved ? "outline" : "destructive"}
                            className={isResolved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : ""}
                          >
                            {isResolved ? 'Resolved' : 'Active'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
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

export default FlightIncidentLog;
