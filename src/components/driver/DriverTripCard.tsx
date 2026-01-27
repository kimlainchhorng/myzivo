import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, DollarSign, User, Sparkles, Zap, Timer, TrendingUp, ChevronRight, Star, Shield, ArrowRight } from "lucide-react";
import { Trip } from "@/hooks/useTrips";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DriverTripCardProps {
  trip: Trip;
  onAccept?: () => void;
  isAccepting?: boolean;
  showAcceptButton?: boolean;
}

const DriverTripCard = ({ trip, onAccept, isAccepting, showAcceptButton = true }: DriverTripCardProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const estimatedEarnings = trip.fare_amount || 0;
  const isHighValue = estimatedEarnings >= 20;
  const isUrgent = trip.created_at && (Date.now() - new Date(trip.created_at).getTime()) < 60000;
  const hourlyRate = trip.duration_minutes ? (estimatedEarnings / trip.duration_minutes * 60) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      whileHover={{ y: -4 }}
    >
      <Card className={cn(
        "overflow-hidden border-0 bg-gradient-to-br from-card/98 via-card/95 to-card/90 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group rounded-3xl",
        isHighValue && "ring-2 ring-amber-500/50 shadow-amber-500/10",
        isUrgent && "ring-2 ring-primary/50 shadow-primary/10"
      )}>
        {/* Premium Top Bar */}
        <AnimatePresence>
          {(isHighValue || isUrgent) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "px-5 py-3 flex items-center justify-between",
                isHighValue ? "bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent" : "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent"
              )}
            >
              <div className="flex items-center gap-2">
                {isHighValue && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    <Badge className="bg-gradient-to-r from-amber-500/25 to-amber-500/15 text-amber-500 border-amber-500/30 border shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      High Value
                    </Badge>
                  </motion.div>
                )}
                {isUrgent && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <Badge className="bg-gradient-to-r from-primary/25 to-primary/15 text-primary border-primary/30 border shadow-lg animate-pulse">
                      <Zap className="w-3 h-3 mr-1" />
                      New Request
                    </Badge>
                  </motion.div>
                )}
              </div>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-muted-foreground font-medium"
              >
                {formatTime(trip.created_at)}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-5">
          {/* Header with User & Fare */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-teal-400 flex items-center justify-center shadow-xl shadow-primary/40"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <User className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <p className="font-bold text-lg">Trip Request</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <Timer className="w-3.5 h-3.5" />
                  <span>{formatTime(trip.created_at)}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>4.8</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <motion.div 
                className="inline-flex items-center gap-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                  ${estimatedEarnings.toFixed(2)}
                </span>
              </motion.div>
              {hourlyRate > 0 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1"
                >
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="font-semibold">${hourlyRate.toFixed(0)}/hr</span>
                </motion.p>
              )}
            </div>
          </div>

          {/* Route with Premium Design */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative p-5 rounded-3xl bg-gradient-to-br from-muted/40 via-muted/20 to-muted/10 border border-white/10 mb-5 overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
            
            <div className="space-y-5 relative">
              {/* Pickup */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/40 flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </motion.div>
                  <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-500 via-muted to-foreground/40 rounded-full" />
                </div>
                <div className="flex-1 min-w-0 -mt-0.5">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Pickup</p>
                  <p className="font-semibold text-sm leading-tight truncate">{trip.pickup_address}</p>
                </div>
              </div>
              
              {/* Dropoff */}
              <div className="flex items-start gap-4">
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="w-5 h-5 rounded-lg bg-gradient-to-br from-foreground to-foreground/80 shadow-lg flex items-center justify-center"
                >
                  <div className="w-2 h-2 rounded-sm bg-background" />
                </motion.div>
                <div className="flex-1 min-w-0 -mt-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Dropoff</p>
                  <p className="font-semibold text-sm text-muted-foreground leading-tight truncate">{trip.dropoff_address}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-5"
          >
            {[
              { icon: Navigation, value: `${trip.distance_km?.toFixed(1)} km`, color: "primary", gradient: "from-primary/20 to-primary/5" },
              { icon: Clock, value: `${trip.duration_minutes} min`, color: "amber-500", gradient: "from-amber-500/20 to-amber-500/5" },
              { icon: DollarSign, value: `$${hourlyRate.toFixed(0)}/hr`, color: "emerald-500", gradient: "from-emerald-500/20 to-emerald-500/5", highlight: true },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -2, scale: 1.02 }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all",
                  `bg-gradient-to-br ${stat.gradient}`,
                  stat.highlight ? "border-emerald-500/30" : "border-white/10"
                )}
              >
                <stat.icon className={cn("w-4 h-4", `text-${stat.color}`)} />
                <span className={cn(
                  "text-sm font-bold",
                  stat.highlight && "text-emerald-600 dark:text-emerald-400"
                )}>{stat.value}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Safety & Trust indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mb-5 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified rider</span>
            </div>
            <span className="text-muted-foreground/30">•</span>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>4.8 rating</span>
            </div>
          </motion.div>

          {/* Accept Button */}
          {showAcceptButton && onAccept && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                className={cn(
                  "w-full h-16 rounded-2xl font-bold text-base transition-all relative overflow-hidden group",
                  "bg-gradient-to-r from-primary via-primary to-teal-400 shadow-xl shadow-primary/30",
                  "hover:shadow-2xl hover:shadow-primary/50 active:scale-[0.98]"
                )}
                onClick={onAccept}
                disabled={isAccepting}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                
                {isAccepting ? (
                  <div className="flex items-center gap-3 relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Accepting Trip...</span>
                  </div>
                ) : (
                  <motion.div 
                    className="flex items-center gap-3 relative"
                    whileHover={{ x: 5 }}
                  >
                    <Zap className="w-5 h-5" />
                    <span>Accept Trip</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DriverTripCard;
