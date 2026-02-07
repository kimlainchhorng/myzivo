/**
 * RateOrderPage
 * Public page for customers to rate their delivery experience
 * Accessible via /rate/:code without authentication
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertTriangle, Store, Truck } from "lucide-react";
import StarRating from "@/components/rating/StarRating";
import TagSelector from "@/components/rating/TagSelector";
import { useOrderForRating, useSubmitRating } from "@/hooks/useOrderRating";
import { format } from "date-fns";

const RateOrderPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const { data: order, isLoading, error } = useOrderForRating(code);
  const submitRating = useSubmitRating();

  const [driverRating, setDriverRating] = useState(0);
  const [merchantRating, setMerchantRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [contactBack, setContactBack] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!code || driverRating === 0 || merchantRating === 0) return;

    try {
      await submitRating.mutateAsync({
        trackingCode: code,
        driverRating,
        merchantRating,
        comment: comment.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        contactBack,
      });
      setSubmitted(true);
    } catch {
      // Error handled in mutation
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error or not found
  if (error || !order) {
    return (
      <HelmetProvider>
        <Helmet>
          <title>Order Not Found | ZIVO</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This order doesn't exist, hasn't been delivered yet, or the link has expired.
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </HelmetProvider>
    );
  }

  // Already rated
  if (order.already_rated) {
    return (
      <HelmetProvider>
        <Helmet>
          <title>Already Rated | ZIVO</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Already Rated</h2>
              <p className="text-muted-foreground mb-6">
                You've already submitted feedback for this order. Thank you!
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </HelmetProvider>
    );
  }

  // Success state
  if (submitted) {
    return (
      <HelmetProvider>
        <Helmet>
          <title>Thank You! | ZIVO</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-muted-foreground mb-6">
                Your feedback helps us improve our service for everyone.
              </p>
              {contactBack && (
                <p className="text-sm text-primary mb-4">
                  Our support team will contact you soon.
                </p>
              )}
              <Button onClick={() => navigate("/")} className="w-full">
                Continue to ZIVO
              </Button>
            </CardContent>
          </Card>
        </div>
      </HelmetProvider>
    );
  }

  // Rating form
  return (
    <HelmetProvider>
      <Helmet>
        <title>Rate Your Order | ZIVO</title>
      </Helmet>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Rate Your Experience
            </h1>
            <p className="text-muted-foreground">
              Your feedback helps us serve you better
            </p>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Order Summary</CardTitle>
              <CardDescription>
                Delivered on {order.delivered_at 
                  ? format(new Date(order.delivered_at), "MMM d, yyyy 'at' h:mm a")
                  : "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.restaurant_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span>{order.restaurant_name}</span>
                </div>
              )}
              {order.driver_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>Delivered by {order.driver_name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Form */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Driver Rating */}
              {order.driver_name && (
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    How was your driver?
                  </Label>
                  <StarRating
                    value={driverRating}
                    onChange={setDriverRating}
                    size="lg"
                  />
                </div>
              )}

              {/* Merchant Rating */}
              {order.restaurant_name && (
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    How was the food?
                  </Label>
                  <StarRating
                    value={merchantRating}
                    onChange={setMerchantRating}
                    size="lg"
                  />
                </div>
              )}

              {/* Tags */}
              <TagSelector
                selectedTags={selectedTags}
                onChange={setSelectedTags}
              />

              {/* Comment */}
              <div>
                <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
                  Additional comments (optional)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Tell us more about your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/500 characters
                </p>
              </div>

              {/* Contact Back */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="contact-back"
                  checked={contactBack}
                  onCheckedChange={(checked) => setContactBack(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="contact-back"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Request support contact
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Check this if you'd like our team to follow up with you
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={
                  driverRating === 0 ||
                  merchantRating === 0 ||
                  submitRating.isPending
                }
                className="w-full"
                size="lg"
              >
                {submitRating.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            Powered by ZIVO • Your feedback is confidential
          </p>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default RateOrderPage;
