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
  Sparkles,
  ArrowRight,
  Zap
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
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 bg-gradient-to-br from-card/98 via-card/95 to-card/90 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-3xl p-0">
        {/* Premium Header with gradient */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="p-6">
          <DialogHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg"
              >
                <Receipt className="w-7 h-7 text-primary" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold">Trip Receipt</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm text-muted-foreground">Completed successfully</p>
                </div>
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
              className="flex items-center gap-3 text-sm bg-gradient-to-r from-muted/50 to-muted/20 rounded-2xl p-4 border border-white/10"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-semibold">{formatDate(trip.created_at)}</p>
                </div>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-semibold">{formatTime(trip.created_at)}</p>
                </div>
              </div>
            </motion.div>

            {/* Locations - Premium Design */}
            <motion.div 
              variants={itemVariants}
              className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/10 p-5 overflow-hidden"
            >
              {/* Decorative line */}
              <div className="absolute left-[30px] top-[60px] bottom-[60px] w-0.5 bg-gradient-to-b from-emerald-500 via-primary/30 to-primary rounded-full" />
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 relative">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30 z-10"
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Pickup</p>
                    <p className="text-sm font-semibold leading-tight">{trip.pickup_address}</p>
                    {trip.started_at && (
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(trip.started_at)}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-4 relative">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center ring-4 ring-primary/20 shadow-lg shadow-primary/30 z-10"
                  >
                    <div className="w-2 h-2 bg-white rounded-sm" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Dropoff</p>
                    <p className="text-sm font-semibold leading-tight">{trip.dropoff_address}</p>
                    {trip.completed_at && (
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(trip.completed_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Driver Info - Enhanced */}
            {trip.driver && (
              <motion.div 
                variants={itemVariants}
                className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-gradient-to-r from-card/80 to-card/50"
              >
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                  >
                    <Car className="w-7 h-7 text-primary" />
                  </motion.div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full border-2 border-background flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg">{trip.driver.full_name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {trip.driver.vehicle_model} • {trip.driver.vehicle_plate}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/15 to-amber-500/5 px-3 py-2 rounded-xl border border-amber-500/20">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span className="text-base font-bold text-amber-500">4.9</span>
                </div>
              </motion.div>
            )}

            {/* Trip Stats - Premium Grid */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { icon: Navigation, value: trip.distance_km?.toFixed(1), label: "kilometers", color: "primary", gradient: "from-primary/20 to-primary/5" },
                { icon: Clock, value: trip.duration_minutes, label: "minutes", color: "amber-500", gradient: "from-amber-500/20 to-amber-500/5" },
                { icon: Star, value: trip.rating || "—", label: "rating", color: "amber-500", gradient: "from-amber-500/20 to-amber-500/5" },
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className={cn(
                    "text-center p-4 rounded-2xl bg-gradient-to-br border border-white/10 transition-all",
                    stat.gradient
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2",
                    `bg-${stat.color}/10`
                  )}>
                    <stat.icon className={cn("w-5 h-5", `text-${stat.color}`)} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <Separator className="bg-white/10" />

            {/* Fare Breakdown - Premium */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="font-bold">Fare Breakdown</h4>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Base fare", value: baseFare },
                  { label: `Distance (${trip.distance_km?.toFixed(1)} km)`, value: distanceFare },
                  { label: `Time (${trip.duration_minutes} min)`, value: timeFare },
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex justify-between items-center py-2 px-3 rounded-xl hover:bg-muted/20 transition-colors"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold">${item.value.toFixed(2)}</span>
                  </motion.div>
                ))}
                <Separator className="my-2 bg-white/10" />
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20"
                >
                  <span className="font-bold text-base">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                    ${trip.fare_amount?.toFixed(2)}
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Payment Status - Enhanced */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20"
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 flex items-center justify-center shadow-lg"
                >
                  <CreditCard className="w-6 h-6 text-emerald-500" />
                </motion.div>
                <div>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                    Payment {trip.payment_status}
                  </p>
                  <p className="text-xs text-muted-foreground">Visa ending in 4242</p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </motion.div>
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
                className="flex-1 h-14 rounded-2xl border-2 border-white/10 hover:bg-primary/5 hover:border-primary/30 transition-all group"
              >
                <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Download PDF
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-14 rounded-2xl border-2 border-white/10 hover:bg-primary/5 hover:border-primary/30 transition-all group"
              >
                <Share2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Share
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripReceiptModal;
