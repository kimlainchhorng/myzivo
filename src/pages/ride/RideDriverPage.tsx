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

const RideDriverPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [etaMinutes, setEtaMinutes] = useState(state?.ride?.eta || 4);

  // Handle missing state
  useEffect(() => {
    if (!state?.ride) {
      navigate("/ride");
    }
  }, [state, navigate]);

  // Mock countdown timer
  useEffect(() => {
    if (etaMinutes <= 0) return;

    const timer = setInterval(() => {
      setEtaMinutes((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.success("Your driver has arrived!");
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

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
      {/* Static Map Placeholder */}
      <div className="relative h-[40vh] w-full">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop"
          alt="Map view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950" />
        
        {/* Pickup Pin */}
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
        >
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="w-1 h-4 bg-primary" />
            <div className="w-3 h-3 rounded-full bg-primary/50" />
          </div>
        </motion.div>

        {/* Driver en-route indicator */}
        <motion.div
          animate={{
            x: ["-20%", "10%", "-20%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 left-1/4"
        >
          <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center shadow-lg">
            <span className="text-xs">🚗</span>
          </div>
        </motion.div>
      </div>

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
            <div className="flex items-center justify-center gap-3 py-4 bg-primary/10 rounded-xl border border-primary/20">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-white">
                {etaMinutes > 0 ? `Arriving in ${etaMinutes} min` : "Driver has arrived!"}
              </span>
            </div>

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
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Nav */}
      <RideBottomNav />
    </div>
  );
};

export default RideDriverPage;
