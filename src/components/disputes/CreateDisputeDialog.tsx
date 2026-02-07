/**
 * Create Dispute Dialog Component
 * Dialog for creating a new dispute on an order
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useCreateDispute } from "@/hooks/useDisputes";

interface CreateDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderTotal: number;
  createdRole?: "customer" | "merchant" | "admin";
}

const DISPUTE_REASONS = [
  { value: "not_delivered", label: "Not Delivered" },
  { value: "late", label: "Late Delivery" },
  { value: "wrong_item", label: "Wrong Item" },
  { value: "damaged", label: "Damaged" },
  { value: "overcharged", label: "Overcharged" },
  { value: "quality", label: "Quality Issue" },
  { value: "fraud", label: "Fraud" },
  { value: "other", label: "Other" },
];

export function CreateDisputeDialog({
  open,
  onOpenChange,
  orderId,
  orderTotal,
  createdRole = "admin",
}: CreateDisputeDialogProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const createDispute = useCreateDispute();

  const handleSubmit = async () => {
    if (!reason) return;

    await createDispute.mutateAsync({
      order_id: orderId,
      reason,
      description: description || undefined,
      requested_refund_amount: parseFloat(requestedAmount) || 0,
      created_role: createdRole,
    });

    // Reset form
    setReason("");
    setDescription("");
    setRequestedAmount("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Open Dispute
          </DialogTitle>
          <DialogDescription>
            Create a dispute for this order. Driver payouts will be held until
            the dispute is resolved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Info */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono">{orderId.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Order Total</span>
              <span className="font-medium">${orderTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="Provide additional details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Requested Refund Amount */}
          <div className="space-y-2">
            <Label>Requested Refund Amount (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={orderTotal}
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to request full refund consideration
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || createDispute.isPending}
          >
            {createDispute.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Open Dispute"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
