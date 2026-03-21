/**
 * Admin Flight Orders - View and manage customer flight bookings
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plane, RefreshCw, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type FlightBooking = {
  id: string;
  customer_id: string;
  booking_reference: string;
  status: string | null;
  payment_status: string | null;
  ticketing_status: string | null;
  total_amount: number;
  currency: string | null;
  origin: string | null;
  destination: string | null;
  departure_date: string | null;
  return_date: string | null;
  cabin_class: string;
  total_passengers: number;
  pnr: string | null;
  created_at: string;
  passengers: any;
  stripe_payment_intent_id: string | null;
  ticketing_partner_order_id: string | null;
  zivo_markup: number | null;
  duffel_cost: number | null;
  refund_status: string | null;
  refund_amount: number | null;
  admin_notes: string | null;
  dispute_status: string | null;
  special_requests: string | null;
  offer_id: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  issued: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  ticketed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-muted text-muted-foreground",
};

export default function AdminFlightOrders() {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<FlightBooking | null>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["admin-flight-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flight_bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as unknown as FlightBooking[];
    },
  });

  const filtered = orders?.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.id?.toLowerCase().includes(q) ||
      o.booking_reference?.toLowerCase().includes(q) ||
      o.pnr?.toLowerCase().includes(q) ||
      o.origin?.toLowerCase().includes(q) ||
      o.destination?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Flight Orders">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by booking ref, route, PNR…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <Button variant="outline" size="sm" className="h-10 rounded-xl gap-2" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: orders?.length || 0 },
          { label: "Confirmed", value: orders?.filter((o) => ["confirmed", "issued", "ticketed"].includes(o.status || "")).length || 0 },
          { label: "Pending", value: orders?.filter((o) => ["pending", "processing"].includes(o.status || "")).length || 0 },
          { label: "Failed / Cancelled", value: orders?.filter((o) => ["failed", "cancelled"].includes(o.status || "")).length || 0 },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading flight orders…</div>
      ) : !filtered?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Plane className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No flight orders found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Route</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Booking Ref</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Pax</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">
                    {format(new Date(order.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {order.origin && order.destination ? `${order.origin} → ${order.destination}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                    {order.booking_reference}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={STATUS_COLORS[order.status || ""] || "bg-muted text-muted-foreground"}>
                      {order.status || "unknown"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      {order.payment_status || "—"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    ${Number(order.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {order.total_passengers}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 text-sm">
              <Row label="Booking Ref" value={selectedOrder.booking_reference} />
              <Row label="Route" value={`${selectedOrder.origin || "?"} → ${selectedOrder.destination || "?"}`} />
              <Row label="Departure" value={selectedOrder.departure_date || "—"} />
              {selectedOrder.return_date && <Row label="Return" value={selectedOrder.return_date} />}
              <Row label="Cabin" value={selectedOrder.cabin_class} />
              <Row label="Passengers" value={String(selectedOrder.total_passengers)} />
              <Row label="Status" value={selectedOrder.status || "—"} />
              <Row label="Payment" value={selectedOrder.payment_status || "—"} />
              <Row label="Ticketing" value={selectedOrder.ticketing_status || "—"} />
              <Row label="PNR" value={selectedOrder.pnr || "—"} />
              <Row label="Total" value={`$${Number(selectedOrder.total_amount).toFixed(2)} ${(selectedOrder.currency || "USD").toUpperCase()}`} />
              {selectedOrder.zivo_markup != null && <Row label="ZIVO Markup" value={`$${Number(selectedOrder.zivo_markup).toFixed(2)}`} />}
              {selectedOrder.duffel_cost != null && <Row label="Duffel Cost" value={`$${Number(selectedOrder.duffel_cost).toFixed(2)}`} />}
              <Row label="Stripe PI" value={selectedOrder.stripe_payment_intent_id || "—"} />
              <Row label="Partner Order" value={selectedOrder.ticketing_partner_order_id || "—"} />
              {selectedOrder.refund_status && <Row label="Refund" value={`${selectedOrder.refund_status} ($${Number(selectedOrder.refund_amount || 0).toFixed(2)})`} />}
              {selectedOrder.dispute_status && <Row label="Dispute" value={selectedOrder.dispute_status} />}
              {selectedOrder.special_requests && <Row label="Special Requests" value={selectedOrder.special_requests} />}
              {selectedOrder.admin_notes && <Row label="Admin Notes" value={selectedOrder.admin_notes} />}
              <Row label="Created" value={format(new Date(selectedOrder.created_at), "PPpp")} />
              {selectedOrder.passengers && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Passengers</p>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedOrder.passengers, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right font-medium break-all">{value}</span>
    </div>
  );
}
