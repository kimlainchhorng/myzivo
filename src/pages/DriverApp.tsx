import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Power, 
  DollarSign, 
  MapPin, 
  Clock,
  Car,
  AlertCircle,
  History,
  Navigation
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useCurrentDriver, 
  useAvailableTripRequests, 
  useDriverActiveTrip,
  useDriverTripHistory,
  useToggleOnlineStatus,
  useAcceptTrip,
  useUpdateDriverTripStatus,
  useDriverEarnings
} from "@/hooks/useDriverApp";
import { useDriverTripRealtime } from "@/hooks/useTripRealtime";
import DriverTripCard from "@/components/driver/DriverTripCard";
import ActiveTripPanel from "@/components/driver/ActiveTripPanel";
import { TripStatus } from "@/hooks/useTrips";
import AdminFloatingButton from "@/components/admin/AdminFloatingButton";
import { useUserAccess } from "@/hooks/useUserAccess";
import AccessDenied from "@/components/auth/AccessDenied";

const DriverApp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("requests");

  // Fetch driver data
  const { data: driver, isLoading: driverLoading } = useCurrentDriver(user?.id);
  const { data: availableTrips, isLoading: tripsLoading } = useAvailableTripRequests(driver?.is_online && driver?.status === "verified");
  const { data: activeTrip } = useDriverActiveTrip(driver?.id);
  const { data: tripHistory } = useDriverTripHistory(driver?.id);
  const { data: earnings } = useDriverEarnings(driver?.id);

  // Mutations
  const toggleOnline = useToggleOnlineStatus();
  const acceptTrip = useAcceptTrip();
  const updateTripStatus = useUpdateDriverTripStatus();

  // Enable realtime for driver trips
  useDriverTripRealtime(driver?.id);

  // Get user location when going online
  const handleToggleOnline = async () => {
    if (!driver) return;

    if (!driver.is_online) {
      // Going online - get location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            toggleOnline.mutate({
              driverId: driver.id,
              isOnline: true,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            // Location denied, still go online
            toggleOnline.mutate({ driverId: driver.id, isOnline: true });
          }
        );
      } else {
        toggleOnline.mutate({ driverId: driver.id, isOnline: true });
      }
    } else {
      toggleOnline.mutate({ driverId: driver.id, isOnline: false });
    }
  };

  const handleAcceptTrip = (tripId: string) => {
    if (!driver) return;
    acceptTrip.mutate({ tripId, driverId: driver.id });
  };

  const handleUpdateStatus = (status: TripStatus) => {
    if (!activeTrip) return;
    updateTripStatus.mutate({ tripId: activeTrip.id, status });
  };

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
            <p className="text-muted-foreground mb-4">You need to be logged in to access the driver app</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
              <Button onClick={() => navigate("/login")}>Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (driverLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Not a driver yet
  if (!driver) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Become a Driver</h2>
            <p className="text-muted-foreground mb-4">Register as a driver to start accepting trips</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
              <Button onClick={() => navigate("/drive")}>Register Now</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Driver not verified
  if (driver.status !== "verified") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">
              {driver.status === "pending" ? "Verification Pending" : 
               driver.status === "rejected" ? "Application Rejected" : "Account Suspended"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {driver.status === "pending" 
                ? "Your application is being reviewed. We'll notify you once approved."
                : driver.status === "rejected"
                ? "Unfortunately, your application was not approved. Please contact support."
                : "Your account has been suspended. Please contact support for assistance."}
            </p>
            <Badge variant={driver.status === "pending" ? "secondary" : "destructive"}>
              {driver.status}
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has active trip - show trip panel
  if (activeTrip) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg">Active Trip</h1>
            <Badge variant="default" className="capitalize">
              {activeTrip.status?.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <ActiveTripPanel 
          trip={activeTrip} 
          driverId={driver.id}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={updateTripStatus.isPending}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{driver.full_name}</h1>
              <p className="text-xs text-muted-foreground">{driver.vehicle_model}</p>
            </div>
          </div>
          
          {/* Online Toggle */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{driver.is_online ? "Online" : "Offline"}</p>
              <p className="text-xs text-muted-foreground">
                {driver.is_online ? "Accepting trips" : "Go online to start"}
              </p>
            </div>
            <div className={`p-2 rounded-full ${driver.is_online ? "bg-green-500" : "bg-muted"}`}>
              <Switch
                checked={driver.is_online || false}
                onCheckedChange={handleToggleOnline}
                disabled={toggleOnline.isPending}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <p className="text-xl font-bold">${earnings?.today.toFixed(0) || 0}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Navigation className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{earnings?.trips_today || 0}</p>
              <p className="text-xs text-muted-foreground">Trips</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <DollarSign className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xl font-bold">${earnings?.week.toFixed(0) || 0}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {!driver.is_online ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Power className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">You're Offline</h2>
              <p className="text-muted-foreground mb-4">
                Toggle the switch above to go online and start receiving trip requests
              </p>
              <Button onClick={handleToggleOnline} disabled={toggleOnline.isPending}>
                <Power className="w-4 h-4 mr-2" />
                Go Online
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="requests" className="flex-1">
                <MapPin className="w-4 h-4 mr-2" />
                Requests
                {(availableTrips?.length || 0) > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {availableTrips?.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-3">
              {tripsLoading ? (
                <>
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </>
              ) : !availableTrips?.length ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No Trip Requests</h3>
                    <p className="text-muted-foreground text-sm">
                      New trip requests will appear here. Stay online to receive them.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                availableTrips.map((trip) => (
                  <DriverTripCard
                    key={trip.id}
                    trip={trip}
                    onAccept={() => handleAcceptTrip(trip.id)}
                    isAccepting={acceptTrip.isPending}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {!tripHistory?.length ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No Trip History</h3>
                    <p className="text-muted-foreground text-sm">
                      Your completed trips will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                tripHistory.map((trip) => (
                  <Card key={trip.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant={trip.status === "completed" ? "default" : "secondary"}>
                            {trip.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {trip.completed_at 
                              ? new Date(trip.completed_at).toLocaleDateString()
                              : new Date(trip.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-lg">${trip.fare_amount?.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="truncate text-muted-foreground">
                          <span className="text-green-500 mr-2">●</span>
                          {trip.pickup_address}
                        </p>
                        <p className="truncate text-muted-foreground">
                          <span className="mr-2">■</span>
                          {trip.dropoff_address}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      <AdminFloatingButton />
    </div>
  );
};

export default DriverApp;
