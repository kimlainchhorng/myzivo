/**
 * RideTripHistory — Trip list with filters, detailed cards, rebook, and dispute
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Car, Star, DollarSign, RotateCcw, AlertTriangle, ChevronRight, Filter, Search, Calendar, CheckCircle, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type TripStatus = "completed" | "cancelled" | "disputed";

interface Trip {
  id: string;
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
  driver: string;
  driverInitials: string;
  driverRating: number;
  vehicle: string;
  amount: number;
  distance: string;
  duration: string;
  status: TripStatus;
  rating?: number;
  paymentMethod: string;
}

const trips: Trip[] = [
  { id: "R-48291", date: "Mar 6", time: "2:34 PM", pickup: "123 Main St", dropoff: "Airport Terminal B", driver: "Marcus T.", driverInitials: "MT", driverRating: 4.92, vehicle: "Silver Camry", amount: 28.50, distance: "12.3 mi", duration: "24 min", status: "completed", rating: 5, paymentMethod: "Visa •••• 4242" },
  { id: "R-48285", date: "Mar 5", time: "8:15 AM", pickup: "Home", dropoff: "400 Tech Blvd", driver: "Sarah L.", driverInitials: "SL", driverRating: 4.88, vehicle: "Black Accord", amount: 14.20, distance: "4.8 mi", duration: "16 min", status: "completed", rating: 4, paymentMethod: "Visa •••• 4242" },
  { id: "R-48270", date: "Mar 4", time: "6:30 PM", pickup: "Downtown Gym", dropoff: "Home", driver: "David K.", driverInitials: "DK", driverRating: 4.95, vehicle: "White Model 3", amount: 11.25, distance: "3.2 mi", duration: "12 min", status: "completed", paymentMethod: "Wallet" },
  { id: "R-48260", date: "Mar 3", time: "9:00 AM", pickup: "Home", dropoff: "Conference Center", driver: "Ana R.", driverInitials: "AR", driverRating: 4.80, vehicle: "Gray Civic", amount: 0, distance: "6.1 mi", duration: "—", status: "cancelled", paymentMethod: "—" },
  { id: "R-48245", date: "Mar 1", time: "11:45 PM", pickup: "Restaurant Row", dropoff: "Home", driver: "James P.", driverInitials: "JP", driverRating: 4.70, vehicle: "Blue Sonata", amount: 18.75, distance: "7.4 mi", duration: "22 min", status: "disputed", paymentMethod: "Mastercard •••• 8888" },
];

const statusColors: Record<TripStatus, string> = {
  completed: "text-emerald-500 bg-emerald-500/10",
  cancelled: "text-muted-foreground bg-muted/30",
  disputed: "text-amber-500 bg-amber-500/10",
};

export default function RideTripHistory() {
  const [filter, setFilter] = useState<"all" | TripStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [disputeTrip, setDisputeTrip] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  const filtered = trips.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (searchQuery && !t.pickup.toLowerCase().includes(searchQuery.toLowerCase()) && !t.dropoff.toLowerCase().includes(searchQuery.toLowerCase()) && !t.driver.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleRebook = (trip: Trip) => {
    toast.success(`Rebooking: ${trip.pickup} → ${trip.dropoff}`);
  };

  const handleDispute = (tripId: string) => {
    if (!disputeReason.trim()) { toast.error("Please describe the issue"); return; }
    toast.success("Dispute submitted. We'll review within 24 hours.");
    setDisputeTrip(null);
    setDisputeReason("");
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search trips..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-10 pl-10 rounded-xl text-xs bg-muted/30 border-border/30" />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {(["all", "completed", "cancelled", "disputed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold capitalize shrink-0 transition-all", filter === f ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground")}>
            {f === "all" ? `All (${trips.length})` : `${f} (${trips.filter(t => t.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Trip list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <Car className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No trips found</p>
          </div>
        ) : filtered.map(trip => (
          <div key={trip.id} className="rounded-2xl bg-card border border-border/40 overflow-hidden">
            {/* Trip summary row */}
            <button onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)} className="w-full flex items-center gap-3 p-3.5 text-left active:bg-muted/10 transition-colors">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{trip.driverInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground truncate">{trip.pickup} → {trip.dropoff}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{trip.date} · {trip.time}</span>
                  <Badge className={cn("text-[8px] font-bold capitalize border-0", statusColors[trip.status])}>
                    {trip.status}
                  </Badge>
                </div>
              </div>
              <div className="text-right shrink-0">
                {trip.amount > 0 && <p className="text-sm font-black text-foreground">${trip.amount.toFixed(2)}</p>}
                {trip.rating && (
                  <div className="flex items-center gap-0.5 justify-end">
                    {Array.from({ length: trip.rating }).map((_, i) => (
                      <Star key={i} className="w-2 h-2 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                )}
              </div>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0", expandedTrip === trip.id && "rotate-180")} />
            </button>

            {/* Expanded details */}
            <AnimatePresence>
              {expandedTrip === trip.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-border/20 pt-3 space-y-3">
                    {/* Route */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></div>
                        <p className="text-xs text-foreground">{trip.pickup}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center mt-0.5 shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /></div>
                        <p className="text-xs text-foreground">{trip.dropoff}</p>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-muted/20 p-2 text-center">
                        <p className="text-xs font-bold text-foreground">{trip.distance}</p>
                        <p className="text-[9px] text-muted-foreground">Distance</p>
                      </div>
                      <div className="rounded-lg bg-muted/20 p-2 text-center">
                        <p className="text-xs font-bold text-foreground">{trip.duration}</p>
                        <p className="text-[9px] text-muted-foreground">Duration</p>
                      </div>
                      <div className="rounded-lg bg-muted/20 p-2 text-center">
                        <p className="text-xs font-bold text-foreground">{trip.vehicle}</p>
                        <p className="text-[9px] text-muted-foreground">Vehicle</p>
                      </div>
                    </div>

                    {/* Driver + payment */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Driver: <span className="font-bold text-foreground">{trip.driver}</span> ⭐ {trip.driverRating}</span>
                      <span className="text-muted-foreground">{trip.paymentMethod}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {trip.status === "completed" && (
                        <Button size="sm" className="flex-1 h-9 rounded-xl text-xs font-bold gap-1" onClick={() => handleRebook(trip)}>
                          <RotateCcw className="w-3 h-3" /> Rebook
                        </Button>
                      )}
                      {trip.status === "completed" && (
                        <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-bold gap-1 border-amber-500/20 text-amber-500" onClick={() => setDisputeTrip(trip.id)}>
                          <AlertTriangle className="w-3 h-3" /> Dispute
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-bold">
                        Receipt
                      </Button>
                    </div>

                    {/* Dispute form */}
                    <AnimatePresence>
                      {disputeTrip === trip.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2 mt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">Report an Issue</span>
                              <button onClick={() => setDisputeTrip(null)}><X className="w-3 h-3 text-muted-foreground" /></button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {["Wrong route", "Overcharged", "Safety concern", "Driver behavior", "Other"].map(r => (
                                <button key={r} onClick={() => setDisputeReason(r)} className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold transition-all", disputeReason === r ? "bg-amber-500 text-white" : "bg-muted/30 text-muted-foreground")}>
                                  {r}
                                </button>
                              ))}
                            </div>
                            <Button size="sm" className="w-full h-8 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600" onClick={() => handleDispute(trip.id)} disabled={!disputeReason}>
                              Submit Dispute
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
