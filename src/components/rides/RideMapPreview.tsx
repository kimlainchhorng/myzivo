/**
 * RideMapPreview — Polished map preview with pickup pin, route visualization, vehicle types
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Car, Sparkles, Crown, Users, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const vehicleTypes = [
  { id: "economy", label: "Economy", icon: Car, price: "$8-12", eta: "3 min", color: "text-primary" },
  { id: "premium", label: "Premium", icon: Sparkles, price: "$14-18", eta: "5 min", color: "text-amber-500" },
  { id: "elite", label: "Elite", icon: Crown, price: "$22-28", eta: "8 min", color: "text-violet-500" },
  { id: "shared", label: "Shared", icon: Users, price: "$5-7", eta: "6 min", color: "text-emerald-500" },
];

interface RideMapPreviewProps {
  pickup?: string;
  dropoff?: string;
  onSelectVehicle?: (id: string) => void;
}

export default function RideMapPreview({ pickup = "123 Main St", dropoff = "Airport Terminal B", onSelectVehicle }: RideMapPreviewProps) {
  const [selected, setSelected] = useState("economy");
  const [pickupDrag, setPickupDrag] = useState({ x: 25, y: 72 });
  const [nearbyDrivers, setNearbyDrivers] = useState([
    { id: 1, x: 35, y: 55 },
    { id: 2, x: 55, y: 40 },
    { id: 3, x: 18, y: 48 },
  ]);

  // Animate nearby drivers
  useEffect(() => {
    const interval = setInterval(() => {
      setNearbyDrivers(prev => prev.map(d => ({
        ...d,
        x: d.x + (Math.random() - 0.5) * 2,
        y: d.y + (Math.random() - 0.5) * 2,
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Map area */}
      <div className="relative h-56 rounded-2xl bg-gradient-to-br from-[hsl(var(--muted)/0.4)] to-[hsl(var(--muted)/0.2)] border border-border/40 overflow-hidden shadow-lg">
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="currentColor" strokeWidth="0.3" className="text-foreground" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="currentColor" strokeWidth="0.3" className="text-foreground" />
          ))}
        </svg>

        {/* Route line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d={`M ${pickupDrag.x} ${pickupDrag.y} C ${pickupDrag.x + 15} ${pickupDrag.y - 15}, 60 30, 78 22`}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d={`M ${pickupDrag.x} ${pickupDrag.y} C ${pickupDrag.x + 15} ${pickupDrag.y - 15}, 60 30, 78 22`}
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeDasharray="3 3"
            fill="none"
            opacity={0.3}
          />
        </svg>

        {/* Pickup pin — draggable concept */}
        <motion.div
          className="absolute z-20 cursor-grab active:cursor-grabbing"
          style={{ left: `${pickupDrag.x}%`, top: `${pickupDrag.y}%` }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="relative -translate-x-1/2 -translate-y-full">
            <div className="w-8 h-8 rounded-full bg-emerald-500 border-3 border-card shadow-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rotate-45" />
            <motion.div
              animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-emerald-500/20"
            />
          </div>
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[8px] font-bold text-foreground bg-card/90 px-1.5 py-0.5 rounded whitespace-nowrap">
            Drag to adjust
          </span>
        </motion.div>

        {/* Dropoff */}
        <div className="absolute z-10" style={{ left: "78%", top: "22%" }}>
          <div className="-translate-x-1/2 -translate-y-full">
            <div className="w-7 h-7 rounded-full bg-red-500 border-2 border-card shadow-lg flex items-center justify-center">
              <Navigation className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Nearby drivers */}
        {nearbyDrivers.map(driver => (
          <motion.div
            key={driver.id}
            className="absolute z-10"
            animate={{ left: `${driver.x}%`, top: `${driver.y}%` }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <div className="w-6 h-6 rounded-full bg-primary/80 border-2 border-card flex items-center justify-center shadow-md">
              <Car className="w-3 h-3 text-primary-foreground" />
            </div>
          </motion.div>
        ))}

        {/* Top info */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
          <Badge className="bg-card/90 text-foreground border-0 text-[10px] font-bold shadow-sm backdrop-blur-sm">
            {nearbyDrivers.length} drivers nearby
          </Badge>
          <Badge className="bg-card/90 text-foreground border-0 text-[10px] font-bold shadow-sm backdrop-blur-sm">
            ~4.2 mi
          </Badge>
        </div>
      </div>

      {/* Route summary */}
      <div className="rounded-xl bg-card border border-border/40 p-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div className="w-0.5 h-6 bg-border/40" />
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-[9px] text-muted-foreground">PICKUP</p>
              <p className="text-xs font-bold text-foreground">{pickup}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground">DROPOFF</p>
              <p className="text-xs font-bold text-foreground">{dropoff}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle type selector */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Choose Your Ride</h3>
        {vehicleTypes.map(v => {
          const Icon = v.icon;
          const isSelected = selected === v.id;
          return (
            <button
              key={v.id}
              onClick={() => { setSelected(v.id); onSelectVehicle?.(v.id); }}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all active:scale-[0.98]",
                isSelected ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border/40 bg-card hover:border-primary/15"
              )}
            >
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", isSelected ? "bg-primary/10" : "bg-muted/30")}>
                <Icon className={cn("w-5 h-5", isSelected ? v.color : "text-muted-foreground")} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-foreground">{v.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{v.eta}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-black", isSelected ? "text-primary" : "text-foreground")}>{v.price}</p>
              </div>
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <ChevronRight className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
