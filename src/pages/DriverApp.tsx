import { useState, useEffect, useCallback } from "react";
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
  ChevronRight,
  WifiOff,
  Wallet
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
  useDriverEarnings as useDriverEarningsLegacy
} from "@/hooks/useDriverApp";
import { useDriverTripRealtime } from "@/hooks/useTripRealtime";
import { useDriverState } from "@/hooks/useDriverState";
import { useJobDispatch, IncomingJob } from "@/hooks/useJobDispatch";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { LocationService, LocationCoordinates } from "@/services/LocationService";
import DriverTripCard from "@/components/driver/DriverTripCard";
import ActiveTripPanel from "@/components/driver/ActiveTripPanel";
import { JobRequestModal } from "@/components/driver/JobRequestModal";
import { ServiceToggles } from "@/components/driver/ServiceToggles";
import { EatsDeliveryPanel, EatsDeliveryStatus } from "@/components/driver/EatsDeliveryPanel";
import { MoveDeliveryPanel, MoveDeliveryStatus } from "@/components/driver/MoveDeliveryPanel";
import { DriverEarningsTab } from "@/components/driver/DriverEarningsTab";
import { DriverPayoutsTab } from "@/components/driver/DriverPayoutsTab";
import { TripStatus } from "@/hooks/useTrips";
import AdminFloatingButton from "@/components/admin/AdminFloatingButton";
import { useUserAccess } from "@/hooks/useUserAccess";
import AccessDenied from "@/components/auth/AccessDenied";
import CrossAppNavigation from "@/components/CrossAppNavigation";
import NotificationCenter from "@/components/NotificationCenter";
import { cn } from "@/lib/utils";

const DriverApp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("requests");
  const [driverLocation, setDriverLocation] = useState<LocationCoordinates | null>(null);

  // Fetch driver data
  const { data: driver, isLoading: driverLoading } = useCurrentDriver(user?.id);
  const { data: availableTrips, isLoading: tripsLoading } = useAvailableTripRequests(driver?.is_online && driver?.status === "verified");
  const { data: activeTrip } = useDriverActiveTrip(driver?.id);
  const { data: tripHistory } = useDriverTripHistory(driver?.id);
  const { data: earnings } = useDriverEarningsLegacy(driver?.id);

  // Native hooks for persistent state and real-time dispatch
  const driverState = useDriverState(driver?.id);
  const { isOnline: networkOnline } = useNetworkStatus();

  // Job dispatch system
  const {
    incomingJob,
    timeRemaining,
    isAccepting,
    isDeclining,
    acceptJob,
    declineJob,
  } = useJobDispatch({
    driverId: driver?.id,
    isOnline: driver?.is_online ?? false,
    enabledServices: driverState.enabledServices,
    driverLocation,
    onJobAccepted: (job) => {
      driverState.setActiveJob({
        id: job.id,
        type: job.type,
        status: 'accepted',
      });
    },
  });

  // Mutations
  const toggleOnline = useToggleOnlineStatus();
  const acceptTrip = useAcceptTrip();
  const updateTripStatus = useUpdateDriverTripStatus();

  // Enable realtime for driver trips
  useDriverTripRealtime(driver?.id);

  // Initialize location tracking when online
  useEffect(() => {
    if (!driver?.is_online) return;

    const initLocation = async () => {
      const hasPermission = await LocationService.requestPermissions();
      if (hasPermission) {
        const position = await LocationService.getCurrentPosition();
        if (position) {
          setDriverLocation(position);
        }
        
        // Start continuous tracking
        await LocationService.startTracking((position) => {
          setDriverLocation(position);
        });
      }
    };

    initLocation();

    return () => {
      LocationService.stopTracking();
    };
  }, [driver?.is_online]);

  // Get user location when going online
  const handleToggleOnline = async () => {
    if (!driver) return;

    if (!driver.is_online) {
      // Going online - get location
      const position = await LocationService.getCurrentPosition();
      if (position) {
        toggleOnline.mutate({
          driverId: driver.id,
          isOnline: true,
          lat: position.lat,
          lng: position.lng,
        });
      } else {
        toggleOnline.mutate({ driverId: driver.id, isOnline: true });
      }
    } else {
      toggleOnline.mutate({ driverId: driver.id, isOnline: false });
      LocationService.stopTracking();
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

  const handleServiceToggle = async (service: 'rides' | 'eats' | 'move', enabled: boolean) => {
    await driverState.setEnabledServices({ [service]: enabled });
  };

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
        <div className="animate-in fade-in zoom-in-95 duration-300">
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
        </div>
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/95 to-card backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5 pointer-events-none" />
            <CardContent className="p-8 text-center relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary/30 animate-pulse">
                <Car className="w-10 h-10 text-white" />
              </div>
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
        </div>
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
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/95 to-card backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} pointer-events-none`} />
            <CardContent className="p-8 text-center relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg animate-pulse`}>
                <StatusIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">{config.title}</h2>
              <p className="text-muted-foreground mb-5">{config.description}</p>
              <Badge variant={driver.status === "pending" ? "secondary" : "destructive"} className="text-sm px-4 py-1.5">
                {driver.status}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Has active trip - show trip panel based on job type
  if (activeTrip || driverState.activeJob) {
    const jobType = driverState.activeJob?.type || 'ride';
    
    // For Eats deliveries
    if (jobType === 'eats' && driverState.activeJob) {
      // TODO: Fetch full eats order data
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 p-4">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold">Eats Delivery</h1>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </div>
              </div>
              <Badge variant="default" className="capitalize bg-gradient-to-r from-orange-500 to-amber-500 border-0 shadow-lg">
                {driverState.activeJob.status?.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <Card className="border-0 bg-card/90 shadow-xl">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Eats delivery panel loading...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // For Move deliveries
    if (jobType === 'move' && driverState.activeJob) {
      // TODO: Fetch full move delivery data
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 p-4">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold">Move Delivery</h1>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </div>
              </div>
              <Badge variant="default" className="capitalize bg-gradient-to-r from-purple-500 to-indigo-500 border-0 shadow-lg">
                {driverState.activeJob.status?.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <Card className="border-0 bg-card/90 shadow-xl">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Move delivery panel loading...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Default: Ride trip panel
    if (activeTrip) {
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Enhanced Background effects */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-40 pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gradient-to-bl from-emerald-500/10 to-green-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-gradient-to-tr from-primary/10 to-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Offline Banner */}
      {!networkOnline && (
        <div className="bg-destructive/90 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm">
          <WifiOff className="w-4 h-4" />
          <span>You're offline. Actions will sync when connection is restored.</span>
        </div>
      )}

      {/* Job Request Modal */}
      <JobRequestModal
        job={incomingJob}
        timeRemaining={timeRemaining}
        isAccepting={isAccepting}
        isDeclining={isDeclining}
        onAccept={acceptJob}
        onDecline={declineJob}
      />
      
      {/* Premium Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="max-w-lg mx-auto p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 touch-manipulation active:scale-95" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
                    <Car className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  {driver.is_online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-card shadow-lg shadow-emerald-500/30 animate-pulse" />
                  )}
                </div>
                <div>
                  <h1 className="font-bold text-base sm:text-lg truncate max-w-[120px] sm:max-w-none">{driver.full_name}</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground truncate max-w-[80px] sm:max-w-none">{driver.vehicle_model}</p>
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
            <div className="flex items-center gap-1 sm:gap-2">
              <NotificationCenter />
              <CrossAppNavigation currentApp="driver" />
            </div>
          </div>
        </div>
      </div>

      {/* Online/Offline Toggle Banner */}
      <div 
        className={cn(
          "py-5 px-4 transition-all duration-500 animate-in fade-in slide-in-from-top-2 duration-300",
          driver.is_online 
            ? "bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-b border-emerald-500/20" 
            : "bg-gradient-to-r from-muted via-muted/50 to-transparent border-b border-border/50"
        )}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                driver.is_online 
                  ? "bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30 animate-pulse" 
                  : "bg-muted shadow-none"
              )}
            >
              <Power className={cn(
                "w-7 h-7 transition-colors",
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
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4 space-y-5 relative z-10">
        {/* Service Toggles - Show when online */}
        {driver.is_online && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ServiceToggles
              enabledServices={driverState.enabledServices}
              onToggle={handleServiceToggle}
              disabled={driverState.isLoading}
            />
          </div>
        )}

        {/* Earnings Summary - Premium Design */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: DollarSign, value: `$${earnings?.today.toFixed(0) || 0}`, label: "Today", gradient: "from-emerald-500 to-green-500", glow: "shadow-emerald-500/20" },
            { icon: Navigation, value: `${earnings?.trips_today || 0}`, label: "Trips", gradient: "from-primary to-teal-400", glow: "shadow-primary/20" },
            { icon: TrendingUp, value: `$${earnings?.week.toFixed(0) || 0}`, label: "This Week", gradient: "from-sky-500 to-blue-500", glow: "shadow-sky-500/20" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="animate-in fade-in slide-in-from-bottom-4 duration-300 hover:-translate-y-1 hover:scale-[1.02] transition-transform"
              style={{ animationDelay: `${index * 75}ms` }}
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
            </div>
          ))}
        </div>

        {/* Goals Card */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: '150ms' }}>
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
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                  style={{ width: `${Math.min((earnings?.trips_today || 0) / 10 * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {!driver.is_online ? (
          <div className="animate-in fade-in zoom-in-95 duration-300" style={{ animationDelay: '200ms' }}>
            <Card className="border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
              <CardContent className="p-10 text-center relative">
                <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-5 animate-pulse">
                  <Power className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold mb-2">Ready to Earn?</h2>
                <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                  Go online to start receiving trip requests and earn money
                </p>
                <Button 
                  onClick={handleToggleOnline} 
                  disabled={toggleOnline.isPending}
                  size="lg"
                  className="rounded-xl bg-gradient-to-r from-primary to-teal-400 shadow-lg shadow-primary/30 font-bold gap-2 touch-manipulation active:scale-[0.98]"
                >
                  <Zap className="w-5 h-5" />
                  Go Online
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: '200ms' }}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-4 h-14 p-1.5 rounded-2xl bg-muted/50 mb-5">
                <TabsTrigger 
                  value="requests" 
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-lg gap-1 font-semibold text-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Requests</span>
                  {availableTrips && availableTrips.length > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full">
                      {availableTrips.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-lg gap-1 font-semibold text-xs"
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="earnings" 
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-lg gap-1 font-semibold text-xs"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Earnings</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="payouts" 
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-lg gap-1 font-semibold text-xs"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Payouts</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="mt-0 space-y-4">
                {tripsLoading ? (
                  <>
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                  </>
                ) : availableTrips && availableTrips.length > 0 ? (
                  availableTrips.map((trip, index) => (
                    <div
                      key={trip.id}
                      className="animate-in fade-in slide-in-from-left-4 duration-300"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <DriverTripCard
                        trip={trip}
                        onAccept={() => handleAcceptTrip(trip.id)}
                        isAccepting={acceptTrip.isPending}
                      />
                    </div>
                  ))
                ) : (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                      <CardContent className="p-10 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center mx-auto mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
                          <MapPin className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Waiting for trips...</h3>
                        <p className="text-muted-foreground text-sm">
                          Stay online to receive trip requests from nearby riders
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0 space-y-4">
                {tripHistory && tripHistory.length > 0 ? (
                  tripHistory.slice(0, 10).map((trip, index) => (
                    <div
                      key={trip.id}
                      className="animate-in fade-in slide-in-from-left-4 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
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
                    </div>
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

              <TabsContent value="earnings" className="mt-0">
                <DriverEarningsTab driverId={driver.id} />
              </TabsContent>

              <TabsContent value="payouts" className="mt-0">
                <DriverPayoutsTab driverId={driver.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      <AdminFloatingButton />
    </div>
  );
};

export default DriverApp;
