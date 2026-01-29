import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, MapPin, Zap, Car, Navigation, Sparkles, Locate, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LocationSearchInput from "@/components/rider/LocationSearchInput";
import VehicleSelector from "@/components/rider/VehicleSelector";
import BookingMap from "@/components/rider/BookingMap";
import SavedLocationsPanel from "@/components/rider/SavedLocationsPanel";
import QuickLocationPicker from "@/components/rider/QuickLocationPicker";
import TripTracker from "@/components/rider/TripTracker";
import { StatusTracker, LivePulse } from "@/components/ui/status-tracker";
import { cn } from "@/lib/utils";
import { Location, FareEstimate, useRouteCalculation, useFareEstimation, useCreateTrip } from "@/hooks/useRiderBooking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/hooks/useTrips";
import { useRiderTripRealtime } from "@/hooks/useTripRealtime";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useOnlineDrivers } from "@/hooks/useOnlineDrivers";
import { toast } from "sonner";
import ZivoLogo from "@/components/ZivoLogo";
type BookingStep = "location" | "vehicle" | "confirm" | "tracking";
const bookingSteps = [{
  id: "location",
  label: "Pickup",
  icon: <MapPin className="w-4 h-4" />
}, {
  id: "vehicle",
  label: "Your Ride",
  icon: <Car className="w-4 h-4" />
}, {
  id: "confirm",
  label: "Book",
  icon: <Zap className="w-4 h-4" />
}];
const RiderApp = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [step, setStep] = useState<BookingStep>("location");
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [fareEstimates, setFareEstimates] = useState<FareEstimate[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  const {
    calculateRoute,
    isCalculating
  } = useRouteCalculation();
  const {
    calculateFares
  } = useFareEstimation();
  const createTrip = useCreateTrip();
  const {
    getCurrentLocation,
    reverseGeocode,
    isGettingLocation
  } = useCurrentLocation();

  // Fetch online drivers for map display
  const { data: onlineDrivers = [] } = useOnlineDrivers();

  // Auto-set pickup from GPS
  const handleUseMyLocation = async () => {
    try {
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.lat, location.lng);
      setPickup({
        address,
        lat: location.lat,
        lng: location.lng
      });
      toast.success("Pickup location set to your current location");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get location");
    }
  };

  // Enable realtime subscriptions for trip updates
  useRiderTripRealtime(user?.id);

  // Check for active trip - optimized to avoid skeleton flash on revisits
  const {
    data: activeTrip,
    isLoading: tripLoading,
    isFetching
  } = useQuery({
    queryKey: ["active-rider-trip", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const {
        data,
        error
      } = await supabase.from("trips").select(`
          *,
          driver:drivers(full_name, email, avatar_url)
        `).eq("rider_id", user.id).in("status", ["requested", "accepted", "en_route", "arrived", "in_progress"]).order("created_at", {
        ascending: false
      }).limit(1).maybeSingle();
      if (error) throw error;
      return data as Trip | null;
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 1000 * 60, // Data stays fresh for 1 minute - no refetch on mount
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    placeholderData: (prev) => prev, // Show previous data while refetching
  });

  // Only show loading skeleton on first load, not on background refetches
  const showLoadingSkeleton = tripLoading && !activeTrip;

  // Calculate route when both locations are set
  // Use primitive deps to avoid re-running when object references change but values don't
  const pickupKey = pickup ? `${pickup.lat.toFixed(5)},${pickup.lng.toFixed(5)}` : null;
  const dropoffKey = dropoff ? `${dropoff.lat.toFixed(5)},${dropoff.lng.toFixed(5)}` : null;

  useEffect(() => {
    if (!pickup || !dropoff) return;

    let cancelled = false;
    const fetchRoute = async () => {
      const route = await calculateRoute(pickup, dropoff);
      if (cancelled || !route) return;

      setRouteGeometry(route.geometry);
      setRouteInfo({ distance: route.distance, duration: route.duration });
      const fares = calculateFares(route.distance, route.duration);
      setFareEstimates(fares);
      if (fares.length > 0 && !selectedVehicle) {
        setSelectedVehicle(fares[0].vehicleType);
      }
      setStep("vehicle");
    };
    fetchRoute();

    return () => { cancelled = true; };
  }, [pickupKey, dropoffKey]);

  // Switch to tracking if there's an active trip
  useEffect(() => {
    if (activeTrip) {
      setStep("tracking");
    }
  }, [activeTrip]);
  const handleConfirmBooking = async () => {
    if (!user) {
      toast.error("Please sign in to book a ride");
      navigate("/login");
      return;
    }
    if (!pickup || !dropoff || !selectedVehicle || !routeInfo) return;
    const selectedFare = fareEstimates.find(f => f.vehicleType === selectedVehicle);
    if (!selectedFare) return;
    try {
      await createTrip.mutateAsync({
        pickup,
        dropoff,
        fareAmount: selectedFare.totalFare,
        distanceKm: routeInfo.distance,
        durationMinutes: routeInfo.duration
      });
    } catch (error) {
      // Error is handled in the mutation's onError callback
      console.error("Trip booking failed:", error);
    }
  };
  const handleCancelTrip = async () => {
    if (!activeTrip) return;
    const {
      error
    } = await supabase.from("trips").update({
      status: "cancelled"
    }).eq("id", activeTrip.id);
    if (!error) {
      setStep("location");
      setPickup(null);
      setDropoff(null);
      setSelectedVehicle(null);
      setFareEstimates([]);
      setRouteGeometry(null);
      setRouteInfo(null);
    }
  };
  const handleReset = () => {
    setStep("location");
    setPickup(null);
    setDropoff(null);
    setSelectedVehicle(null);
    setFareEstimates([]);
    setRouteGeometry(null);
    setRouteInfo(null);
  };
  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Static gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/15 via-transparent to-transparent opacity-60" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/15 to-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl" />
        
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-2xl shadow-2xl shadow-black/30 overflow-hidden">
            {/* Top gradient accent */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-teal-400 to-cyan-400" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-teal-500/8" />
            <CardContent className="p-10 text-center relative">
              <div className="mx-auto mb-8 hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                <ZivoLogo size="lg" />
              </div>
              
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200" style={{
              animationDelay: '100ms'
            }}>
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                  Ready to ride?
                </h2>
                <p className="text-muted-foreground mb-8 text-base">Sign in to book your next trip</p>
              </div>
              
              <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-2 duration-200" style={{
              animationDelay: '150ms'
            }}>
                <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl px-6 h-12 border-white/10 hover:bg-white/5 active:scale-95 transition-transform">
                  Home
                </Button>
                <Button onClick={() => navigate("/login")} className="rounded-xl px-8 h-12 bg-gradient-to-r from-primary via-primary to-teal-400 text-white shadow-xl shadow-primary/40 font-semibold active:scale-95 transition-transform">
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  if (showLoadingSkeleton) {
    return <div className="min-h-screen bg-background p-6 space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-[350px] w-full rounded-3xl" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>;
  }

  // Show trip tracking if there's an active trip
  if (activeTrip && step === "tracking") {
    return <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Static background glow effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-gradient-to-bl from-primary/15 to-teal-500/8 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-1/3 left-0 w-[200px] h-[200px] bg-gradient-to-tr from-emerald-500/8 to-cyan-500/4 rounded-full blur-3xl" />
        </div>
        
        <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-lg hover:bg-white/10 border border-white/5 h-8 w-8 active:scale-95 transition-transform">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Navigation className="w-4 h-4 text-white" />
                    <div className="absolute inset-0 rounded-xl bg-primary/30 blur-sm animate-pulse" />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm">Your Trip</h1>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] text-muted-foreground">In progress</p>
                    </div>
                  </div>
                </div>
              </div>
              <LivePulse color="rides" size="sm" label="Live" />
            </div>
          </div>
        </div>
        
        <div className="p-2.5">
          <TripTracker trip={activeTrip} onCancel={handleCancelTrip} />
        </div>
      </div>;
  }
  const selectedFare = fareEstimates.find(f => f.vehicleType === selectedVehicle);
  return <div className="min-h-screen bg-background flex flex-col relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Static Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[250px] h-[250px] bg-gradient-to-bl from-primary/12 to-teal-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-gradient-to-tr from-violet-500/8 to-purple-500/4 rounded-full blur-3xl" />
      </div>
      
      {/* Premium Header with Glassmorphism */}
      <div className="sticky top-0 z-50 bg-card/70 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/5">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" onClick={() => step === "location" ? navigate("/") : handleReset()} className="h-7 w-7 rounded-lg hover:bg-white/10 backdrop-blur-sm border border-white/5 active:scale-95 transition-transform">
                <ArrowLeft className="w-3.5 h-3.5" />
              </Button>
              <div className="flex items-center gap-1.5">
                <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-primary via-primary to-teal-400 flex items-center justify-center shadow-md shadow-primary/30">
                  <Car className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-xs bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {step === "location" && "Where to?"}
                    {step === "vehicle" && "Choose a ride"}
                    {step === "confirm" && "Confirm booking"}
                  </h1>
                  <p className="text-[9px] text-muted-foreground leading-tight">
                    {step === "location" && "Enter your destination"}
                    {step === "vehicle" && routeInfo && <span className="flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        {(routeInfo.distance * 0.621371).toFixed(1)} mi • {routeInfo.duration} min
                      </span>}
                  </p>
                </div>
              </div>
            </div>
            <LivePulse color="rides" size="sm" label="Live" />
          </div>

          {/* Compact Step Indicator */}
          <div className="mt-1.5 px-0.5">
            <StatusTracker steps={bookingSteps} currentStep={step === "location" ? 0 : step === "vehicle" ? 1 : 2} color="rides" orientation="horizontal" />
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 relative">
        <BookingMap pickup={pickup} dropoff={dropoff} routeGeometry={routeGeometry} onlineDrivers={onlineDrivers} className="absolute inset-0" />

        {/* Loading Overlay - CSS based */}
        {isCalculating && <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-4 bg-card/95 backdrop-blur-xl px-8 py-6 rounded-3xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/40 animate-spin" style={{
              animationDuration: '2s'
            }}>
                  <Navigation className="w-7 h-7 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-md animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">Finding best routes</p>
                <p className="text-sm text-muted-foreground">Analyzing traffic patterns...</p>
              </div>
            </div>
          </div>}

      </div>

      {/* Bottom Sheet - Mobile Optimized */}
      <div className="relative bg-gradient-to-b from-card via-card to-card/95 border-t border-white/10 rounded-t-[1.5rem] shadow-[0_-15px_40px_-12px_rgba(0,0,0,0.4)] safe-area-bottom">
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5" />
        
        <div className="p-4 pb-8 max-h-[55vh] overflow-y-auto scrollbar-hide">
          {/* Location Step */}
          {step === "location" && <div className="space-y-4">
              {/* Quick Location Picker */}
              <QuickLocationPicker userId={user?.id} onSelect={location => {
            if (!pickup) {
              setPickup(location);
            } else {
              setDropoff(location);
            }
          }} />

              {/* Location Inputs with Static Connection Line */}
              <div className="relative">
                {/* Static connection line */}
                <div className="absolute left-[1.1rem] top-[2.75rem] bottom-[2.25rem] w-0.5 rounded-full bg-gradient-to-b from-emerald-500/60 via-muted/30 to-primary/60" />
                
                <div className="space-y-3">
                  <div className="relative">
                    <LocationSearchInput placeholder="Pickup location" value={pickup} onChange={setPickup} icon="pickup" />
                    {/* Use My Location Button */}
                    {!pickup && <div className="mt-1.5">
                        <Button variant="outline" size="sm" onClick={handleUseMyLocation} disabled={isGettingLocation} className="w-full h-9 text-xs rounded-lg border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all active:scale-[0.98]">
                          {isGettingLocation ? <>
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              Getting location...
                            </> : <>
                              <Locate className="w-3.5 h-3.5 mr-1.5" />
                              Use my current location
                            </>}
                        </Button>
                      </div>}
                  </div>
                  <div>
                    <LocationSearchInput placeholder="Where to?" value={dropoff} onChange={setDropoff} icon="dropoff" />
                  </div>
                </div>
              </div>

              {/* Saved Locations */}
              <div className="pt-4 border-t border-white/8">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/25 via-primary/15 to-teal-500/15 flex items-center justify-center border border-primary/20">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground">Saved Places</span>
                    <p className="text-[10px] text-muted-foreground">Your favorite locations</p>
                  </div>
                </div>
                <SavedLocationsPanel userId={user?.id} onSelect={location => {
              if (!pickup) {
                setPickup(location);
              } else {
                setDropoff(location);
              }
            }} />
              </div>
            </div>}

          {/* Vehicle Selection Step */}
          {step === "vehicle" && fareEstimates.length > 0 && <div className="space-y-4">
              {/* Route Summary Card */}
              <div className="relative p-3 rounded-xl bg-card border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5" />
                
                <div className="relative flex items-center gap-2.5">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-md shadow-primary/30">
                      <Navigation className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card animate-pulse" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow shadow-emerald-500/50" />
                      <p className="text-[11px] font-semibold truncate">{pickup?.address?.split(',')[0]}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm bg-primary shadow shadow-primary/50" />
                      <p className="text-[11px] text-muted-foreground truncate">{dropoff?.address?.split(',')[0]}</p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right bg-muted/30 px-2.5 py-1.5 rounded-lg">
                    <p className="text-lg font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                      {routeInfo?.duration ? Math.round(routeInfo.duration) : '--'}<span className="text-[10px] text-muted-foreground ml-0.5">min</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">{routeInfo && (routeInfo.distance * 0.621371).toFixed(1)} mi</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Selector */}
              <div>
                <VehicleSelector fareEstimates={fareEstimates} selectedVehicle={selectedVehicle} onSelect={setSelectedVehicle} />
              </div>
              
              {/* Confirm Button */}
              <div>
                <Button size="lg" className="relative w-full h-12 text-sm font-bold gap-2.5 rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/40 overflow-hidden active:scale-[0.98] transition-transform" disabled={!selectedVehicle || createTrip.isPending} onClick={handleConfirmBooking}>
                  {createTrip.isPending ? <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Finding driver...</span>
                    </div> : <div className="flex items-center justify-center gap-2.5 w-full">
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm Ride</span>
                      <span className="px-2.5 py-0.5 bg-white/20 rounded-md text-xs font-bold">
                        ${selectedFare?.totalFare.toFixed(2)}
                      </span>
                    </div>}
                </Button>
                
                <p className="text-center text-[9px] text-muted-foreground mt-1.5 flex items-center justify-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-emerald-400" />
                  Secure payment • Trip protection
                </p>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};
export default RiderApp;