/**
 * Dispatch Orders Kanban
 * Kanban board for order management
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useDispatchOrdersByStatus, DispatchOrder } from "@/hooks/useDispatchOrders";
import { useUnassignDriver, useUpdateOrderStatus } from "@/hooks/useOrderMutations";
import KanbanColumn from "@/components/dispatch/KanbanColumn";
import AssignDriverModal from "@/components/dispatch/AssignDriverModal";

const DispatchOrdersKanban = () => {
  const { grouped, isLoading } = useDispatchOrdersByStatus();
  const unassignDriver = useUnassignDriver();
  const updateStatus = useUpdateOrderStatus();
  const [assignModalOrder, setAssignModalOrder] = useState<DispatchOrder | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateStatus.mutateAsync({
      orderId,
      status,
      insertEarnings: status === "completed",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage order assignments and status</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        <KanbanColumn
          title="New"
          orders={grouped.pending}
          color="bg-amber-500"
          onAssign={(order) => setAssignModalOrder(order)}
        />
        <KanbanColumn
          title="Assigned"
          orders={grouped.confirmed}
          color="bg-blue-500"
          onUnassign={(id) => unassignDriver.mutate(id)}
          onStatusChange={handleStatusChange}
        />
        <KanbanColumn
          title="Picked Up"
          orders={grouped.in_progress}
          color="bg-orange-500"
          onStatusChange={handleStatusChange}
        />
        <KanbanColumn
          title="Delivered"
          orders={grouped.completed}
          color="bg-primary"
        />
        <KanbanColumn
          title="Cancelled"
          orders={grouped.cancelled}
          color="bg-destructive"
        />
      </div>

      <AssignDriverModal
        order={assignModalOrder}
        open={!!assignModalOrder}
        onClose={() => setAssignModalOrder(null)}
      />
    </div>
  );
};

export default DispatchOrdersKanban;
