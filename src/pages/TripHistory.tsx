import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  Receipt,
  Clock,
  Navigation,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRiderTripHistory } from "@/hooks/useRiderTripHistory";
import TripReceiptModal from "@/components/rider/TripReceiptModal";
import { Trip } from "@/hooks/useTrips";

const TripHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: trips, isLoading } = useRiderTripHistory(user?.id);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const completedTrips = trips?.filter((t) => t.status === "completed") || [];
  const cancelledTrips = trips?.filter((t) => t.status === "cancelled") || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewReceipt = (trip: Trip) => {
    setSelectedTrip(trip);
    setReceiptOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Sign in to view history</h2>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to see your trip history
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button onClick={() => navigate("/login")}>Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TripCard = ({ trip }: { trip: typeof trips[0] }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                trip.status === "completed" ? "bg-green-500/10" : "bg-destructive/10"
              }`}
            >
              {trip.status === "completed" ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{formatDate(trip.created_at)}</p>
              <p className="text-xs text-muted-foreground">{formatTime(trip.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">${trip.fare_amount?.toFixed(2)}</p>
            {trip.rating && (
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs">{trip.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Route */}
        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0" />
            <p className="text-sm truncate flex-1">{trip.pickup_address}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-sm bg-foreground mt-1 flex-shrink-0" />
            <p className="text-sm truncate flex-1">{trip.dropoff_address}</p>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            <span>{trip.distance_km?.toFixed(1)} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{trip.duration_minutes} min</span>
          </div>
          {trip.driver && (
            <div className="flex items-center gap-1">
              <span>• {trip.driver.full_name}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {trip.status === "completed" && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleViewReceipt(trip)}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Receipt
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => {
              // Re-book same route
              navigate("/ride", {
                state: {
                  pickup: {
                    address: trip.pickup_address,
                    lat: trip.pickup_lat,
                    lng: trip.pickup_lng,
                  },
                  dropoff: {
                    address: trip.dropoff_address,
                    lat: trip.dropoff_lat,
                    lng: trip.dropoff_lng,
                  },
                },
              });
            }}
          >
            Book Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">Trip History</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{completedTrips.length}</p>
              <p className="text-xs text-muted-foreground">Trips</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">
                ${completedTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">
                {completedTrips.reduce((sum, t) => sum + (t.distance_km || 0), 0).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">km Traveled</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : !trips?.length ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No trips yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your completed trips will appear here
              </p>
              <Button onClick={() => navigate("/ride")}>Book a Ride</Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="completed">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="completed" className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed ({completedTrips.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1">
                <XCircle className="w-4 h-4 mr-2" />
                Cancelled ({cancelledTrips.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="space-y-3">
              {completedTrips.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No completed trips</p>
                  </CardContent>
                </Card>
              ) : (
                completedTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-3">
              {cancelledTrips.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No cancelled trips</p>
                  </CardContent>
                </Card>
              ) : (
                cancelledTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedTrip && (
        <TripReceiptModal
          trip={selectedTrip as any}
          open={receiptOpen}
          onOpenChange={setReceiptOpen}
        />
      )}
    </div>
  );
};

export default TripHistory;
