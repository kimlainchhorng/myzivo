/**
 * Scheduled Bookings Dashboard
 * View, edit, reschedule, and cancel upcoming bookings
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, isAfter, parseISO } from "date-fns";
import { 
  ArrowLeft, Calendar as CalendarIcon, Car, UtensilsCrossed, Package, Clock,
  Edit2, CalendarDays, X, Loader2, Bell, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useScheduledBookingsQuery,
  useCancelScheduledBooking,
  useEditScheduledBooking,
  type ScheduledBooking,
} from "@/hooks/useScheduledBookings";
import AppBottomNav from "@/components/app/AppBottomNav";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const typeConfig: Record<string, { icon: typeof Car; color: string; label: string }> = {
  ride: { icon: Car, color: "text-primary", label: "Ride" },
  eats: { icon: UtensilsCrossed, color: "text-orange-500", label: "Food Order" },
  delivery: { icon: Package, color: "text-violet-500", label: "Delivery" },
};

const statusStyles: Record<string, string> = {
  scheduled: "bg-primary/15 text-primary",
  confirmed: "bg-emerald-500/15 text-emerald-600",
  in_progress: "bg-sky-500/15 text-sky-600",
  completed: "bg-emerald-500/15 text-emerald-600",
  cancelled: "bg-destructive/15 text-destructive",
};

// Quick time slots for rescheduling
const RESCHEDULE_TIMES: string[] = [];
for (let h = 6; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    RESCHEDULE_TIMES.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  }
}

function formatTime12(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function BookingCard({
  booking,
  onCancel,
  onReschedule,
}: {
  booking: ScheduledBooking;
  onCancel: (id: string) => void;
  onReschedule: (booking: ScheduledBooking) => void;
}) {
  const cfg = typeConfig[booking.booking_type] || typeConfig.ride;
  const Icon = cfg.icon;
  const bookingDate = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`);
  const isUpcoming = isAfter(bookingDate, new Date());
  const isActive = booking.status === "scheduled" || booking.status === "confirmed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-4 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-current/10", cfg.color)}>
            <Icon className={cn("w-5 h-5", cfg.color)} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{cfg.label}</p>
            <p className="text-xs text-muted-foreground">
              {booking.details?.rideType || booking.details?.rideName || booking.details?.restaurant || booking.details?.packageType || ""}
            </p>
          </div>
        </div>
        <Badge className={cn("text-[10px]", statusStyles[booking.status])}>
          {booking.status === "in_progress" ? "In Progress" : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      {/* Date/Time */}
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          {format(bookingDate, "MMM d, yyyy")} · {format(bookingDate, "h:mm a")}
        </span>
        {booking.driver_id && (
          <Badge className="text-[9px] bg-emerald-500/15 text-emerald-600 ml-auto">
            <CheckCircle2 className="w-3 h-3 mr-0.5" />
            Driver Assigned
          </Badge>
        )}
      </div>

      {/* Route */}
      {booking.pickup_address && (
        <div className="text-xs text-muted-foreground mb-1 pl-5.5">
          {booking.pickup_address}
          {booking.destination_address ? ` → ${booking.destination_address}` : ""}
        </div>
      )}

      {/* Price estimate */}
      {booking.estimated_price && (
        <div className="text-xs text-muted-foreground pl-5.5">
          Est. ${Number(booking.estimated_price).toFixed(2)}
        </div>
      )}

      {/* Reminder indicator */}
      {isActive && isUpcoming && !booking.reminder_sent && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
          <Bell className="w-3 h-3" />
          Reminder will be sent 1 hour before
        </div>
      )}

      {/* Actions */}
      {isActive && isUpcoming && (
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={() => onReschedule(booking)}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Reschedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => onCancel(booking.id)}
          >
            <X className="w-3.5 h-3.5 mr-0.5" />
            Cancel
          </Button>
        </div>
      )}
    </motion.div>
  );
}

const ScheduledBookingsPage = () => {
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useScheduledBookingsQuery();
  const cancelMutation = useCancelScheduledBooking();
  const editMutation = useEditScheduledBooking();
  
  const [rescheduleTarget, setRescheduleTarget] = useState<ScheduledBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState<string | undefined>(undefined);

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings
    .filter((b) => (b.status === "scheduled" || b.status === "confirmed") && isAfter(new Date(`${b.scheduled_date}T${b.scheduled_time}`), now))
    .sort((a, b) => new Date(`${a.scheduled_date}T${a.scheduled_time}`).getTime() - new Date(`${b.scheduled_date}T${b.scheduled_time}`).getTime());

  const past = bookings
    .filter((b) => b.status === "completed" || b.status === "in_progress" || ((b.status === "scheduled" || b.status === "confirmed") && !isAfter(new Date(`${b.scheduled_date}T${b.scheduled_time}`), now)))
    .sort((a, b) => new Date(`${b.scheduled_date}T${b.scheduled_time}`).getTime() - new Date(`${a.scheduled_date}T${a.scheduled_time}`).getTime());

  const cancelled = bookings
    .filter((b) => b.status === "cancelled")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleCancel = (id: string) => {
    cancelMutation.mutate({ id });
  };

  const handleReschedule = (booking: ScheduledBooking) => {
    setRescheduleTarget(booking);
    setRescheduleDate(new Date(booking.scheduled_date + "T00:00:00"));
    setRescheduleTime(booking.scheduled_time?.slice(0, 5));
  };

  const confirmReschedule = () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return;
    editMutation.mutate(
      {
        id: rescheduleTarget.id,
        updates: {
          scheduled_date: format(rescheduleDate, "yyyy-MM-dd"),
          scheduled_time: rescheduleTime,
        },
      },
      {
        onSuccess: () => {
          setRescheduleTarget(null);
        },
      }
    );
  };

  const renderList = (items: ScheduledBooking[], emptyMsg: string) =>
    items.length > 0 ? (
      <div className="space-y-3">
        {items.map((b) => (
          <BookingCard key={b.id} booking={b} onCancel={handleCancel} onReschedule={handleReschedule} />
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <CalendarIcon className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">{emptyMsg}</p>
        <p className="text-xs text-muted-foreground">Schedule a ride, delivery, or meal from the home screen</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Scheduled Bookings</h1>
          {upcoming.length > 0 && (
            <Badge className="ml-auto bg-primary/15 text-primary text-[10px]">
              {upcoming.length} upcoming
            </Badge>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="w-full">
              <TabsTrigger value="upcoming" className="flex-1">
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1">
                Past ({past.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1">
                Cancelled ({cancelled.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-4">
              {renderList(upcoming, "No upcoming bookings")}
            </TabsContent>
            <TabsContent value="past" className="mt-4">
              {renderList(past, "No past bookings")}
            </TabsContent>
            <TabsContent value="cancelled" className="mt-4">
              {renderList(cancelled, "No cancelled bookings")}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleTarget} onOpenChange={(o) => !o && setRescheduleTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Reschedule Booking
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={rescheduleDate}
              onSelect={setRescheduleDate}
              disabled={(d) => d < today}
              className="p-0 pointer-events-auto"
            />

            {rescheduleDate && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Select time
                </p>
                <div className="grid grid-cols-4 gap-1 max-h-[150px] overflow-y-auto">
                  {RESCHEDULE_TIMES.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setRescheduleTime(slot)}
                      className={cn(
                        "text-xs py-1.5 rounded-xl transition-colors",
                        rescheduleTime === slot
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {formatTime12(slot)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRescheduleTarget(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!rescheduleDate || !rescheduleTime || editMutation.isPending}
                onClick={confirmReschedule}
              >
                {editMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <CalendarDays className="w-4 h-4 mr-1" />
                )}
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AppBottomNav />
    </div>
  );
};

export default ScheduledBookingsPage;
