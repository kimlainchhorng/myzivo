/**
 * BatchOrderSelector Component
 * Select orders to add to a new batch
 */

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Clock, Store, Calendar, Search } from "lucide-react";
import { useUnbatchedOrders } from "@/hooks/useBatches";
import { useRegions } from "@/hooks/useRegions";

interface BatchOrderSelectorProps {
  selectedOrderIds: string[];
  onSelectionChange: (orderIds: string[]) => void;
}

const BatchOrderSelector = ({
  selectedOrderIds,
  onSelectionChange,
}: BatchOrderSelectorProps) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showScheduledOnly, setShowScheduledOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: regions } = useRegions();
  const { data: orders, isLoading } = useUnbatchedOrders(selectedRegion || undefined);

  const filteredOrders = (orders || []).filter((order: any) => {
    if (showScheduledOnly && !order.is_scheduled) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesAddress = order.delivery_address?.toLowerCase().includes(q);
      const matchesCustomer = order.customer_name?.toLowerCase().includes(q);
      const matchesRestaurant = order.restaurant?.name?.toLowerCase().includes(q);
      if (!matchesAddress && !matchesCustomer && !matchesRestaurant) return false;
    }
    return true;
  });

  const toggleOrder = (orderId: string) => {
    if (selectedOrderIds.includes(orderId)) {
      onSelectionChange(selectedOrderIds.filter(id => id !== orderId));
    } else {
      onSelectionChange([...selectedOrderIds, orderId]);
    }
  };

  const toggleAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredOrders.map((o: any) => o.id));
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Zones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Zones</SelectItem>
            {(regions || []).map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox
            id="scheduled-only"
            checked={showScheduledOnly}
            onCheckedChange={(checked) => setShowScheduledOnly(!!checked)}
          />
          <label htmlFor="scheduled-only" className="text-sm cursor-pointer">
            Scheduled only
          </label>
        </div>
      </div>

      {/* Selection summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedOrderIds.length} of {filteredOrders.length} orders selected
        </div>
        <Button variant="outline" size="sm" onClick={toggleAll}>
          {selectedOrderIds.length === filteredOrders.length ? "Deselect All" : "Select All"}
        </Button>
      </div>

      {/* Orders table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Restaurant</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Delivery Address</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No unbatched orders available
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order: any) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleOrder(order.id)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedOrderIds.includes(order.id)}
                      onCheckedChange={() => toggleOrder(order.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{order.restaurant?.name || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{order.customer_name || "Guest"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{order.delivery_address}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_amount_cents || 0)}</TableCell>
                  <TableCell>
                    {order.is_scheduled ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Calendar className="h-3 w-3" />
                        {order.deliver_by
                          ? new Date(order.deliver_by).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Scheduled"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BatchOrderSelector;
