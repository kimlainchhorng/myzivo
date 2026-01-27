import { useState } from "react";
import { Star, X, Sparkles, Send, ThumbsUp, ThumbsDown, Heart, Gift, Trophy } from "lucide-react";
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
  const [showConfetti, setShowConfetti] = useState(false);

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
    if (rating === 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    onSubmit(rating, comment, selectedTags);
    setRating(0);
    setComment("");
    setSelectedTags([]);
    onClose();
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const ratingEmojis = ['', '😞', '😐', '🙂', '😊', '🤩'];
  const ratingColors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-emerald-500', 'text-primary'];
  const ratingGradients = ['', 'from-red-500 to-red-600', 'from-orange-500 to-orange-600', 'from-yellow-500 to-yellow-600', 'from-emerald-500 to-emerald-600', 'from-primary to-teal-400'];

  const serviceIcons = {
    ride: '🚗',
    food: '🍕',
    hotel: '🏨',
    car: '🚙',
    flight: '✈️',
  };

  const serviceColors = {
    ride: 'from-rides/20 to-rides/5',
    food: 'from-eats/20 to-eats/5',
    hotel: 'from-amber-500/20 to-amber-500/5',
    car: 'from-primary/20 to-primary/5',
    flight: 'from-sky-500/20 to-sky-500/5',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-card/98 to-card backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-primary/10 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-radial from-amber-500/10 to-transparent blur-2xl" />
        </div>
        
        {/* Confetti animation for 5-star */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-50"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    y: -20, 
                    x: Math.random() * 300 - 150,
                    rotate: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    y: 400, 
                    rotate: 360,
                    opacity: 0 
                  }}
                  transition={{ duration: 1.5, delay: i * 0.1 }}
                  className="absolute left-1/2 top-0"
                >
                  <span className="text-2xl">{['🎉', '⭐', '✨', '🌟'][i % 4]}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        <DialogHeader className="relative text-center pb-2">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center mx-auto mb-4 shadow-xl",
              serviceColors[serviceType]
            )}
          >
            <span className="text-4xl">{serviceIcons[serviceType]}</span>
          </motion.div>
          <DialogTitle className="text-2xl font-display font-bold">Rate Your Experience</DialogTitle>
          <DialogDescription className="text-muted-foreground">{serviceName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 relative">
          {/* Star Rating - Premium Design */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-4 p-3 rounded-2xl bg-muted/20">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  whileHover={{ scale: 1.2, y: -8 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 transition-transform focus:outline-none relative"
                >
                  <Star
                    className={cn(
                      "h-12 w-12 transition-all duration-300",
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                        : "text-muted/30"
                    )}
                  />
                  {star <= (hoverRating || rating) && star === (hoverRating || rating) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              {(hoverRating || rating) > 0 && (
                <motion.div
                  key={hoverRating || rating}
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-center justify-center gap-3"
                >
                  <motion.span 
                    className="text-4xl"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {ratingEmojis[hoverRating || rating]}
                  </motion.span>
                  <span className={cn(
                    "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                    ratingGradients[hoverRating || rating]
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
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    rating >= 4 ? "bg-emerald-500/10" : "bg-orange-500/10"
                  )}>
                    {rating >= 4 ? (
                      <ThumbsUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <p className="text-sm font-bold">
                    {rating >= 4 ? 'What made it great?' : 'What could improve?'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.04, type: "spring", stiffness: 300 }}
                    >
                      <Badge
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer px-3 py-2 text-sm transition-all font-medium",
                          selectedTags.includes(tag)
                            ? rating >= 4 
                              ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-0 text-white shadow-lg shadow-emerald-500/30"
                              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0 text-white shadow-lg shadow-orange-500/30"
                            : "hover:bg-muted/80 border-border/50"
                        )}
                        onClick={() => toggleTag(tag)}
                      >
                        {selectedTags.includes(tag) && <Heart className="w-3 h-3 mr-1.5 fill-current" />}
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
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-bold">Additional comments</p>
                  <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">(optional)</span>
                </div>
                <Textarea
                  placeholder="Share more details about your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="rounded-2xl border-border/50 bg-muted/20 resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reward hint for 5-star */}
          <AnimatePresence>
            {rating === 5 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
              >
                <Trophy className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Thanks for the 5-star rating!</p>
                  <p className="text-xs text-muted-foreground">Your feedback helps us improve</p>
                </div>
                <Gift className="w-5 h-5 text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Service Details */}
          {serviceDetails && (
            <p className="text-xs text-muted-foreground text-center bg-muted/30 rounded-xl py-3 px-4 border border-border/30">
              {serviceDetails}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex-1 h-13 rounded-2xl border-2 font-semibold" 
            onClick={onClose}
          >
            Skip for now
          </Button>
          <motion.div 
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className={cn(
                "w-full h-13 rounded-2xl font-bold text-white transition-all",
                rating >= 4 
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/30"
                  : rating > 0
                    ? "bg-gradient-to-r from-primary to-teal-400 hover:opacity-90 shadow-lg shadow-primary/30"
                    : "bg-muted text-muted-foreground"
              )}
              disabled={rating === 0} 
              onClick={handleSubmit}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Rating
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
