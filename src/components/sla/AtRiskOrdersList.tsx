/**
 * At Risk Orders List
 * Live list of at-risk and breached orders with quick actions
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  XCircle,
  User,
  Clock,
  MapPin,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { AtRiskOrder } from "@/hooks/useSLAMetrics";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface AtRiskOrdersListProps {
  orders: AtRiskOrder[] | undefined;
  isLoading: boolean;
  onAssign?: (orderId: string) => void;
}

const reasonLabels: Record<string, string> = {
  no_driver_assigned: "No driver",
  no_driver_approaching_deadline: "No driver (urgent)",
  merchant_prep_delay: "Prep delay",
  pickup_delay: "Pickup delayed",
  pickup_approaching_deadline: "Pickup (urgent)",
  delivery_delay: "Delivery delayed",
  delivery_approaching_deadline: "Delivery (urgent)",
};

const AtRiskOrdersList = ({ orders, isLoading, onAssign }: AtRiskOrdersListProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">At Risk / Breached Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const atRiskOrders = orders?.filter((o) => o.sla_status === "at_risk") || [];
  const breachedOrders = orders?.filter((o) => o.sla_status === "breached") || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            At Risk / Breached Orders
          </CardTitle>
          <Badge variant="outline" className="font-mono">
            {orders?.length || 0} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {(!orders || orders.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No at-risk orders</p>
              <p className="text-sm">All orders on track!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Breached orders first (critical) */}
              {breachedOrders.map((order) => (
                <OrderRow key={order.id} order={order} onAssign={onAssign} />
              ))}
              {/* Then at-risk orders */}
              {atRiskOrders.map((order) => (
                <OrderRow key={order.id} order={order} onAssign={onAssign} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

function OrderRow({ order, onAssign }: { order: AtRiskOrder; onAssign?: (id: string) => void }) {
  const isBreached = order.sla_status === "breached";
  const reason = order.breached_reason || order.at_risk_reason || "";
  const reasonLabel = reasonLabels[reason] || reason;
  const deliverBy = order.sla_deliver_by ? formatDistanceToNow(new Date(order.sla_deliver_by), { addSuffix: true }) : "N/A";

  return (
    <div
      className={`p-3 rounded-lg border ${
        isBreached
          ? "border-destructive/50 bg-destructive/5"
          : "border-amber-500/50 bg-amber-500/5"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-medium">#{order.short_id}</span>
            <Badge
              variant={isBreached ? "destructive" : "outline"}
              className={isBreached ? "" : "text-amber-600 border-amber-500"}
            >
              {isBreached ? <XCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
              {reasonLabel}
            </Badge>
          </div>
          <p className="text-sm font-medium truncate">{order.restaurant_name}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due {deliverBy}
            </span>
            {order.driver_name ? (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {order.driver_name}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600">
                <User className="h-3 w-3" />
                Unassigned
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            {order.delivery_address}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          {!order.driver_id && onAssign && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssign(order.id)}
              className="text-xs"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Assign
            </Button>
          )}
          <Button size="sm" variant="ghost" asChild className="text-xs">
            <Link to={`/dispatch/orders/${order.id}`}>
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AtRiskOrdersList;
