/**
 * POINTS ADJUSTMENT MODAL
 * Admin modal to manually add or subtract points from a user
 */

import { useState, useEffect } from "react";
import { Loader2, Plus, Minus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdjustPoints } from "@/hooks/useLoyalty";

interface PointsAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export default function PointsAdjustmentModal({
  open,
  onOpenChange,
  userId,
}: PointsAdjustmentModalProps) {
  const adjustMutation = useAdjustPoints();
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState<number>(100);
  const [reason, setReason] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setOperation("add");
      setAmount(100);
      setReason("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!userId || !reason.trim()) return;

    const adjustedAmount = operation === "subtract" ? -Math.abs(amount) : Math.abs(amount);

    adjustMutation.mutate(
      { userId, amount: adjustedAmount, reason: reason.trim() },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Points</DialogTitle>
          <DialogDescription>
            Manually add or subtract points from a customer's balance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Operation Type */}
          <div>
            <Label className="mb-2 block">Operation</Label>
            <RadioGroup
              value={operation}
              onValueChange={(v) => setOperation(v as "add" | "subtract")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="flex items-center gap-1 cursor-pointer">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  Add Points
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="subtract" id="subtract" />
                <Label htmlFor="subtract" className="flex items-center gap-1 cursor-pointer">
                  <Minus className="w-4 h-4 text-rose-500" />
                  Subtract Points
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Points Amount</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason (required)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Customer service compensation, Referral bonus correction..."
              rows={3}
              className="mt-1"
            />
          </div>

          {operation === "subtract" && (
            <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                This will subtract {amount.toLocaleString()} points from the customer's balance.
                This action is logged and cannot be undone.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={adjustMutation.isPending || !reason.trim() || amount <= 0}
            variant={operation === "subtract" ? "destructive" : "default"}
          >
            {adjustMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : operation === "add" ? (
              <Plus className="w-4 h-4 mr-2" />
            ) : (
              <Minus className="w-4 h-4 mr-2" />
            )}
            {operation === "add" ? "Add" : "Subtract"} {amount.toLocaleString()} Points
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
