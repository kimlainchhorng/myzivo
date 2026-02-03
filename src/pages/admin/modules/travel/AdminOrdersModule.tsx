/**
 * Admin Orders Module
 * Manage all travel orders with filtering, search, and actions
 */
import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Mail, 
  Flag,
  Eye,
  RefreshCw,
  Building2,
  Plane,
  Car,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useAdminTravelOrders,
  useAdminResendConfirmation,
  useAdminFlagOrder,
} from "@/hooks/useAdminTravelDashboard";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AdminOrderDetailModal from "./AdminOrderDetailModal";

const AdminOrdersModule = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useAdminTravelOrders({
    page,
    limit: 20,
    status,
    searchQuery: searchQuery.length >= 2 ? searchQuery : undefined,
  });

  const resendConfirmation = useAdminResendConfirmation();
  const flagOrder = useAdminFlagOrder();

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus) {
      case "confirmed":
        return <Badge className="bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</Badge>;
      case "pending_payment":
        return <Badge className="bg-amber-500/10 text-amber-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "cancelled":
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "refunded":
        return <Badge className="bg-blue-500/10 text-blue-500"><RefreshCw className="w-3 h-3 mr-1" /> Refunded</Badge>;
      default:
        return <Badge variant="outline">{orderStatus}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return <Building2 className="w-3 h-3" />;
      case "activity":
        return <Plane className="w-3 h-3" />;
      case "transfer":
        return <Car className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order #, email, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending_payment">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.data?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No orders found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((order) => (
                    <TableRow 
                      key={order.id}
                      className={cn(
                        order.flagged_for_review && "bg-amber-500/5"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{order.order_number}</span>
                          {order.flagged_for_review && (
                            <Flag className="w-3 h-3 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.holder_name}</p>
                          <p className="text-sm text-muted-foreground">{order.holder_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {order.travel_order_items?.slice(0, 3).map((item, i) => (
                            <div 
                              key={i}
                              className="p-1.5 rounded bg-muted"
                              title={item.type}
                            >
                              {getTypeIcon(item.type)}
                            </div>
                          ))}
                          {(order.travel_order_items?.length ?? 0) > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{(order.travel_order_items?.length ?? 0) - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${order.total.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(order.created_at), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedOrderId(order.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => resendConfirmation.mutate(order.id)}
                              disabled={resendConfirmation.isPending}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Resend Confirmation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => flagOrder.mutate({ orderId: order.id })}
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              {order.flagged_for_review ? "Remove Flag" : "Flag for Review"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total} orders
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm px-2">
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={page >= data.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <AdminOrderDetailModal
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
};

export default AdminOrdersModule;
