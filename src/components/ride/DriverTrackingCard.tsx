/**
 * DriverTrackingCard - Real-time driver tracking display
 * 
 * Shows:
 * - Driver info (name, car, plate, rating)
 * - Live ETA countdown
 * - Distance to pickup
 * - Arrival status
 * - Connection indicator
 */

import { motion, AnimatePresence } from "framer-motion";
import { 
  Car, 
  Navigation, 
  Phone, 
  MessageSquare, 
  Star,
  CheckCircle2,
  Loader2,
  WifiOff
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NearbyDriver } from "@/hooks/useLiveDriverTracking";

interface DriverTrackingCardProps {
  driver: NearbyDriver | null;
  etaSeconds: number;
  distanceMiles: number;
  hasArrived: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
  onCall?: () => void;
  onMessage?: () => void;
  formatETA: (seconds: number) => string;
}

export function DriverTrackingCard({
  driver,
  etaSeconds,
  distanceMiles,
  hasArrived,
  isConnected,
  isReconnecting,
  onCall,
  onMessage,
  formatETA,
}: DriverTrackingCardProps) {
  if (!driver) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-zinc-100 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Connection Status Bar */}
      <AnimatePresence>
        {(!isConnected || isReconnecting) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2"
          >
            {isReconnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span className="text-xs text-amber-700">Reconnecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-amber-700">Connection lost</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arrival Status Banner */}
      <AnimatePresence>
        {hasArrived && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-green-500 px-4 py-3 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">Driver has arrived!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver Info */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="w-14 h-14 border-2 border-zinc-100">
            <AvatarImage src={driver.avatarUrl || undefined} alt={driver.name} />
            <AvatarFallback className="bg-zinc-100 text-zinc-600 text-lg font-semibold">
              {driver.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-zinc-900 truncate">{driver.name}</h3>
              {driver.rating && (
                <div className="flex items-center gap-0.5 bg-zinc-100 px-1.5 py-0.5 rounded-full">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-medium text-zinc-700">{driver.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Car className="w-4 h-4" />
              <span className="truncate">
                {driver.vehicleModel || driver.vehicleType} • {driver.plate}
              </span>
            </div>
          </div>

          {/* ETA Badge */}
          {!hasArrived && (
            <motion.div
              key={etaSeconds}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center justify-center bg-zinc-900 text-white px-3 py-2 rounded-xl"
            >
              <span className="text-lg font-bold leading-tight">{formatETA(etaSeconds)}</span>
              <span className="text-[10px] uppercase tracking-wide text-zinc-400">away</span>
            </motion.div>
          )}
        </div>

        {/* Distance Info */}
        {!hasArrived && (
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
            <Navigation className="w-4 h-4" />
            <span>{distanceMiles.toFixed(1)} miles to pickup</span>
            <motion.div
              className="w-1.5 h-1.5 bg-green-500 rounded-full ml-auto"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs text-green-600">Live tracking</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 rounded-xl active:scale-[0.97] transition-all duration-200 touch-manipulation"
            onClick={onCall}
          >
            <Phone className="w-4 h-4" />
            Call
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 rounded-xl active:scale-[0.97] transition-all duration-200 touch-manipulation"
            onClick={onMessage}
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default DriverTrackingCard;
