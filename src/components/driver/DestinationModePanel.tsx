/**
 * Destination Mode Panel
 * Allows drivers to set a preferred destination and see matching progress
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, MapPin, X, Clock, ChevronRight, Compass, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useActiveDestinationSession,
  useDestinationModeUsageToday,
  useStartDestinationMode,
  useEndDestinationMode,
} from "@/hooks/useDriverDestinationMode";

interface DestinationModePanelProps {
  driverId: string | undefined;
  isOnline: boolean;
  className?: string;
}

const DestinationModePanel = ({ driverId, isOnline, className }: DestinationModePanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [address, setAddress] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { data: activeSession } = useActiveDestinationSession(driverId);
  const { data: usageToday = 0 } = useDestinationModeUsageToday(driverId);
  const startMode = useStartDestinationMode();
  const endMode = useEndDestinationMode();

  const maxDailyUses = 2;
  const canActivate = isOnline && !activeSession && usageToday < maxDailyUses;

  const handleSetDestination = () => {
    if (!driverId || !address.trim()) return;

    // Use a simple geocode approximation — in production this would call the maps API
    // For now, start with dummy coords that get replaced by actual map input
    const coords = destinationCoords || { lat: 40.7128, lng: -74.006 };

    startMode.mutate({
      driverId,
      destinationLat: coords.lat,
      destinationLng: coords.lng,
      destinationAddress: address,
    });

    setIsExpanded(false);
    setAddress("");
  };

  const handleEndMode = () => {
    if (activeSession) {
      endMode.mutate(activeSession.id);
    }
  };

  if (!isOnline) return null;

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        {activeSession ? (
          // Active destination mode card
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="bg-gradient-to-br from-emerald-900/40 to-zinc-900 border-emerald-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Navigation className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Destination Mode</p>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] mt-0.5">
                        <Zap className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEndMode}
                    disabled={endMode.isPending}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-1" />
                    End
                  </Button>
                </div>

                {/* Destination info */}
                <div className="p-3 bg-white/5 rounded-xl flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {activeSession.destination_address || "Set destination"}
                    </p>
                    {activeSession.target_arrival_time && (
                      <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Target: {new Date(activeSession.target_arrival_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                  <span>{activeSession.trips_completed} trips toward destination</span>
                  <span>{usageToday}/{maxDailyUses} uses today</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Inactive — toggle button and form
          <motion.div
            key="inactive"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {!isExpanded ? (
              <Card
                className={cn(
                  "border-white/10 cursor-pointer transition-colors",
                  canActivate
                    ? "bg-zinc-900/80 hover:bg-zinc-800/80"
                    : "bg-zinc-900/40 opacity-50 cursor-not-allowed"
                )}
                onClick={() => canActivate && setIsExpanded(true)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Compass className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Destination Mode</p>
                      <p className="text-xs text-white/50">
                        {canActivate
                          ? "Get trips toward your destination"
                          : usageToday >= maxDailyUses
                            ? "Daily limit reached"
                            : "Go online to use"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] bg-white/5 text-white/40">
                      {usageToday}/{maxDailyUses}
                    </Badge>
                    {canActivate && <ChevronRight className="w-4 h-4 text-white/30" />}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-zinc-900/80 border-white/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-sm">Set Destination</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                      className="text-white/60 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Where are you heading?"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>

                  <Button
                    onClick={handleSetDestination}
                    disabled={!address.trim() || startMode.isPending}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    {startMode.isPending ? "Activating..." : "Activate Destination Mode"}
                  </Button>

                  <p className="text-[10px] text-white/30 text-center">
                    You'll receive trip requests heading toward your destination
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DestinationModePanel;
