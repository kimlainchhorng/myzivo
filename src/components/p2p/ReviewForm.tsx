/**
 * Review Form Component
 * Form for submitting reviews for P2P bookings
 */

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateReview, useBookingReview } from "@/hooks/useP2PReview";
import type { P2PReviewType } from "@/types/p2p";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  bookingId: string;
  reviewType: P2PReviewType;
  vehicleId?: string;
  revieweeId?: string;
  vehicleName?: string;
  ownerName?: string;
  onSuccess?: () => void;
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

export default function ReviewForm({
  bookingId,
  reviewType,
  vehicleId,
  revieweeId,
  vehicleName,
  ownerName,
  onSuccess,
}: ReviewFormProps) {
  const createReview = useCreateReview();
  const { data: existingReview, isLoading } = useBookingReview(bookingId, reviewType);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [cleanliness, setCleanliness] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [value, setValue] = useState(5);
  const [condition, setCondition] = useState(5);
  // Owner-to-renter specific ratings
  const [vehicleCare, setVehicleCare] = useState(5);
  const [timeliness, setTimeliness] = useState(5);

  const isVehicleReview = reviewType === "renter_to_vehicle";
  const isOwnerReview = reviewType === "renter_to_owner";
  const isRenterReview = reviewType === "owner_to_renter";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createReview.mutateAsync({
      bookingId,
      reviewType,
      rating,
      title: title || undefined,
      comment: comment || undefined,
      cleanliness: isVehicleReview ? cleanliness : undefined,
      accuracy: isVehicleReview ? accuracy : undefined,
      value: isVehicleReview ? value : undefined,
      condition: isVehicleReview ? condition : undefined,
      communication: (isOwnerReview || isRenterReview) ? communication : undefined,
      vehicleCare: isRenterReview ? vehicleCare : undefined,
      timeliness: isRenterReview ? timeliness : undefined,
      vehicleId: isVehicleReview ? vehicleId : undefined,
      revieweeId: (isOwnerReview || isRenterReview) ? revieweeId : undefined,
    });

    onSuccess?.();
  };

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  if (existingReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isVehicleReview ? "Your Vehicle Review" : "Your Host Review"}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
          {existingReview.title && (
            <p className="font-medium mb-1">{existingReview.title}</p>
          )}
          {existingReview.comment && (
            <p className="text-muted-foreground">{existingReview.comment}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isVehicleReview
            ? `Review ${vehicleName || "the vehicle"}`
            : isRenterReview
            ? `Review ${ownerName || "your renter"}`
            : `Review ${ownerName || "your host"}`}
        </CardTitle>
        <CardDescription>
          {isRenterReview
            ? "Share your experience with this renter"
            : "Share your experience to help other renters"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <RatingInput
            label="Overall Rating"
            value={rating}
            onChange={setRating}
          />

          {isVehicleReview && (
            <div className="grid grid-cols-2 gap-4">
              <RatingInput label="Cleanliness" value={cleanliness} onChange={setCleanliness} />
              <RatingInput label="Accuracy" value={accuracy} onChange={setAccuracy} />
              <RatingInput label="Value" value={value} onChange={setValue} />
              <RatingInput label="Condition" value={condition} onChange={setCondition} />
            </div>
          )}

          {isOwnerReview && (
            <RatingInput label="Communication" value={communication} onChange={setCommunication} />
          )}

          {isRenterReview && (
            <div className="grid grid-cols-2 gap-4">
              <RatingInput label="Communication" value={communication} onChange={setCommunication} />
              <RatingInput label="Vehicle Care" value={vehicleCare} onChange={setVehicleCare} />
              <RatingInput label="Timeliness" value={timeliness} onChange={setTimeliness} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={createReview.isPending} className="w-full">
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
