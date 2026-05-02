/**
 * LiveTripTracker - Real-time card showing active ride/delivery with ETA countdown
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Car from "lucide-react/dist/esm/icons/car";
import UtensilsCrossed from "lucide-react/dist/esm/icons/utensils-crossed";
import Package from "lucide-react/dist/esm/icons/package";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Clock from "lucide-react/dist/esm/icons/clock";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ActiveTrip {
  id: string;
  type: "ride" | "food" | "delivery";
  status: string;
  destination: string;
  eta_minutes: number;
  driver_name?: string;
  progress: number;
}

const typeConfig = {
  ride: { icon: Car, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500/10 to-emerald-500/5", label: "Ride" },
  food: { icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", gradient: "from-orange-500/10 to-orange-500/5", label: "Food Delivery" },
  delivery: { icon: Package, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", gradient: "from-violet-500/10 to-violet-500/5", label: "Package" },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  driver_assigned: { label: "Driver assigned", color: "text-sky-500" },
  en_route: { label: "On the way", color: "text-primary" },
  arriving: { label: "Arriving now", color: "text-amber-500" },
  picked_up: { label: "In transit", color: "text-primary" },
  preparing: { label: "Preparing", color: "text-orange-500" },
  out_for_delivery: { label: "Out for delivery", color: "text-primary" },
};

export default function LiveTripTracker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Poll for active trips
  useEffect(() => {
    if (!user?.id) return;

    const fetchActive = async () => {
      // Check active rides
      const { data: rides } = await supabase
        .from("trips")
        .select("id, status, dropoff_address, driver_id")
        .eq("rider_id", user.id)
        .in("status", ["accepted", "en_route", "arriving"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (rides?.[0]) {
        const r = rides[0];
        const progressMap: Record<string, number> = { accepted: 20, en_route: 55, arriving: 85 };
        setActiveTrip({
          id: r.id,
          type: "ride",
          status: r.status === "accepted" ? "driver_assigned" : r.status,
          destination: r.dropoff_address?.slice(0, 30) || "Destination",
          eta_minutes: r.status === "arriving" ? 2 : r.status === "en_route" ? 6 : 10,
          progress: progressMap[r.status] || 30,
        });
        return;
      }

      // Check active food orders
      const { data: orders } = await supabase
        .from("food_orders")
        .select("id, status, delivery_address")
        .eq("customer_id", user.id)
        .in("status", ["confirmed", "preparing", "ready", "out_for_delivery"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (orders?.[0]) {
        const o = orders[0];
        const progressMap: Record<string, number> = { confirmed: 10, preparing: 30, ready: 55, out_for_delivery: 85 };
        setActiveTrip({
          id: o.id,
          type: "food",
          status: o.status === "out_for_delivery" ? "out_for_delivery" : o.status,
          destination: (o.delivery_address as string)?.slice(0, 30) || "Your address",
          eta_minutes: o.status === "out_for_delivery" ? 5 : 15,
          progress: progressMap[o.status] || 20,
        });
        return;
      }

      setActiveTrip(null);
    };

    fetchActive();
    const interval = setInterval(fetchActive, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // ETA countdown
  useEffect(() => {
    if (!activeTrip) return;
    setCountdown(activeTrip.eta_minutes * 60);
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [activeTrip?.id, activeTrip?.eta_minutes]);

  if (!activeTrip) return null;

  const cfg = typeConfig[activeTrip.type];
  const Icon = cfg.icon;
  const statusInfo = statusLabels[activeTrip.status] || { label: activeTrip.status, color: "text-muted-foreground" };
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(activeTrip.type === "ride" ? `/rides/track/${activeTrip.id}` : `/orders/${activeTrip.id}`)}
      className={`w-full rounded-2xl bg-gradient-to-br ${cfg.gradient} border ${cfg.border} p-5 text-left relative overflow-hidden shadow-md touch-manipulation`}
    >
      {/* Animated pulse ring */}
      <div className="absolute top-4 right-4">
        <span className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.bg} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-3 w-3 ${cfg.bg}`}>
            <Navigation className={`w-2 h-2 m-auto ${cfg.color}`} />
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center border ${cfg.border}`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{cfg.label}</span>
            <Badge variant="outline" className={`text-[9px] font-bold ${statusInfo.color} border-current/20 bg-current/5`}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{activeTrip.destination}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={activeTrip.progress} className="h-1.5 mb-3" />

      {/* ETA countdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${cfg.color}`} />
          <span className="text-xs font-bold text-foreground">
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
          <span className="text-[10px] text-muted-foreground">ETA</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-primary">
          Track <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.button>
  );
}
