/**
 * Cancel Request Modal
 * Allows users to request cancellation with a reason
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useOrderActions } from "@/hooks/useOrderActions";

interface CancelRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  total: number;
  currency: string;
}

export function CancelRequestModal({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  total,
  currency,
}: CancelRequestModalProps) {
  const [reason, setReason] = useState("");
  const { requestCancellation, isCancelling } = useOrderActions();

  const handleSubmit = () => {
    if (reason.trim().length < 10) {
      return;
    }
    
    requestCancellation(
      { orderId, reason },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Cancellation</DialogTitle>
          <DialogDescription>
            Order {orderNumber} • ${total.toFixed(2)} {currency}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              <strong>Important:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Cancellation depends on supplier rules</li>
                <li>Some bookings are non-refundable</li>
                <li>If eligible, refund timing depends on payment provider</li>
                <li>Typical processing: 5-10 business days</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason for cancellation <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="reason"
              placeholder="Please tell us why you need to cancel this booking..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              minLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters. {reason.length}/10
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCancelling}
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={reason.trim().length < 10 || isCancelling}
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Request Cancellation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
