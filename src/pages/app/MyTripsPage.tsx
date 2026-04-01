/**
 * My Trips Page — 3D/4D Spatial UI
 */

import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ChevronRight,
  Plane, Car, UtensilsCrossed, Package, MapPin, BedDouble, Compass,
  CarFront, CarTaxiFront, Building2, CreditCard, type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnifiedTrips, type UnifiedTrip, type ServiceType } from "@/hooks/useUnifiedTrips";
import { getServiceMeta } from "@/hooks/useZivoWallet";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import PullToRefresh from "@/components/shared/PullToRefresh";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/* ── Bokeh Particle ── */
const BokehParticle = ({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, background: color, filter: `blur(${size * 0.4}px)` }}
    animate={{ opacity: [0.12, 0.35, 0.12], scale: [0.8, 1.2, 0.8], y: [0, -15, 0] }}
    transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

/* ── Glass Card ── */
const GlassCard3D = ({ children, className = "", allowOverflow = false }: { children: React.ReactNode; className?: string; allowOverflow?: boolean }) => (
  <div className={`relative ${allowOverflow ? '' : 'overflow-hidden'} rounded-2xl ${className}`}>
    <div className="absolute inset-0 bg-card/65 backdrop-blur-2xl rounded-2xl" />
    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.015] rounded-2xl" />
    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />
    <div className="relative z-10">{children}</div>
  </div>
);

const serviceFilters: Array<{ id: ServiceType | "all"; label: string; icon?: React.ElementType }> = [
  { id: "all", label: "All" },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: BedDouble },
  { id: "p2p_cars", label: "Cars", icon: CarFront },
  { id: "rides", label: "Ride", icon: CarTaxiFront },
];

const statusFilters = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
];

const tripIconMap: Record<string, LucideIcon> = {
  "plane": Plane,
  "car": Car,
  "car-front": CarFront,
  "car-taxi-front": CarTaxiFront,
  "utensils-crossed": UtensilsCrossed,
  "package": Package,
  "building-2": Building2,
  "target": MapPin,
  "credit-card": CreditCard,
};

function TripCard({ trip, index }: { trip: UnifiedTrip; index: number }) {
  const meta = getServiceMeta(trip.service);
  const TripIcon = tripIconMap[trip.icon] || Plane;
  
  const statusStyles: Record<string, string> = {
    pending: "bg-amber-500/12 text-amber-600 border-amber-500/20",
    confirmed: "bg-sky-500/12 text-sky-600 border-sky-500/20",
    approved: "bg-sky-500/12 text-sky-600 border-sky-500/20",
    active: "bg-emerald-500/12 text-emerald-600 border-emerald-500/20",
    in_progress: "bg-emerald-500/12 text-emerald-600 border-emerald-500/20",
    completed: "bg-muted text-muted-foreground border-border/40",
    delivered: "bg-muted text-muted-foreground border-border/40",
    cancelled: "bg-destructive/12 text-destructive border-destructive/20",
    rejected: "bg-destructive/12 text-destructive border-destructive/20",
    cancel_requested: "bg-orange-500/12 text-orange-600 border-orange-500/20",
  };

  const detailPath = trip.orderNumber 
    ? `/my-trips/${trip.orderNumber}` 
    : undefined;

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 25, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, y: -3, rotateX: 1 }}
      whileTap={{ scale: 0.97 }}
      style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
    >
      <div className="relative rounded-2xl overflow-hidden shadow-lg shadow-primary/[0.06] ring-1 ring-border/20 group">
        {/* Glass layers */}
        <div className="absolute inset-0 bg-card/70 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.01]" />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />

        <div className="relative z-10 flex items-stretch">
          {/* Left accent */}
          <div className="w-1 bg-gradient-to-b from-primary via-primary/60 to-primary/20 shrink-0" />
          <div className="flex items-start gap-3.5 p-4 flex-1">
            {/* 3D Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/8 flex items-center justify-center shrink-0 mt-0.5 shadow-inner border border-primary/10">
              <TripIcon className="w-5.5 h-5.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-foreground">{trip.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{trip.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <Badge variant="outline" className={`text-[10px] font-bold border rounded-full px-2 ${statusStyles[trip.status] || 'bg-muted text-muted-foreground border-border/40'}`}>
                  {trip.status.replace(/_/g, " ")}
                </Badge>
                <span className="text-[10px] text-muted-foreground/60 font-medium">
                  {format(new Date(trip.date), "MMM d, yyyy")}
                </span>
              </div>
              
              <div className="mt-2.5 pt-2.5 border-t border-border/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{meta.label}</span>
                <span className="font-bold text-foreground">${trip.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return detailPath ? <Link to={detailPath}>{cardContent}</Link> : cardContent;
}

export default function MyTripsPage() {
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: trips, isLoading, refetch } = useUnifiedTrips({
    services: serviceFilter === "all" ? undefined : [serviceFilter],
    status: statusFilter as any,
    limit: 50,
  });

  const handlePullRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      {/* ── 3D Background ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <img
          src="/images/trips-bg-3d.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.1]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-primary/[0.03]" />
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/[0.06] blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-primary/[0.04] blur-[80px]" />
        <BokehParticle delay={0} size={50} x="10%" y="15%" color="hsl(var(--primary) / 0.07)" />
        <BokehParticle delay={1.5} size={35} x="80%" y="25%" color="hsl(var(--primary) / 0.05)" />
        <BokehParticle delay={2.8} size={60} x="85%" y="60%" color="hsl(var(--primary) / 0.04)" />
        <BokehParticle delay={0.8} size={40} x="15%" y="70%" color="hsl(var(--primary) / 0.06)" />
        <BokehParticle delay={3.2} size={30} x="55%" y="85%" color="hsl(var(--primary) / 0.05)" />
      </div>

      {/* ── Scrollable Content ── */}
      <PullToRefresh onRefresh={handlePullRefresh} className="relative z-10 h-screen">
        <div className="pb-24 scroll-smooth" style={{ scrollbarWidth: "none" }}>
...
          </div>
        </div>
      </PullToRefresh>

      <MobileBottomNav />
    </div>
  );
}
