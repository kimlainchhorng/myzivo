import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  CalendarIcon, User, Car, Clock, Phone, Mail, FileText,
  Search, MessageSquareText, CalendarClock, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [search, setSearch] = useState("");
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; bookingId: string; notes: string }>({ open: false, bookingId: "", notes: "" });
  const [rescheduleDialog, setRescheduleDialog] = useState<{ open: boolean; bookingId: string; date: Date | undefined; time: string }>({ open: false, bookingId: "", date: undefined, time: "" });
  const [saving, setSaving] = useState(false);

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

  const saveNotes = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("service_bookings")
      .update({ admin_notes: notesDialog.notes } as any)
      .eq("id", notesDialog.bookingId);
    setSaving(false);
    if (error) { toast.error("Failed to save notes"); return; }
    toast.success("Notes saved");
    setNotesDialog({ open: false, bookingId: "", notes: "" });
    fetchBookings();
  };

  const saveReschedule = async () => {
    if (!rescheduleDialog.date || !rescheduleDialog.time) {
      toast.error("Please select both date and time");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("service_bookings")
      .update({
        preferred_date: format(rescheduleDialog.date, "yyyy-MM-dd"),
        preferred_time: rescheduleDialog.time,
      })
      .eq("id", rescheduleDialog.bookingId);
    setSaving(false);
    if (error) { toast.error("Failed to reschedule"); return; }
    toast.success("Booking rescheduled");
    setRescheduleDialog({ open: false, bookingId: "", date: undefined, time: "" });
    fetchBookings();
  };

  const filtered = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        b.customer_name?.toLowerCase().includes(q) ||
        b.customer_phone?.toLowerCase().includes(q) ||
        b.customer_email?.toLowerCase().includes(q) ||
        b.service_name?.toLowerCase().includes(q)
      );
    });

  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayCount = bookings.filter(b => b.preferred_date === todayStr).length;

  if (loading) return <div className="py-8 text-center text-muted-foreground">Loading bookings...</div>;

  const timeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM", "5:30 PM", "6:00 PM",
  ];

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600">Pending</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{todayCount}</p>
          <p className="text-xs text-blue-600">Today</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{bookings.filter(b => b.status === "completed").length}</p>
          <p className="text-xs text-green-600">Completed</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email, or service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <CalendarIcon className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p>No bookings {search ? "matching your search" : "yet"}</p>
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

              {/* Customer Info + Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5" /> {b.customer_name}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <a href={`tel:${b.customer_phone}`} className="text-primary hover:underline flex items-center gap-1">
                    {b.customer_phone} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${b.customer_email}`} className="text-primary hover:underline flex items-center gap-1">
                    {b.customer_email} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {(b.vehicle_make || b.vehicle_model) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car className="h-3.5 w-3.5" /> {[b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(" ")}
                  </div>
                )}
              </div>

              {/* Customer notes */}
              {b.notes && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
                  <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {b.notes}
                </div>
              )}

              {/* Admin notes */}
              {b.admin_notes && (
                <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <MessageSquareText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium text-xs">Admin Note:</span> {b.admin_notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {b.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")}>Confirm</Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "cancelled")}>Cancel</Button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(b.id, "completed")}>Mark Completed</Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "cancelled")}>Cancel</Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRescheduleDialog({ open: true, bookingId: b.id, date: new Date(b.preferred_date), time: b.preferred_time })}
                >
                  <CalendarClock className="h-3.5 w-3.5 mr-1" /> Reschedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNotesDialog({ open: true, bookingId: b.id, notes: b.admin_notes || "" })}
                >
                  <MessageSquareText className="h-3.5 w-3.5 mr-1" /> Notes
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">Submitted {format(new Date(b.created_at), "MMM d, yyyy h:mm a")}</p>
            </div>
          ))}
        </div>
      )}

      {/* Notes Dialog */}
      <Dialog open={notesDialog.open} onOpenChange={open => !open && setNotesDialog(n => ({ ...n, open: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Notes</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Add internal notes about this booking..."
            value={notesDialog.notes}
            onChange={e => setNotesDialog(n => ({ ...n, notes: e.target.value }))}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialog(n => ({ ...n, open: false }))}>Cancel</Button>
            <Button onClick={saveNotes} disabled={saving}>{saving ? "Saving..." : "Save Notes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={open => !open && setRescheduleDialog(r => ({ ...r, open: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">New Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left", !rescheduleDialog.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDialog.date ? format(rescheduleDialog.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rescheduleDialog.date}
                    onSelect={d => setRescheduleDialog(r => ({ ...r, date: d }))}
                    disabled={d => d < new Date()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">New Time</label>
              <Select value={rescheduleDialog.time} onValueChange={t => setRescheduleDialog(r => ({ ...r, time: t }))}>
                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(r => ({ ...r, open: false }))}>Cancel</Button>
            <Button onClick={saveReschedule} disabled={saving}>{saving ? "Saving..." : "Reschedule"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
