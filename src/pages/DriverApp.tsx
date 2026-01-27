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
  Shield,
  Target,
  Award,
  ChevronRight
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/95 to-card backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">Sign in required</h2>
              <p className="text-muted-foreground mb-6">You need to be logged in to access the driver app</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="rounded-xl" onClick={() => navigate("/")}>Home</Button>
                <Button className="rounded-xl bg-gradient-to-r from-primary to-teal-400 shadow-lg shadow-primary/30" onClick={() => navigate("/login")}>Sign In</Button>
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
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-primary/15 to-teal-500/10 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/95 to-card backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5 pointer-events-none" />
            <CardContent className="p-8 text-center relative">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary/30"
              >
                <Car className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Become a Driver</h2>
              <p className="text-muted-foreground mb-6">Register as a driver to start accepting trips and earning money</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="rounded-xl" onClick={() => navigate("/")}>Home</Button>
                <Button className="rounded-xl bg-gradient-to-r from-primary to-teal-400 shadow-lg shadow-primary/30 gap-2" onClick={() => navigate("/drive")}>
                  <Sparkles className="w-4 h-4" />
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
        gradient: "from-amber-500 to-orange-500",
        bg: "from-amber-500/20 to-amber-500/5",
      },
      rejected: {
        icon: AlertCircle,
        title: "Application Rejected",
        description: "Unfortunately, your application was not approved. Please contact support.",
        color: "text-red-500",
        gradient: "from-red-500 to-rose-500",
        bg: "from-red-500/20 to-red-500/5",
      },
      suspended: {
        icon: Shield,
        title: "Account Suspended",
        description: "Your account has been suspended. Please contact support for assistance.",
        color: "text-red-500",
        gradient: "from-red-500 to-rose-500",
        bg: "from-red-500/20 to-red-500/5",
      },
    };

    const config = statusConfig[driver.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-radial ${config.bg} opacity-30`} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/95 to-card backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} pointer-events-none`} />
            <CardContent className="p-8 text-center relative">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg`}
              >
                <StatusIcon className="w-8 h-8 text-white" />
              </motion.div>
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
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 p-4"
        >
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">Active Trip</h1>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
            </div>
            <Badge variant="default" className="capitalize bg-gradient-to-r from-primary to-teal-400 border-0 shadow-lg">
              {activeTrip.status?.replace("_", " ")}
            </Badge>
          </div>
        </motion.div>
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Background effects */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-40 pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-emerald-500/10 to-green-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-primary/10 to-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Floating emojis */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="fixed top-32 right-[8%] text-4xl hidden lg:block opacity-25 pointer-events-none"
      >
        🚗
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="fixed bottom-40 left-[6%] text-4xl hidden lg:block opacity-20 pointer-events-none"
      >
        💰
      </motion.div>
      
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-lg mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg"
                  >
                    <Car className="w-6 h-6 text-primary" />
                  </motion.div>
                  {driver.is_online && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card shadow-lg shadow-emerald-500/30" 
                    />
                  )}
                </div>
                <div>
                  <h1 className="font-bold text-lg">{driver.full_name}</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{driver.vehicle_model}</p>
                    {driver.rating && (
                      <div className="flex items-center gap-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-600">{driver.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
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
      </motion.div>

      {/* Online/Offline Toggle Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "py-5 px-4 transition-all duration-500",
          driver.is_online 
            ? "bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-b border-emerald-500/20" 
            : "bg-gradient-to-r from-muted via-muted/50 to-transparent border-b border-border/50"
        )}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              animate={driver.is_online ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                driver.is_online 
                  ? "bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30" 
                  : "bg-muted shadow-none"
              )}
            >
              <Power className={cn(
                "w-7 h-7 transition-colors",
                driver.is_online ? "text-white" : "text-muted-foreground"
              )} />
            </motion.div>
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
      <div className="max-w-lg mx-auto p-4 space-y-5 relative z-10">
        {/* Earnings Summary - Premium Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: DollarSign, value: `$${earnings?.today.toFixed(0) || 0}`, label: "Today", gradient: "from-emerald-500 to-green-500", glow: "shadow-emerald-500/20" },
            { icon: Navigation, value: `${earnings?.trips_today || 0}`, label: "Trips", gradient: "from-primary to-teal-400", glow: "shadow-primary/20" },
            { icon: TrendingUp, value: `$${earnings?.week.toFixed(0) || 0}`, label: "This Week", gradient: "from-sky-500 to-blue-500", glow: "shadow-sky-500/20" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Card className={cn(
                "border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all",
                stat.glow
              )}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <CardContent className="p-4 text-center relative">
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-2 shadow-lg",
                    stat.gradient
                  )}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Goals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Daily Goal</h3>
                    <p className="text-xs text-muted-foreground">Complete 10 trips today</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-amber-500">{earnings?.trips_today || 0}/10</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((earnings?.trips_today || 0) / 10 * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        {!driver.is_online ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-2xl overflow-hidden">
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleToggleOnline} 
                    disabled={toggleOnline.isPending}
                    size="lg"
                    className="rounded-xl bg-gradient-to-r from-primary to-teal-400 shadow-lg shadow-primary/30 font-bold gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Go Online
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-2 h-14 p-1.5 rounded-2xl bg-muted/50 mb-5">
                <TabsTrigger 
                  value="requests" 
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-lg gap-2 font-semibold"
                >
                  <Navigation className="w-4 h-4" />
                  Requests
                  {availableTrips && availableTrips.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                      {availableTrips.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-lg gap-2 font-semibold"
                >
                  <History className="w-4 h-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="requests" className="mt-0 space-y-4">
                  {tripsLoading ? (
                    <>
                      <Skeleton className="h-32 w-full rounded-2xl" />
                      <Skeleton className="h-32 w-full rounded-2xl" />
                    </>
                  ) : availableTrips && availableTrips.length > 0 ? (
                    availableTrips.map((trip, index) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <DriverTripCard
                          trip={trip}
                          onAccept={() => handleAcceptTrip(trip.id)}
                          isAccepting={acceptTrip.isPending}
                        />
                        <DriverTripCard
                          trip={trip}
                          onAccept={() => handleAcceptTrip(trip.id)}
                          isAccepting={acceptTrip.isPending}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                        <CardContent className="p-10 text-center">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center mx-auto mb-4"
                          >
                            <MapPin className="w-8 h-8 text-primary" />
                          </motion.div>
                          <h3 className="font-bold text-lg mb-2">Waiting for trips...</h3>
                          <p className="text-muted-foreground text-sm">
                            Stay online to receive trip requests from nearby riders
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="mt-0 space-y-4">
                  {tripHistory && tripHistory.length > 0 ? (
                    tripHistory.slice(0, 10).map((trip, index) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-lg hover:shadow-xl transition-all">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant={trip.status === "completed" ? "default" : "secondary"} className={trip.status === "completed" ? "bg-gradient-to-r from-emerald-500 to-green-500 border-0" : ""}>
                                {trip.status}
                              </Badge>
                              <span className="font-bold text-lg">${trip.fare_amount?.toFixed(2)}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 ring-4 ring-emerald-500/20" />
                                <span className="text-muted-foreground line-clamp-1">{trip.pickup_address}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm bg-foreground mt-1.5 ring-4 ring-foreground/10" />
                                <span className="text-muted-foreground line-clamp-1">{trip.dropoff_address}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                      <CardContent className="p-10 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                          <History className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">No trip history</h3>
                        <p className="text-muted-foreground text-sm">
                          Your completed trips will appear here
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        )}
      </div>
      <AdminFloatingButton />
    </div>
  );
};

export default DriverApp;
