import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus, MapPin, Calendar, DollarSign, Trash2, Plane, Share2, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTripItineraries, useCreateTrip, useDeleteTrip, TripItinerary } from "@/hooks/useTripItineraries";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  planning: "bg-amber-500/20 text-amber-400",
  booked: "bg-primary/20 text-primary",
  completed: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function TripsListPage() {
  const { data: trips = [], isLoading } = useTripItineraries();
  const createTrip = useCreateTrip();
  const deleteTrip = useDeleteTrip();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Trips</h1>
            <p className="text-muted-foreground mt-1">Plan and organize your travel itineraries</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" /> New Trip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Trip</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Trip Name</Label>
                  <Input
                    placeholder="e.g. Summer in Paris"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label>Destination (optional)</Label>
                  <Input
                    placeholder="e.g. Paris, France"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || createTrip.isPending}
                >
                  {createTrip.isPending ? "Creating…" : "Create Trip"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-40" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Plane className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Create your first trip to start organizing flights, hotels, and activities in one place.
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Create Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onOpen={() => navigate(`/trip/${trip.id}`)}
                  onDelete={() => deleteTrip.mutate(trip.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
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

          <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(`${window.location.origin}/trip/${trip.id}`);
              }}
            >
              <Share2 className="w-3 h-3 mr-1" /> Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
