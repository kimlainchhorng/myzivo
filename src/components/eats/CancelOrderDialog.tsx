/**
 * CancelOrderDialog Component
 * Confirmation dialog for order cancellation with optional reason
 */
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => Promise<boolean>;
  isCancelling: boolean;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  isCancelling,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    const success = await onConfirm(reason.trim() || undefined);
    if (success) {
      setReason("");
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isCancelling) {
      if (!newOpen) {
        setReason("");
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-zinc-950 border-white/10 max-w-md mx-auto">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <AlertDialogTitle className="text-lg font-bold">
              Cancel Order?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-zinc-400 mt-2">
            Are you sure you want to cancel this order? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <label className="text-sm text-zinc-400 mb-2 block">
            Reason (optional)
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let us know why you're cancelling..."
            className="bg-zinc-900/80 border-white/10 rounded-xl min-h-[80px] resize-none"
            maxLength={200}
            disabled={isCancelling}
          />
        </div>

        <AlertDialogFooter className="gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCancelling}
            className="flex-1 h-11 rounded-xl border-white/10 bg-zinc-900"
          >
            Keep Order
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCancelling}
            className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white"
          >
            {isCancelling ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
