/**
 * Dispute Form Component
 * Form for filing disputes about P2P bookings
 */

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateDispute, useBookingDisputes } from "@/hooks/useP2PDispute";
import type { P2PDisputeType } from "@/types/p2p";

interface DisputeFormProps {
  bookingId: string;
  onSuccess?: () => void;
}

const disputeTypes: { value: P2PDisputeType; label: string; description: string }[] = [
  {
    value: "damage",
    label: "Vehicle Damage",
    description: "Report damage to the vehicle during the rental period",
  },
  {
    value: "cleanliness",
    label: "Cleanliness Issue",
    description: "Vehicle was not clean upon pickup or return",
  },
  {
    value: "late_return",
    label: "Late Return",
    description: "Issues related to late vehicle return",
  },
  {
    value: "cancellation",
    label: "Cancellation Issue",
    description: "Problems with booking cancellation or refunds",
  },
  {
    value: "refund",
    label: "Refund Issue",
    description: "Billing errors or refund disputes",
  },
  {
    value: "other",
    label: "Other",
    description: "Any other issue not covered above",
  },
];

export default function DisputeForm({ bookingId, onSuccess }: DisputeFormProps) {
  const createDispute = useCreateDispute();
  const { data: existingDisputes } = useBookingDisputes(bookingId);

  const [open, setOpen] = useState(false);
  const [disputeType, setDisputeType] = useState<P2PDisputeType | "">("");
  const [description, setDescription] = useState("");

  const hasOpenDispute = existingDisputes?.some(
    (d) => d.status === "open" || d.status === "investigating"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeType) return;

    await createDispute.mutateAsync({
      bookingId,
      disputeType: disputeType as P2PDisputeType,
      description,
    });

    setOpen(false);
    setDisputeType("");
    setDescription("");
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={hasOpenDispute}>
          <AlertTriangle className="w-4 h-4" />
          {hasOpenDispute ? "Dispute in Progress" : "Report an Issue"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            File a Dispute
          </DialogTitle>
          <DialogDescription>
            Report an issue with your booking. Our team will review and respond within 24-48 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Issue Type</Label>
            <Select value={disputeType} onValueChange={(v) => setDisputeType(v as P2PDisputeType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {disputeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please describe the issue in detail. Include dates, times, and any relevant information..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <Card className="bg-muted/50">
            <CardContent className="py-3 text-sm text-muted-foreground">
              <p>
                <strong>What happens next?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Your dispute will be reviewed by our support team</li>
                <li>We may contact you for additional information</li>
                <li>Resolution typically takes 3-5 business days</li>
                <li>You'll be notified of the outcome via email</li>
              </ul>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!disputeType || !description || createDispute.isPending}>
              {createDispute.isPending ? "Submitting..." : "Submit Dispute"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
