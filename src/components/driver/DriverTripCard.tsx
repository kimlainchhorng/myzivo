import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, DollarSign, User } from "lucide-react";
import { Trip } from "@/hooks/useTrips";

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

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Rider</p>
              <p className="text-xs text-muted-foreground">{formatTime(trip.created_at)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg font-semibold">
            ${trip.fare_amount?.toFixed(2)}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm font-medium truncate">{trip.pickup_address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-sm bg-foreground mt-1.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Dropoff</p>
              <p className="text-sm font-medium truncate">{trip.dropoff_address}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Navigation className="w-4 h-4" />
            <span>{trip.distance_km?.toFixed(1)} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{trip.duration_minutes} min</span>
          </div>
        </div>

        {showAcceptButton && onAccept && (
          <Button 
            className="w-full" 
            onClick={onAccept}
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting..." : "Accept Trip"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverTripCard;
