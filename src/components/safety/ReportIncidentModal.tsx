/**
 * Report Incident Modal
 * Form for customers, drivers, and merchants to report safety issues
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, X, Camera, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIncidentReports, IncidentCategory, IncidentSeverity, ReporterRole } from "@/hooks/useIncidentReports";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";

const CATEGORIES: { value: IncidentCategory; label: string; description: string }[] = [
  { value: "safety", label: "Safety Concern", description: "Unsafe driving, food handling, etc." },
  { value: "harassment", label: "Harassment", description: "Verbal abuse, threats, inappropriate behavior" },
  { value: "fraud", label: "Fraud", description: "Fake orders, payment issues, scams" },
  { value: "theft", label: "Theft", description: "Stolen items or money" },
  { value: "accident", label: "Accident", description: "Vehicle or property damage" },
  { value: "other", label: "Other", description: "Something else not listed" },
];

const SEVERITIES: { value: IncidentSeverity; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-blue-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

interface ReportIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderCompletedAt?: string | null;
  reportedUserId?: string;
  reportedUserName?: string;
  reporterRole: ReporterRole;
  onBlockUser?: () => void;
}

export function ReportIncidentModal({
  open,
  onOpenChange,
  orderId,
  orderCompletedAt,
  reportedUserId,
  reportedUserName,
  reporterRole,
  onBlockUser,
}: ReportIncidentModalProps) {
  const [category, setCategory] = useState<IncidentCategory | null>(null);
  const [severity, setSeverity] = useState<IncidentSeverity>("medium");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<"category" | "details" | "success">("category");
  const { createReport } = useIncidentReports();

  // Check 7-day window
  const isWithinWindow = orderCompletedAt
    ? differenceInDays(new Date(), new Date(orderCompletedAt)) <= 7
    : true;

  const handleSubmit = async () => {
    if (!category || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    await createReport.mutateAsync({
      orderId,
      reportedUserId,
      reporterRole,
      category,
      severity,
      description: description.trim(),
    });

    setStep("success");
  };

  const handleClose = () => {
    setCategory(null);
    setSeverity("medium");
    setDescription("");
    setStep("category");
    onOpenChange(false);
  };

  if (!isWithinWindow) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Report Window Expired
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-400">
              Reports can only be submitted within 7 days of order completion.
              If you have an urgent issue, please contact support directly.
            </p>
          </div>
          <Button variant="outline" onClick={handleClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Report an Issue
          </DialogTitle>
          {reportedUserName && (
            <DialogDescription className="text-zinc-400">
              Reporting: {reportedUserName}
            </DialogDescription>
          )}
        </DialogHeader>

        {step === "category" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="py-4 space-y-4"
          >
            <Label className="text-zinc-300">What type of issue?</Label>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setCategory(cat.value);
                    setStep("details");
                  }}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    category === cat.value
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                >
                  <p className="font-medium text-white">{cat.label}</p>
                  <p className="text-sm text-zinc-500">{cat.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "details" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="py-4 space-y-6"
          >
            {/* Selected Category */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-sm">Category:</span>
              <span className="text-orange-400 font-medium">
                {CATEGORIES.find((c) => c.value === category)?.label}
              </span>
              <button
                onClick={() => setStep("category")}
                className="ml-auto text-xs text-zinc-500 hover:text-white"
              >
                Change
              </button>
            </div>

            {/* Severity */}
            <div className="space-y-3">
              <Label className="text-zinc-300">Severity Level</Label>
              <RadioGroup
                value={severity}
                onValueChange={(v) => setSeverity(v as IncidentSeverity)}
                className="flex gap-2"
              >
                {SEVERITIES.map((sev) => (
                  <div key={sev.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={sev.value}
                      id={sev.value}
                      className="border-zinc-600"
                    />
                    <Label
                      htmlFor={sev.value}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className={`w-2 h-2 rounded-full ${sev.color}`} />
                      <span className="text-sm text-zinc-300">{sev.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Describe what happened *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about the incident..."
                className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("category")}
                className="flex-1 border-zinc-700"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!description.trim() || createReport.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {createReport.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-white font-medium">Report Submitted</p>
              <p className="text-sm text-zinc-500 mt-1">
                Our team will review this and take appropriate action.
              </p>
            </div>

            {onBlockUser && reportedUserId && (
              <Button
                variant="outline"
                onClick={() => {
                  onBlockUser();
                  handleClose();
                }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Also Block This User
              </Button>
            )}

            <Button onClick={handleClose} className="w-full bg-zinc-800 hover:bg-zinc-700">
              Close
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
