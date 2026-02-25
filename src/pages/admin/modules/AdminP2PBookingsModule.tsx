/**
 * Admin P2P Bookings Module
 * Manage and monitor P2P rental bookings
 */

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Car, Calendar, User, DollarSign, Search, Filter,
  CheckCircle, Clock, XCircle, AlertCircle, Eye, MoreVertical, Plus, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAdminP2PBookings, type BookingWithDetails } from "@/hooks/useP2PBooking";
import { useCreateTestBooking } from "@/hooks/useAdminP2PTestData";

const statusConfig = {
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
  confirmed: { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/10", label: "Confirmed" },
  in_progress: { icon: Car, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "In Progress" },
  completed: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", label: "Completed" },
  cancelled: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Cancelled" },
};

export default function AdminP2PBookingsModule() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);

  const { data: bookings, isLoading } = useAdminP2PBookings({
    status: statusFilter,
    search: searchQuery,
  });
  const createTestBooking = useCreateTestBooking();

  // Calculate stats
  const stats = {
    total: bookings?.length || 0,
    pending: bookings?.filter((b) => b.status === "pending").length || 0,
    active: bookings?.filter((b) => b.status === "in_progress").length || 0,
    revenue: bookings
      ?.filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.platform_fee || 0), 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">P2P Bookings</h2>
          <p className="text-muted-foreground">
            Monitor and manage peer-to-peer rental bookings
          </p>
        </div>
        <Button
          onClick={() => createTestBooking.mutate()}
          disabled={createTestBooking.isPending}
        >
          {createTestBooking.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create Test Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.revenue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Platform Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const vehicle = booking.vehicle;
                  const owner = booking.owner;

                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm">
                        {booking.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {vehicle ? (
                          <div className="flex items-center gap-2">
                            {(vehicle.images as string[])?.[0] && (
                              <img
                                src={(vehicle.images as string[])[0]}
                                alt=""
                                className="w-10 h-8 object-cover rounded"
                              />
                            )}
                            <span className="font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {owner?.full_name || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(parseISO(booking.pickup_date), "MMM d")} -{" "}
                        {format(parseISO(booking.return_date), "MMM d")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">${booking.total_amount.toFixed(0)}</span>
                          <span className="text-xs text-muted-foreground block">
                            Fee: ${(booking.platform_fee || 0).toFixed(0)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${status.bg} ${status.color} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Car className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Status */}
              {(() => {
                const status = statusConfig[selectedBooking.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <div className={`p-4 rounded-xl ${status.bg}`}>
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`w-6 h-6 ${status.color}`} />
                      <div>
                        <p className="font-semibold">{status.label}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {format(parseISO(selectedBooking.created_at!), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Vehicle */}
              {selectedBooking.vehicle && (
                <div>
                  <h4 className="font-semibold mb-2">Vehicle</h4>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    {(selectedBooking.vehicle.images as string[])?.[0] && (
                      <img
                        src={(selectedBooking.vehicle.images as string[])[0]}
                        alt=""
                        className="w-20 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">
                        {selectedBooking.vehicle.year} {selectedBooking.vehicle.make} {selectedBooking.vehicle.model}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trip Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Pick-up</h4>
                  <p>{format(parseISO(selectedBooking.pickup_date), "EEEE, MMM d, yyyy")}</p>
                  {selectedBooking.pickup_location && (
                    <p className="text-sm text-muted-foreground">{selectedBooking.pickup_location}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Return</h4>
                  <p>{format(parseISO(selectedBooking.return_date), "EEEE, MMM d, yyyy")}</p>
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div>
                <h4 className="font-semibold mb-3">Pricing Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>${selectedBooking.daily_rate}/day × {selectedBooking.total_days} days</span>
                    <span>${selectedBooking.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedBooking.service_fee && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Renter service fee</span>
                      <span>${selectedBooking.service_fee.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedBooking.insurance_fee && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Insurance</span>
                      <span>${selectedBooking.insurance_fee.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedBooking.taxes && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxes</span>
                      <span>${selectedBooking.taxes.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${selectedBooking.total_amount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-emerald-600">
                    <span>Platform fee</span>
                    <span>+${(selectedBooking.platform_fee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Owner payout</span>
                    <span>${selectedBooking.owner_payout.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Renter Notes</h4>
                    <p className="text-muted-foreground">{selectedBooking.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
