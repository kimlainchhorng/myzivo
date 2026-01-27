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
import ZivoLogo from "@/components/ZivoLogo";

type BookingStep = "location" | "vehicle" | "confirm" | "tracking";

const bookingSteps = [
  { id: "location", label: "Pickup", icon: <MapPin className="w-4 h-4" /> },
  { id: "vehicle", label: "Select Ride", icon: <Car className="w-4 h-4" /> },
  { id: "confirm", label: "Confirm", icon: <Shield className="w-4 h-4" /> },
];

const quickStats = [
  { icon: Clock, value: "~3 min", label: "Avg pickup", gradient: "from-primary via-teal-400 to-cyan-400", glow: "shadow-primary/40" },
  { icon: Star, value: "4.9", label: "Top rated", gradient: "from-amber-400 via-orange-500 to-rose-500", glow: "shadow-amber-500/40" },
  { icon: Shield, value: "100%", label: "Verified drivers", gradient: "from-emerald-400 via-green-500 to-teal-500", glow: "shadow-emerald-500/40" },
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
        <div className="absolute inset-0 bg-gradient-radial from-primary/12 via-transparent to-transparent opacity-50" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/15 to-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl" />
        
        {/* Floating emojis */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-[20%] right-[15%] text-4xl opacity-30"
        >
          🚗
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-[25%] left-[12%] text-4xl opacity-25"
        >
          📍
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-teal-500/5" />
            <CardContent className="p-8 text-center relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="mx-auto mb-6"
              >
                <ZivoLogo size="lg" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Sign in to book a ride</h2>
              <p className="text-muted-foreground mb-6">You need to be logged in to request trips</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl">Home</Button>
                <Button onClick={() => navigate("/login")} className="rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30">Sign In</Button>
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/15 to-teal-500/8 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.12, 0.08]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl" 
        />
        {/* Floating particles */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[10%] text-3xl opacity-20"
        >
          🚗
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[40%] left-[5%] text-2xl opacity-15"
        >
          📍
        </motion.div>
      </div>
      
      {/* Premium Header with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 z-50 bg-card/70 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/5"
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => step === "location" ? navigate("/") : handleReset()}
                  className="rounded-xl hover:bg-white/10 backdrop-blur-sm border border-white/5"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </motion.div>
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-teal-400 flex items-center justify-center shadow-xl shadow-primary/40"
                >
                  <Car className="w-6 h-6 text-white" />
                  {/* Shine effect */}
                  <motion.div
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: "200%", opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 rounded-2xl"
                  />
                </motion.div>
                <div>
                  <motion.h1 
                    key={step}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display font-bold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
                  >
                    {step === "location" && "Where to?"}
                    {step === "vehicle" && "Choose a ride"}
                    {step === "confirm" && "Confirm booking"}
                  </motion.h1>
                  <motion.p 
                    key={`sub-${step}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground"
                  >
                    {step === "location" && "Enter your destination"}
                    {step === "vehicle" && (
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {routeInfo?.distance.toFixed(1)} km • {routeInfo?.duration} min
                      </span>
                    )}
                  </motion.p>
                </div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <LivePulse color="rides" size="sm" label="Live" />
            </motion.div>
          </div>

          {/* Enhanced Step Indicator */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 px-2"
          >
            <StatusTracker 
              steps={bookingSteps}
              currentStep={step === "location" ? 0 : step === "vehicle" ? 1 : 2}
              color="rides"
              orientation="horizontal"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Map Section */}
      <div className="flex-1 relative">
        <BookingMap
          pickup={pickup}
          dropoff={dropoff}
          routeGeometry={routeGeometry}
          className="absolute inset-0"
        />

        {/* Enhanced Loading Overlay */}
        <AnimatePresence>
          {isCalculating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center gap-4 bg-card/95 backdrop-blur-xl px-8 py-6 rounded-3xl shadow-2xl border border-white/10"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/40"
                  >
                    <Navigation className="w-7 h-7 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl bg-primary/30 blur-md"
                  />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Finding best routes</p>
                  <p className="text-sm text-muted-foreground">Analyzing traffic patterns...</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Quick Stats Floating */}
        <AnimatePresence>
          {step === "location" && !pickup && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-4 left-4 right-4 flex gap-3 justify-center flex-wrap"
            >
              {quickStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.7, y: -20, rotateX: -15 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                  transition={{ 
                    delay: index * 0.12, 
                    type: "spring", 
                    stiffness: 350,
                    damping: 25
                  }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center gap-3 cursor-default overflow-hidden"
                >
                  {/* Animated gradient border glow */}
                  <motion.div 
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl",
                      "bg-gradient-to-r",
                      stat.gradient
                    )}
                    style={{ padding: '1px', margin: '-1px' }}
                  />
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-3">
                    <motion.div 
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className={cn(
                        "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                        stat.gradient,
                        stat.glow
                      )}
                    >
                      <stat.icon className="w-5 h-5 text-white drop-shadow-md" />
                    </motion.div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <p className="text-lg font-bold tracking-tight">{stat.value}</p>
                        {stat.label === "Top rated" && (
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Premium Bottom Sheet with Enhanced Design */}
      <motion.div 
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="relative bg-gradient-to-b from-card via-card to-card/98 border-t border-white/10 rounded-t-[2rem] shadow-[0_-20px_60px_-12px_rgba(0,0,0,0.4)]"
      >
        {/* Decorative top gradient line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
        
        {/* Handle */}
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 cursor-grab" 
        />
        
        <div className="p-5 pb-8 max-h-[62vh] overflow-y-auto scrollbar-hide">
          {/* Location Step */}
          <AnimatePresence mode="wait">
            {step === "location" && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
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

                {/* Location Inputs with Connection Line */}
                <div className="relative">
                  {/* Connection line between inputs */}
                  <div className="absolute left-[1.35rem] top-[3.25rem] bottom-[2.75rem] w-0.5 bg-gradient-to-b from-emerald-500/50 via-muted/30 to-primary/50 rounded-full" />
                  
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                    >
                      <LocationSearchInput
                        placeholder="Pickup location"
                        value={pickup}
                        onChange={setPickup}
                        icon="pickup"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <LocationSearchInput
                        placeholder="Where to?"
                        value={dropoff}
                        onChange={setDropoff}
                        icon="dropoff"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Saved Locations with Enhanced Header */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="pt-5 border-t border-white/5"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/10 flex items-center justify-center"
                    >
                      <MapPin className="w-4 h-4 text-primary" />
                    </motion.div>
                    <span className="text-sm font-bold text-foreground">Saved Places</span>
                  </div>
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
                </motion.div>
              </motion.div>
            )}

            {/* Vehicle Selection Step */}
            {step === "vehicle" && fareEstimates.length > 0 && (
              <motion.div
                key="vehicle"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-5"
              >
                {/* Enhanced Route Summary Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-teal-500/5 border border-white/10 overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
                  
                  <div className="flex items-center gap-4 relative">
                    <motion.div 
                      whileHover={{ rotate: 10 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-xl shadow-primary/30"
                    >
                      <Navigation className="w-7 h-7 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                        <p className="text-sm font-bold truncate">{pickup?.address?.split(',')[0]}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-sm bg-primary shadow-lg shadow-primary/50" />
                        <p className="text-sm text-muted-foreground truncate">{dropoff?.address?.split(',')[0]}</p>
                      </div>
                    </div>
                    <div className="text-right bg-card/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5">
                      <p className="text-xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">{routeInfo?.duration} min</p>
                      <p className="text-xs text-muted-foreground font-medium">{routeInfo?.distance.toFixed(1)} km</p>
                    </div>
                  </div>
                </motion.div>

                <VehicleSelector
                  fareEstimates={fareEstimates}
                  selectedVehicle={selectedVehicle}
                  onSelect={setSelectedVehicle}
                />
                
                {/* Enhanced Confirm Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className="relative w-full h-16 text-lg font-bold gap-3 rounded-2xl bg-gradient-to-r from-primary via-primary to-teal-400 text-white shadow-2xl shadow-primary/40 overflow-hidden group"
                    disabled={!selectedVehicle || createTrip.isPending}
                    onClick={handleConfirmBooking}
                  >
                    {/* Shine sweep effect */}
                    <motion.div
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={{ x: "200%", opacity: [0, 0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                    
                    {createTrip.isPending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-6 h-6" />
                        </motion.div>
                        <span>Finding your driver...</span>
                      </>
                    ) : (
                      <>
                        <motion.div
                          animate={{ rotate: [0, 15, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-6 h-6" />
                        </motion.div>
                        <span>Confirm Ride</span>
                        <span className="ml-1 px-3 py-1 bg-white/20 rounded-lg text-base">
                          ${selectedFare?.totalFare.toFixed(2)}
                        </span>
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
