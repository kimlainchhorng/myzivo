/**
 * DriverMapPage - Full-screen driver map with GPS tracking
 * Syncs online status & location to drivers_status table
 * Shows customer live location after accepting a ride
 * Shows flight arrival info for airport pickups
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useDriverMapState } from "@/hooks/useDriverMapState";
import { useCustomerLocation } from "@/hooks/useCustomerLocation";
import { useGpsPermission } from "@/hooks/useGpsPermission";
import DriverMapHeader from "@/components/driver/DriverMapHeader";
import DriverBottomNav from "@/components/driver/DriverBottomNav";
import { motion } from "framer-motion";
import { MapPin, Navigation, Loader2, Car, Check, X, User, Plane, LocateFixed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

interface RideOffer {
  offerId: string;
  jobId: string;
  expiresAt: string;
  estPayout: number | null;
  milesToPickup: number | null;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  flightNumber: string | null;
  flightArrivalTime: string | null;
  isAirportPickup: boolean;
}

export default function DriverMapPage() {
  const mapState = useDriverMapState();
  const [isOnline, setIsOnline] = useState(false);
  const { permission: gpsPermission, requestPermission: requestGps, skipPermission: skipGps } = useGpsPermission();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [activeOffer, setActiveOffer] = useState<RideOffer | null>(null);
  const [isRespondingToOffer, setIsRespondingToOffer] = useState(false);
  const [acceptedJobId, setAcceptedJobId] = useState<string | null>(null);
  const [acceptedJobFlight, setAcceptedJobFlight] = useState<{
    flightNumber: string | null;
    flightArrivalTime: string | null;
    isAirportPickup: boolean;
  } | null>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to customer's live location after accepting a ride
  const { location: customerLocation, isConnected: customerConnected } = useCustomerLocation(acceptedJobId);

  const fetchPendingOffer = useCallback(async (currentDriverId: string) => {
    const now = new Date().toISOString();
    const { data: offer, error: offerError } = await supabase
      .from("job_offers")
      .select("id, job_id, expires_at, est_payout, miles_to_pickup")
      .eq("driver_id", currentDriverId)
      .eq("status", "pending")
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (offerError || !offer) {
      setActiveOffer(null);
      return;
    }

    const { data: job } = await supabase
      .from("jobs")
      .select("pickup_address, dropoff_address, flight_number, flight_arrival_time, is_airport_pickup")
      .eq("id", offer.job_id)
      .maybeSingle();

    const newOffer = {
      offerId: offer.id,
      jobId: offer.job_id,
      expiresAt: offer.expires_at,
      estPayout: offer.est_payout,
      milesToPickup: offer.miles_to_pickup,
      pickupAddress: job?.pickup_address ?? null,
      dropoffAddress: job?.dropoff_address ?? null,
      flightNumber: (job as any)?.flight_number ?? null,
      flightArrivalTime: (job as any)?.flight_arrival_time ?? null,
      isAirportPickup: (job as any)?.is_airport_pickup ?? false,
    };
    setActiveOffer(newOffer);

    // Notify driver of new ride offer (toast + native local notification)
    const payoutText = newOffer.estPayout ? ` — $${(newOffer.estPayout / 100).toFixed(2)}` : "";
    toast.info(`New ride request${payoutText}`, {
      description: newOffer.pickupAddress ? `Pickup: ${newOffer.pickupAddress}` : "Tap to view details",
    });

    if (Capacitor.isNativePlatform()) {
      try {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== "granted") await LocalNotifications.requestPermissions();
        await LocalNotifications.schedule({
          notifications: [{
            id: Date.now(),
            title: `New Ride Request${payoutText}`,
            body: newOffer.pickupAddress || "A rider is waiting for you!",
            schedule: { at: new Date(Date.now() + 100) },
            sound: undefined,
            actionTypeId: "",
            extra: { type: "driver_new_offer", job_id: newOffer.jobId },
          }],
        });
      } catch (err) {
        console.warn("[DriverNotif] Local notification failed:", err);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadDriver = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id ?? null;
      if (!mounted) return;

      setDriverId(userId);
      if (!userId) return;

      const { data: status } = await supabase
        .from("drivers_status")
        .select("is_online")
        .eq("driver_id", userId)
        .maybeSingle();

      if (mounted) {
        setIsOnline(Boolean(status?.is_online));
      }
    };

    loadDriver();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!driverId) {
      setActiveOffer(null);
      return;
    }

    fetchPendingOffer(driverId);

    const channel = supabase
      .channel(`driver-ride-offers-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "job_offers",
          filter: `driver_id=eq.${driverId}`,
        },
        () => {
          fetchPendingOffer(driverId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, fetchPendingOffer]);

  useEffect(() => {
    if (!isOnline || !driverId) {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
      return;
    }

    const updateLocation = async () => {
      const { lat, lng } = mapState.driverLocation;
      if (mapState.locationError || lat == null || lng == null) return;

      const { error } = await supabase.from("drivers_status").upsert({
        driver_id: driverId,
        is_online: true,
        is_busy: false,
        driver_state: "online_available",
        lat,
        lng,
        heading: mapState.heading,
        speed_mps: mapState.speed,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "driver_id" });

      if (error) {
        console.error("Failed to sync driver location:", error);
      }
    };

    updateLocation();
    locationIntervalRef.current = setInterval(updateLocation, 10000);

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [isOnline, driverId, mapState.driverLocation, mapState.heading, mapState.speed, mapState.locationError]);

  const handleToggleOnline = useCallback(async () => {
    if (!driverId) {
      toast.error("Not logged in as a driver");
      return;
    }

    const goingOnline = !isOnline;

    setIsOnline(goingOnline);

    if (goingOnline) {
      const { lat, lng } = mapState.driverLocation;
      // Allow going online even without GPS - location will sync via interval
      if (mapState.locationError) {
        toast.info("GPS still loading, location will sync shortly");
      }
      const { error } = await supabase.from("drivers_status").upsert({
        driver_id: driverId,
        is_online: true,
        is_busy: false,
        driver_state: "online_available",
        lat: lat || null,
        lng: lng || null,
        heading: mapState.heading,
        speed_mps: mapState.speed,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "driver_id" });

      if (error) {
        console.error("Failed to go online:", error);
        toast.error("Failed to go online");
        setIsOnline(false);
      } else {
        toast.success("You're now online!");
      }
    } else {
      const { error } = await supabase.from("drivers_status").upsert({
        driver_id: driverId,
        is_online: false,
        is_busy: false,
        driver_state: "offline",
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "driver_id" });

      if (error) {
        console.error("Failed to go offline:", error);
      } else {
        setActiveOffer(null);
        toast.success("You're now offline");
      }
    }
  }, [isOnline, driverId, mapState.driverLocation, mapState.heading, mapState.speed, mapState.locationError]);

  const handleAcceptOffer = useCallback(async () => {
    if (!activeOffer) return;

    setIsRespondingToOffer(true);
    const { error } = await supabase.rpc("accept_job_offer" as never, {
      p_offer_id: activeOffer.offerId,
    } as never);
    setIsRespondingToOffer(false);

    if (error) {
      console.error("Failed to accept offer:", error);
      toast.error("Could not accept ride");
      return;
    }

    setAcceptedJobId(activeOffer.jobId);
    setAcceptedJobFlight({
      flightNumber: activeOffer.flightNumber,
      flightArrivalTime: activeOffer.flightArrivalTime,
      isAirportPickup: activeOffer.isAirportPickup,
    });
    setActiveOffer(null);
    toast.success(
      activeOffer.isAirportPickup
        ? "Airport pickup accepted — check flight arrival time"
        : "Ride accepted — customer location loading"
    );
  }, [activeOffer]);

  const handleDeclineOffer = useCallback(async () => {
    if (!activeOffer) return;

    setIsRespondingToOffer(true);
    const { error } = await supabase
      .from("job_offers")
      .update({
        status: "declined",
        offer_status: "declined",
        declined_at: new Date().toISOString(),
      } as never)
      .eq("id", activeOffer.offerId);
    setIsRespondingToOffer(false);

    if (error) {
      console.error("Failed to decline offer:", error);
      toast.error("Could not decline ride");
      return;
    }

    setActiveOffer(null);
    toast.success("Ride declined");
  }, [activeOffer]);

  return (
    <div className="h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      <div className="flex-1 relative bg-muted/30">
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

        {/* Customer live location + flight info indicator */}
        {acceptedJobId && (customerLocation || acceptedJobFlight?.isAirportPickup) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-20 left-4 right-4 z-20 space-y-2"
          >
            {/* Flight info banner for airport pickups */}
            {acceptedJobFlight?.isAirportPickup && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 backdrop-blur shadow-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                    <Plane className="w-5 h-5 text-sky-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">✈️ Airport Pickup</p>
                    {acceptedJobFlight.flightNumber && (
                      <p className="text-xs font-semibold text-sky-600">
                        Flight: {acceptedJobFlight.flightNumber}
                      </p>
                    )}
                    {acceptedJobFlight.flightArrivalTime && (
                      <p className="text-xs text-muted-foreground">
                        Landing: {new Date(acceptedJobFlight.flightArrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" · "}
                        {new Date(acceptedJobFlight.flightArrivalTime).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Customer live GPS location */}
            {customerLocation && (
              <div className="rounded-2xl border border-primary/20 bg-card/95 backdrop-blur shadow-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">Customer Location</span>
                      {customerConnected && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {customerLocation.lat.toFixed(5)}, {customerLocation.lng.toFixed(5)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs h-8"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lng}`;
                      import("@/lib/openExternalUrl").then(({ openExternalUrl }) => openExternalUrl(`https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lng}`));
                    }}
                  >
                    <Navigation className="w-3 h-3 mr-1" /> Navigate
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <DriverMapHeader
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          onRecenter={mapState.recenter}
        />

        {activeOffer ? (
          <div className="absolute left-4 right-4 bottom-44 z-20">
            <div className="rounded-3xl border border-border bg-card/95 backdrop-blur shadow-xl p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${activeOffer.isAirportPickup ? "bg-sky-500/10" : "bg-primary/10"}`}>
                    {activeOffer.isAirportPickup ? (
                      <Plane className="w-5 h-5 text-sky-500" />
                    ) : (
                      <Car className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {activeOffer.isAirportPickup ? "✈️ Airport Pickup" : "Incoming ride request"}
                      </p>
                    </div>
                    {activeOffer.isAirportPickup && (
                      <p className="text-xs font-bold text-sky-600">
                        {activeOffer.flightNumber ? `Flight ${activeOffer.flightNumber}` : "Airport terminal pickup"}
                        {activeOffer.flightArrivalTime && (
                          <> · Lands {new Date(activeOffer.flightArrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{activeOffer.pickupAddress || "Pickup location loading..."}</p>
                    <p className="text-xs text-muted-foreground truncate">To {activeOffer.dropoffAddress || "Destination loading..."}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">
                    {activeOffer.estPayout != null ? `$${Number(activeOffer.estPayout).toFixed(2)}` : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeOffer.milesToPickup != null ? `${Number(activeOffer.milesToPickup).toFixed(1)} mi away` : "Nearby"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={handleDeclineOffer}
                  disabled={isRespondingToOffer}
                >
                  {isRespondingToOffer ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                  Decline
                </Button>
                <Button
                  type="button"
                  className="rounded-2xl"
                  onClick={handleAcceptOffer}
                  disabled={isRespondingToOffer}
                >
                  {isRespondingToOffer ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Accept ride
                </Button>
              </div>
            </div>
          </div>
        ) : null}

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
