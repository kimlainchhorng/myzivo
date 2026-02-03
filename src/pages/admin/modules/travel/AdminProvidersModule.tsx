/**
 * Admin Providers Module
 * Monitor API health and status for travel providers
 */
import { 
  Activity, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Server,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAdminProviderStatus } from "@/hooks/useAdminTravelDashboard";
import { format } from "date-fns";

interface ProviderHealth {
  id: string;
  provider_name: string;
  status: string;
  last_success_at: string | null;
  last_error_at: string | null;
  error_count_24h: number;
  success_count_24h: number;
  avg_response_time_ms: number | null;
  last_error_message: string | null;
  updated_at: string;
}

const AdminProvidersModule = () => {
  const { data: providers, isLoading, refetch } = useAdminProviderStatus();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-3 h-3 mr-1" /> Healthy</Badge>;
      case "degraded":
        return <Badge className="bg-amber-500/10 text-amber-500"><AlertTriangle className="w-3 h-3 mr-1" /> Degraded</Badge>;
      case "down":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Down</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Unknown</Badge>;
    }
  };

  const getSuccessRate = (provider: ProviderHealth) => {
    const total = provider.success_count_24h + provider.error_count_24h;
    if (total === 0) return 0;
    return Math.round((provider.success_count_24h / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Provider Health</h2>
          <p className="text-sm text-muted-foreground">
            Monitor API status and performance for travel providers
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : !providers || (providers as ProviderHealth[]).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Provider Data</p>
            <p className="text-muted-foreground">Provider health data will appear after API activity</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {(providers as ProviderHealth[]).map((provider) => {
            const successRate = getSuccessRate(provider);
            const total24h = provider.success_count_24h + provider.error_count_24h;

            return (
              <Card key={provider.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="capitalize">{provider.provider_name}</CardTitle>
                        <CardDescription>
                          Last updated: {provider.updated_at 
                            ? format(new Date(provider.updated_at), "PPpp")
                            : "Never"
                          }
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(provider.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-muted-foreground">Successful (24h)</span>
                      </div>
                      <p className="text-2xl font-bold">{provider.success_count_24h}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-sm text-muted-foreground">Errors (24h)</span>
                      </div>
                      <p className="text-2xl font-bold">{provider.error_count_24h}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-muted-foreground">Avg Response</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {provider.avg_response_time_ms 
                          ? `${provider.avg_response_time_ms}ms`
                          : "-"
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {successRate >= 95 ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                      </div>
                      <p className="text-2xl font-bold">{successRate}%</p>
                    </div>
                  </div>

                  {/* Success Rate Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">24h Success Rate</span>
                      <span className="font-medium">{successRate}% ({total24h} requests)</span>
                    </div>
                    <Progress 
                      value={successRate} 
                      className={successRate >= 95 ? "" : successRate >= 80 ? "bg-amber-200" : "bg-destructive/20"}
                    />
                  </div>

                  {/* Last Activity */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                        Last Successful Request
                      </p>
                      <p className="text-sm">
                        {provider.last_success_at 
                          ? format(new Date(provider.last_success_at), "PPpp")
                          : "No recent success"
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-sm font-medium text-destructive mb-1">
                        Last Error
                      </p>
                      <p className="text-sm">
                        {provider.last_error_at 
                          ? format(new Date(provider.last_error_at), "PPpp")
                          : "No recent errors"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Last Error Message */}
                  {provider.last_error_message && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <p className="text-sm font-medium text-destructive mb-1">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        Last Error Message
                      </p>
                      <code className="text-xs text-destructive/80 break-all">
                        {provider.last_error_message}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Provider Info */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Hotelbeds</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Primary provider for hotels, activities, and transfers.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Hotels: Availability + Booking API</li>
                <li>• Activities: Search + Booking API</li>
                <li>• Transfers: Availability + Booking API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Rate Limits</h3>
              <p className="text-sm text-muted-foreground mb-2">
                API rate limits and quotas:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Hotels: 20 req/sec</li>
                <li>• Activities: 10 req/sec</li>
                <li>• Transfers: 10 req/sec</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProvidersModule;
