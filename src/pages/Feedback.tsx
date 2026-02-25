/**
 * Feedback - User feedback collection page
 */

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Star,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  Bug,
  Send,
  ThumbsUp,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PriceMismatchReport } from "@/components/feedback/PriceMismatchReport";

type FeedbackType = "rating" | "price_mismatch" | "suggestion" | "bug";

const feedbackTypes = [
  {
    id: "rating" as FeedbackType,
    icon: Star,
    label: "Rate Experience",
    description: "Tell us about your booking experience",
  },
  {
    id: "price_mismatch" as FeedbackType,
    icon: AlertTriangle,
    label: "Price Mismatch",
    description: "Report a price difference",
  },
  {
    id: "suggestion" as FeedbackType,
    icon: Lightbulb,
    label: "Suggestion",
    description: "Share ideas for improvement",
  },
  {
    id: "bug" as FeedbackType,
    icon: Bug,
    label: "Report Bug",
    description: "Something not working right?",
  },
];

export default function Feedback() {
  const [selectedType, setSelectedType] = useState<FeedbackType>("rating");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Feedback submitted:", {
      type: selectedType,
      rating: selectedType === "rating" ? rating : null,
      feedback,
      email,
    });

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Thank You | ZIVO Feedback</title>
        </Helmet>
        <Header />
        <main className="min-h-screen bg-background py-20">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-muted-foreground mb-8">
              Your feedback helps us improve ZIVO for everyone. We appreciate you taking the time
              to share your thoughts.
            </p>
            <Button onClick={() => setIsSubmitted(false)}>Submit More Feedback</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Feedback | ZIVO</title>
        <meta name="description" content="Share your feedback to help us improve ZIVO" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3">We Value Your Feedback</h1>
            <p className="text-muted-foreground">
              Help us make ZIVO better by sharing your experience
            </p>
          </div>

          {/* Feedback Type Selection */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {feedbackTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all duration-300",
                  selectedType === type.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                    : "border-border hover:border-primary/50 hover:shadow-sm hover:-translate-y-0.5"
                )}
              >
                <type.icon
                  className={cn(
                    "w-6 h-6 mb-2",
                    selectedType === type.id ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
              </button>
            ))}
          </div>

          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {feedbackTypes.find((t) => t.id === selectedType)?.label}
              </CardTitle>
              <CardDescription>
                {feedbackTypes.find((t) => t.id === selectedType)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedType === "price_mismatch" ? (
                <div className="text-center py-6">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-6">
                    Found a different price on the partner site? Click below to report it.
                  </p>
                  <PriceMismatchReport />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Star Rating (for rating type) */}
                  {selectedType === "rating" && (
                    <div className="space-y-3">
                      <Label>How would you rate your experience?</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1"
                          >
                            <Star
                              className={cn(
                                "w-8 h-8 transition-colors",
                                (hoverRating || rating) >= star
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {rating === 5
                            ? "Excellent! We're glad you had a great experience."
                            : rating >= 4
                            ? "Great! Tell us what we can improve."
                            : rating >= 3
                            ? "Thanks! Help us understand what could be better."
                            : "We're sorry to hear that. Please share what went wrong."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Feedback Text */}
                  <div className="space-y-2">
                    <Label htmlFor="feedback">
                      {selectedType === "rating"
                        ? "Tell us more about your experience"
                        : selectedType === "suggestion"
                        ? "What would you like to see improved?"
                        : "Please describe the issue"}
                    </Label>
                    <Textarea
                      id="feedback"
                      placeholder={
                        selectedType === "bug"
                          ? "What happened? What were you trying to do?"
                          : "Share your thoughts..."
                      }
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={5}
                      required
                    />
                  </div>

                  {/* Email (optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional, for follow-up)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] transition-shadow"
                    disabled={isSubmitting || (selectedType === "rating" && rating === 0)}
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Quick Feedback Buttons */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Quick feedback — how's ZIVO working for you?
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  toast({ title: "Thanks for the thumbs up! 👍" });
                }}
              >
                <ThumbsUp className="w-4 h-4" />
                It's great!
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setSelectedType("suggestion")}
              >
                <Lightbulb className="w-4 h-4" />
                Could be better
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
