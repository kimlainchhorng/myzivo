import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Navigation, 
  Star, 
  Download, 
  Share2, 
  CheckCircle2,
  CreditCard,
  Receipt,
  Car,
  Shield,
  Sparkles
} from "lucide-react";
import { Trip } from "@/hooks/useTrips";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TripReceiptModalProps {
  trip: Trip & { driver?: { full_name: string; vehicle_model: string; vehicle_plate: string } | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TripReceiptModal = ({ trip, open, onOpenChange }: TripReceiptModalProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const baseFare = (trip.fare_amount || 0) * 0.6;
  const distanceFare = (trip.fare_amount || 0) * 0.3;
  const timeFare = (trip.fare_amount || 0) * 0.1;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        
        <DialogHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Trip Receipt</DialogTitle>
              <p className="text-sm text-muted-foreground">Thank you for riding with ZIVO</p>
            </div>
          </div>
        </DialogHeader>

        <motion.div 
          className="space-y-5 relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Trip Date & Time - Enhanced */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-4 text-sm bg-muted/30 rounded-xl p-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="font-medium">{formatDate(trip.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="font-medium">{formatTime(trip.created_at)}</span>
            </div>
          </motion.div>

          {/* Locations - Premium Design */}
          <motion.div 
            variants={itemVariants}
            className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-muted/50 to-muted/20 p-4 overflow-hidden"
          >
            {/* Decorative line */}
            <div className="absolute left-[26px] top-[52px] bottom-[52px] w-0.5 bg-gradient-to-b from-emerald-500 via-muted to-primary" />
            
            <div className="space-y-5">
              <div className="flex items-start gap-3 relative">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-emerald-500/20 z-10">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Pickup</p>
                  <p className="text-sm font-semibold truncate">{trip.pickup_address}</p>
                  {trip.started_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">{formatTime(trip.started_at)}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3 relative">
                <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center ring-4 ring-primary/20 z-10">
                  <div className="w-2 h-2 bg-white rounded-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Dropoff</p>
                  <p className="text-sm font-semibold truncate">{trip.dropoff_address}</p>
                  {trip.completed_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">{formatTime(trip.completed_at)}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Driver Info - Enhanced */}
          {trip.driver && (
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/50"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">{trip.driver.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {trip.driver.vehicle_model} • {trip.driver.vehicle_plate}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1.5 rounded-lg">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="text-sm font-bold">4.9</span>
              </div>
            </motion.div>
          )}

          {/* Trip Stats - Premium Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-3"
          >
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{trip.distance_km?.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground font-medium">kilometers</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{trip.duration_minutes}</p>
              <p className="text-xs text-muted-foreground font-medium">minutes</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{trip.rating || "—"}</p>
              <p className="text-xs text-muted-foreground font-medium">rating</p>
            </div>
          </motion.div>

          <Separator className="bg-border/50" />

          {/* Fare Breakdown - Premium */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Fare Breakdown</h4>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-muted-foreground">Base fare</span>
                <span className="font-medium">${baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-muted-foreground">Distance ({trip.distance_km?.toFixed(1)} km)</span>
                <span className="font-medium">${distanceFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-muted-foreground">Time ({trip.duration_minutes} min)</span>
                <span className="font-medium">${timeFare.toFixed(2)}</span>
              </div>
              <Separator className="my-2 bg-border/50" />
              <div className="flex justify-between items-center py-2 bg-primary/5 -mx-2 px-4 rounded-xl">
                <span className="font-bold text-base">Total</span>
                <span className="text-2xl font-bold text-primary">${trip.fare_amount?.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Status - Enhanced */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                  Payment {trip.payment_status}
                </p>
                <p className="text-xs text-muted-foreground">Visa ending in 4242</p>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </motion.div>

          {/* Security Notice */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Your payment info is encrypted and secure</span>
          </motion.div>

          {/* Actions - Enhanced */}
          <motion.div variants={itemVariants} className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl border-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl border-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TripReceiptModal;
