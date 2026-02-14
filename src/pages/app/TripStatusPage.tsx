import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Car, Loader2, CheckCircle2, MapPin, User, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobRealtime, cancelJob } from "@/hooks/useJobRequest";
import { toast } from "sonner";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

const STATUS_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  requested: { label: "Searching for driver…", icon: <Loader2 className="w-6 h-6 animate-spin" />, color: "text-primary" },
  assigned: { label: "Driver accepted!", icon: <User className="w-6 h-6" />, color: "text-green-500" },
  arrived: { label: "Driver arrived", icon: <MapPin className="w-6 h-6" />, color: "text-blue-500" },
  in_progress: { label: "Trip in progress", icon: <Car className="w-6 h-6" />, color: "text-primary" },
  completed: { label: "Trip completed", icon: <CheckCircle2 className="w-6 h-6" />, color: "text-green-600" },
  cancelled: { label: "Trip cancelled", icon: <XCircle className="w-6 h-6" />, color: "text-destructive" },
};

export default function TripStatusPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { job, isLoading } = useJobRealtime(jobId ?? null);

  const status = job?.status ?? "requested";
  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.requested;

  const handleCancel = async () => {
    if (!jobId) return;
    try {
      await cancelJob(jobId);
      toast.info("Ride cancelled");
      navigate("/rides");
    } catch {
      toast.error("Failed to cancel ride");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/rides")} className="p-1.5 rounded-full hover:bg-muted transition">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Trip Status</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto w-full space-y-8">
        {isLoading ? (
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              {/* Status icon */}
              <div className={`p-6 rounded-full bg-muted ${statusInfo.color}`}>
                {statusInfo.icon}
              </div>

              {/* Status text */}
              <h2 className="text-xl font-bold text-foreground">{statusInfo.label}</h2>

              {/* Job details */}
              {job && (
                <div className="w-full bg-card border border-border rounded-xl p-4 space-y-3 text-left text-sm">
                  {job.pickup_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Pickup</p>
                        <p className="text-foreground">{job.pickup_address}</p>
                      </div>
                    </div>
                  )}
                  {job.dropoff_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Dropoff</p>
                        <p className="text-foreground">{job.dropoff_address}</p>
                      </div>
                    </div>
                  )}

                  {/* Driver info when assigned */}
                  {job.assigned_driver_id && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <User className="w-4 h-4 text-green-500 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Driver</p>
                        <p className="text-foreground font-medium">Driver assigned ✓</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cancel button (only when searching or assigned) */}
              {(status === "requested" || status === "assigned") && (
                <Button variant="destructive" onClick={handleCancel} className="mt-4 w-full">
                  Cancel Ride
                </Button>
              )}

              {/* Done button */}
              {(status === "completed" || status === "cancelled") && (
                <Button onClick={() => navigate("/rides")} className="mt-4 w-full">
                  Back to Rides
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
