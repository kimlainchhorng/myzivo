import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, DollarSign, User, Sparkles, Zap, Timer, TrendingUp, ChevronRight } from "lucide-react";
import { Trip } from "@/hooks/useTrips";
import { motion } from "framer-motion";
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      whileHover={{ y: -2 }}
    >
      <Card className={cn(
        "overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group",
        isHighValue && "ring-2 ring-amber-500/40",
        isUrgent && "ring-2 ring-primary/40"
      )}>
        {/* Premium Top Bar */}
        {(isHighValue || isUrgent) && (
          <div className={cn(
            "px-4 py-2 flex items-center justify-between",
            isHighValue ? "bg-gradient-to-r from-amber-500/10 to-transparent" : "bg-gradient-to-r from-primary/10 to-transparent"
          )}>
            <div className="flex items-center gap-2">
              {isHighValue && (
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 border">
                  <Sparkles className="w-3 h-3 mr-1" />
                  High Value
                </Badge>
              )}
              {isUrgent && (
                <Badge className="bg-primary/20 text-primary border-primary/30 border animate-pulse">
                  <Zap className="w-3 h-3 mr-1" />
                  New Request
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{formatTime(trip.created_at)}</span>
          </div>
        )}

        <CardContent className="p-4">
          {/* Header with User & Fare */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <User className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <p className="font-bold text-lg">Trip Request</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="w-3.5 h-3.5" />
                  <span>{formatTime(trip.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <motion.div 
                className="inline-flex items-center gap-1 text-2xl font-bold text-emerald-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <DollarSign className="w-5 h-5" />
                {estimatedEarnings.toFixed(2)}
              </motion.div>
              {hourlyRate > 0 && (
                <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  ${hourlyRate.toFixed(0)}/hr
                </p>
              )}
            </div>
          </div>

          {/* Route with Premium Design */}
          <div className="relative p-4 rounded-2xl bg-muted/20 border border-border/50 mb-4">
            <div className="space-y-4">
              {/* Pickup */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="w-0.5 h-10 bg-gradient-to-b from-emerald-500 via-muted to-foreground/30 rounded-full" />
                </div>
                <div className="flex-1 min-w-0 -mt-0.5">
                  <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Pickup</p>
                  <p className="font-medium text-sm truncate">{trip.pickup_address}</p>
                </div>
              </div>
              
              {/* Dropoff */}
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-sm bg-foreground shadow-lg flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-sm bg-background" />
                </div>
                <div className="flex-1 min-w-0 -mt-0.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Dropoff</p>
                  <p className="font-medium text-sm text-muted-foreground truncate">{trip.dropoff_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/30 border border-border/50">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">{trip.distance_km?.toFixed(1)} km</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/30 border border-border/50">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold">{trip.duration_minutes} min</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">${hourlyRate.toFixed(0)}/hr</span>
            </div>
          </div>

          {/* Accept Button */}
          {showAcceptButton && onAccept && (
            <Button 
              className={cn(
                "w-full h-14 rounded-2xl font-bold text-base transition-all",
                "bg-gradient-to-r from-primary to-teal-400 shadow-lg shadow-primary/30",
                "hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98]"
              )}
              onClick={onAccept}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Accepting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Accept Trip</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DriverTripCard;
