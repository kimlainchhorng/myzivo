import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Clock, Navigation, Star, Download, Share2 } from "lucide-react";
import { Trip } from "@/hooks/useTrips";

interface TripReceiptModalProps {
  trip: Trip & { driver?: { full_name: string; vehicle_model: string; vehicle_plate: string } | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TripReceiptModal = ({ trip, open, onOpenChange }: TripReceiptModalProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const baseFare = (trip.fare_amount || 0) * 0.6;
  const distanceFare = (trip.fare_amount || 0) * 0.3;
  const timeFare = (trip.fare_amount || 0) * 0.1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Trip Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trip Date & Time */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(trip.created_at)}</span>
            <Clock className="w-4 h-4 ml-2" />
            <span>{formatTime(trip.created_at)}</span>
          </div>

          {/* Locations */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium">{trip.pickup_address}</p>
                {trip.started_at && (
                  <p className="text-xs text-muted-foreground">{formatTime(trip.started_at)}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-sm bg-foreground mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Dropoff</p>
                <p className="text-sm font-medium">{trip.dropoff_address}</p>
                {trip.completed_at && (
                  <p className="text-xs text-muted-foreground">{formatTime(trip.completed_at)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Driver Info */}
          {trip.driver && (
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {trip.driver.full_name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{trip.driver.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {trip.driver.vehicle_model} • {trip.driver.vehicle_plate}
                </p>
              </div>
            </div>
          )}

          {/* Trip Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-muted/50 rounded-lg">
              <Navigation className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{trip.distance_km?.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">km</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{trip.duration_minutes}</p>
              <p className="text-xs text-muted-foreground">min</p>
            </div>
            {trip.rating && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold">{trip.rating}</p>
                <p className="text-xs text-muted-foreground">rating</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Fare Breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium">Fare Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base fare</span>
                <span>${baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance ({trip.distance_km?.toFixed(1)} km)</span>
                <span>${distanceFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time ({trip.duration_minutes} min)</span>
                <span>${timeFare.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${trip.fare_amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Payment {trip.payment_status}
            </span>
            <span className="text-sm text-green-700 dark:text-green-400">
              •••• 4242
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripReceiptModal;
