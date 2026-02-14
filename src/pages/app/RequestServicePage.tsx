import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Navigation, StickyNote, Car, Package, Utensils, Loader2, Check, RefreshCw, ShieldCheck, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCreateJob, useJobRealtime, dispatchJob, JobType, JobStatus } from "@/hooks/useJobRequest";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import JobTrackingMap from "@/components/app/JobTrackingMap";

const SUPABASE_URL = "https://slirphzzwcogdbkeicff.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI";

interface OtpData {
  otp: string;
  expires_at: string;
}

async function generateJobOtp(jobId: string): Promise<OtpData | null> {
  const { data: { session } } = await supabase.auth.getSession();
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/otp-generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
        apikey: SUPABASE_ANON,
      },
      body: JSON.stringify({ job_id: jobId, digits: 4, ttl_minutes: 120 }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.ok) return null;
    return { otp: data.otp, expires_at: data.expires_at };
  } catch {
    return null;
  }
}

// ─── OTP Countdown Hook ───
function useCountdown(expiresAt: string | null) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) { setSecondsLeft(0); return; }
    const calc = () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    setSecondsLeft(calc());
    const iv = setInterval(() => setSecondsLeft(calc()), 1000);
    return () => clearInterval(iv);
  }, [expiresAt]);

  return secondsLeft;
}

function formatCountdown(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const JOB_TYPES: { value: JobType; label: string; icon: React.ElementType }[] = [
  { value: "ride", label: "Ride", icon: Car },
  { value: "food_delivery", label: "Food Delivery", icon: Utensils },
  { value: "package", label: "Package", icon: Package },
];

const STATUS_STEPS: { key: JobStatus; label: string }[] = [
  { key: "requested", label: "Requested" },
  { key: "assigned", label: "Driver Assigned" },
  { key: "arrived", label: "Driver Arrived" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const getStepIndex = (status: JobStatus) => STATUS_STEPS.findIndex((s) => s.key === status);

// ─── Status Tracker ───
const StatusTracker = ({ currentStatus }: { currentStatus: JobStatus }) => {
  const activeIdx = getStepIndex(currentStatus);

  return (
    <div className="space-y-1">
      {STATUS_STEPS.map((step, idx) => {
        const isDone = idx < activeIdx;
        const isActive = idx === activeIdx;
        return (
          <div key={step.key} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.15 : 1 }}
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isDone
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
              </motion.div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`w-0.5 h-6 ${isDone ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                isDone ? "text-primary" : isActive ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Page ───
const RequestServicePage = () => {
  const navigate = useNavigate();
  const createJob = useCreateJob();

  const [jobType, setJobType] = useState<JobType>("ride");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [notes, setNotes] = useState("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // OTP state — kept in memory only, never localStorage
  const [otpData, setOtpData] = useState<OtpData | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const otpFetchedForStatus = useRef<string | null>(null);

  const { job, isLoading: jobLoading, clearJob } = useJobRealtime(activeJobId);
  const otpSecondsLeft = useCountdown(otpData?.expires_at ?? null);

  // Show "Try Again" after 30s if still no driver
  useEffect(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    setShowRetry(false);

    if (activeJobId && job?.status === "requested" && !job.assigned_driver_id) {
      retryTimerRef.current = setTimeout(() => {
        setShowRetry(true);
      }, 30_000);
    }

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [activeJobId, job?.status, job?.assigned_driver_id]);

  const handleSubmit = async () => {
    if (!pickup.trim() || !dropoff.trim()) return;

    const result = await createJob.mutateAsync({
      job_type: jobType,
      pickup_address: pickup.trim(),
      dropoff_address: dropoff.trim(),
      notes: notes.trim() || undefined,
    });

    setActiveJobId(result.id);
  };

  const handleRetryDispatch = async () => {
    if (!activeJobId) return;
    setIsRetrying(true);
    try {
      const result = await dispatchJob(activeJobId);
      if (result.success) {
        toast.success("Driver found!");
      } else {
        toast.info(result.message || "Still searching...");
      }
    } catch (e: any) {
      toast.error("Retry failed: " + e.message);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleNewRequest = () => {
    setActiveJobId(null);
    clearJob();
    setPickup("");
    setDropoff("");
    setNotes("");
    setOtpData(null);
    otpFetchedForStatus.current = null;
  };

  // Auto-generate OTP when job transitions to assigned/arrived
  useEffect(() => {
    if (!activeJobId || !job) return;
    const s = job.status;
    if ((s === "assigned" || s === "arrived") && otpFetchedForStatus.current !== s && !otpData) {
      otpFetchedForStatus.current = s;
      setIsOtpLoading(true);
      generateJobOtp(activeJobId)
        .then((data) => {
          if (data) setOtpData(data);
          else toast.error("Failed to generate verification code");
        })
        .finally(() => setIsOtpLoading(false));
    }
  }, [activeJobId, job?.status, otpData]);

  const handleRegenerateOtp = async () => {
    if (!activeJobId) return;
    setIsOtpLoading(true);
    const data = await generateJobOtp(activeJobId);
    if (data) {
      setOtpData(data);
      toast.success("New code generated");
    } else {
      toast.error("Failed to regenerate code");
    }
    setIsOtpLoading(false);
  };

  const isSearching = job?.status === "requested";
  const isAssigned = job && job.status !== "requested" && job.status !== "cancelled";
  const isCompleted = job?.status === "completed";

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3 safe-area-top">
          <button onClick={() => navigate(-1)} className="touch-manipulation">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground">Request Service</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          {/* ─── FORM STATE ─── */}
          {!activeJobId && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Job Type */}
              <div>
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 block">
                  Service Type
                </Label>
                <RadioGroup
                  value={jobType}
                  onValueChange={(v) => setJobType(v as JobType)}
                  className="grid grid-cols-3 gap-3"
                >
                  {JOB_TYPES.map((jt) => (
                    <Label
                      key={jt.value}
                      htmlFor={jt.value}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all touch-manipulation ${
                        jobType === jt.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <RadioGroupItem value={jt.value} id={jt.value} className="sr-only" />
                      <jt.icon className={`w-6 h-6 ${jobType === jt.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-semibold ${jobType === jt.value ? "text-primary" : "text-foreground"}`}>
                        {jt.label}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Pickup */}
              <div>
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1.5 block">
                  Pickup Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Enter pickup location"
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Dropoff */}
              <div>
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1.5 block">
                  Dropoff Address
                </Label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    placeholder="Enter dropoff location"
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1.5 block">
                  Notes <span className="text-muted-foreground/60 normal-case">(optional)</span>
                </Label>
                <div className="relative">
                  <StickyNote className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions..."
                    className="pl-10 rounded-xl min-h-[70px]"
                    rows={2}
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                size="lg"
                className="w-full"
                disabled={!pickup.trim() || !dropoff.trim() || createJob.isPending}
                onClick={handleSubmit}
              >
                {createJob.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Requesting...
                  </>
                ) : (
                  "Request"
                )}
              </Button>
            </motion.div>
          )}

          {/* ─── SEARCHING STATE ─── */}
          {activeJobId && isSearching && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-5"
            >
              {/* Live Map */}
              {job && (
                <JobTrackingMap
                  jobId={activeJobId}
                  jobStatus={job.status}
                  pickupLat={job.pickup_lat}
                  pickupLng={job.pickup_lng}
                  dropoffLat={job.dropoff_lat}
                  dropoffLng={job.dropoff_lng}
                  className="h-[220px] w-full"
                />
              )}

              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary"
                />
                <div>
                  <h2 className="text-base font-bold text-foreground">Searching for driver...</h2>
                  <p className="text-xs text-muted-foreground">Hang tight, we're finding the best match</p>
                </div>
              </div>

              <div className="w-full rounded-2xl bg-card border border-border p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{job?.pickup_address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Navigation className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{job?.dropoff_address}</span>
                </div>
              </div>

              {/* Try Again button — appears after 30s with no driver */}
              {showRetry && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleRetryDispatch}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" /> Try Again
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          )}

          {/* ─── ASSIGNED / TRACKING STATE ─── */}
          {activeJobId && isAssigned && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Driver Assigned Banner */}
              <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {isCompleted ? "Job Completed!" : "Driver Assigned"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isCompleted ? "Your request has been fulfilled" : "Your driver is on the way"}
                  </p>
                </div>
              </div>

              {/* Live Map */}
              <JobTrackingMap
                jobId={activeJobId}
                jobStatus={job!.status}
                pickupLat={job!.pickup_lat}
                pickupLng={job!.pickup_lng}
                dropoffLat={job!.dropoff_lat}
                dropoffLng={job!.dropoff_lng}
                className="h-[280px] w-full"
              />

              {/* OTP Verification Code — shown for assigned/arrived */}
              {(job!.status === "assigned" || job!.status === "arrived") && (
                <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Verification Code
                    </h3>
                  </div>

                  {isOtpLoading && !otpData ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Generating code...</span>
                    </div>
                  ) : otpData ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Share this code with your driver to verify pickup
                      </p>
                      {/* OTP digits */}
                      <div className="flex justify-center gap-3">
                        {otpData.otp.split("").map((digit, i) => (
                          <div
                            key={i}
                            className="w-12 h-14 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center"
                          >
                            <span className="text-2xl font-bold text-primary">{digit}</span>
                          </div>
                        ))}
                      </div>
                      {/* Countdown */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Timer className="w-3.5 h-3.5" />
                          {otpSecondsLeft > 0 ? (
                            <span>Expires in {formatCountdown(otpSecondsLeft)}</span>
                          ) : (
                            <span className="text-destructive">Expired</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={handleRegenerateOtp}
                          disabled={isOtpLoading}
                        >
                          {isOtpLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-destructive">Could not generate code. Try again.</p>
                  )}
                </div>
              )}

              {/* Trip Info */}
              <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground">{job?.pickup_address}</span>
                </div>
                <div className="ml-2 border-l-2 border-dashed border-border h-4" />
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground">{job?.dropoff_address}</span>
                </div>
              </div>

              {/* Status Tracker */}
              <div className="rounded-2xl bg-card border border-border p-4">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4">Live Status</h3>
                <StatusTracker currentStatus={job!.status} />
              </div>

              {/* New Request button when completed */}
              {isCompleted && (
                <Button size="lg" className="w-full" onClick={handleNewRequest}>
                  New Request
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ZivoMobileNav />
    </div>
  );
};

export default RequestServicePage;
