/**
 * Refund Dialog Component
 * Admin-only dialog for processing refunds
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2, RefreshCcw } from "lucide-react";
import { useProcessRefund } from "@/hooks/usePaymentAdmin";

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "ride" | "eats";
  id: string;
  amount: number;
  customerName?: string;
}

export function RefundDialog({
  open,
  onOpenChange,
  type,
  id,
  amount,
  customerName,
}: RefundDialogProps) {
  const [reason, setReason] = useState<string>("requested_by_customer");
  const [notes, setNotes] = useState("");
  const processRefund = useProcessRefund();

  const handleRefund = async () => {
    await processRefund.mutateAsync({
      type,
      id,
      reason: notes ? `${reason}: ${notes}` : reason,
    });
    onOpenChange(false);
    setNotes("");
    setReason("requested_by_customer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-amber-500" />
            Process Refund
          </DialogTitle>
          <DialogDescription>
            This will refund the full payment to the customer via Stripe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Info */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Order ID:</span>
                <p className="font-mono font-medium">{id.slice(0, 8)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <p className="font-bold text-lg">${amount.toFixed(2)}</p>
              </div>
              {customerName && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{customerName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Refund Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested_by_customer">
                  Customer Request
                </SelectItem>
                <SelectItem value="duplicate">Duplicate Charge</SelectItem>
                <SelectItem value="fraudulent">Fraudulent</SelectItem>
                <SelectItem value="service_issue">Service Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (optional)</Label>
            <Textarea
              placeholder="Any additional details about this refund..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Refunds are processed immediately via Stripe and cannot be
              reversed. The {type === "ride" ? "ride request" : "order"} will be
              marked as cancelled.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRefund}
            disabled={processRefund.isPending}
          >
            {processRefund.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Confirm Refund
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
