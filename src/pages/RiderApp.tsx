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
  { id: "vehicle", label: "Your Ride", icon: <Car className="w-4 h-4" /> },
  { id: "confirm", label: "Book", icon: <Zap className="w-4 h-4" /> },
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
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/15 via-transparent to-transparent opacity-60" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/20 to-teal-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/15 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-1/3 w-[300px] h-[300px] bg-gradient-to-br from-cyan-500/10 to-teal-500/5 rounded-full blur-3xl" />
        
        {/* Floating emojis with enhanced animations */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 12, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[18%] right-[12%] text-5xl opacity-40"
        >
          🚗
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[22%] left-[10%] text-5xl opacity-35"
        >
          📍
        </motion.div>
        <motion.div
          animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[35%] left-[18%] text-3xl opacity-25"
        >
          ✨
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-2xl shadow-2xl shadow-black/30 overflow-hidden">
            {/* Top gradient accent */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-teal-400 to-cyan-400" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-teal-500/8" />
            <CardContent className="p-10 text-center relative">
              <motion.div 
                whileHover={{ scale: 1.08, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                className="mx-auto mb-8"
              >
                <ZivoLogo size="lg" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                  Ready to ride?
                </h2>
                <p className="text-muted-foreground mb-8 text-base">Sign in to book your next trip</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 justify-center"
              >
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/")} 
                  className="rounded-xl px-6 h-12 border-white/10 hover:bg-white/5"
                >
                  Home
                </Button>
                <Button 
                  onClick={() => navigate("/login")} 
                  className="rounded-xl px-8 h-12 bg-gradient-to-r from-primary via-primary to-teal-400 text-white shadow-xl shadow-primary/40 font-semibold"
                >
                  Sign In
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
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
      </div>
    );
  }

  // Show trip tracking if there's an active trip
  if (activeTrip && step === "tracking") {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background glow effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/20 to-teal-500/10 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-emerald-500/10 to-cyan-500/5 rounded-full blur-3xl" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 bg-card/80 backdrop-blur-2xl border-b border-white/10 shadow-lg"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate("/")} 
                    className="rounded-xl hover:bg-white/10 border border-white/5"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </motion.div>
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-teal-400 flex items-center justify-center shadow-xl shadow-primary/40"
                  >
                    <Navigation className="w-6 h-6 text-white" />
                    {/* Pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-2xl bg-primary/40 blur-sm"
                    />
                  </motion.div>
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
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4"
        >
          <TripTracker trip={activeTrip} onCancel={handleCancelTrip} />
        </motion.div>
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
        initial={{ y: 150 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        className="relative bg-gradient-to-b from-card via-card to-card/95 border-t border-white/15 rounded-t-[2.5rem] shadow-[0_-25px_70px_-12px_rgba(0,0,0,0.5)]"
      >
        {/* Decorative top gradient line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full" />
        
        {/* Handle with glow */}
        <div className="relative w-12 h-1.5 bg-white/25 rounded-full mx-auto mt-4 cursor-grab group">
          <motion.div 
            whileHover={{ scale: 1.2 }}
            className="absolute inset-0 bg-white/20 rounded-full blur-sm group-hover:bg-primary/30 transition-colors" 
          />
        </div>
        
        <div className="p-6 pb-10 max-h-[65vh] overflow-y-auto scrollbar-hide">
          {/* Location Step */}
          <AnimatePresence mode="wait">
            {step === "location" && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="space-y-6"
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

                {/* Location Inputs with Enhanced Connection Line */}
                <div className="relative">
                  {/* Connection line between inputs with animated gradient */}
                  <div className="absolute left-[1.35rem] top-[3.5rem] bottom-[3rem] w-0.5 overflow-hidden rounded-full">
                    <motion.div 
                      animate={{ y: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-b from-emerald-500 via-primary to-teal-400"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/40 via-muted/20 to-primary/40" />
                  </div>
                  
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05, type: "spring" }}
                    >
                      <LocationSearchInput
                        placeholder="Pickup location"
                        value={pickup}
                        onChange={setPickup}
                        icon="pickup"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12, type: "spring" }}
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
                  transition={{ delay: 0.2 }}
                  className="pt-6 border-t border-white/8"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <motion.div 
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 via-primary/15 to-teal-500/15 flex items-center justify-center border border-primary/20"
                    >
                      <MapPin className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <span className="text-sm font-bold text-foreground">Saved Places</span>
                      <p className="text-[11px] text-muted-foreground">Your favorite locations</p>
                    </div>
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
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="space-y-6"
              >
                {/* Premium Route Summary Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="group relative p-6 rounded-[1.75rem] bg-gradient-to-br from-card via-card/95 to-card/90 border border-white/15 overflow-hidden shadow-2xl shadow-black/20"
                >
                  {/* Multi-layer background effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-teal-500/8" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-radial from-teal-500/15 via-teal-500/5 to-transparent rounded-full blur-2xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-radial from-cyan-500/8 to-transparent rounded-full blur-3xl" />
                  
                  {/* Animated border glow */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-[1px] rounded-[1.75rem] bg-gradient-conic from-primary/30 via-transparent via-50% to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="absolute inset-[1px] rounded-[1.6rem] bg-card" />
                  
                  {/* Shimmer sweep on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className="relative flex items-center gap-5">
                    {/* Animated navigation icon */}
                    <motion.div 
                      whileHover={{ rotate: 20, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="relative flex-shrink-0"
                    >
                      <div className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-primary via-primary to-teal-400 flex items-center justify-center shadow-2xl shadow-primary/50 border border-white/20">
                        <Navigation className="w-9 h-9 text-white drop-shadow-lg" />
                      </div>
                      {/* Pulse rings */}
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl bg-primary/40 blur-md"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        className="absolute inset-0 rounded-2xl bg-teal-400/30 blur-lg"
                      />
                      {/* Live indicator */}
                      <motion.div 
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-card shadow-lg shadow-emerald-500/50 flex items-center justify-center"
                      >
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </motion.div>
                    </motion.div>
                    
                    {/* Route details */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Pickup */}
                      <div className="flex items-center gap-3 group/pickup">
                        <div className="relative">
                          <motion.div 
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/60"
                          />
                          <div className="absolute inset-0 rounded-full bg-emerald-400/50 blur-sm animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-emerald-400/80 font-semibold uppercase tracking-wider mb-0.5">Pickup</p>
                          <p className="text-sm font-bold truncate group-hover/pickup:text-primary transition-colors">{pickup?.address?.split(',')[0]}</p>
                        </div>
                      </div>
                      
                      {/* Animated connection dots */}
                      <div className="flex items-center gap-1.5 pl-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary/60 to-teal-400/60"
                          />
                        ))}
                      </div>
                      
                      {/* Dropoff */}
                      <div className="flex items-center gap-3 group/dropoff">
                        <div className="relative">
                          <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-primary to-teal-400 shadow-lg shadow-primary/60" />
                          <div className="absolute inset-0 rounded-sm bg-primary/40 blur-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-primary/80 font-semibold uppercase tracking-wider mb-0.5">Drop-off</p>
                          <p className="text-sm font-bold truncate group-hover/dropoff:text-teal-400 transition-colors">{dropoff?.address?.split(',')[0]}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Trip stats card */}
                    <motion.div 
                      whileHover={{ scale: 1.03, y: -2 }}
                      className="relative flex-shrink-0 bg-gradient-to-br from-card via-card/95 to-muted/30 backdrop-blur-2xl px-5 py-4 rounded-2xl border border-white/15 shadow-xl overflow-hidden"
                    >
                      {/* Inner glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5" />
                      
                      <div className="relative text-center">
                        <motion.p 
                          key={routeInfo?.duration}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-black bg-gradient-to-r from-primary via-teal-400 to-cyan-400 bg-clip-text text-transparent"
                        >
                          {routeInfo?.duration}
                        </motion.p>
                        <p className="text-xs text-muted-foreground font-bold tracking-wide">min</p>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-2" />
                        <p className="text-lg font-bold text-foreground">{routeInfo?.distance.toFixed(1)} <span className="text-xs text-muted-foreground">km</span></p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Vehicle Selector with premium wrapper */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <VehicleSelector
                    fareEstimates={fareEstimates}
                    selectedVehicle={selectedVehicle}
                    onSelect={setSelectedVehicle}
                  />
                </motion.div>
                
                {/* Premium Confirm Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 280 }}
                  className="relative pt-2"
                >
                  {/* Floating glow behind button */}
                  <div className="absolute inset-x-4 -top-2 bottom-4 bg-gradient-to-r from-primary/30 via-teal-400/25 to-primary/30 rounded-3xl blur-2xl" />
                  
                  <motion.div
                    whileHover={{ scale: 1.015, y: -3 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      className="relative w-full h-20 text-xl font-bold gap-4 rounded-[1.25rem] bg-gradient-to-r from-primary via-primary to-teal-400 text-white shadow-2xl shadow-primary/60 overflow-hidden group border border-white/20"
                      disabled={!selectedVehicle || createTrip.isPending}
                      onClick={handleConfirmBooking}
                    >
                      {/* Animated background layers */}
                      <motion.div
                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-primary via-teal-400 via-cyan-400 to-primary bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      
                      {/* Shine sweep effect */}
                      <motion.div
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: "200%", opacity: [0, 0.5, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                      />
                      
                      {/* Top highlight */}
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                      
                      {createTrip.isPending ? (
                        <div className="relative flex items-center gap-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 rounded-full border-3 border-white/30 border-t-white"
                          />
                          <span className="text-lg">Finding your driver...</span>
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="flex gap-1"
                          >
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                className="w-1.5 h-1.5 rounded-full bg-white"
                              />
                            ))}
                          </motion.div>
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center gap-5 w-full">
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1.15, 1] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                            className="relative"
                          >
                            <Sparkles className="w-8 h-8 drop-shadow-lg" />
                            <div className="absolute inset-0 blur-md bg-white/40" />
                          </motion.div>
                          
                          <span className="text-xl font-bold tracking-wide">Confirm Ride</span>
                          
                          <motion.div 
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative ml-2 px-5 py-2 bg-white/25 backdrop-blur-md rounded-xl border border-white/30 shadow-inner"
                          >
                            <span className="text-lg font-black">${selectedFare?.totalFare.toFixed(2)}</span>
                            {/* Subtle shine */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-xl opacity-60" />
                          </motion.div>
                        </div>
                      )}
                    </Button>
                  </motion.div>
                  
                  {/* Safety message */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground"
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Secure payment • Trip protection included</span>
                  </motion.div>
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
