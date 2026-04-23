/**
 * CancelReservationSheet — refund preview + reason capture for cancellations.
 *
 * Refund policy (client preview; server re-computes authoritatively):
 *  - 7+ days before check-in: full refund
 *  - 2-6 days: 50% refund
 *  - <48h or after check-in: no refund
 */
import { useMemo, useState } from "react";
import { differenceInHours, parseISO } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, AlertTriangle } from "lucide-react";
import { useReservationActions } from "@/hooks/lodging/useReservationChangeRequests";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reservationId: string;
  checkIn: string;
  totalCents: number;
  paidCents: number;
}

const REASONS = [
  "Plans changed",
  "Found alternative",
  "Property issue",
  "Travel restrictions",
  "Other",
];

function computeRefund(checkIn: string, paidCents: number) {
  const hoursUntil = differenceInHours(parseISO(checkIn), new Date());
  if (hoursUntil >= 24 * 7) return { cents: paidCents, label: "Full refund", policy: "7+ days notice" };
  if (hoursUntil >= 48) return { cents: Math.round(paidCents * 0.5), label: "50% refund", policy: "2–6 days notice" };
  return { cents: 0, label: "No refund", policy: "Less than 48h notice" };
}

export default function CancelReservationSheet({
  open,
  onOpenChange,
  reservationId,
  checkIn,
  totalCents,
  paidCents,
}: Props) {
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const refund = useMemo(() => computeRefund(checkIn, paidCents), [checkIn, paidCents]);
  const { requestCancel } = useReservationActions(reservationId);

  const submit = async () => {
    try {
      const fullReason = details ? `${reason} — ${details}` : reason;
      const res = await requestCancel.mutateAsync({ reason: fullReason });
      const msg = res.refund_cents > 0
        ? `Cancelled. Refund status: ${res.payment_status || "refund pending"}.`
        : "Cancelled. No refund is due under the policy.";
      setResult(msg);
      toast.success(msg);
      setConfirmOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Could not cancel");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" /> Cancel reservation
          </SheetTitle>
          <SheetDescription>
            Review the refund based on the property's cancellation policy.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total paid</span>
              <span>${(paidCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Policy applied</span>
              <span className="text-xs">{refund.policy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Forfeited</span>
              <span>${((paidCents - refund.cents) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base">
              <span className="font-semibold">{refund.label}</span>
              <span className="font-bold text-emerald-600">
                ${(refund.cents / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {refund.cents === 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                You are within the no-refund window. Cancelling now will forfeit the full payment.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="details">More details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="mt-1.5"
            />
          </div>

          {result && <Alert aria-live="polite"><AlertDescription>{result}</AlertDescription></Alert>}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Keep reservation
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={requestCancel.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              {requestCancel.isPending ? "Cancelling…" : "Confirm cancellation"}
            </Button>
          </div>
        </div>
      </SheetContent>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm cancellation</DialogTitle>
            <DialogDescription>This will cancel the reservation and process the refund outcome shown in the policy breakdown.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Go back</Button>
            <Button variant="destructive" disabled={requestCancel.isPending || !reason} onClick={submit}>
              {requestCancel.isPending ? "Cancelling…" : "Cancel reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
