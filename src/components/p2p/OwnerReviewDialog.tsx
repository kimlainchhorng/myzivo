/**
 * Owner Review Dialog Component
 * Dialog for owners to review renters after a completed booking
 */

import { useState } from "react";
import { Star } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { useCreateReview, useBookingReview } from "@/hooks/useP2PReview";
import { cn } from "@/lib/utils";
import type { BookingWithDetails } from "@/hooks/useP2PBooking";

interface OwnerReviewDialogProps {
  booking: BookingWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function RatingInput({ label, value, onChange }: RatingInputProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="space-y-1">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "w-6 h-6 transition-colors",
                star <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OwnerReviewDialog({
  booking,
  open,
  onOpenChange,
}: OwnerReviewDialogProps) {
  const createReview = useCreateReview();
  const { data: existingReview } = useBookingReview(booking?.id, "owner_to_renter");

  const [rating, setRating] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [vehicleCare, setVehicleCare] = useState(5);
  const [timeliness, setTimeliness] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!booking) return;

    await createReview.mutateAsync({
      bookingId: booking.id,
      reviewType: "owner_to_renter",
      rating,
      communication,
      vehicleCare,
      timeliness,
      comment: comment || undefined,
      revieweeId: booking.renter_id,
    });

    onOpenChange(false);
    // Reset form
    setRating(5);
    setCommunication(5);
    setVehicleCare(5);
    setTimeliness(5);
    setComment("");
  };

  if (!booking) return null;

  const vehicle = booking.vehicle;

  // If already reviewed, show a message
  if (existingReview) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Already Submitted</DialogTitle>
            <DialogDescription>
              You've already reviewed this renter.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < existingReview.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            {existingReview.comment && (
              <p className="text-muted-foreground">{existingReview.comment}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Renter</DialogTitle>
          <DialogDescription>
            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Your vehicle"} rental
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RatingInput
            label="Overall Rating"
            value={rating}
            onChange={setRating}
          />

          <div className="grid grid-cols-2 gap-4">
            <RatingInput
              label="Communication"
              value={communication}
              onChange={setCommunication}
            />
            <RatingInput
              label="Vehicle Care"
              value={vehicleCare}
              onChange={setVehicleCare}
            />
            <RatingInput
              label="Timeliness"
              value={timeliness}
              onChange={setTimeliness}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this renter..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createReview.isPending}>
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
