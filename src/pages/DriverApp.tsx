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
  Navigation,
  Sparkles,
  TrendingUp,
  Zap,
  Star,
  Shield
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
import CrossAppNavigation from "@/components/CrossAppNavigation";
import NotificationCenter from "@/components/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">Sign in required</h2>
              <p className="text-muted-foreground mb-6">You need to be logged in to access the driver app</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="rounded-xl" onClick={() => navigate("/")}>Home</Button>
                <Button className="rounded-xl bg-gradient-to-r from-primary to-teal-400" onClick={() => navigate("/login")}>Sign In</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (driverLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // Not a driver yet
  if (!driver) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="w-full max-w-md border-0 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-teal-500/10 pointer-events-none" />
            <CardContent className="p-8 text-center relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-5">
                <Car className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Become a Driver</h2>
              <p className="text-muted-foreground mb-6">Register as a driver to start accepting trips and earning money</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="rounded-xl" onClick={() => navigate("/")}>Home</Button>
                <Button className="rounded-xl bg-gradient-to-r from-primary to-teal-400 shadow-lg shadow-primary/30" onClick={() => navigate("/drive")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Register Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Driver not verified
  if (driver.status !== "verified") {
    const statusConfig = {
      pending: {
        icon: Clock,
        title: "Verification Pending",
        description: "Your application is being reviewed. We'll notify you once approved.",
        color: "text-amber-500",
        bg: "from-amber-500/20 to-amber-500/5",
      },
      rejected: {
        icon: AlertCircle,
        title: "Application Rejected",
        description: "Unfortunately, your application was not approved. Please contact support.",
        color: "text-red-500",
        bg: "from-red-500/20 to-red-500/5",
      },
      suspended: {
        icon: Shield,
        title: "Account Suspended",
        description: "Your account has been suspended. Please contact support for assistance.",
        color: "text-red-500",
        bg: "from-red-500/20 to-red-500/5",
      },
    };

    const config = statusConfig[driver.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md border-0 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} pointer-events-none`} />
            <CardContent className="p-8 text-center relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.bg} flex items-center justify-center mx-auto mb-5`}>
                <StatusIcon className={`w-8 h-8 ${config.color}`} />
              </div>
              <h2 className="text-xl font-bold mb-2">{config.title}</h2>
              <p className="text-muted-foreground mb-5">{config.description}</p>
              <Badge variant={driver.status === "pending" ? "secondary" : "destructive"} className="text-sm px-4 py-1.5">
                {driver.status}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Has active trip - show trip panel
  if (activeTrip) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 p-4">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">Active Trip</h1>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
            </div>
            <Badge variant="default" className="capitalize bg-gradient-to-r from-primary to-teal-400 border-0">
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
      {/* Premium Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold">{driver.full_name}</h1>
                  <p className="text-xs text-muted-foreground">{driver.vehicle_model}</p>
                </div>
              </div>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <CrossAppNavigation currentApp="driver" />
            </div>
          </div>
        </div>
      </div>

      {/* Online/Offline Toggle Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "py-4 px-4 transition-colors",
          driver.is_online 
            ? "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-emerald-500/20" 
            : "bg-gradient-to-r from-muted via-muted/50 to-transparent border-b border-border/50"
        )}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              driver.is_online 
                ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                : "bg-muted"
            )}>
              <Power className={cn(
                "w-6 h-6 transition-colors",
                driver.is_online ? "text-white" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="font-bold text-lg">{driver.is_online ? "You're Online" : "You're Offline"}</p>
              <p className="text-sm text-muted-foreground">
                {driver.is_online ? "Accepting trip requests" : "Toggle to start earning"}
              </p>
            </div>
          </div>
          <Switch
            checked={driver.is_online || false}
            onCheckedChange={handleToggleOnline}
            disabled={toggleOnline.isPending}
            className="scale-125"
          />
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4 space-y-5">
        {/* Earnings Summary - Premium Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4 text-center relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">${earnings?.today.toFixed(0) || 0}</p>
              <p className="text-xs text-muted-foreground font-medium">Today</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4 text-center relative">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{earnings?.trips_today || 0}</p>
              <p className="text-xs text-muted-foreground font-medium">Trips</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4 text-center relative">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-sky-500" />
              </div>
              <p className="text-2xl font-bold">${earnings?.week.toFixed(0) || 0}</p>
              <p className="text-xs text-muted-foreground font-medium">This Week</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        {!driver.is_online ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
              <CardContent className="p-10 text-center relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-5"
                >
                  <Power className="w-10 h-10 text-muted-foreground" />
                </motion.div>
                <h2 className="text-xl font-bold mb-2">Ready to Earn?</h2>
                <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                  Go online to start receiving trip requests and earn money
                </p>
                <Button 
                  onClick={handleToggleOnline} 
                  disabled={toggleOnline.isPending}
                  size="lg"
                  className="rounded-xl bg-gradient-to-r from-primary to-teal-400 shadow-lg shadow-primary/30 font-semibold"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Go Online
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full h-12 p-1 bg-muted/50 rounded-2xl mb-4">
                <TabsTrigger value="requests" className="flex-1 h-10 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md transition-all">
                  <MapPin className="w-4 h-4 mr-2" />
                  Requests
                  {(availableTrips?.length || 0) > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 px-1.5 min-w-[20px] text-xs animate-pulse">
                      {availableTrips?.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 h-10 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md transition-all">
                  <History className="w-4 h-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="space-y-3 mt-0">
                <AnimatePresence mode="popLayout">
                  {tripsLoading ? (
                    <>
                      <Skeleton className="h-44 w-full rounded-2xl" />
                      <Skeleton className="h-44 w-full rounded-2xl" />
                    </>
                  ) : !availableTrips?.length ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg">
                        <CardContent className="p-10 text-center">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4"
                          >
                            <Clock className="w-8 h-8 text-muted-foreground" />
                          </motion.div>
                          <h3 className="font-bold text-lg mb-2">No Trip Requests</h3>
                          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                            New trip requests will appear here. Stay online to receive them.
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-emerald-500">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Listening for requests...</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    availableTrips.map((trip, index) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <DriverTripCard
                          trip={trip}
                          onAccept={() => handleAcceptTrip(trip.id)}
                          isAccepting={acceptTrip.isPending}
                        />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="history" className="space-y-3 mt-0">
                <AnimatePresence mode="popLayout">
                  {!tripHistory?.length ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg">
                        <CardContent className="p-10 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <History className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-bold text-lg mb-2">No Trip History</h3>
                          <p className="text-muted-foreground text-sm">
                            Your completed trips will appear here
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    tripHistory.map((trip, index) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-md hover:shadow-lg transition-all overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardContent className="p-4 relative">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant={trip.status === "completed" ? "default" : "secondary"} className={cn(
                                  "capitalize",
                                  trip.status === "completed" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 border"
                                )}>
                                  {trip.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {trip.completed_at 
                                    ? new Date(trip.completed_at).toLocaleDateString()
                                    : new Date(trip.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="font-bold text-lg text-emerald-500">${trip.fare_amount?.toFixed(2)}</p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                                <p className="text-sm truncate">{trip.pickup_address}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="w-3 h-3 rounded-sm bg-foreground mt-1 flex-shrink-0" />
                                <p className="text-sm text-muted-foreground truncate">{trip.dropoff_address}</p>
                              </div>
                            </div>
                            {trip.rating && (
                              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
                                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                <span className="text-sm font-medium">{trip.rating}</span>
                                <span className="text-xs text-muted-foreground">from rider</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
      <AdminFloatingButton />
    </div>
  );
};

export default DriverApp;
