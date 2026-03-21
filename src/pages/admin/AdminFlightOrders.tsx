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

type FlightOrder = {
  id: string;
  user_id: string | null;
  status: string | null;
  total_cents: number | null;
  currency: string | null;
  created_at: string;
  contact_email: string | null;
  contact_phone: string | null;
  passengers: any;
  slices: any;
  offer_id: string | null;
  stripe_payment_intent_id: string | null;
  partner_booking_ref: string | null;
  duffel_order_id: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  issued: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-muted text-muted-foreground",
};

export default function AdminFlightOrders() {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<FlightOrder | null>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["admin-flight-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flight_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as FlightOrder[];
    },
  });

  const filtered = orders?.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.id?.toLowerCase().includes(q) ||
      o.contact_email?.toLowerCase().includes(q) ||
      o.partner_booking_ref?.toLowerCase().includes(q) ||
      o.duffel_order_id?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  });

  const formatAmount = (cents: number | null, currency: string | null) => {
    if (!cents) return "—";
    return `$${(cents / 100).toFixed(2)} ${(currency || "USD").toUpperCase()}`;
  };

  return (
    <AdminLayout title="Flight Orders">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, booking ref, order ID…"
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
          { label: "Confirmed", value: orders?.filter((o) => o.status === "confirmed" || o.status === "issued").length || 0 },
          { label: "Processing", value: orders?.filter((o) => o.status === "processing" || o.status === "pending").length || 0 },
          { label: "Failed", value: orders?.filter((o) => o.status === "failed" || o.status === "cancelled").length || 0 },
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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Booking Ref</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">
                    {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-3 text-foreground truncate max-w-[200px]">
                    {order.contact_email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={STATUS_COLORS[order.status || ""] || "bg-muted text-muted-foreground"}>
                      {order.status || "unknown"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatAmount(order.total_cents, order.currency)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                    {order.partner_booking_ref || order.duffel_order_id || "—"}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Flight Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 text-sm">
              <Row label="Order ID" value={selectedOrder.id} />
              <Row label="Status" value={selectedOrder.status || "—"} />
              <Row label="Email" value={selectedOrder.contact_email || "—"} />
              <Row label="Phone" value={selectedOrder.contact_phone || "—"} />
              <Row label="Amount" value={formatAmount(selectedOrder.total_cents, selectedOrder.currency)} />
              <Row label="Stripe PI" value={selectedOrder.stripe_payment_intent_id || "—"} />
              <Row label="Duffel Order" value={selectedOrder.duffel_order_id || "—"} />
              <Row label="Partner Ref" value={selectedOrder.partner_booking_ref || "—"} />
              <Row label="Created" value={format(new Date(selectedOrder.created_at), "PPpp")} />
              {selectedOrder.passengers && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Passengers</p>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedOrder.passengers, null, 2)}
                  </pre>
                </div>
              )}
              {selectedOrder.slices && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Slices / Segments</p>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedOrder.slices, null, 2)}
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
