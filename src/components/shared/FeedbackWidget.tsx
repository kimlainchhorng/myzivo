/**
 * FeedbackWidget - Floating feedback collection widget
 */

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, X, Send, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface FeedbackWidgetProps {
  context?: string; // e.g., "flight_results", "checkout"
  className?: string;
  position?: "bottom-right" | "bottom-left";
}

export function FeedbackWidget({
  context = "general",
  className,
  position = "bottom-right",
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleQuickFeedback = (type: "positive" | "negative") => {
    setRating(type);
    if (type === "negative") {
      setShowDetails(true);
    } else {
      submitFeedback(type, "");
    }
  };

  const submitFeedback = async (
    ratingType: "positive" | "negative",
    details: string
  ) => {
    setIsSubmitting(true);
    try {
      // In production, this would submit to the database
      console.log("Feedback submitted:", { context, rating: ratingType, details });
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve.",
      });
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Failed to submit",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(null);
    setFeedback("");
    setShowDetails(false);
  };

  const positionClasses = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
  };

  return (
    <div className={cn(positionClasses[position], "z-50", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="rounded-full shadow-xl h-14 w-14 p-0 bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-110 active:scale-90 touch-manipulation"
            variant="default"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align={position === "bottom-right" ? "end" : "start"}
          className="w-80 p-4"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Quick Feedback</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!showDetails ? (
              <>
                <p className="text-sm text-muted-foreground">
                  How's your experience so far?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant={rating === "positive" ? "default" : "outline"}
                    className="flex-1 gap-2 rounded-xl h-10 active:scale-95 transition-all duration-200 touch-manipulation"
                    onClick={() => handleQuickFeedback("positive")}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Good
                  </Button>
                  <Button
                    variant={rating === "negative" ? "destructive" : "outline"}
                    className="flex-1 gap-2 rounded-xl h-10 active:scale-95 transition-all duration-200 touch-manipulation"
                    onClick={() => handleQuickFeedback("negative")}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Could be better
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground rounded-xl active:scale-95 transition-all duration-200 touch-manipulation mt-2"
                  onClick={() => setShowDetails(true)}
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-2" />
                  Report an issue
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tell us more {rating === "negative" && "(optional)"}
                  </label>
                  <Textarea
                    placeholder="What could we improve?"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="resize-none rounded-xl focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl active:scale-95 transition-all duration-200 touch-manipulation"
                    onClick={() => {
                      setShowDetails(false);
                      setRating(null);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 gap-2 rounded-xl shadow-md active:scale-95 transition-all duration-200 touch-manipulation"
                    onClick={() => submitFeedback(rating || "negative", feedback)}
                    disabled={isSubmitting}
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Sending..." : "Submit"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Inline feedback for specific contexts
export function InlineFeedback({
  question = "Was this helpful?",
  onFeedback,
  className,
}: {
  question?: string;
  onFeedback?: (positive: boolean) => void;
  className?: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (positive: boolean) => {
    setSubmitted(true);
    onFeedback?.(positive);
  };

  if (submitted) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 text-sm", className)}>
      <span className="text-muted-foreground">{question}</span>
      <div className="flex gap-1">
        <button
          onClick={() => handleFeedback(true)}
          className="p-1.5 rounded-xl hover:bg-muted active:scale-90 transition-all duration-200 touch-manipulation"
          aria-label="Yes, helpful"
        >
          <ThumbsUp className="w-4 h-4 text-muted-foreground hover:text-emerald-500" />
        </button>
        <button
          onClick={() => handleFeedback(false)}
          className="p-1.5 rounded-xl hover:bg-muted active:scale-90 transition-all duration-200 touch-manipulation"
          aria-label="No, not helpful"
        >
          <ThumbsDown className="w-4 h-4 text-muted-foreground hover:text-red-500" />
        </button>
      </div>
    </div>
  );
}

export default FeedbackWidget;
