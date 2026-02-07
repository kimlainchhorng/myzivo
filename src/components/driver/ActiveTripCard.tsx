import { motion } from "framer-motion";
import { MapPin, Navigation, Phone, MessageCircle, X, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TripRequest } from "@/hooks/useDriverApp";
import { toast } from "sonner";

interface ActiveTripCardProps {
  trip: TripRequest;
  onUpdateStatus: (tripId: string, status: string) => void;
  isUpdating?: boolean;
  updateError?: string | null;
  onRetryUpdate?: (tripId: string, status: string) => void;
  isNearPickup?: boolean;
  isNearDropoff?: boolean;
}

const statusConfig: Record<string, { 
  label: string; 
  nextStatus: string; 
  nextLabel: string;
  color: string;
}> = {
  accepted: {
    label: "Heading to pickup",
    nextStatus: "arrived",
    nextLabel: "I'VE ARRIVED",
    color: "bg-blue-500",
  },
  en_route: {
    label: "En route to pickup",
    nextStatus: "arrived",
    nextLabel: "I'VE ARRIVED",
    color: "bg-blue-500",
  },
  arrived: {
    label: "Waiting at pickup",
    nextStatus: "in_progress",
    nextLabel: "START TRIP",
    color: "bg-yellow-500",
  },
  in_progress: {
    label: "Trip in progress",
    nextStatus: "completed",
    nextLabel: "COMPLETE TRIP",
    color: "bg-green-500",
  },
};

const ActiveTripCard = ({ 
  trip, 
  onUpdateStatus, 
  isUpdating, 
  updateError, 
  onRetryUpdate,
  isNearPickup = false,
  isNearDropoff = false,
}: ActiveTripCardProps) => {
  const config = statusConfig[trip.status] || statusConfig.accepted;
  const formattedFare = trip.fare_amount ? `$${trip.fare_amount.toFixed(2)}` : "—";

  const handleCall = () => {
    if (trip.customer_phone) {
      window.location.href = `tel:${trip.customer_phone}`;
    } else {
      toast.info("No phone number available");
    }
  };

  const handleMessage = () => {
    toast.info("Opening chat...");
  };

  const handleCancel = () => {
    onUpdateStatus(trip.id, "cancelled");
  };

  // Show pickup arrival prompt
  const showPickupPrompt = isNearPickup && trip.status !== "arrived" && trip.status !== "in_progress";
  // Show dropoff arrival prompt  
  const showDropoffPrompt = isNearDropoff && trip.status === "in_progress";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-zinc-900/95 border-white/10 overflow-hidden">
        {/* Proximity-based arrival prompts */}
        {showPickupPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-green-500 px-4 py-3 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-white" />
              <span className="font-semibold text-white">📍 You're at the pickup location</span>
            </div>
            <p className="text-xs text-white/80 mt-1">Tap "I'VE ARRIVED" to notify the customer</p>
          </motion.div>
        )}

        {showDropoffPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-green-500 px-4 py-3 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <Navigation className="w-5 h-5 text-white" />
              <span className="font-semibold text-white">🏁 You've reached the destination</span>
            </div>
            <p className="text-xs text-white/80 mt-1">Tap "COMPLETE TRIP" to finish</p>
          </motion.div>
        )}

        {/* Status banner */}
        <div className={`${config.color} px-4 py-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-white rounded-full"
              />
              <span className="font-medium text-white">{config.label}</span>
            </div>
            <span className="font-bold text-white">{formattedFare}</span>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Customer info */}
          {trip.customer_name && (
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-sm text-white/60">Customer</p>
                <p className="font-semibold text-white">{trip.customer_name}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCall}
                  className="h-10 w-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <Phone className="w-4 h-4 text-primary" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleMessage}
                  className="h-10 w-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <MessageCircle className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </div>
          )}

          {/* Route info */}
          <div className="space-y-3">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                showPickupPrompt ? "bg-green-500/30" : "bg-primary/20"
              }`}>
                <MapPin className={`w-4 h-4 ${showPickupPrompt ? "text-green-400" : "text-primary"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40 uppercase tracking-wide">Pickup</p>
                <p className="text-sm text-white">{trip.pickup_address}</p>
              </div>
            </div>

            {/* Connector line */}
            <div className="ml-4 border-l-2 border-dashed border-white/10 h-3" />

            {/* Dropoff */}
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                showDropoffPrompt ? "bg-green-500/30" : "bg-green-500/20"
              }`}>
                <Navigation className={`w-4 h-4 ${showDropoffPrompt ? "text-green-300" : "text-green-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40 uppercase tracking-wide">Dropoff</p>
                <p className="text-sm text-white">{trip.dropoff_address}</p>
              </div>
            </div>
          </div>

          {/* Error message with retry */}
          {updateError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{updateError}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            {/* Main action button or Retry button */}
            {updateError && onRetryUpdate ? (
              <Button
                onClick={() => onRetryUpdate(trip.id, config.nextStatus)}
                disabled={isUpdating}
                variant="outline"
                className="w-full h-14 text-lg font-bold border-primary bg-primary/10 hover:bg-primary/20 text-primary"
              >
                {isUpdating ? (
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
                onClick={() => onUpdateStatus(trip.id, config.nextStatus)}
                disabled={isUpdating}
                className={`w-full h-14 text-lg font-bold ${
                  config.nextStatus === "completed" || showPickupPrompt || showDropoffPrompt
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    {config.nextStatus === "completed" && <CheckCircle2 className="w-5 h-5 mr-2" />}
                    {config.nextLabel}
                  </>
                )}
              </Button>
            )}

            {/* Cancel button - only show before trip starts */}
            {trip.status !== "in_progress" && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
                className="w-full h-12 border-destructive/50 bg-destructive/10 hover:bg-destructive/20 text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Ride
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActiveTripCard;
