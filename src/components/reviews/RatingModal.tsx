import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, tags: string[]) => void;
  serviceType: 'ride' | 'food' | 'hotel' | 'car' | 'flight';
  serviceName: string;
  serviceDetails?: string;
}

const RatingModal = ({
  isOpen,
  onClose,
  onSubmit,
  serviceType,
  serviceName,
  serviceDetails,
}: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tagsByType = {
    ride: {
      positive: ['Great conversation', 'Smooth driving', 'Clean car', 'On time', 'Safe driver', 'Good music'],
      negative: ['Late arrival', 'Rude driver', 'Dirty car', 'Unsafe driving', 'Wrong route', 'Poor AC'],
    },
    food: {
      positive: ['Fresh food', 'Good portions', 'Fast delivery', 'Well packaged', 'Tasty', 'Hot food'],
      negative: ['Cold food', 'Missing items', 'Wrong order', 'Late delivery', 'Bad packaging', 'Stale'],
    },
    hotel: {
      positive: ['Clean room', 'Great service', 'Good location', 'Quiet', 'Comfy bed', 'Nice amenities'],
      negative: ['Noisy', 'Dirty', 'Poor service', 'Bad location', 'Small room', 'Not as pictured'],
    },
    car: {
      positive: ['Clean vehicle', 'Well maintained', 'Easy pickup', 'Good value', 'Accurate description'],
      negative: ['Dirty', 'Issues with car', 'Late pickup', 'Overpriced', 'Inaccurate listing'],
    },
    flight: {
      positive: ['On time', 'Comfy seats', 'Good crew', 'Clean cabin', 'Smooth flight', 'Good service'],
      negative: ['Delayed', 'Uncomfortable', 'Rude staff', 'Dirty', 'Turbulent', 'Poor food'],
    },
  };

  const tags = rating >= 4 ? tagsByType[serviceType].positive : tagsByType[serviceType].negative;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    onSubmit(rating, comment, selectedTags);
    setRating(0);
    setComment("");
    setSelectedTags([]);
    onClose();
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>{serviceName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-10 w-10 transition-colors",
                      star <= (hoverRating || rating)
                        ? "text-warning fill-warning"
                        : "text-muted"
                    )}
                  />
                </button>
              ))}
            </div>
            {(hoverRating || rating) > 0 && (
              <p className="text-sm font-medium text-primary">
                {ratingLabels[hoverRating || rating]}
              </p>
            )}
          </div>

          {/* Quick Tags */}
          {rating > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                {rating >= 4 ? 'What went well?' : 'What could be better?'}
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          {rating > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Additional comments (optional)</p>
              <Textarea
                placeholder="Share more details about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Service Details */}
          {serviceDetails && (
            <p className="text-xs text-muted-foreground text-center">{serviceDetails}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Skip
          </Button>
          <Button className="flex-1" disabled={rating === 0} onClick={handleSubmit}>
            Submit Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
