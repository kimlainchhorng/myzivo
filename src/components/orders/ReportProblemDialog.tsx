/**
 * Report a Problem Dialog
 * Customer-friendly dispute form for reporting order issues
 */
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCreateCustomerDispute, type CustomerDisputeReason } from "@/hooks/useCustomerDisputes";

interface ReportProblemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}

const reasonOptions: { value: CustomerDisputeReason; label: string }[] = [
  { value: "missing_items", label: "Missing items" },
  { value: "wrong_items", label: "Wrong items" },
  { value: "order_late", label: "Order late" },
  { value: "other", label: "Other" },
];

export function ReportProblemDialog({ open, onOpenChange, orderId }: ReportProblemDialogProps) {
  const [reason, setReason] = useState<CustomerDisputeReason | "">("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const createDispute = useCreateCustomerDispute();

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setReason("");
        setDescription("");
        setSubmitted(false);
      }, 300);
    }
  }, [open]);

  // Auto-close after submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => onOpenChange(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted, onOpenChange]);

  const handleSubmit = async () => {
    if (!reason || !description.trim()) return;

    createDispute.mutate(
      { orderId, reason, description: description.trim() },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Your request is under review.</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We'll look into this and get back to you soon.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report a problem</DialogTitle>
              <DialogDescription>
                Tell us what went wrong with your order and we'll look into it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="reason">What happened?</Label>
                <Select
                  value={reason}
                  onValueChange={(v) => setReason(v as CustomerDisputeReason)}
                >
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Describe the issue</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide details about the problem..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!reason || !description.trim() || createDispute.isPending}
              >
                {createDispute.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
