/**
 * Dispatch Dashboard
 * Overview with KPIs, attention panel, and quick actions
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Truck, CheckCircle, XCircle, Users, AlertTriangle, Zap, Plus } from "lucide-react";
import { useDispatchStats, useAttentionItems } from "@/hooks/useDispatchStats";
import { useAssignDriver } from "@/hooks/useOrderMutations";

const DispatchDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDispatchStats();
  const { data: attentionItems, isLoading: attentionLoading } = useAttentionItems();
  const assignDriver = useAssignDriver();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dispatch Dashboard</h1>
          <p className="text-muted-foreground">Real-time order and driver management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/dispatch/orders">View All Orders</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">New</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.newOrders ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Assigned</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.assignedOrders ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Picked Up</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.pickedUpOrders ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Delivered</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.deliveredOrders ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Cancelled</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.cancelledOrders ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Online Drivers</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.onlineDrivers ?? 0}</p>
            {stats?.idleDrivers ? (
              <p className="text-xs text-muted-foreground">{stats.idleDrivers} idle</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Attention Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attentionLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !attentionItems?.length ? (
            <p className="text-muted-foreground text-center py-8">
              Everything looks good! No items need attention.
            </p>
          ) : (
            <div className="space-y-3">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={item.type === "unassigned_order" ? "destructive" : "secondary"}
                    >
                      {item.type === "unassigned_order" ? "Order" : "Driver"}
                    </Badge>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    {item.orderId ? (
                      <Link to={`/dispatch/orders/${item.orderId}`}>
                        {item.actionLabel}
                      </Link>
                    ) : (
                      <Link to={`/dispatch/drivers`}>{item.actionLabel}</Link>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dispatch/orders">
                <Package className="h-4 w-4 mr-2" />
                Manage Orders
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dispatch/drivers">
                <Users className="h-4 w-4 mr-2" />
                Manage Drivers
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dispatch/payouts">
                <Zap className="h-4 w-4 mr-2" />
                View Payouts
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-medium">
                  {(stats?.newOrders ?? 0) +
                    (stats?.assignedOrders ?? 0) +
                    (stats?.pickedUpOrders ?? 0) +
                    (stats?.deliveredOrders ?? 0) +
                    (stats?.cancelledOrders ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium text-green-500">
                  {(() => {
                    const total = (stats?.deliveredOrders ?? 0) + (stats?.cancelledOrders ?? 0);
                    if (total === 0) return "N/A";
                    return Math.round(((stats?.deliveredOrders ?? 0) / total) * 100) + "%";
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unassigned &gt; 5min</span>
                <span className={stats?.unassignedOver5Min ? "font-medium text-red-500" : "font-medium"}>
                  {stats?.unassignedOver5Min ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DispatchDashboard;
