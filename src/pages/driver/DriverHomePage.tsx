import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, MapPin, Star, Clock, DollarSign, ChevronRight, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DriverOnlineToggle from "@/components/driver/DriverOnlineToggle";
import DriverNotificationBell from "@/components/driver/DriverNotificationBell";
import { 
  useDriverProfile, 
  useUpdateDriverStatus,
  useDriverLocationTracking,
  useDriverActiveTrip 
} from "@/hooks/useDriverApp";
import { supabase } from "@/integrations/supabase/client";

const DriverHomePage = () => {
  const navigate = useNavigate();
  const { data: driver, isLoading: isLoadingDriver, error } = useDriverProfile();
  const updateStatus = useUpdateDriverStatus();
  const { data: activeTrip } = useDriverActiveTrip(driver?.id);

  // Start location tracking when online
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

  // Redirect to active trip if exists
  useEffect(() => {
    if (activeTrip) {
      navigate("/driver/trips");
    }
  }, [activeTrip, navigate]);

  const handleToggleOnline = () => {
    if (!driver) return;
    updateStatus.mutate({
      driverId: driver.id,
      isOnline: !driver.is_online,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/driver/login");
  };

  if (isLoadingDriver) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="bg-zinc-900 border-white/10 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-white/60 mb-4">Unable to load driver profile.</p>
            <Button onClick={() => navigate("/driver/login")} variant="outline">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">ZIVO Driver</p>
              <p className="text-xs text-white/40">Ready to earn</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DriverNotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/driver/account")}
              className="text-white/60 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/60 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Driver Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarImage src={driver.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {driver.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{driver.full_name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{driver.rating?.toFixed(1) || "5.0"}</span>
                    </div>
                    <span className="text-white/40">•</span>
                    <span className="text-sm text-white/60">
                      {driver.total_trips || 0} trips
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle info */}
              <div className="mt-4 p-3 bg-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-sm text-white">
                      {driver.vehicle_model || driver.vehicle_type}
                    </p>
                    <p className="text-xs text-white/40">{driver.vehicle_plate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Online Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DriverOnlineToggle
            isOnline={driver.is_online ?? false}
            onToggle={handleToggleOnline}
            isLoading={updateStatus.isPending}
          />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-xl font-bold">$0.00</p>
              <p className="text-xs text-white/40">Today</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold">0h</p>
              <p className="text-xs text-white/40">Online</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xl font-bold">0</p>
              <p className="text-xs text-white/40">Trips</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* View Requests Button */}
        {driver.is_online && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => navigate("/driver/trips")}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-green-500"
            >
              View Ride Requests
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Offline message */}
        {!driver.is_online && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-8"
          >
            <p className="text-white/40">Go online to start receiving ride requests</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DriverHomePage;
