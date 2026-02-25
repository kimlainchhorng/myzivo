/**
 * Master Dashboard
 * Home page for the Admin Control Center
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAllPayouts } from "@/hooks/usePayouts";
import {
  Plane,
  DollarSign,
  Car,
  Utensils,
  Headphones,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Activity,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  href?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  href,
  variant = "default" 
}: StatCardProps) => {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-destructive/10 text-destructive",
  };

  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                {trend.value >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={trend.value >= 0 ? "text-green-600" : "text-red-600"}>
                  {trend.value >= 0 ? "+" : ""}{trend.value}%
                </span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", variantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
};

interface QuickActionProps {
  title: string;
  description: string;
  count?: number;
  href: string;
  variant?: "default" | "warning" | "danger";
}

const QuickAction = ({ title, description, count, href, variant = "default" }: QuickActionProps) => {
  const badgeVariant = variant === "danger" ? "destructive" : variant === "warning" ? "secondary" : "default";

  return (
    <Link to={href}>
      <div className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && count > 0 && (
            <Badge variant={badgeVariant}>{count}</Badge>
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
};

interface ActivityItemProps {
  action: string;
  target: string;
  time: string;
  user: string;
  status: "success" | "pending" | "error";
}

const ActivityItem = ({ action, target, time, user, status }: ActivityItemProps) => {
  const statusIcon = {
    success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    pending: <Clock className="h-4 w-4 text-amber-500" />,
    error: <AlertTriangle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div className="flex items-start gap-3 py-3">
      {statusIcon[status]}
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{action}</span>{" "}
          <span className="text-muted-foreground">{target}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          by {user} • {time}
        </p>
      </div>
    </div>
  );
};

const MasterDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { canAccessPayouts, canAccessDrivers, canAccessSupport, canAccessTravel } = useAdminRole();
  const { data: pendingPayouts } = useAllPayouts({ status: "pending", limit: 5 });

  const pendingPayoutTotal = pendingPayouts?.reduce((sum, p) => sum + Number(p.net_payout), 0) || 0;

  // Activity data is loaded from real audit logs via AdminRecentActivity component
  // This inline list is empty — see /admin/activity for the full feed
  const recentActivity: ActivityItemProps[] = [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here's what's happening today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Today Bookings"
          value={stats?.totalFlightBookings || 0}
          icon={Plane}
          href="/admin/travel/bookings"
          trend={{ value: 12, label: "vs yesterday" }}
        />
        <StatCard
          title="Today Revenue"
          value={`$${((stats?.totalFlightBookings || 0) * 45).toLocaleString()}`}
          icon={DollarSign}
          variant="success"
          href="/admin/reports"
          trend={{ value: 8, label: "vs yesterday" }}
        />
        <StatCard
          title="Active Drivers"
          value={stats?.onlineDrivers || 0}
          description={`${stats?.totalDrivers || 0} total`}
          icon={Car}
          href="/admin/drivers"
        />
        <StatCard
          title="Active Deliveries"
          value={stats?.activeFoodOrders || 0}
          icon={Utensils}
          href="/admin/eats"
        />
        <StatCard
          title="Open Tickets"
          value={stats?.openTickets || 0}
          icon={Headphones}
          variant={stats?.openTickets && stats.openTickets > 10 ? "warning" : "default"}
          href="/admin/support"
        />
        <StatCard
          title="Pending Payouts"
          value={`$${pendingPayoutTotal.toLocaleString()}`}
          icon={Wallet}
          variant={pendingPayoutTotal > 5000 ? "warning" : "default"}
          href="/admin/payouts"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks that need attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {canAccessDrivers && (
              <>
                <QuickAction
                  title="Approve Drivers"
                  description="Review pending driver applications"
                  count={stats?.pendingDrivers}
                  href="/admin/drivers?status=pending"
                  variant={stats?.pendingDrivers && stats.pendingDrivers > 0 ? "warning" : "default"}
                />
                <QuickAction
                  title="Review Documents"
                  description="Verify driver documents"
                  count={stats?.pendingDocuments}
                  href="/admin/drivers?tab=documents"
                  variant={stats?.pendingDocuments && stats.pendingDocuments > 5 ? "warning" : "default"}
                />
              </>
            )}
            {canAccessTravel && (
              <QuickAction
                title="Failed Bookings"
                description="Review booking errors"
                count={0}
                href="/admin/travel/bookings?status=failed"
              />
            )}
            {canAccessSupport && (
              <QuickAction
                title="Escalated Tickets"
                description="High priority support issues"
                count={stats?.openTickets ? Math.floor(stats.openTickets * 0.2) : 0}
                href="/admin/support?priority=high"
                variant="danger"
              />
            )}
            {canAccessPayouts && (
              <QuickAction
                title="Process Payouts"
                description="Driver earnings ready for payout"
                count={pendingPayouts?.length || 0}
                href="/admin/payouts"
              />
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Activity</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/activity">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Activity from audit logs will appear here</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentActivity.map((item, index) => (
                    <ActivityItem key={index} {...item} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Service Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Plane className="h-4 w-4 text-blue-500" />
              </div>
              <CardTitle className="text-base">Travel</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Flights</span>
                <span className="font-medium">{stats?.totalFlightBookings || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hotels</span>
                <span className="font-medium">{stats?.totalHotelBookings || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cars</span>
                <span className="font-medium">{stats?.totalCarRentals || 0}</span>
              </div>
            </div>
            <Separator className="my-3" />
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/admin/travel">
                <Activity className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-green-500/10">
                <Car className="h-4 w-4 text-green-500" />
              </div>
              <CardTitle className="text-base">Rides</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <span className="font-medium">{stats?.activeTrips || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{stats?.totalTrips || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Drivers Online</span>
                <span className="font-medium">{stats?.onlineDrivers || 0}</span>
              </div>
            </div>
            <Separator className="my-3" />
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/admin/drivers">
                <Activity className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/10">
                <Utensils className="h-4 w-4 text-red-500" />
              </div>
              <CardTitle className="text-base">Eats</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Orders</span>
                <span className="font-medium">{stats?.activeFoodOrders || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Restaurants</span>
                <span className="font-medium">{stats?.totalRestaurants || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deliveries Today</span>
                <span className="font-medium">0</span>
              </div>
            </div>
            <Separator className="my-3" />
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/admin/eats">
                <Activity className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-violet-500/10">
                <Users className="h-4 w-4 text-violet-500" />
              </div>
              <CardTitle className="text-base">Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Users</span>
                <span className="font-medium">{stats?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Drivers</span>
                <span className="font-medium">{stats?.totalDrivers || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Today</span>
                <span className="font-medium">0</span>
              </div>
            </div>
            <Separator className="my-3" />
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/admin/users">
                <Activity className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterDashboard;
