import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useRiderTripHistory } from "@/hooks/useRiderTripHistory";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const CustomerRides = () => {
  const { user } = useAuth();
  const { data: trips, isLoading } = useRiderTripHistory(user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500";
      case "cancelled": return "bg-red-500/10 text-red-500";
      case "in_progress": return "bg-blue-500/10 text-blue-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Rides</h1>
        <p className="text-muted-foreground">View your ride history and upcoming trips</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ride History</CardTitle>
          <CardDescription>All your past and current rides</CardDescription>
        </CardHeader>
        <CardContent>
          {trips && trips.length > 0 ? (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div key={trip.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="p-2 rounded-lg bg-rides/10">
                    <MapPin className="h-5 w-5 text-rides" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{trip.pickup_address}</p>
                        <p className="text-sm text-muted-foreground">→ {trip.dropoff_address}</p>
                      </div>
                      <Badge className={getStatusColor(trip.status || 'requested')}>
                        {trip.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{format(new Date(trip.created_at), 'MMM d, yyyy')}</span>
                      {trip.fare_amount && <span className="font-semibold text-foreground">${trip.fare_amount.toFixed(2)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No rides yet</p>
              <p className="text-sm">Book your first ride to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRides;
