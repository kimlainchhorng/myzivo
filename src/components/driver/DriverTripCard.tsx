import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, DollarSign, User, Sparkles, Zap } from "lucide-react";
import { Trip } from "@/hooks/useTrips";
import { motion } from "framer-motion";

interface DriverTripCardProps {
  trip: Trip;
  onAccept?: () => void;
  isAccepting?: boolean;
  showAcceptButton?: boolean;
}

const DriverTripCard = ({ trip, onAccept, isAccepting, showAcceptButton = true }: DriverTripCardProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const estimatedEarnings = trip.fare_amount || 0;
  const isHighValue = estimatedEarnings >= 20;
  const isUrgent = trip.created_at && (Date.now() - new Date(trip.created_at).getTime()) < 60000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <Card className={`overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isHighValue ? 'ring-2 ring-amber-500/50' : ''}`}>
        <CardContent className="p-4">
          {/* Header with badges */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">New Trip Request</p>
                <p className="text-xs text-muted-foreground">{formatTime(trip.created_at)}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className="text-lg font-bold bg-emerald-500/10 text-emerald-500 border-emerald-500/20 border">
                <DollarSign className="w-4 h-4 mr-0.5" />
                {estimatedEarnings.toFixed(2)}
              </Badge>
              <div className="flex gap-1">
                {isHighValue && (
                  <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    High Value
                  </Badge>
                )}
                {isUrgent && (
                  <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-500 border-red-500/20 animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30" />
                <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-500 to-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Pickup</p>
                <p className="text-sm font-medium truncate">{trip.pickup_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-sm bg-foreground shadow-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Dropoff</p>
                <p className="text-sm font-medium truncate">{trip.dropoff_address}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-2.5 py-1.5 rounded-lg bg-muted/50">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="font-medium">{trip.distance_km?.toFixed(1)} km</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-2.5 py-1.5 rounded-lg bg-muted/50">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">{trip.duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <span className="font-semibold">${(estimatedEarnings / (trip.duration_minutes || 1) * 60).toFixed(0)}/hr</span>
            </div>
          </div>

          {showAcceptButton && onAccept && (
            <Button 
              className="w-full h-12 bg-gradient-to-r from-primary to-teal-400 shadow-lg hover:shadow-xl transition-all font-semibold text-base" 
              onClick={onAccept}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Accepting...
                </>
              ) : (
                "Accept Trip"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DriverTripCard;
