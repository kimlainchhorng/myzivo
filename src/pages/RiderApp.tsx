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

  // Check for active trip
  const {
    data: activeTrip,
    isLoading: tripLoading
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
    refetchInterval: 30000
  });

  // Calculate route when both locations are set
  useEffect(() => {
    const fetchRoute = async () => {
      if (pickup && dropoff) {
        const route = await calculateRoute(pickup, dropoff);
        if (route) {
          setRouteGeometry(route.geometry);
          setRouteInfo({
            distance: route.distance,
            duration: route.duration
          });
          const fares = calculateFares(route.distance, route.duration);
          setFareEstimates(fares);
          if (fares.length > 0 && !selectedVehicle) {
            setSelectedVehicle(fares[0].vehicleType);
          }
          setStep("vehicle");
        }
      }
    };
    fetchRoute();
  }, [pickup, dropoff]);

  // Switch to tracking if there's an active trip
  useEffect(() => {
    if (activeTrip) {
      setStep("tracking");
    }
  }, [activeTrip]);
  const handleConfirmBooking = async () => {
    if (!pickup || !dropoff || !selectedVehicle || !routeInfo) return;
    const selectedFare = fareEstimates.find(f => f.vehicleType === selectedVehicle);
    if (!selectedFare) return;
    await createTrip.mutateAsync({
      pickup,
      dropoff,
      fareAmount: selectedFare.totalFare,
      distanceKm: routeInfo.distance,
      durationMinutes: routeInfo.duration
    });
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
  if (tripLoading) {
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
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/15 to-teal-500/8 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-emerald-500/8 to-cyan-500/4 rounded-full blur-3xl" />
        </div>
        
        <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl hover:bg-white/10 border border-white/5 h-10 w-10 active:scale-95 transition-transform">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-teal-400 flex items-center justify-center shadow-xl shadow-primary/40">
                    <Navigation className="w-6 h-6 text-white" />
                    {/* Static pulse ring */}
                    <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-sm animate-pulse" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">Your Trip</h1>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-xs text-muted-foreground">In progress</p>
                    </div>
                  </div>
                </div>
              </div>
              <LivePulse color="rides" size="sm" label="Live" />
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <TripTracker trip={activeTrip} onCancel={handleCancelTrip} />
        </div>
      </div>;
  }
  const selectedFare = fareEstimates.find(f => f.vehicleType === selectedVehicle);
  return <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Static Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/12 to-teal-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-gradient-to-tr from-violet-500/8 to-purple-500/4 rounded-full blur-3xl" />
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
        <BookingMap pickup={pickup} dropoff={dropoff} routeGeometry={routeGeometry} className="absolute inset-0" />

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
      <div className="relative bg-gradient-to-b from-card via-card to-card/95 border-t border-white/10 rounded-t-[1.5rem] shadow-[0_-15px_40px_-12px_rgba(0,0,0,0.4)]">
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3" />
        
        <div className="p-4 pb-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {/* Location Step */}
          {step === "location" && <div className="space-y-6">
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
                <div className="absolute left-[1.35rem] top-[3.5rem] bottom-[3rem] w-0.5 rounded-full bg-gradient-to-b from-emerald-500/60 via-muted/30 to-primary/60" />
                
                <div className="space-y-4">
                  <div className="relative">
                    <LocationSearchInput placeholder="Pickup location" value={pickup} onChange={setPickup} icon="pickup" />
                    {/* Use My Location Button */}
                    {!pickup && <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={handleUseMyLocation} disabled={isGettingLocation} className="w-full h-10 rounded-xl border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all active:scale-[0.98]">
                          {isGettingLocation ? <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Getting location...
                            </> : <>
                              <Locate className="w-4 h-4 mr-2" />
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
              <div className="pt-6 border-t border-white/8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 via-primary/15 to-teal-500/15 flex items-center justify-center border border-primary/20">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground">Saved Places</span>
                    <p className="text-[11px] text-muted-foreground">Your favorite locations</p>
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
          {step === "vehicle" && fareEstimates.length > 0 && <div className="space-y-6">
              {/* Route Summary Card */}
              <div className="relative p-4 rounded-2xl bg-card border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5" />
                
                <div className="relative flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Navigation className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card animate-pulse" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow shadow-emerald-500/50" />
                      <p className="text-xs font-semibold truncate">{pickup?.address?.split(',')[0]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm bg-primary shadow shadow-primary/50" />
                      <p className="text-xs text-muted-foreground truncate">{dropoff?.address?.split(',')[0]}</p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right bg-muted/30 px-3 py-2 rounded-xl">
                    <p className="text-xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                      {routeInfo?.duration}<span className="text-xs text-muted-foreground ml-0.5">min</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">{routeInfo && (routeInfo.distance * 0.621371).toFixed(1)} mi</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Selector */}
              <div>
                <VehicleSelector fareEstimates={fareEstimates} selectedVehicle={selectedVehicle} onSelect={setSelectedVehicle} />
              </div>
              
              {/* Confirm Button */}
              <div>
                <Button size="lg" className="relative w-full h-14 text-base font-bold gap-3 rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/40 overflow-hidden active:scale-[0.98] transition-transform" disabled={!selectedVehicle || createTrip.isPending} onClick={handleConfirmBooking}>
                  {createTrip.isPending ? <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Finding driver...</span>
                    </div> : <div className="flex items-center justify-center gap-3 w-full">
                      <Sparkles className="w-5 h-5" />
                      <span>Confirm Ride</span>
                      <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-bold">
                        ${selectedFare?.totalFare.toFixed(2)}
                      </span>
                    </div>}
                </Button>
                
                <p className="text-center text-[10px] text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Secure payment • Trip protection
                </p>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};
export default RiderApp;