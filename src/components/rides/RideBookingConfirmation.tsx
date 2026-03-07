/**
 * RideBookingConfirmation — Premium confirmation screen after booking
 * Animated success state with trip details, driver assignment, and actions
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, MapPin, Car, Star, Clock, Share2, Bell, Calendar, Copy, Navigation, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ConfirmationProps {
  pickup?: string;
  dropoff?: string;
  vehicleType?: string;
  price?: string;
  eta?: string;
  onTrackRide?: () => void;
  onAddToCalendar?: () => void;
}

export default function RideBookingConfirmation({
  pickup = "123 Main Street",
  dropoff = "Airport Terminal B",
  vehicleType = "Standard",
  price = "$16.29",
  eta = "3-5 min",
  onTrackRide,
  onAddToCalendar,
}: ConfirmationProps) {
  const [step, setStep] = useState<"success" | "assigning" | "assigned">("success");

  useEffect(() => {
    const t1 = setTimeout(() => setStep("assigning"), 1500);
    const t2 = setTimeout(() => setStep("assigned"), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="space-y-5">
      {/* Success animation */}
      <AnimatePresence mode="wait">
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <h2 className="text-xl font-black text-foreground">Ride Confirmed!</h2>
            <p className="text-sm text-muted-foreground">Finding the best driver for you</p>
          </motion.div>
        )}

        {step === "assigning" && (
          <motion.div
            key="assigning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-muted border-t-primary"
            />
            <p className="text-sm font-bold text-foreground">Matching you with a driver...</p>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === "assigned" && (
          <motion.div
            key="assigned"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Driver card */}
            <div className="rounded-2xl bg-card border border-primary/20 p-4 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-14 h-14 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">MT</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-foreground">Marcus T.</span>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[9px] font-bold">Matched</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-foreground">4.92</span>
                    <span className="text-xs text-muted-foreground">· 2,847 trips</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Arriving in</p>
                  <p className="text-lg font-black text-primary">{eta}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30">
                <Car className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Silver Toyota Camry</span>
                <Badge variant="outline" className="text-[9px] font-bold h-5 ml-auto">ABC 1234</Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip summary */}
      <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Trip Details</h3>
        <div className="space-y-2.5">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Pickup</p>
              <p className="text-xs font-medium text-foreground">{pickup}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center mt-0.5 shrink-0">
              <div className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Dropoff</p>
              <p className="text-xs font-medium text-foreground">{dropoff}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">{vehicleType}</span>
          </div>
          <span className="text-base font-black text-foreground">{price}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={onTrackRide}
          className="w-full h-12 text-sm font-bold gap-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/20"
        >
          <Navigation className="w-4 h-4" /> Track Your Ride
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-10 text-xs rounded-xl"
            onClick={() => { navigator.clipboard.writeText(`Ride to ${dropoff} • ETA ${eta}`); toast.success("Trip details copied!"); }}
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share ETA
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 text-xs rounded-xl"
            onClick={onAddToCalendar}
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" /> Add to Calendar
          </Button>
        </div>
      </div>
    </div>
  );
}
