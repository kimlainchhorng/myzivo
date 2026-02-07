/**
 * Order Card
 * Card component for displaying order in kanban board
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, DollarSign, User, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DispatchOrder } from "@/hooks/useDispatchOrders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface OrderCardProps {
  order: DispatchOrder;
  onAssign?: () => void;
  onUnassign?: () => void;
  onStatusChange?: (status: string) => void;
}

const OrderCard = ({ order, onAssign, onUnassign, onStatusChange }: OrderCardProps) => {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const createdAgo = formatDistanceToNow(new Date(order.created_at), { addSuffix: true });

  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-sm font-medium">#{shortId}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {createdAgo}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dispatch/orders/${order.id}`}>View Details</Link>
              </DropdownMenuItem>
              {order.status === "pending" && !order.driver_id && onAssign && (
                <DropdownMenuItem onClick={onAssign}>Assign Driver</DropdownMenuItem>
              )}
              {order.driver_id && order.status !== "completed" && onUnassign && (
                <DropdownMenuItem onClick={onUnassign}>Unassign Driver</DropdownMenuItem>
              )}
              {order.status === "confirmed" && onStatusChange && (
                <DropdownMenuItem onClick={() => onStatusChange("in_progress")}>
                  Mark Picked Up
                </DropdownMenuItem>
              )}
              {order.status === "in_progress" && onStatusChange && (
                <DropdownMenuItem onClick={() => onStatusChange("completed")}>
                  Mark Delivered
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Restaurant */}
        <div>
          <p className="font-medium text-sm">{order.restaurant?.name || "Unknown Restaurant"}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{order.restaurant?.address}</p>
        </div>

        {/* Delivery Address */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <span className="line-clamp-2">{order.delivery_address}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-medium">
              ${((order.driver_payout_cents || 0) / 100).toFixed(2)}
            </span>
          </div>

          {order.driver ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {order.driver.full_name.split(" ")[0]}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-600 dark:text-amber-400 dark:border-amber-400">
              Unassigned
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
