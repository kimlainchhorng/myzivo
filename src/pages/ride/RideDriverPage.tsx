import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, MessageCircle, X, Star, MapPin, Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RideBottomNav from "@/components/ride/RideBottomNav";
import { RideOption } from "@/components/ride/RideCard";
import { toast } from "sonner";
import { GoogleMapProvider } from "@/components/maps";
import DriverMapView from "@/components/ride/DriverMapView";

interface LocationState {
  ride: RideOption;
  pickup: string;
  destination: string;
  paymentMethod: string;
}

const mockDriver = {
  name: "Marcus Johnson",
  rating: 4.9,
  trips: 2847,
  car: "Toyota Camry",
  plate: "ABC 1234",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
};

// Mock coordinates for Baton Rouge area
const PICKUP_LOCATION = { lat: 30.4515, lng: -91.1871 };
const INITIAL_DRIVER_LOCATION = { lat: 30.4615, lng: -91.1971 };

const RideDriverPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as LocationState | null;
  
  // Try to get state from route or localStorage
  const [state, setState] = useState<LocationState | null>(routeState);
  const [etaMinutes, setEtaMinutes] = useState(state?.ride?.eta || 4);
  const [driverLocation, setDriverLocation] = useState(INITIAL_DRIVER_LOCATION);

  // Load from localStorage if route state is missing
  useEffect(() => {
    if (!routeState?.ride) {
      try {
        const stored = localStorage.getItem("zivo_active_ride");
        if (stored) {
          const parsed = JSON.parse(stored);
          setState(parsed);
          setEtaMinutes(parsed.ride?.eta || 4);
          return;
        }
      } catch {}
      navigate("/ride");
    }
  }, [routeState, navigate]);

  // Mock countdown timer - updates every 12 seconds for demo
  useEffect(() => {
    if (etaMinutes <= 0) return;

    const timer = setInterval(() => {
      setEtaMinutes((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.success("Your driver has arrived!");
          setDriverLocation(PICKUP_LOCATION);
          return 0;
        }
        return prev - 1;
      });
      
      // Move driver closer to pickup
      setDriverLocation((prev) => ({
        lat: prev.lat + (PICKUP_LOCATION.lat - INITIAL_DRIVER_LOCATION.lat) / 4,
        lng: prev.lng + (PICKUP_LOCATION.lng - INITIAL_DRIVER_LOCATION.lng) / 4,
      }));
    }, 12000); // Update every 12 seconds for demo

    return () => clearInterval(timer);
  }, []);

  const handleCall = () => {
    toast.info("Calling driver...", { duration: 2000 });
  };

  const handleMessage = () => {
    toast.info("Opening chat...", { duration: 2000 });
  };

  const handleCancel = () => {
    toast.error("Ride cancelled");
    navigate("/ride");
  };

  if (!state?.ride) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Google Maps Background */}
      <GoogleMapProvider>
        <DriverMapView 
          pickupLocation={PICKUP_LOCATION} 
          driverLocation={driverLocation}
          hasArrived={etaMinutes === 0}
        />
      </GoogleMapProvider>

      {/* Driver Card Bottom Sheet */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative -mt-6 px-4"
      >
        <Card className="bg-zinc-900/95 backdrop-blur-xl border-white/10">
          <CardContent className="p-4 space-y-4">
            {/* Driver Info Row */}
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-primary">
                <AvatarImage src={mockDriver.avatar} alt={mockDriver.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {mockDriver.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{mockDriver.name}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{mockDriver.rating}</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">{mockDriver.trips.toLocaleString()} trips</span>
                </div>
              </div>
            </div>

            {/* Car Info */}
            <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-sm text-white/60">Vehicle</p>
                <p className="font-semibold text-white">{mockDriver.car}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">Plate</p>
                <p className="font-mono font-bold text-primary">{mockDriver.plate}</p>
              </div>
            </div>

            {/* ETA Display */}
            <motion.div
              animate={etaMinutes === 0 ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.5, repeat: etaMinutes === 0 ? Infinity : 0, repeatDelay: 1 }}
              className={`flex items-center justify-center gap-3 py-4 rounded-xl border ${
                etaMinutes === 0
                  ? "bg-green-500/20 border-green-500/40"
                  : "bg-primary/10 border-primary/20"
              }`}
            >
              <Clock className={`w-5 h-5 ${etaMinutes === 0 ? "text-green-400" : "text-primary"}`} />
              <span className={`text-lg font-bold ${etaMinutes === 0 ? "text-green-400" : "text-white"}`}>
                {etaMinutes > 0 ? `Arriving in ${etaMinutes} min` : "Driver has arrived!"}
              </span>
            </motion.div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleCall}
                className="flex flex-col items-center gap-1 py-4 h-auto border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-xs">Call</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleMessage}
                className="flex flex-col items-center gap-1 py-4 h-auto border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="text-xs">Message</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex flex-col items-center gap-1 py-4 h-auto border-destructive/50 bg-destructive/10 hover:bg-destructive/20 text-destructive"
              >
                <X className="w-5 h-5" />
                <span className="text-xs">Cancel</span>
              </Button>
            </div>

            {/* Trip Summary */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">{state.ride.name}</span>
                <span className="font-bold text-primary">${state.ride.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Start Trip Button - only shows when driver has arrived */}
            {etaMinutes === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={() => navigate("/ride/trip", { state })}
                  className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 mt-4"
                >
                  START TRIP
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Nav */}
      <RideBottomNav />
    </div>
  );
};

export default RideDriverPage;
