/**
 * Owner Bookings Page
 * Manage incoming booking requests and active rentals
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  Car, Calendar, User, Clock, CheckCircle, XCircle,
  ChevronRight, MessageCircle, AlertCircle, Star
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCarOwnerProfile } from "@/hooks/useCarOwner";
import { useOwnerBookings, useRespondToBooking, useCompleteBooking, type BookingWithDetails } from "@/hooks/useP2PBooking";
import { useBookingReview } from "@/hooks/useP2PReview";
import OwnerReviewDialog from "@/components/p2p/OwnerReviewDialog";

export default function OwnerBookings() {
  const { data: profile } = useCarOwnerProfile();
  const { data: bookings, isLoading } = useOwnerBookings(profile?.id);
  const respondToBooking = useRespondToBooking();
  const completeBooking = useCompleteBooking();

  const [activeTab, setActiveTab] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [dialogAction, setDialogAction] = useState<"confirm" | "reject" | "complete" | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<BookingWithDetails | null>(null);

  // Filter bookings - use "active" instead of "in_progress" to match DB enum
  const pendingBookings = bookings?.filter((b) => b.status === "pending") || [];
  const confirmedBookings = bookings?.filter((b) => b.status === "confirmed") || [];
  const activeBookings = bookings?.filter((b) => b.status === "active") || [];
  const completedBookings = bookings?.filter((b) => ["completed", "cancelled"].includes(b.status || "")) || [];

  const handleAction = async () => {
    if (!selectedBooking || !dialogAction) return;

    if (dialogAction === "complete") {
      await completeBooking.mutateAsync({ bookingId: selectedBooking.id });
    } else {
      await respondToBooking.mutateAsync({
        bookingId: selectedBooking.id,
        action: dialogAction,
        reason: dialogAction === "reject" ? rejectReason : undefined,
      });
    }

    setSelectedBooking(null);
    setDialogAction(null);
    setRejectReason("");
  };

  const openDialog = (booking: BookingWithDetails, action: "confirm" | "reject" | "complete") => {
    setSelectedBooking(booking);
    setDialogAction(action);
  };

  const openReviewDialog = (booking: BookingWithDetails) => {
    setReviewBooking(booking);
    setReviewDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Booking Requests | ZIVO Owner"
        description="Manage your P2P car rental booking requests"
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Booking Requests</h1>
              <p className="text-muted-foreground">
                Manage incoming requests and active rentals
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/owner/dashboard">Back to Dashboard</Link>
            </Button>
          </div>

          {/* Pending Alert */}
          {pendingBookings.length > 0 && (
            <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="font-medium">
                    You have {pendingBookings.length} pending request{pendingBookings.length !== 1 ? "s" : ""} awaiting your response
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="pending" className="gap-2">
                Pending
                {pendingBookings.length > 0 && (
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-600">
                    {pendingBookings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="gap-2">
                Confirmed
                {confirmedBookings.length > 0 && (
                  <Badge variant="secondary">{confirmedBookings.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="gap-2">
                Active
                {activeBookings.length > 0 && (
                  <Badge variant="secondary">{activeBookings.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="pending">
                  {pendingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {pendingBookings.map((booking) => (
                        <BookingRequestCard
                          key={booking.id}
                          booking={booking}
                          onConfirm={() => openDialog(booking, "confirm")}
                          onReject={() => openDialog(booking, "reject")}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No pending requests"
                      description="New booking requests will appear here"
                    />
                  )}
                </TabsContent>

                <TabsContent value="confirmed">
                  {confirmedBookings.length > 0 ? (
                    <div className="space-y-4">
                      {confirmedBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No confirmed bookings"
                      description="Confirmed bookings waiting for pickup will appear here"
                    />
                  )}
                </TabsContent>

                <TabsContent value="active">
                  {activeBookings.length > 0 ? (
                    <div className="space-y-4">
                      {activeBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          isActive
                          onComplete={() => openDialog(booking, "complete")}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No active rentals"
                      description="Vehicles currently rented out will appear here"
                    />
                  )}
                </TabsContent>

                <TabsContent value="history">
                  {completedBookings.length > 0 ? (
                    <div className="space-y-4">
                      {completedBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          showReviewButton={booking.status === "completed"}
                          onReview={() => openReviewDialog(booking)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No booking history"
                      description="Completed and cancelled bookings will appear here"
                    />
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogAction === "confirm"} onOpenChange={() => setDialogAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm this booking request? The renter will be notified and can proceed to payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={respondToBooking.isPending}
            >
              {respondToBooking.isPending ? "Confirming..." : "Confirm Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={dialogAction === "reject"} onOpenChange={() => setDialogAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this booking request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="e.g., Vehicle not available during these dates"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="mt-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={respondToBooking.isPending || completeBooking.isPending || !rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {respondToBooking.isPending ? "Rejecting..." : "Reject Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Trip Dialog */}
      <AlertDialog open={dialogAction === "complete"} onOpenChange={() => setDialogAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this trip as completed? This will initiate the payout process for this booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={completeBooking.isPending}
            >
              {completeBooking.isPending ? "Completing..." : "Complete Trip"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Owner Review Dialog */}
      <OwnerReviewDialog
        booking={reviewBooking}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
      />
    </div>
  );
}

function BookingRequestCard({
  booking,
  onConfirm,
  onReject,
}: {
  booking: BookingWithDetails;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const vehicle = booking.vehicle;
  const images = (vehicle?.images as string[]) || [];

  return (
    <Card className="border-amber-500/30">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Vehicle Image */}
          <div className="w-full sm:w-32 h-32 sm:h-24 rounded-xl bg-muted overflow-hidden shrink-0">
            {images[0] ? (
              <img
                src={images[0]}
                alt={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-8 h-8 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold">
                  {vehicle
                    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                    : "Vehicle"}
                </h3>
                <Badge variant="secondary" className="mt-1 bg-amber-500/20 text-amber-600">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending Approval
                </Badge>
              </div>
              <span className="text-lg font-bold">
                ${booking.total_amount.toFixed(0)}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {format(parseISO(booking.pickup_date), "MMM d")} -{" "}
                {format(parseISO(booking.return_date), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                Renter ID: {booking.renter_id.slice(0, 8)}...
              </div>
            </div>

            {booking.notes && (
              <div className="p-3 rounded-xl bg-muted/50 text-sm mb-4">
                <p className="text-muted-foreground">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  "{booking.notes}"
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={onConfirm} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Accept
              </Button>
              <Button variant="outline" onClick={onReject} className="gap-2">
                <XCircle className="w-4 h-4" />
                Decline
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingCard({
  booking,
  isActive,
  onComplete,
  showReviewButton,
  onReview,
}: {
  booking: BookingWithDetails;
  isActive?: boolean;
  onComplete?: () => void;
  showReviewButton?: boolean;
  onReview?: () => void;
}) {
  const vehicle = booking.vehicle;
  const images = (vehicle?.images as string[]) || [];
  const { data: existingReview } = useBookingReview(
    showReviewButton ? booking.id : undefined,
    "owner_to_renter"
  );

  const statusBadges = {
    confirmed: { variant: "default" as const, label: "Confirmed" },
    active: { variant: "default" as const, label: "Active" },
    in_progress: { variant: "default" as const, label: "In Progress" },
    completed: { variant: "outline" as const, label: "Completed" },
    cancelled: { variant: "destructive" as const, label: "Cancelled" },
  };
  const status = statusBadges[booking.status as keyof typeof statusBadges] || statusBadges.confirmed;

  return (
    <Card className={cn(isActive && "border-primary/50")}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Vehicle Image */}
          <div className="w-24 h-20 rounded-xl bg-muted overflow-hidden shrink-0">
            {images[0] ? (
              <img
                src={images[0]}
                alt={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-6 h-6 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold truncate">
                {vehicle
                  ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                  : "Vehicle"}
              </h3>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(parseISO(booking.pickup_date), "MMM d")} -{" "}
                {format(parseISO(booking.return_date), "MMM d")}
              </div>
              <div className="font-medium text-foreground">
                ${booking.owner_payout.toFixed(0)} payout
              </div>
            </div>

            {/* Complete Trip button for active bookings */}
            {isActive && onComplete && (
              <Button size="sm" onClick={onComplete} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Mark as Completed
              </Button>
            )}

            {/* Review button for completed bookings */}
            {showReviewButton && onReview && (
              existingReview ? (
                <Badge variant="outline" className="gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Reviewed
                </Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={onReview} className="gap-2">
                  <Star className="w-4 h-4" />
                  Leave Review
                </Button>
              )
            )}
          </div>

          {!isActive && (
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 self-center" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-16">
      <Car className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
