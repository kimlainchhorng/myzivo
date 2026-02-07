/**
 * Dispute Refund Dialog Component
 * Dialog for processing partial or full refunds
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2, DollarSign } from "lucide-react";
import { useProcessDisputeRefund } from "@/hooks/useDisputes";

interface DisputeRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeId: string;
  orderId: string;
  maxAmount: number;
  requestedAmount?: number;
  previouslyRefunded?: number;
}

export function DisputeRefundDialog({
  open,
  onOpenChange,
  disputeId,
  orderId,
  maxAmount,
  requestedAmount = 0,
  previouslyRefunded = 0,
}: DisputeRefundDialogProps) {
  const availableForRefund = maxAmount - previouslyRefunded;
  const [amount, setAmount] = useState(
    Math.min(requestedAmount || availableForRefund, availableForRefund).toFixed(2)
  );
  const [reason, setReason] = useState<"duplicate" | "fraudulent" | "requested_by_customer">(
    "requested_by_customer"
  );
  const processRefund = useProcessDisputeRefund();

  const handleSubmit = async () => {
    const refundAmount = parseFloat(amount);
    if (isNaN(refundAmount) || refundAmount <= 0) {
      return;
    }
    if (refundAmount > availableForRefund) {
      return;
    }

    await processRefund.mutateAsync({
      dispute_id: disputeId,
      amount: refundAmount,
      reason,
    });

    onOpenChange(false);
  };

  const handleFullRefund = () => {
    setAmount(availableForRefund.toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Process Refund
          </DialogTitle>
          <DialogDescription>
            Issue a partial or full refund via Stripe for this dispute.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Info */}
          <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Total</span>
              <span className="font-medium">${maxAmount.toFixed(2)}</span>
            </div>
            {previouslyRefunded > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Already Refunded</span>
                <span className="font-medium text-amber-500">
                  -${previouslyRefunded.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground">Available for Refund</span>
              <span className="font-bold">${availableForRefund.toFixed(2)}</span>
            </div>
          </div>

          {/* Refund Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Refund Amount</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={handleFullRefund}
              >
                Full Refund
              </Button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={availableForRefund}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
            {parseFloat(amount) > availableForRefund && (
              <p className="text-xs text-destructive">
                Amount exceeds available refund balance
              </p>
            )}
          </div>

          {/* Refund Reason */}
          <div className="space-y-2">
            <Label>Reason (for Stripe)</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as typeof reason)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested_by_customer">
                  Requested by Customer
                </SelectItem>
                <SelectItem value="duplicate">Duplicate Charge</SelectItem>
                <SelectItem value="fraudulent">Fraudulent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Refunds are processed immediately via Stripe and cannot be reversed.
              The customer will be notified by Stripe.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              processRefund.isPending ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > availableForRefund
            }
          >
            {processRefund.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Refund ${parseFloat(amount || "0").toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
