/**
 * FlightChangeRequest Component
 * Dialog for users to request changes or cancellations
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Loader2,
  Phone,
  Mail,
} from "lucide-react";
import { useRequestFlightRefund } from "@/hooks/useFlightBooking";
import { FLIGHT_MOR_DISCLAIMERS } from "@/config/flightMoRCompliance";

interface FlightChangeRequestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingReference: string;
  isRefundable?: boolean;
  changesFee?: string;
}

type RequestType = 'change_dates' | 'cancel' | 'other';

export function FlightChangeRequest({
  open,
  onOpenChange,
  bookingId,
  bookingReference,
  isRefundable = false,
  changesFee = "Fee applies",
}: FlightChangeRequestProps) {
  const [requestType, setRequestType] = useState<RequestType>('change_dates');
  const [reason, setReason] = useState("");
  
  const { mutate: requestRefund, isPending } = useRequestFlightRefund();

  const handleSubmit = () => {
    if (requestType === 'cancel') {
      requestRefund(
        { bookingId, reason },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      // For changes, we'd typically create a support ticket
      // For now, close and show success
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Change or Cancellation</DialogTitle>
          <DialogDescription>
            Booking Reference: <span className="font-mono font-bold">{bookingReference}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Request Type */}
          <div className="space-y-3">
            <Label>What would you like to do?</Label>
            <RadioGroup
              value={requestType}
              onValueChange={(v) => setRequestType(v as RequestType)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                <RadioGroupItem value="change_dates" id="change_dates" />
                <Label htmlFor="change_dates" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    <span>Change flight dates</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{changesFee}</p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                <RadioGroupItem value="cancel" id="cancel" />
                <Label htmlFor="cancel" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Cancel booking</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRefundable ? "Refundable fare" : "Non-refundable fare - cancellation fee applies"}
                  </p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span>Other request</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Name correction, special assistance, etc.</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Additional details (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Please provide any additional information about your request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Fare Rules Notice */}
          {requestType === 'cancel' && !isRefundable && (
            <Alert className="border-amber-500/30 bg-amber-500/5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <AlertDescription className="text-sm">
                <strong>Non-refundable fare:</strong> {FLIGHT_MOR_DISCLAIMERS.refund}
              </AlertDescription>
            </Alert>
          )}

          {/* Support Contact */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm font-medium mb-2">Need help?</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <a href="tel:+1-800-ZIVO" className="flex items-center gap-1 hover:text-foreground">
                <Phone className="w-3.5 h-3.5" />
                1-800-ZIVO
              </a>
              <a href="mailto:support@hizovo.com" className="flex items-center gap-1 hover:text-foreground">
                <Mail className="w-3.5 h-3.5" />
                support@hizovo.com
              </a>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FlightChangeRequest;
