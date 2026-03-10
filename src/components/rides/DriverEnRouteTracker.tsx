/**
 * DriverEnRouteTracker - Real-time driver tracking with animated car, driver info, and action buttons
 * Inspired by Uber/Lyft's en-route experience
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Phone, MessageSquare, Share2, Shield, Star, Navigation, Clock, MapPin, ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DriverInfo {
  name: string;
  rating: number;
  trips: number;
  plate: string;
  vehicle: string;
  vehicleColor: string;
  avatar?: string;
  phone?: string;
}

interface EnRouteProps {
  tripId: string;
  driver?: DriverInfo;
  etaMinutes?: number;
  pickupAddress?: string;
  dropoffAddress?: string;
  status?: "arriving" | "waiting" | "in_transit" | "almost_there";
  onCancel?: () => void;
  onContact?: (type: "call" | "message") => void;
  onShare?: () => void;
}

const statusConfig = {
  arriving: { label: "Driver is on the way", color: "text-primary", progress: 30, pulse: true },
  waiting: { label: "Driver has arrived", color: "text-amber-500", progress: 50, pulse: true },
  in_transit: { label: "Heading to destination", color: "text-emerald-500", progress: 70, pulse: false },
  almost_there: { label: "Almost there!", color: "text-primary", progress: 92, pulse: true },
};

const defaultDriver: DriverInfo = {
  name: "",
  rating: 0,
  trips: 0,
  plate: "",
  vehicle: "",
  vehicleColor: "",
};

export default function DriverEnRouteTracker({
  tripId,
  driver = defaultDriver,
  etaMinutes = 0,
  pickupAddress = "",
  dropoffAddress = "",
  status = "arriving",
  onCancel,
  onContact,
  onShare,
}: EnRouteProps) {
  const [expanded, setExpanded] = useState(false);
  const [countdown, setCountdown] = useState(etaMinutes * 60);
  const [carPosition, setCarPosition] = useState(0);
  const cfg = statusConfig[status];

  // Countdown timer
  useEffect(() => {
    setCountdown(etaMinutes * 60);
    const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [etaMinutes]);

  // Animate car position along route
  useEffect(() => {
    const interval = setInterval(() => {
      setCarPosition(prev => Math.min(100, prev + 0.5));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="rounded-2xl bg-card border border-border/40 overflow-hidden shadow-lg">
      {/* Map area with animated car */}
      <div className="relative h-40 bg-gradient-to-br from-muted/40 to-muted/20 overflow-hidden">
        {/* Route line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 10 80 Q 25 60, 40 50 Q 55 40, 70 35 Q 85 30, 90 20"
            stroke="hsl(var(--primary))"
            strokeWidth="0.8"
            strokeDasharray="2 2"
            fill="none"
            opacity={0.4}
          />
          <path
            d="M 10 80 Q 25 60, 40 50 Q 55 40, 70 35 Q 85 30, 90 20"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            fill="none"
            strokeDasharray={`${carPosition} 200`}
            opacity={0.8}
          />
        </svg>

        {/* Pickup pin */}
        <div className="absolute bottom-6 left-[10%] flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-card shadow-lg" />
          <span className="text-[8px] font-bold text-muted-foreground mt-1">Pickup</span>
        </div>

        {/* Dropoff pin */}
        <div className="absolute top-4 right-[10%] flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-card shadow-lg" />
          <span className="text-[8px] font-bold text-muted-foreground mt-1">Dropoff</span>
        </div>

        {/* Animated car */}
        <motion.div
          className="absolute z-10"
          style={{
            left: `${10 + (carPosition / 100) * 80}%`,
            top: `${80 - (carPosition / 100) * 60}%`,
          }}
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center shadow-lg border-2 border-primary-foreground">
              <Car className="w-4 h-4 text-primary-foreground" />
            </div>
            {cfg.pulse && (
              <span className="absolute inset-0 rounded-full animate-ping bg-primary/30" />
            )}
          </div>
        </motion.div>

        {/* ETA overlay */}
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-border/30 shadow-md">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-lg font-black text-foreground">{mins}:{secs.toString().padStart(2, "0")}</span>
          </div>
          <span className="text-[9px] text-muted-foreground">ETA</span>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className={cn("text-sm font-bold", cfg.color)}>{cfg.label}</span>
          <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary bg-primary/5">
            <Navigation className="w-2.5 h-2.5 mr-1" /> Live
          </Badge>
        </div>
        <Progress value={cfg.progress} className="h-1.5 mb-3" />
      </div>

      {/* Driver card */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {driver.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{driver.name}</span>
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-foreground">{driver.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground">{driver.vehicleColor} {driver.vehicle}</span>
              <Badge variant="outline" className="text-[9px] font-bold h-4">
                {driver.plate}
              </Badge>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onContact?.("call")}
              className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Phone className="w-4 h-4 text-emerald-500" />
            </button>
            <button
              onClick={() => onContact?.("message")}
              className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center active:scale-95 transition-transform"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2 border-t border-border/30 text-[11px] font-bold text-muted-foreground hover:bg-muted/30"
      >
        {expanded ? "Less" : "Trip details"}
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-4 pb-4 overflow-hidden"
        >
          {/* Route details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Pickup</span>
                <p className="text-xs font-medium text-foreground">{pickupAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center mt-0.5 shrink-0">
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Dropoff</span>
                <p className="text-xs font-medium text-foreground">{dropoffAddress}</p>
              </div>
            </div>
          </div>

          {/* Safety & share */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" onClick={onShare}>
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share trip
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs border-red-500/20 text-red-500 hover:bg-red-500/5" onClick={onCancel}>
              <Shield className="w-3.5 h-3.5 mr-1.5" /> Safety
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
