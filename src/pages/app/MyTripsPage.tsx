/**
 * My Trips Page — Premium 2026
 * Unified view of all bookings across ZIVO services
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Calendar, ChevronRight,
  Plane, Car, UtensilsCrossed, Package, MapPin, BedDouble, Compass,
  CarFront, CarTaxiFront, Building2, CreditCard, type LucideIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnifiedTrips, type UnifiedTrip, type ServiceType } from "@/hooks/useUnifiedTrips";
import { getServiceMeta } from "@/hooks/useZivoWallet";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { format } from "date-fns";

const serviceFilters: Array<{ id: ServiceType | "all"; label: string; icon?: React.ElementType; color?: string }> = [
  { id: "all", label: "All" },
  { id: "flights", label: "Flights", icon: Plane, color: "bg-sky-500" },
  { id: "hotels", label: "Hotels", icon: BedDouble, color: "bg-amber-500" },
  { id: "p2p_cars", label: "Cars", icon: Car, color: "bg-emerald-500" },
  { id: "rides", label: "Rides", icon: MapPin, color: "bg-primary" },
  { id: "eats", label: "Eats", icon: UtensilsCrossed, color: "bg-orange-500" },
  { id: "move", label: "Move", icon: Package, color: "bg-violet-500" },
];

const statusFilters = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
];

// Map trip.icon string to Lucide icon component
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
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    confirmed: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    approved: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    in_progress: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    completed: "bg-muted text-muted-foreground border-border/50",
    delivered: "bg-muted text-muted-foreground border-border/50",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    cancel_requested: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  };

  const detailPath = trip.orderNumber 
    ? `/my-trips/${trip.orderNumber}` 
    : undefined;

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-border/40 hover:border-primary/15 overflow-hidden group">
        <CardContent className="p-0">
          <div className="flex items-stretch">
            {/* Left accent */}
            <div className="w-1 bg-gradient-to-b from-primary/60 to-primary/20 shrink-0" />
            <div className="flex items-start gap-4 p-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <TripIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-foreground">{trip.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{trip.subtitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1 group-hover:text-primary transition-colors" />
                </div>
                
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] font-bold border ${statusStyles[trip.status] || 'bg-muted text-muted-foreground border-border/50'}`}>
                    {trip.status.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(trip.date), "MMM d, yyyy")}
                  </span>
                </div>
                
                <div className="mt-2.5 pt-2.5 border-t border-border/30 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{meta.label}</span>
                  <span className="font-bold text-foreground">${trip.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return detailPath ? <Link to={detailPath}>{cardContent}</Link> : cardContent;
}

export default function MyTripsPage() {
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: trips, isLoading } = useUnifiedTrips({
    services: serviceFilter === "all" ? undefined : [serviceFilter],
    status: statusFilter as any,
    limit: 50,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="rounded-xl -ml-1" aria-label="Go back">
              <Link to="/app">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">My Trips</h1>
              <p className="text-xs text-muted-foreground">All your bookings in one place</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[65px] z-30 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 py-3 space-y-3">
          {/* Service Filter - Premium chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {serviceFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setServiceFilter(filter.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 touch-manipulation active:scale-95 ${
                  serviceFilter === filter.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card border border-border/50 text-muted-foreground hover:border-primary/20"
                }`}
              >
                {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
                {filter.label}
              </button>
            ))}
          </div>

          {/* Status Filter - Premium pills */}
          <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`flex-1 text-[11px] font-bold py-2 rounded-xl transition-all duration-200 touch-manipulation ${
                  statusFilter === filter.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="space-y-3">
            {trips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/30">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-bold text-lg mb-1">No trips found</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {statusFilter !== "all" 
                    ? `No ${statusFilter} trips in ${serviceFilter === "all" ? "any service" : serviceFilter}`
                    : "Start booking to see your trips here"}
                </p>
                <Button asChild className="rounded-xl h-11 font-bold shadow-md shadow-primary/20">
                  <Link to="/app">Explore Services</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
