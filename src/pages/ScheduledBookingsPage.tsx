import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, isAfter, parseISO } from "date-fns";
import { ArrowLeft, Calendar as CalendarIcon, Car, UtensilsCrossed, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScheduledBookings, ScheduledBooking } from "@/hooks/useScheduledBookings";
import AppBottomNav from "@/components/app/AppBottomNav";
import { toast } from "sonner";

const typeConfig: Record<string, { icon: typeof Car; color: string; label: string }> = {
  ride: { icon: Car, color: "text-primary", label: "Ride" },
  eats: { icon: UtensilsCrossed, color: "text-orange-500", label: "Food Delivery" },
  delivery: { icon: Package, color: "text-violet-500", label: "Package Delivery" },
};

const statusStyles: Record<string, string> = {
  scheduled: "bg-primary/15 text-primary",
  completed: "bg-emerald-500/15 text-emerald-600",
  cancelled: "bg-destructive/15 text-destructive",
};

function BookingCard({
  booking,
  onCancel,
}: {
  booking: ScheduledBooking;
  onCancel: (id: string) => void;
}) {
  const cfg = typeConfig[booking.type] || typeConfig.ride;
  const Icon = cfg.icon;
  const bookingDate = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);

  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color} bg-current/10`}>
            <Icon className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{cfg.label}</p>
            <p className="text-xs text-muted-foreground">
              {booking.details?.rideType || booking.details?.restaurant || ""}
            </p>
          </div>
        </div>
        <Badge className={`text-[10px] ${statusStyles[booking.status]}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          {format(bookingDate, "MMM d, yyyy")} · {format(bookingDate, "h:mm a")}
        </span>
      </div>

      {booking.pickup && (
        <div className="text-xs text-muted-foreground mb-1 pl-5.5">
          {booking.pickup}
          {booking.destination ? ` → ${booking.destination}` : ""}
        </div>
      )}

      {booking.status === "scheduled" && (
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => onCancel(booking.id)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

const ScheduledBookingsPage = () => {
  const navigate = useNavigate();
  const { getScheduledBookings, cancelScheduledBooking } = useScheduledBookings();
  const [bookings, setBookings] = useState<ScheduledBooking[]>([]);

  useEffect(() => {
    setBookings(getScheduledBookings());
  }, []);

  const now = new Date();

  const upcoming = bookings
    .filter((b) => b.status === "scheduled" && isAfter(new Date(`${b.scheduledDate}T${b.scheduledTime}`), now))
    .sort((a, b) => new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime() - new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime());

  const past = bookings
    .filter((b) => b.status === "completed" || (b.status === "scheduled" && !isAfter(new Date(`${b.scheduledDate}T${b.scheduledTime}`), now)))
    .sort((a, b) => new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime() - new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime());

  const cancelled = bookings
    .filter((b) => b.status === "cancelled")
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleCancel = (id: string) => {
    cancelScheduledBooking(id);
    setBookings(getScheduledBookings());
    toast.success("Booking cancelled");
  };

  const renderList = (items: ScheduledBooking[], emptyMsg: string) =>
    items.length > 0 ? (
      <div className="space-y-3">
        {items.map((b) => (
          <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
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
        </div>
      </div>

      <div className="px-4 pt-4">
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
      </div>

      <AppBottomNav />
    </div>
  );
};

export default ScheduledBookingsPage;
