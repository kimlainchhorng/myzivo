/**
 * Dispatch Safety Dashboard
 * Fraud prevention and risk management
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, Check, X, RefreshCw, UserX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useFraudPrevention } from "@/hooks/useFraudPrevention";

const DispatchSafety = () => {
  const {
    riskEvents,
    riskyUsers,
    blockedEntities,
    ordersForReview,
    kpis,
    isLoading,
    reviewOrder,
    unblockEntity,
    resetUserScore,
    refetch,
  } = useFraudPrevention();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Safety & Fraud Prevention</h1>
          <p className="text-muted-foreground">Monitor and manage risk across your platform</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpis?.riskEventsToday || 0}</p>
                <p className="text-sm text-muted-foreground">Risk Events Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpis?.highRiskOrdersToday || 0}</p>
                <p className="text-sm text-muted-foreground">High-Risk Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <ShieldX className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpis?.blockedEntities || 0}</p>
                <p className="text-sm text-muted-foreground">Blocked Entities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpis?.pendingReviews || 0}</p>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Requiring Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Orders Requiring Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersForReview.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders require review</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Signals</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersForReview.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>{order.restaurant?.name || "Unknown"}</TableCell>
                    <TableCell>${((order.subtotal_cents || 0) / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={order.risk_level === "high" ? "destructive" : "secondary"}>
                        {order.risk_level} ({order.risk_score})
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {order.risk_signals?.map((signal) => (
                          <Badge key={signal} variant="outline" className="text-xs">
                            {signal.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          onClick={() => reviewOrder({ orderId: order.id, decision: "approved" })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => reviewOrder({ orderId: order.id, decision: "rejected" })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Risk Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Risk Events</CardTitle>
          </CardHeader>
          <CardContent>
            {riskEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent risk events</p>
            ) : (
              <div className="space-y-3">
                {riskEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{event.event_type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          event.severity === "critical"
                            ? "destructive"
                            : event.severity === "warning"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {event.severity}
                      </Badge>
                      <span className="text-sm font-mono">+{event.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blocked Entities */}
        <Card>
          <CardHeader>
            <CardTitle>Blocked Entities</CardTitle>
          </CardHeader>
          <CardContent>
            {blockedEntities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No blocked entities</p>
            ) : (
              <div className="space-y-3">
                {blockedEntities.slice(0, 10).map((entity) => (
                  <div key={entity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{entity.entity_type}</Badge>
                        <span className="font-mono text-sm">{entity.entity_value.slice(0, 12)}...</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{entity.reason}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        unblockEntity({ entityType: entity.entity_type, entityValue: entity.entity_value })
                      }
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* High-Risk Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            High-Risk Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {riskyUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No high-risk users</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Last Evaluated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskyUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.user_id.slice(0, 12)}...</TableCell>
                    <TableCell className="font-bold">{user.total_score}</TableCell>
                    <TableCell>
                      <Badge variant={user.risk_level === "blocked" ? "destructive" : "secondary"}>
                        {user.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(user.last_evaluated), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => resetUserScore(user.user_id)}>
                        Reset Score
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchSafety;
