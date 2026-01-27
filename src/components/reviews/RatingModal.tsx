import { useState } from "react";
import { Star, X, Sparkles, Send, ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const ratingEmojis = ['', '😞', '😐', '🙂', '😊', '🤩'];
  const ratingColors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-emerald-500', 'text-primary'];

  const serviceIcons = {
    ride: '🚗',
    food: '🍕',
    hotel: '🏨',
    car: '🚙',
    flight: '✈️',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 pointer-events-none" />
        
        <DialogHeader className="relative text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3"
          >
            <span className="text-3xl">{serviceIcons[serviceType]}</span>
          </motion.div>
          <DialogTitle className="text-xl font-display">Rate Your Experience</DialogTitle>
          <DialogDescription className="text-muted-foreground">{serviceName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 relative">
          {/* Star Rating - Enhanced */}
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  whileHover={{ scale: 1.15, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 transition-transform focus:outline-none"
                >
                  <Star
                    className={cn(
                      "h-11 w-11 transition-all duration-200",
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400 drop-shadow-lg"
                        : "text-muted/40"
                    )}
                  />
                </motion.button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              {(hoverRating || rating) > 0 && (
                <motion.div
                  key={hoverRating || rating}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">{ratingEmojis[hoverRating || rating]}</span>
                  <span className={cn(
                    "text-lg font-bold",
                    ratingColors[hoverRating || rating]
                  )}>
                    {ratingLabels[hoverRating || rating]}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Tags - Enhanced */}
          <AnimatePresence>
            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  {rating >= 4 ? (
                    <ThumbsUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-orange-500" />
                  )}
                  <p className="text-sm font-semibold">
                    {rating >= 4 ? 'What went well?' : 'What could be better?'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Badge
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer px-3 py-1.5 text-sm transition-all",
                          selectedTags.includes(tag)
                            ? rating >= 4 
                              ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500"
                              : "bg-orange-500 hover:bg-orange-600 border-orange-500"
                            : "hover:bg-muted/80 border-border/50"
                        )}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comment - Enhanced */}
          <AnimatePresence>
            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold">Additional comments</p>
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </div>
                <Textarea
                  placeholder="Share more details about your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="rounded-xl border-border/50 bg-muted/30 resize-none focus:ring-2 focus:ring-primary/20"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Service Details */}
          {serviceDetails && (
            <p className="text-xs text-muted-foreground text-center bg-muted/30 rounded-lg py-2 px-4">
              {serviceDetails}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl border-2" 
            onClick={onClose}
          >
            Skip for now
          </Button>
          <Button 
            className={cn(
              "flex-1 h-12 rounded-xl font-semibold transition-all",
              rating >= 4 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
                : rating > 0
                  ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30"
                  : ""
            )}
            disabled={rating === 0} 
            onClick={handleSubmit}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
