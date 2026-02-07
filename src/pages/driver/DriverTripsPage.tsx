import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Car, Radio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripRequestCard from "@/components/driver/TripRequestCard";
import ActiveTripCard from "@/components/driver/ActiveTripCard";
import {
  useDriverProfile,
  useAvailableTripRequests,
  useDriverActiveTrip,
  useAcceptTrip,
  useUpdateTripStatus,
  useAvailableTripsRealtime,
  useDriverLocationTracking,
} from "@/hooks/useDriverApp";
import { useDriverTripRealtime } from "@/hooks/useTripRealtime";
import { supabase } from "@/integrations/supabase/client";

const DriverTripsPage = () => {
  const navigate = useNavigate();
  const { data: driver, isLoading: isLoadingDriver } = useDriverProfile();
  const { data: availableTrips, isLoading: isLoadingTrips } = useAvailableTripRequests(
    driver?.is_online ?? false
  );
  const { data: activeTrip } = useDriverActiveTrip(driver?.id);
  const acceptTrip = useAcceptTrip();
  const updateTripStatus = useUpdateTripStatus();

  // Enable realtime subscriptions
  useAvailableTripsRealtime(driver?.is_online ?? false);
  useDriverTripRealtime(driver?.id);
  useDriverLocationTracking(driver?.id, driver?.is_online ?? false);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/driver/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAcceptTrip = (tripId: string) => {
    if (!driver) return;
    acceptTrip.mutate({ tripId, driverId: driver.id });
  };

  const handleUpdateStatus = (tripId: string, status: string) => {
    updateTripStatus.mutate({ tripId, status });
    
    if (status === "completed" || status === "cancelled") {
      // Stay on trips page to see new requests
    }
  };

  if (isLoadingDriver) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!driver) {
    navigate("/driver/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/driver")}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="font-bold text-lg">Ride Requests</p>
            <p className="text-xs text-white/40">
              {activeTrip ? "Active trip in progress" : "Waiting for requests..."}
            </p>
          </div>
          {driver.is_online && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full"
            >
              <Radio className="w-3 h-3 text-green-400" />
              <span className="text-xs font-medium text-green-400">Online</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Active Trip */}
        {activeTrip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Active Trip
              </h2>
            </div>
            <ActiveTripCard
              trip={activeTrip}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updateTripStatus.isPending}
            />
          </motion.div>
        )}

        {/* Available Requests */}
        {!activeTrip && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Available Requests</h2>
              <span className="text-sm text-white/40">
                {availableTrips?.length || 0} nearby
              </span>
            </div>

            {isLoadingTrips ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : availableTrips && availableTrips.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {availableTrips.map((trip) => (
                  <TripRequestCard
                    key={trip.id}
                    trip={trip}
                    onAccept={handleAcceptTrip}
                    isAccepting={acceptTrip.isPending}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center"
                >
                  <Car className="w-10 h-10 text-white/20" />
                </motion.div>
                <p className="text-white/40 mb-2">No ride requests nearby</p>
                <p className="text-sm text-white/20">
                  New requests will appear here automatically
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* Offline warning */}
        {!driver.is_online && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
          >
            <p className="text-yellow-400 text-sm text-center">
              You're offline. Go online from the home screen to receive requests.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DriverTripsPage;
