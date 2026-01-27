import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Clock, MapPin, Star, Shield, Zap, Car, Navigation, Phone, MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LocationSearchInput from "@/components/rider/LocationSearchInput";
import VehicleSelector from "@/components/rider/VehicleSelector";
import BookingMap from "@/components/rider/BookingMap";
import SavedLocationsPanel from "@/components/rider/SavedLocationsPanel";
import QuickLocationPicker from "@/components/rider/QuickLocationPicker";
import TripTracker from "@/components/rider/TripTracker";
import { StatusTracker, LivePulse, ETADisplay } from "@/components/ui/status-tracker";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Location,
  FareEstimate,
  useRouteCalculation,
  useFareEstimation,
  useCreateTrip,
} from "@/hooks/useRiderBooking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/hooks/useTrips";
import { useRiderTripRealtime } from "@/hooks/useTripRealtime";

type BookingStep = "location" | "vehicle" | "confirm" | "tracking";

const bookingSteps = [
  { id: "location", label: "Pickup", icon: <MapPin className="w-4 h-4" /> },
  { id: "vehicle", label: "Select Ride", icon: <Car className="w-4 h-4" /> },
  { id: "confirm", label: "Confirm", icon: <Shield className="w-4 h-4" /> },
];

const quickStats = [
  { icon: Clock, value: "< 5 min", label: "Avg pickup", gradient: "from-primary to-teal-400" },
  { icon: Star, value: "4.9★", label: "Driver rating", gradient: "from-amber-500 to-orange-500" },
  { icon: Shield, value: "100%", label: "Verified", gradient: "from-emerald-500 to-green-500" },
];

const RiderApp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<BookingStep>("location");
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [fareEstimates, setFareEstimates] = useState<FareEstimate[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  const { calculateRoute, isCalculating } = useRouteCalculation();
  const { calculateFares } = useFareEstimation();
  const createTrip = useCreateTrip();

  // Enable realtime subscriptions for trip updates
  useRiderTripRealtime(user?.id);

  // Check for active trip
  const { data: activeTrip, isLoading: tripLoading } = useQuery({
    queryKey: ["active-rider-trip", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          driver:drivers(full_name, email, avatar_url)
        `)
        .eq("rider_id", user.id)
        .in("status", ["requested", "accepted", "en_route", "arrived", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Trip | null;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Calculate route when both locations are set
  useEffect(() => {
    const fetchRoute = async () => {
      if (pickup && dropoff) {
        const route = await calculateRoute(pickup, dropoff);
        if (route) {
          setRouteGeometry(route.geometry);
          setRouteInfo({ distance: route.distance, duration: route.duration });
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
      durationMinutes: routeInfo.duration,
    });
  };

  const handleCancelTrip = async () => {
    if (!activeTrip) return;
    
    const { error } = await supabase
      .from("trips")
      .update({ status: "cancelled" })
      .eq("id", activeTrip.id);

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign in to book a ride</h2>
              <p className="text-muted-foreground mb-6">You need to be logged in to request trips</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl">Home</Button>
                <Button onClick={() => navigate("/login")} className="rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white">Sign In</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-[300px] w-full rounded-2xl mb-4" />
        <Skeleton className="h-20 w-full rounded-2xl mb-2" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  // Show trip tracking if there's an active trip
  if (activeTrip && step === "tracking") {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">Your Trip</h1>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <TripTracker trip={activeTrip} onCancel={handleCancelTrip} />
        </div>
      </div>
    );
  }

  const selectedFare = fareEstimates.find(f => f.vehicleType === selectedVehicle);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => step === "location" ? navigate("/") : handleReset()}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg">
                  {step === "location" && "Where to?"}
                  {step === "vehicle" && "Choose a ride"}
                  {step === "confirm" && "Confirm booking"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {step === "location" && "Enter your destination"}
                  {step === "vehicle" && `${routeInfo?.distance.toFixed(1)} km • ${routeInfo?.duration} min`}
                </p>
              </div>
            </div>
          </div>
          <LivePulse color="rides" size="sm" label="Live" />
        </div>

        {/* Step Indicator */}
        <div className="mt-4">
          <StatusTracker 
            steps={bookingSteps}
            currentStep={step === "location" ? 0 : step === "vehicle" ? 1 : 2}
            color="rides"
            orientation="horizontal"
          />
        </div>
      </motion.div>

      {/* Map */}
      <div className="flex-1 relative">
        <BookingMap
          pickup={pickup}
          dropoff={dropoff}
          routeGeometry={routeGeometry}
          className="absolute inset-0"
        />

        {isCalculating && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 bg-card/95 px-5 py-4 rounded-2xl shadow-xl border border-border/50"
            >
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="font-medium">Finding best routes...</span>
            </motion.div>
          </div>
        )}

        {/* Quick Stats Floating */}
        {step === "location" && !pickup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 right-4 flex gap-2 justify-center"
          >
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-4 py-2.5 rounded-xl bg-card/95 backdrop-blur-sm border border-border/50 shadow-xl flex items-center gap-2.5"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                  stat.gradient
                )}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Premium Bottom Sheet */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-b from-card to-card/95 border-t border-border/50 rounded-t-3xl shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.3)]"
      >
        <div className="w-12 h-1.5 bg-muted/50 rounded-full mx-auto mt-3" />
        
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* Location Step */}
          <AnimatePresence mode="wait">
            {step === "location" && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {/* Quick Location Picker */}
                <QuickLocationPicker
                  userId={user?.id}
                  onSelect={(location) => {
                    if (!pickup) {
                      setPickup(location);
                    } else {
                      setDropoff(location);
                    }
                  }}
                />

                <div className="space-y-3">
                  <LocationSearchInput
                    placeholder="Pickup location"
                    value={pickup}
                    onChange={setPickup}
                    icon="pickup"
                  />
                  <LocationSearchInput
                    placeholder="Where to?"
                    value={dropoff}
                    onChange={setDropoff}
                    icon="dropoff"
                  />
                </div>

                {/* Saved Locations */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                    </div>
                    Saved Places
                  </p>
                  <SavedLocationsPanel
                    userId={user?.id}
                    onSelect={(location) => {
                      if (!pickup) {
                        setPickup(location);
                      } else {
                        setDropoff(location);
                      }
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Vehicle Selection Step */}
            {step === "vehicle" && fareEstimates.length > 0 && (
              <motion.div
                key="vehicle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Route Summary */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{pickup?.address}</p>
                    <p className="text-xs text-muted-foreground truncate">→ {dropoff?.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{routeInfo?.duration} min</p>
                    <p className="text-xs text-muted-foreground">{routeInfo?.distance.toFixed(1)} km</p>
                  </div>
                </div>

                <VehicleSelector
                  fareEstimates={fareEstimates}
                  selectedVehicle={selectedVehicle}
                  onSelect={setSelectedVehicle}
                />
                
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    size="lg"
                    className="w-full h-16 text-lg font-bold gap-3 rounded-2xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-xl shadow-primary/30"
                    disabled={!selectedVehicle || createTrip.isPending}
                    onClick={handleConfirmBooking}
                  >
                    {createTrip.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Finding driver...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Confirm ${selectedFare?.totalFare.toFixed(2)}
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default RiderApp;
