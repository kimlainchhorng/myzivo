import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, DollarSign, User, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TripRequest } from "@/hooks/useDriverApp";
import { formatDistanceToNow } from "date-fns";

interface TripRequestCardProps {
  trip: TripRequest;
  onAccept: (tripId: string) => void;
  isAccepting?: boolean;
  acceptError?: string | null;
  onRetry?: (tripId: string) => void;
}

const TripRequestCard = ({ trip, onAccept, isAccepting, acceptError, onRetry }: TripRequestCardProps) => {
  const formattedFare = trip.fare_amount ? `$${trip.fare_amount.toFixed(2)}` : "—";
  const formattedDistance = trip.distance_km ? `${(trip.distance_km * 0.621371).toFixed(1)} mi` : "—";
  const formattedDuration = trip.duration_minutes ? `${Math.round(trip.duration_minutes)} min` : "—";
  const timeAgo = formatDistanceToNow(new Date(trip.created_at), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      layout
    >
      <Card className="bg-zinc-900/90 border-white/10 overflow-hidden">
        {/* Urgency indicator */}
        <div className="h-1 bg-gradient-to-r from-primary via-primary to-transparent" />
        
        <CardContent className="p-4 space-y-4">
          {/* Header with fare and time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-bold text-xl text-green-400">{formattedFare}</p>
                <p className="text-xs text-white/40">{timeAgo}</p>
              </div>
            </div>
            
            <div className="text-right text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                <span>{formattedDistance}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedDuration}</span>
              </div>
            </div>
          </div>

          {/* Route info */}
          <div className="space-y-3">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40 uppercase tracking-wide">Pickup</p>
                <p className="text-sm text-white truncate">{trip.pickup_address}</p>
              </div>
            </div>

            {/* Connector line */}
            <div className="ml-4 border-l-2 border-dashed border-white/10 h-3" />

            {/* Dropoff */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Navigation className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40 uppercase tracking-wide">Dropoff</p>
                <p className="text-sm text-white truncate">{trip.dropoff_address}</p>
              </div>
            </div>
          </div>

          {/* Customer info if available */}
          {trip.customer_name && (
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
              <User className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/60">{trip.customer_name}</span>
            </div>
          )}

          {/* Ride type badge */}
          {trip.ride_type && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full capitalize">
                {trip.ride_type.replace(/_/g, " ")}
              </span>
            </div>
          )}

          {/* Error message with retry */}
          {acceptError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{acceptError}</p>
            </div>
          )}

          {/* Accept button or Retry button */}
          {acceptError && onRetry ? (
            <Button
              onClick={() => onRetry(trip.id)}
              disabled={isAccepting}
              variant="outline"
              className="w-full h-12 text-lg font-bold border-primary bg-primary/10 hover:bg-primary/20 text-primary"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  TAP TO RETRY
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => onAccept(trip.id)}
              disabled={isAccepting}
              className="w-full h-12 text-lg font-bold bg-green-500 hover:bg-green-600 text-white"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                "ACCEPT RIDE"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TripRequestCard;
