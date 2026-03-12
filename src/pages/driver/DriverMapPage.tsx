/**
 * DriverMapPage - Full-screen driver map with GPS tracking
 * Uses existing useDriverMapState hook and DriverMapHeader
 */
import { useState, useCallback } from "react";
import { useDriverMapState } from "@/hooks/useDriverMapState";
import DriverMapHeader from "@/components/driver/DriverMapHeader";
import DriverBottomNav from "@/components/driver/DriverBottomNav";
import { motion } from "framer-motion";
import { MapPin, Navigation, Loader2 } from "lucide-react";

export default function DriverMapPage() {
  const mapState = useDriverMapState();
  const [isOnline, setIsOnline] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const handleToggleOnline = useCallback(() => {
    setIsOnline(prev => !prev);
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Map Placeholder */}
      <div className="flex-1 relative bg-muted/30">
        {/* Simulated map background */}
        <div className="absolute inset-0 flex items-center justify-center">
          {mapState.locationError ? (
            <div className="text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Location Unavailable</h3>
              <p className="text-sm text-muted-foreground">
                Enable location services to use the driver map
              </p>
            </div>
          ) : (
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <Navigation className="w-8 h-8 text-primary" />
              </motion.div>
              <p className="text-sm text-muted-foreground">
                {mapState.driverLocation.lat.toFixed(4)}, {mapState.driverLocation.lng.toFixed(4)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Heading: {mapState.heading.toFixed(0)}° • Speed: {(mapState.speed * 2.237).toFixed(0)} mph
              </p>
            </div>
          )}
        </div>

        {/* Map Header Overlay */}
        <DriverMapHeader
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          onRecenter={mapState.recenter}
        />

        {/* Go Online/Offline bottom card */}
        <div className="absolute bottom-20 left-0 right-0 px-4 pointer-events-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleToggleOnline}
            className="w-full py-4 rounded-2xl font-bold text-base shadow-lg transition-all"
            style={{
              background: isOnline
                ? "hsl(var(--destructive))"
                : "linear-gradient(135deg, hsl(var(--primary)), hsl(152 55% 30%))",
              color: isOnline
                ? "hsl(var(--destructive-foreground))"
                : "hsl(var(--primary-foreground))",
              boxShadow: isOnline
                ? "0 8px 24px -8px hsl(var(--destructive) / 0.4)"
                : "0 8px 24px -8px hsl(var(--primary) / 0.4)",
            }}
          >
            {isOnline ? "Go Offline" : "Go Online"}
          </motion.button>
        </div>
      </div>

      <DriverBottomNav isOnline={isOnline} />
    </div>
  );
}
