/**
 * ZIVO Admin Operations Control Center
 * Comprehensive dashboard for managing travel bookings, cancellations, and support
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  XCircle, 
  Headphones, 
  CreditCard, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  Building2,
  Plane,
  Car,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboardStats } from "@/hooks/useAdminTravelDashboard";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Import sub-modules
import AdminOrdersModule from "./modules/travel/AdminOrdersModule";
import AdminCancellationsModule from "./modules/travel/AdminCancellationsModule";
import AdminTravelSupportModule from "./modules/travel/AdminTravelSupportModule";
import AdminPaymentsModule from "./modules/travel/AdminPaymentsModule";
import AdminProvidersModule from "./modules/travel/AdminProvidersModule";

const TravelOperationsCenter = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: stats, isLoading, refetch } = useAdminDashboardStats();

  const kpiCards = [
    {
      title: "Today's Bookings",
      value: stats?.todayOrders ?? 0,
      subValue: `${stats?.weekOrders ?? 0} this week`,
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Today's Revenue",
      value: `$${(stats?.todayRevenue ?? 0).toLocaleString()}`,
      subValue: `$${(stats?.weekRevenue ?? 0).toLocaleString()} this week`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Pending Cancellations",
      value: stats?.pendingCancellations ?? 0,
      subValue: "Requires review",
      icon: XCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      alert: (stats?.pendingCancellations ?? 0) > 0,
    },
    {
      title: "Failed Bookings",
      value: stats?.failedBookings ?? 0,
      subValue: "Needs attention",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      alert: (stats?.failedBookings ?? 0) > 0,
    },
    {
      title: "Open Tickets",
      value: stats?.openTickets ?? 0,
      subValue: "Support queue",
      icon: Headphones,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Payment Failures",
      value: stats?.paymentFailures ?? 0,
      subValue: "Check Stripe",
      icon: CreditCard,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      alert: (stats?.paymentFailures ?? 0) > 0,
    },
  ];

  const getProviderStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Healthy</Badge>;
      case "degraded":
        return <Badge className="bg-amber-500/10 text-amber-500"><AlertTriangle className="w-3 h-3 mr-1" /> Degraded</Badge>;
      case "down":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Down</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operations Control Center</h1>
          <p className="text-muted-foreground">
            Manage bookings, cancellations, support tickets, and monitor provider health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link to="/admin/travel">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Partner Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : (
          kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className={cn(
                "border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all",
                kpi.alert && "ring-2 ring-destructive/50"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn("p-2 rounded-lg", kpi.bgColor)}>
                      <Icon className={cn("h-4 w-4", kpi.color)} />
                    </div>
                    {kpi.alert && (
                      <Badge variant="destructive" className="text-[10px] px-1.5">
                        Action
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{kpi.subValue}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Provider Status Banner */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Hotelbeds API</p>
              <p className="text-sm text-muted-foreground">
                {stats?.providerHealth?.last_success_at 
                  ? `Last successful: ${format(new Date(stats.providerHealth.last_success_at), "MMM d, HH:mm")}`
                  : "No recent activity"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {getProviderStatusBadge(stats?.providerHealth?.status ?? "unknown")}
            <Link to="/admin/operations/providers">
              <Button variant="ghost" size="sm">
                View Details <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="cancellations" className="gap-2 relative">
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Cancellations</span>
            {(stats?.pendingCancellations ?? 0) > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                {stats?.pendingCancellations}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2 relative">
            <Headphones className="w-4 h-4" />
            <span className="hidden sm:inline">Support</span>
            {(stats?.openTickets ?? 0) > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-purple-500">
                {stats?.openTickets}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="providers" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Providers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewContent stats={stats} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="orders">
          <AdminOrdersModule />
        </TabsContent>

        <TabsContent value="cancellations">
          <AdminCancellationsModule />
        </TabsContent>

        <TabsContent value="support">
          <AdminTravelSupportModule />
        </TabsContent>

        <TabsContent value="payments">
          <AdminPaymentsModule />
        </TabsContent>

        <TabsContent value="providers">
          <AdminProvidersModule />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Overview Content Component
function OverviewContent({ 
  stats, 
  isLoading 
}: { 
  stats: ReturnType<typeof useAdminDashboardStats>["data"]; 
  isLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin operations</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Link to="/admin/operations?tab=cancellations">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <XCircle className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <p className="font-medium">Review Cancellations</p>
                <p className="text-xs text-muted-foreground">{stats?.pendingCancellations ?? 0} pending</p>
              </div>
            </Button>
          </Link>
          <Link to="/admin/operations?tab=support">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <Headphones className="w-4 h-4 text-purple-500" />
              <div className="text-left">
                <p className="font-medium">Support Queue</p>
                <p className="text-xs text-muted-foreground">{stats?.openTickets ?? 0} open tickets</p>
              </div>
            </Button>
          </Link>
          <Link to="/admin/operations?tab=orders&status=failed">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <div className="text-left">
                <p className="font-medium">Failed Bookings</p>
                <p className="text-xs text-muted-foreground">{stats?.failedBookings ?? 0} need attention</p>
              </div>
            </Button>
          </Link>
          <Link to="/admin/operations?tab=payments">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <div className="text-left">
                <p className="font-medium">Payment Issues</p>
                <p className="text-xs text-muted-foreground">{stats?.paymentFailures ?? 0} failures</p>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Revenue Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Summary</CardTitle>
          <CardDescription>Booking revenue overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">${(stats?.todayRevenue ?? 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">${(stats?.weekRevenue ?? 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center p-2 bg-muted/30 rounded">
              <Building2 className="w-4 h-4 mx-auto text-purple-500 mb-1" />
              <p className="text-xs text-muted-foreground">Hotels</p>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <Plane className="w-4 h-4 mx-auto text-sky-500 mb-1" />
              <p className="text-xs text-muted-foreground">Activities</p>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <Car className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
              <p className="text-xs text-muted-foreground">Transfers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Active Alerts
          </CardTitle>
          <CardDescription>Issues requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="space-y-3">
              {(stats?.pendingCancellations ?? 0) > 0 && (
                <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-medium">{stats?.pendingCancellations} Pending Cancellation Requests</p>
                      <p className="text-sm text-muted-foreground">Customers awaiting refund decisions</p>
                    </div>
                  </div>
                  <Link to="/admin/operations?tab=cancellations">
                    <Button size="sm">Review</Button>
                  </Link>
                </div>
              )}
              {(stats?.failedBookings ?? 0) > 0 && (
                <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="font-medium">{stats?.failedBookings} Failed Bookings</p>
                      <p className="text-sm text-muted-foreground">Provider confirmation failed</p>
                    </div>
                  </div>
                  <Link to="/admin/operations?tab=orders&status=failed">
                    <Button size="sm" variant="destructive">Investigate</Button>
                  </Link>
                </div>
              )}
              {(stats?.paymentFailures ?? 0) > 0 && (
                <div className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-rose-500" />
                    <div>
                      <p className="font-medium">{stats?.paymentFailures} Payment Failures</p>
                      <p className="text-sm text-muted-foreground">Check Stripe dashboard</p>
                    </div>
                  </div>
                  <Link to="/admin/operations?tab=payments">
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
              )}
              {(stats?.pendingCancellations ?? 0) === 0 && 
               (stats?.failedBookings ?? 0) === 0 && 
               (stats?.paymentFailures ?? 0) === 0 && (
                <div className="flex items-center justify-center p-6 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
                  No active alerts - all systems operational
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TravelOperationsCenter;
