/**
 * Kanban Column
 * Column component for order kanban board
 */

import { cn } from "@/lib/utils";
import { DispatchOrder } from "@/hooks/useDispatchOrders";
import OrderCard from "./OrderCard";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
  title: string;
  orders: DispatchOrder[];
  color: string;
  onAssign?: (order: DispatchOrder) => void;
  onUnassign?: (orderId: string) => void;
  onStatusChange?: (orderId: string, status: string) => void;
}

const KanbanColumn = ({
  title,
  orders,
  color,
  onAssign,
  onUnassign,
  onStatusChange,
}: KanbanColumnProps) => {
  return (
    <div className="flex flex-col min-w-[300px] max-w-[350px] bg-muted/30 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", color)} />
            <h3 className="font-semibold text-sm">{title}</h3>
          </div>
          <Badge variant="secondary">{orders.length}</Badge>
        </div>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
        <div className="p-3 space-y-3">
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No orders
            </p>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAssign={onAssign ? () => onAssign(order) : undefined}
                onUnassign={onUnassign ? () => onUnassign(order.id) : undefined}
                onStatusChange={
                  onStatusChange ? (status) => onStatusChange(order.id, status) : undefined
                }
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default KanbanColumn;
