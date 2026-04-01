import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus, MapPin, Calendar, DollarSign, Trash2, Plane, Share2, MoreHorizontal, Ticket, Clock, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTripItineraries, useCreateTrip, useDeleteTrip, TripItinerary } from "@/hooks/useTripItineraries";
import { useFlightBookings, getTicketingStatusInfo } from "@/hooks/useFlightBooking";
import PullToRefresh from "@/components/shared/PullToRefresh";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  planning: "bg-amber-500/20 text-amber-400",
  booked: "bg-primary/20 text-primary",
  completed: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function TripsListPage() {
  const { data: trips = [], isLoading, refetch: refetchTrips } = useTripItineraries();
  const { data: flightBookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useFlightBookings();
  const createTrip = useCreateTrip();
  const deleteTrip = useDeleteTrip();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");

  const handlePullRefresh = useCallback(async () => {
    await Promise.all([refetchTrips(), refetchBookings()]);
  }, [refetchTrips, refetchBookings]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const trip = await createTrip.mutateAsync({
      title: newTitle.trim(),
      destination: newDestination.trim() || null,
    });
    setNewTitle("");
    setNewDestination("");
    setDialogOpen(false);
    navigate(`/trip/${trip.id}`);
  };

  return (
    <PullToRefresh onRefresh={handlePullRefresh} className="min-h-screen bg-background">
...
      </div>
    </PullToRefresh>
  );
}

function TripCard({
  trip,
  onOpen,
  onDelete,
}: {
  trip: TripItinerary;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const costDollars = (trip.total_estimated_cost_cents / 100).toFixed(0);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
      <Card
        className="cursor-pointer hover:border-primary/40 transition-all group overflow-hidden"
        onClick={onOpen}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{trip.title}</h3>
              {trip.destination && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {trip.destination}
                </p>
              )}
            </div>
            <Badge className={cn("border-0 capitalize text-xs", statusColors[trip.status])}>
              {trip.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {trip.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(trip.start_date), "MMM d")}
                {trip.end_date && ` – ${format(new Date(trip.end_date), "MMM d, yyyy")}`}
              </span>
            )}
            {trip.total_estimated_cost_cents > 0 && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> ${costDollars}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs min-h-[44px] touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(`${window.location.origin}/trip/${trip.id}`);
              }}
            >
              <Share2 className="w-3.5 h-3.5 mr-1" /> Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs text-destructive hover:text-destructive min-h-[44px] touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
