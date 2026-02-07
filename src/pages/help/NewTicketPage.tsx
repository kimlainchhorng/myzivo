/**
 * New Support Ticket Page
 * Form to create a support ticket with optional ride selection
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRecentRides, useCreateRiderTicket, TICKET_CATEGORIES } from "@/hooks/useRiderSupport";

const NewTicketPage = () => {
  const navigate = useNavigate();
  const { data: recentRides = [], isLoading: ridesLoading } = useRecentRides();
  const createTicket = useCreateRiderTicket();

  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rideId, setRideId] = useState("");

  const isValid = category && subject.trim() && message.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const result = await createTicket.mutateAsync({
        category,
        subject: subject.trim(),
        message: message.trim(),
        rideId: rideId || undefined,
      });

      toast.success(`Ticket ${result.ticketNumber} submitted successfully`);
      navigate("/help/tickets");
    } catch (error) {
      // Error handled in hook
    }
  };

  const formatRideOption = (ride: typeof recentRides[0]) => {
    const date = new Date(ride.created_at);
    const dateStr = format(date, "MMM d, h:mm a");
    const pickup = ride.pickup_address?.split(",")[0] || "Unknown";
    return `${dateStr} - ${pickup}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Report an Issue</h1>
          <div className="w-9" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                maxLength={100}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/2000
              </p>
            </div>

            {/* Related Ride */}
            <div className="space-y-2">
              <Label htmlFor="ride">Related Ride (optional)</Label>
              <Select value={rideId} onValueChange={setRideId}>
                <SelectTrigger id="ride">
                  <SelectValue placeholder={ridesLoading ? "Loading rides..." : "Select a recent ride..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {recentRides.map((ride) => (
                    <SelectItem key={ride.id} value={ride.id}>
                      {formatRideOption(ride)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Linking a ride helps us investigate faster
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Priority Notice for Safety */}
        {category === "safety" && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Safety concerns are treated with highest priority. For immediate emergencies, please call 911.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!isValid || createTicket.isPending}
        >
          {createTicket.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          We typically respond within 24 hours
        </p>
      </form>
    </div>
  );
};

export default NewTicketPage;
