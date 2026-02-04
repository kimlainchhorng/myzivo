/**
 * Travel Bookings Page
 * Admin view of all travel bookings
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plane, Hotel, Car, Search, MoreHorizontal, Eye, Mail, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface TravelBooking {
  id: string;
  user_id: string;
  product_type: string;
  supplier: string;
  status: string;
  total_amount: number;
  currency: string;
  booking_reference: string;
  customer_email: string;
  customer_name: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-green-500/10 text-green-600 border-green-200",
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
  refunded: "bg-blue-500/10 text-blue-600 border-blue-200",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const productIcons: Record<string, React.ElementType> = {
  flight: Plane,
  hotel: Hotel,
  car: Car,
};

const TravelBookingsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-travel-bookings", statusFilter, productFilter],
    queryFn: async (): Promise<TravelBooking[]> => {
      // Using travel_bookings table
      const { data, error } = await supabase
        .from("travel_bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Map database fields to our interface
      return (data || []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        product_type: row.service_type || "flight",
        supplier: "Partner",
        status: row.status,
        total_amount: 0,
        currency: "USD",
        booking_reference: row.partner_booking_ref || row.id.slice(0, 8),
        customer_email: row.email,
        customer_name: row.email?.split("@")[0] || "Customer",
        created_at: row.created_at,
      })).filter((booking) => {
        if (statusFilter !== "all" && booking.status !== statusFilter) return false;
        if (productFilter !== "all" && booking.product_type !== productFilter) return false;
        return true;
      });
    },
  });

  const filteredBookings = bookings.filter((booking) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      booking.booking_reference?.toLowerCase().includes(searchLower) ||
      booking.customer_email?.toLowerCase().includes(searchLower) ||
      booking.customer_name?.toLowerCase().includes(searchLower) ||
      booking.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Travel Bookings</h1>
          <p className="text-muted-foreground">Manage all OTA bookings</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by booking ID, email, or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="flight">Flights</SelectItem>
                <SelectItem value="hotel">Hotels</SelectItem>
                <SelectItem value="car">Cars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            {filteredBookings.length} booking(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bookings found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const ProductIcon = productIcons[booking.product_type] || Plane;
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {booking.booking_reference || booking.id.slice(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.customer_name || "—"}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.customer_email || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ProductIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{booking.product_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{booking.supplier || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[booking.status] || ""}
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {booking.currency} {booking.total_amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(booking.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/travel/bookings/${booking.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Resend Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelBookingsPage;
