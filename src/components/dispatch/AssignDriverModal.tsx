/**
 * Assign Driver Modal
 * Modal to assign a driver to an order
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, User, Car, Clock, MapPin } from "lucide-react";
import { useDispatchDrivers, DispatchDriver } from "@/hooks/useDispatchDrivers";
import { useAssignDriver } from "@/hooks/useOrderMutations";
import { DispatchOrder } from "@/hooks/useDispatchOrders";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssignDriverModalProps {
  order: DispatchOrder | null;
  open: boolean;
  onClose: () => void;
}

const AssignDriverModal = ({ order, open, onClose }: AssignDriverModalProps) => {
  const [search, setSearch] = useState("");
  const { data: drivers, isLoading } = useDispatchDrivers();
  const assignDriver = useAssignDriver();

  const filteredDrivers = (drivers || []).filter((driver) =>
    driver.full_name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort: online first, then by whether they have an active order
  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    if (a.is_online && !b.is_online) return -1;
    if (!a.is_online && b.is_online) return 1;
    if (!a.activeOrder && b.activeOrder) return -1;
    if (a.activeOrder && !b.activeOrder) return 1;
    return 0;
  });

  const handleAssign = async (driver: DispatchDriver) => {
    if (!order) return;
    await assignDriver.mutateAsync({
      orderId: order.id,
      driverId: driver.id,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            {order && (
              <>
                Order #{order.id.slice(0, 8).toUpperCase()} from{" "}
                {order.restaurant?.name}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Driver List */}
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sortedDrivers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No drivers found
            </p>
          ) : (
            <div className="space-y-2">
              {sortedDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted/80 transition-colors touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      {driver.is_online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{driver.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Car className="h-3 w-3" />
                        <span>{driver.vehicle_type}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(driver.updated_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {driver.activeOrder && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          On delivery: {driver.activeOrder.restaurant_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAssign(driver)}
                    disabled={assignDriver.isPending || !!driver.activeOrder}
                  >
                    {assignDriver.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Assign"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDriverModal;
