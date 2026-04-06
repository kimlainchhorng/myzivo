import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, User, Car, Clock, Phone, Mail, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminBookingsTab({ storeId }: { storeId: string }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("service_bookings")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [storeId]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("service_bookings")
      .update({ status })
      .eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success(`Booking ${status}`);
    fetchBookings();
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="py-8 text-center text-muted-foreground">Loading bookings...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Customer Bookings ({bookings.length})</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({bookings.length})</SelectItem>
            <SelectItem value="pending">Pending ({bookings.filter(b => b.status === "pending").length})</SelectItem>
            <SelectItem value="confirmed">Confirmed ({bookings.filter(b => b.status === "confirmed").length})</SelectItem>
            <SelectItem value="completed">Completed ({bookings.filter(b => b.status === "completed").length})</SelectItem>
            <SelectItem value="cancelled">Cancelled ({bookings.filter(b => b.status === "cancelled").length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <CalendarIcon className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p>No bookings yet</p>
          <p className="text-sm mt-1">Customer bookings will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b.id} className="border border-border rounded-xl p-4 bg-card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{b.service_name}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {format(new Date(b.preferred_date), "MMM d, yyyy")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {b.preferred_time}</span>
                  </div>
                </div>
                <Badge className={cn(STATUS_COLORS[b.status] || "")}>{b.status}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5" /> {b.customer_name}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {b.customer_phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {b.customer_email}
                </div>
                {(b.vehicle_make || b.vehicle_model) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car className="h-3.5 w-3.5" /> {[b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(" ")}
                  </div>
                )}
              </div>

              {b.notes && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
                  <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {b.notes}
                </div>
              )}

              {b.status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")}>Confirm</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "cancelled")}>Cancel</Button>
                </div>
              )}
              {b.status === "confirmed" && (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => updateStatus(b.id, "completed")}>Mark Completed</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "cancelled")}>Cancel</Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground">Submitted {format(new Date(b.created_at), "MMM d, yyyy h:mm a")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
