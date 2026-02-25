/**
 * Flight Performance & Cost Dashboard
 * Admin view for API usage, caching stats, and performance metrics
 */

import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import {
  Gauge,
  TrendingUp,
  Database,
  Zap,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  BarChart3,
  Settings,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface ApiUsage {
  date: string;
  searches_total: number;
  searches_cached: number;
  searches_live: number;
  bookings_total: number;
  avg_response_time_ms: number;
  errors_count: number;
}

interface ApiLimits {
  id: string;
  daily_search_cap: number;
  daily_booking_cap: number | null;
  alert_threshold_percent: number;
  cache_ttl_seconds: number;
  is_active: boolean;
}

const FlightPerformancePage = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingLimits, setEditingLimits] = useState(false);
  const [limitsForm, setLimitsForm] = useState<Partial<ApiLimits>>({});

  // Fetch usage data for last 7 days
  const { data: usageData = [], isLoading: usageLoading } = useQuery({
    queryKey: ['flight-api-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flight_api_usage')
        .select('*')
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;
      return (data || []) as ApiUsage[];
    },
  });

  // Fetch current limits
  const { data: limits } = useQuery({
    queryKey: ['flight-api-limits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flight_api_limits')
        .select('*')
        .single();

      if (error) throw error;
      return data as ApiLimits;
    },
  });

  // Fetch cache stats
  const { data: cacheStats } = useQuery({
    queryKey: ['flight-cache-stats'],
    queryFn: async () => {
      const { data: cache, error } = await supabase
        .from('flight_search_cache')
        .select('hits, created_at, expires_at')
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      const totalEntries = cache?.length || 0;
      const totalHits = cache?.reduce((sum, c) => sum + (c.hits || 0), 0) || 0;

      return {
        activeEntries: totalEntries,
        totalHits,
        avgHitsPerEntry: totalEntries > 0 ? Math.round(totalHits / totalEntries * 10) / 10 : 0,
      };
    },
  });

  // Update limits mutation
  const updateLimits = useMutation({
    mutationFn: async (newLimits: Partial<ApiLimits>) => {
      const { error } = await supabase
        .from('flight_api_limits')
        .update({
          ...newLimits,
          updated_at: new Date().toISOString(),
        })
        .eq('id', limits?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flight-api-limits'] });
      setEditingLimits(false);
      toast({ title: 'Limits updated', description: 'API limits saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    },
  });

  // Clear expired cache
  const clearCache = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('flight_search_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flight-cache-stats'] });
      toast({ title: 'Cache cleared', description: 'Expired cache entries removed.' });
    },
  });

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

  // Calculate today's stats
  const todayUsage = usageData.find(u => u.date === new Date().toISOString().split('T')[0]);
  const searchesToday = todayUsage?.searches_total || 0;
  const cachedToday = todayUsage?.searches_cached || 0;
  const liveToday = todayUsage?.searches_live || 0;
  const cacheHitRate = searchesToday > 0 ? Math.round((cachedToday / searchesToday) * 100) : 0;
  const avgResponseTime = todayUsage?.avg_response_time_ms || 0;
  const errorsToday = todayUsage?.errors_count || 0;

  // Calculate usage percentage
  const usagePercent = limits?.daily_search_cap 
    ? Math.round((liveToday / limits.daily_search_cap) * 100) 
    : 0;
  const isNearLimit = usagePercent >= (limits?.alert_threshold_percent || 80);

  // Chart data
  const chartData = usageData.slice().reverse().map(u => ({
    date: format(new Date(u.date), 'MMM d'),
    live: u.searches_live,
    cached: u.searches_cached,
    total: u.searches_total,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Flight Performance | Admin" 
        description="Monitor API usage and performance." 
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 gap-2">
              <Link to="/admin/flights/status">
                <ArrowLeft className="w-4 h-4" />
                Back to Flights Status
              </Link>
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <Gauge className="w-6 h-6 text-primary" />
                  Flight Performance & Costs
                </h1>
                <p className="text-muted-foreground">Monitor API usage, caching, and performance</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['flight-api-usage'] })}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className={cn(isNearLimit && 'border-amber-500/50')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Searches Today</p>
                    <p className="text-2xl font-bold">{searchesToday.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {liveToday} live / {cachedToday} cached
                    </p>
                  </div>
                  <TrendingUp className={cn(
                    "w-8 h-8 opacity-20",
                    isNearLimit ? "text-amber-500" : "text-primary"
                  )} />
                </div>
                {limits?.daily_search_cap && (
                  <Progress 
                    value={usagePercent} 
                    className={cn("mt-3 h-2", isNearLimit && "[&>div]:bg-amber-500")} 
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                    <p className="text-2xl font-bold text-emerald-500">{cacheHitRate}%</p>
                    <p className="text-xs text-muted-foreground">
                      {cacheStats?.activeEntries || 0} active entries
                    </p>
                  </div>
                  <Database className="w-8 h-8 text-emerald-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold">{avgResponseTime}ms</p>
                    <p className="text-xs text-muted-foreground">
                      {avgResponseTime < 2000 ? 'Good' : avgResponseTime < 4000 ? 'Moderate' : 'Slow'}
                    </p>
                  </div>
                  <Zap className={cn(
                    "w-8 h-8 opacity-20",
                    avgResponseTime < 2000 ? "text-emerald-500" : "text-amber-500"
                  )} />
                </div>
              </CardContent>
            </Card>

            <Card className={cn(errorsToday > 0 && 'border-red-500/50')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Errors Today</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      errorsToday > 0 ? "text-red-500" : "text-emerald-500"
                    )}>
                      {errorsToday}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {errorsToday === 0 ? 'No issues' : 'Check logs'}
                    </p>
                  </div>
                  {errorsToday > 0 ? (
                    <AlertTriangle className="w-8 h-8 text-red-500 opacity-20" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-emerald-500 opacity-20" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Usage Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Search Volume (7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No usage data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="live" name="Live API" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cached" name="Cached" fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* API Limits Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    API Controls
                  </CardTitle>
                  {!editingLimits && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setLimitsForm(limits || {});
                        setEditingLimits(true);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingLimits ? (
                  <>
                    <div className="space-y-2">
                      <Label>Daily Search Cap</Label>
                      <Input
                        type="number"
                        value={limitsForm.daily_search_cap || ''}
                        onChange={(e) => setLimitsForm(p => ({ ...p, daily_search_cap: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Daily Booking Cap (optional)</Label>
                      <Input
                        type="number"
                        value={limitsForm.daily_booking_cap || ''}
                        onChange={(e) => setLimitsForm(p => ({ ...p, daily_booking_cap: e.target.value ? parseInt(e.target.value) : null }))}
                        placeholder="No limit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alert Threshold (%)</Label>
                      <Input
                        type="number"
                        value={limitsForm.alert_threshold_percent || ''}
                        onChange={(e) => setLimitsForm(p => ({ ...p, alert_threshold_percent: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cache TTL (seconds)</Label>
                      <Input
                        type="number"
                        value={limitsForm.cache_ttl_seconds || ''}
                        onChange={(e) => setLimitsForm(p => ({ ...p, cache_ttl_seconds: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => updateLimits.mutate(limitsForm)}
                        disabled={updateLimits.isPending}
                        className="gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingLimits(false)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Daily Search Cap</span>
                      <span className="font-medium">{limits?.daily_search_cap?.toLocaleString() || '—'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Daily Booking Cap</span>
                      <span className="font-medium">{limits?.daily_booking_cap?.toLocaleString() || 'None'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Alert Threshold</span>
                      <span className="font-medium">{limits?.alert_threshold_percent || 80}%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Cache TTL</span>
                      <span className="font-medium">{limits?.cache_ttl_seconds || 120}s</span>
                    </div>
                    <Separator />
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => clearCache.mutate()}
                      disabled={clearCache.isPending}
                    >
                      Clear Expired Cache
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cache Performance */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Cache Performance
              </CardTitle>
              <CardDescription>
                Caching reduces API costs by serving identical searches from memory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <p className="text-4xl font-bold text-primary">{cacheStats?.activeEntries || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Cache Entries</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <p className="text-4xl font-bold text-emerald-500">{cacheStats?.totalHits || 0}</p>
                  <p className="text-sm text-muted-foreground">Cache Hits (Total)</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <p className="text-4xl font-bold">{cacheStats?.avgHitsPerEntry || 0}</p>
                  <p className="text-sm text-muted-foreground">Avg Hits per Entry</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Each cached response saves ~$0.01 in API costs. Higher hit rates = lower costs.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightPerformancePage;
