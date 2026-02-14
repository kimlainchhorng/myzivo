import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Car, Loader2, CheckCircle2, MapPin, User, XCircle, WifiOff, Navigation, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobRealtime } from "@/hooks/useJobRequest";
import { useDriverLocationRealtime } from "@/hooks/useDriverLocationRealtime";
import { useGoogleMaps } from "@/components/maps/GoogleMapProvider";
import GoogleMap, { MapMarker, MapRoute } from "@/components/maps/GoogleMap";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  requested: { label: "Searching for driver…", icon: <Loader2 className="w-5 h-5 animate-spin" />, color: "text-primary" },
  assigned: { label: "Driver en route to pickup", icon: <Navigation className="w-5 h-5" />, color: "text-primary" },
  arrived: { label: "Driver arrived at pickup", icon: <MapPin className="w-5 h-5" />, color: "text-primary" },
  in_progress: { label: "Trip in progress", icon: <Car className="w-5 h-5" />, color: "text-primary" },
  completed: { label: "Trip completed", icon: <CheckCircle2 className="w-5 h-5" />, color: "text-primary" },
  cancelled: { label: "Trip cancelled", icon: <XCircle className="w-5 h-5" />, color: "text-destructive" },
};

export default function TripStatusPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { job, isLoading } = useJobRealtime(jobId ?? null);
  const driverLoc = useDriverLocationRealtime(job?.assigned_driver_id ?? null);
  const { isLoaded: mapsLoaded } = useGoogleMaps();

  const status = job?.status ?? "requested";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.requested;
  const isTerminal = status === "completed" || status === "cancelled";

  // Build map markers
  const markers = useMemo<MapMarker[]>(() => {
    const m: MapMarker[] = [];
    if (job?.pickup_lat && job?.pickup_lng) {
      m.push({ id: "pickup", position: { lat: job.pickup_lat, lng: job.pickup_lng }, type: "pickup", title: "Pickup" });
    }
    if (job?.dropoff_lat && job?.dropoff_lng) {
      m.push({ id: "dropoff", position: { lat: job.dropoff_lat, lng: job.dropoff_lng }, type: "dropoff", title: "Dropoff" });
    }
    if (driverLoc?.lat && driverLoc?.lng) {
      m.push({ id: "driver", position: { lat: driverLoc.lat, lng: driverLoc.lng }, type: "driver", title: "Driver" });
    }
    return m;
  }, [job?.pickup_lat, job?.pickup_lng, job?.dropoff_lat, job?.dropoff_lng, driverLoc?.lat, driverLoc?.lng]);

  // Build route line
  const route = useMemo<MapRoute | undefined>(() => {
    if (!driverLoc?.lat || !driverLoc?.lng) return undefined;

    // Before pickup: driver → pickup
    if ((status === "assigned" || status === "arrived") && job?.pickup_lat && job?.pickup_lng) {
      return {
        origin: { lat: driverLoc.lat, lng: driverLoc.lng },
        destination: { lat: job.pickup_lat, lng: job.pickup_lng },
      };
    }

    // After pickup: pickup → dropoff
    if (status === "in_progress" && job?.pickup_lat && job?.pickup_lng && job?.dropoff_lat && job?.dropoff_lng) {
      return {
        origin: { lat: job.pickup_lat, lng: job.pickup_lng },
        destination: { lat: job.dropoff_lat, lng: job.dropoff_lng },
      };
    }

    return undefined;
  }, [status, driverLoc?.lat, driverLoc?.lng, job?.pickup_lat, job?.pickup_lng, job?.dropoff_lat, job?.dropoff_lng]);

  // Map center
  const center = useMemo(() => {
    if (driverLoc?.lat && driverLoc?.lng) return { lat: driverLoc.lat, lng: driverLoc.lng };
    if (job?.pickup_lat && job?.pickup_lng) return { lat: job.pickup_lat, lng: job.pickup_lng };
    return { lat: 30.45, lng: -91.18 }; // Default: Baton Rouge
  }, [driverLoc?.lat, driverLoc?.lng, job?.pickup_lat, job?.pickup_lng]);

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState<{ fee_cents?: number; action?: string } | null>(null);

  const handleCancel = async () => {
    if (!jobId || isCancelling) return;
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-job-payment", {
        body: { job_id: jobId, cancel_reason: "customer_cancel" },
      });

      if (error) throw new Error(error.message || "Failed to cancel");

      if (data?.action === "cancel_fee_charged" && data?.amount) {
        setCancelResult({ fee_cents: data.amount, action: data.action });
        toast.info(`Ride cancelled. Cancellation fee: $${(data.amount / 100).toFixed(2)}`);
      } else {
        setCancelResult({ action: data?.action || "voided" });
        toast.info("Ride cancelled — no fee charged");
      }
    } catch {
      toast.error("Failed to cancel ride");
    } finally {
      setIsCancelling(false);
    }
  };

  // Stale signal warning
  const isStale = driverLoc && driverLoc.staleSec > 60;
  const noDriverLoc = job?.assigned_driver_id && (!driverLoc || driverLoc.lat === null);

  return (
    <div className="h-screen flex flex-col bg-background relative">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/rides")} className="p-1.5 rounded-full hover:bg-muted transition">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={cfg.color}>{cfg.icon}</span>
          <h1 className="text-sm font-semibold text-foreground truncate">{cfg.label}</h1>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : mapsLoaded ? (
          <GoogleMap
            className="w-full h-full"
            center={center}
            zoom={14}
            markers={markers}
            route={route}
            fitBounds={markers.length > 1}
            darkMode
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Loading map…
          </div>
        )}

        {/* Floating status card */}
        <div className="absolute bottom-20 left-4 right-4 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={status + (driverLoc?.lat ?? "none")}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card/95 backdrop-blur-lg border border-border rounded-2xl p-4 shadow-xl space-y-3"
            >
              {/* Searching state */}
              {status === "requested" && !job?.assigned_driver_id && (
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-muted">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Searching for driver…</p>
                    <p className="text-xs text-muted-foreground">We'll notify you when a driver accepts</p>
                  </div>
                </div>
              )}

              {/* Driver assigned — show location info */}
              {job?.assigned_driver_id && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">Driver assigned</p>
                      {driverLoc?.lastSeen && !noDriverLoc && (
                        <p className="text-xs text-muted-foreground">
                          Updated {driverLoc.staleSec}s ago
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stale signal warning */}
                  {isStale && (
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                      <WifiOff className="w-4 h-4 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground">Signal weak / updating…</p>
                    </div>
                  )}

                  {/* No location yet */}
                  {noDriverLoc && (
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground">Waiting for driver location…</p>
                    </div>
                  )}

                  {/* Pickup/dropoff info */}
                  <div className="space-y-2 text-sm">
                    {job.pickup_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground truncate">{job.pickup_address}</span>
                      </div>
                    )}
                    {job.dropoff_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                        <span className="text-foreground truncate">{job.dropoff_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cancel button */}
              {(status === "requested" || status === "assigned") && !cancelResult && (
                <Button variant="destructive" size="sm" onClick={handleCancel} disabled={isCancelling} className="w-full gap-2">
                  {isCancelling ? <><Loader2 className="w-4 h-4 animate-spin" />Cancelling…</> : "Cancel Ride"}
                </Button>
              )}

              {/* Cancellation result */}
              {cancelResult && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Ride cancelled</p>
                      {cancelResult.fee_cents && cancelResult.fee_cents > 0 ? (
                        <p className="text-muted-foreground text-xs mt-0.5">
                          Cancellation fee: <span className="font-semibold text-foreground">${(cancelResult.fee_cents / 100).toFixed(2)}</span>
                          {" "}(reason: {cancelResult.action === "cancel_fee_charged" ? "late cancellation" : "policy"})
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-xs mt-0.5">No cancellation fee charged</p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => navigate("/rides")} className="w-full">
                    Back to Rides
                  </Button>
                </div>
              )}

              {isTerminal && (
                <Button size="sm" onClick={() => navigate("/rides")} className="w-full">
                  Back to Rides
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
