import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Navigation, 
  Star, 
  XCircle, 
  User,
  Car,
  Phone,
  Mail,
  Route,
  Timer,
  CreditCard,
  Calendar,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Trip, TripStatus } from "@/hooks/useTrips";

interface TripDetailsDialogProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (tripId: string, refund: boolean) => void;
  isCancelling?: boolean;
}

const statusConfig: Record<string, { class: string; label: string; gradient: string }> = {
  requested: { class: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Requested", gradient: "from-blue-500 to-blue-600" },
  accepted: { class: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", label: "Accepted", gradient: "from-indigo-500 to-indigo-600" },
  en_route: { class: "bg-purple-500/10 text-purple-500 border-purple-500/20", label: "En Route", gradient: "from-purple-500 to-purple-600" },
  arrived: { class: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20", label: "Arrived", gradient: "from-cyan-500 to-cyan-600" },
  in_progress: { class: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "In Progress", gradient: "from-amber-500 to-amber-600" },
  completed: { class: "bg-green-500/10 text-green-500 border-green-500/20", label: "Completed", gradient: "from-green-500 to-green-600" },
  cancelled: { class: "bg-red-500/10 text-red-500 border-red-500/20", label: "Cancelled", gradient: "from-red-500 to-red-600" },
};

const paymentConfig: Record<string, { class: string; label: string }> = {
  paid: { class: "bg-green-500/10 text-green-500 border-green-500/20", label: "Paid" },
  pending: { class: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Pending" },
  refunded: { class: "bg-gray-500/10 text-gray-500 border-gray-500/20", label: "Refunded" },
};

export const TripDetailsDialog = ({ 
  trip, 
  isOpen, 
  onClose, 
  onCancel,
  isCancelling 
}: TripDetailsDialogProps) => {
  if (!trip) return null;

  const status = statusConfig[trip.status || ""] || { class: "bg-gray-500/10 text-gray-500", label: trip.status || "Unknown", gradient: "from-gray-500 to-gray-600" };
  const payment = paymentConfig[trip.payment_status || ""] || { class: "bg-muted text-muted-foreground", label: trip.payment_status || "Unknown" };

  const canCancel = !["completed", "cancelled"].includes(trip.status || "");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-0 bg-gradient-to-br from-card/95 to-card backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header gradient bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", status.gradient)} />
        
        <DialogHeader className="pt-4">
          <DialogTitle className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shadow-lg", status.gradient)}>
              <Route className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Trip Details</span>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                ID: {trip.id.slice(0, 8)}...
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Status & Payment Badges */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Badge className={cn("border", status.class)}>{status.label}</Badge>
              <Badge className={cn("border", payment.class)}>{payment.label}</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(trip.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Rider & Driver Info */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-xl bg-gradient-to-br from-rides/10 to-rides/5 border border-rides/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-rides" />
                <span className="text-xs text-muted-foreground font-medium">Rider</span>
              </div>
              <p className="font-semibold text-sm truncate">{trip.rider_id?.slice(0, 12) || "N/A"}...</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">Driver</span>
              </div>
              <p className="font-semibold text-sm truncate">
                {trip.driver?.full_name || "Unassigned"}
              </p>
            </motion.div>
          </div>

          {/* Route Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-muted/20 border border-border/50 space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-500 via-muted to-foreground/30 rounded-full" />
                <div className="w-5 h-5 rounded-sm bg-foreground shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-sm bg-background" />
                </div>
              </div>
              <div className="flex-1 space-y-8">
                <div>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Pickup</p>
                  <p className="font-medium text-sm mt-1">{trip.pickup_address}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dropoff</p>
                  <p className="font-medium text-sm mt-1 text-muted-foreground">{trip.dropoff_address}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center group hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/10 transition-colors">
                <Navigation className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xl font-bold">{trip.distance_km || 0}</p>
              <p className="text-xs text-muted-foreground">km</p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center group hover:border-amber-500/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-500/10 transition-colors">
                <Timer className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
              </div>
              <p className="text-xl font-bold">{trip.duration_minutes || "—"}</p>
              <p className="text-xs text-muted-foreground">min</p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-center">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-emerald-500">{trip.fare_amount?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-muted-foreground">fare</p>
            </div>
          </motion.div>

          {/* Rating if exists */}
          {trip.rating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5 transition-colors",
                      i < trip.rating!
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Trip Rating</span>
            </motion.div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          {canCancel && onCancel && (
            <Button 
              variant="destructive"
              onClick={() => onCancel(trip.id, true)}
              disabled={isCancelling}
              className="gap-2 bg-gradient-to-r from-red-500 to-rose-500 hover:opacity-90"
            >
              <XCircle className="h-4 w-4" />
              {isCancelling ? "Cancelling..." : "Cancel & Refund"}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TripDetailsDialog;
