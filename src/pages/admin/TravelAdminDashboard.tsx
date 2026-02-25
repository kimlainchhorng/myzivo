import { Link } from "react-router-dom";
import { 
  Plane, 
  Building2, 
  Car, 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Settings,
  FileText,
  TrendingUp,
  ExternalLink,
  Shield,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTravelAdminStats, usePartnerRedirectLogs } from "@/hooks/useTravelAdminData";
import { format } from "date-fns";

const TravelAdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useTravelAdminStats(30);
  const { data: recentLogs, isLoading: logsLoading } = usePartnerRedirectLogs(undefined, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Travel Admin</h1>
          <p className="text-muted-foreground">
            Manage travel partners, booking handoffs, and monitor redirects
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/travel/seller-of-travel">
            <Button variant="outline" className="gap-2">
              <Shield className="w-4 h-4" />
              Seller of Travel
            </Button>
          </Link>
          <Link to="/admin/travel/partners">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Partners
            </Button>
          </Link>
          <Link to="/admin/travel/logs">
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Redirects</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalRedirects ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.last7Days ?? 0} in last 7 days
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Successful Returns</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats?.successfulReturns ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.conversionRate}% conversion rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed Bookings</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">
                  {stats?.failedBookings ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-amber-600">
                  {stats?.pendingBookings ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting return</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-sky-500/10">
              <Plane className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Flights</CardTitle>
              <CardDescription>Flight search redirects</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">{stats?.byType.flights ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Building2 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Hotels</CardTitle>
              <CardDescription>Hotel search redirects</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">{stats?.byType.hotels ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Car className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Cars</CardTitle>
              <CardDescription>Car rental redirects</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">{stats?.byType.cars ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/admin/flights/analytics">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer border-sky-500/30 bg-sky-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-sky-500" />
                Flight Analytics
              </CardTitle>
              <CardDescription>
                Funnel metrics, revenue, and conversion rates
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/travel/partners">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Partner Configuration
              </CardTitle>
              <CardDescription>
                Manage travel partners, URLs, and tracking parameters
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/travel/handoff">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Handoff Settings
              </CardTitle>
              <CardDescription>
                Configure checkout mode, disclosures, and timeouts
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/travel/logs">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Redirect Logs
              </CardTitle>
              <CardDescription>
                View all partner handoff events and booking returns
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest partner redirects</CardDescription>
            </div>
            <Link to="/admin/travel/logs">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentLogs && recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      log.search_type === 'flights' ? 'bg-sky-500/10' :
                      log.search_type === 'hotels' ? 'bg-purple-500/10' :
                      'bg-emerald-500/10'
                    }`}>
                      {log.search_type === 'flights' && <Plane className="h-4 w-4 text-sky-500" />}
                      {log.search_type === 'hotels' && <Building2 className="h-4 w-4 text-purple-500" />}
                      {log.search_type === 'cars' && <Car className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <div>
                      <p className="font-medium">{log.partner_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === 'returned' ? 'bg-emerald-500/10 text-emerald-600' :
                    log.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                    log.status === 'timeout' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {log.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No redirect activity yet</p>
              <p className="text-sm">Partner redirects will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelAdminDashboard;
