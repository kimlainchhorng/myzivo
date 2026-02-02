/**
 * P2P Booking Confirmation Page
 * Shows booking confirmation and next steps
 */

import { useParams, Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { format, parseISO } from "date-fns";
import {
  CheckCircle, Clock, MapPin, Calendar, Car, User,
  CreditCard, MessageCircle, ArrowRight, Download, Loader2, XCircle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBookingDetail } from "@/hooks/useP2PBooking";
import { useCreateP2PCheckout } from "@/hooks/useP2PPayment";
import { toast } from "sonner";

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Pending Approval",
    description: "Waiting for the owner to confirm your booking request",
  },
  confirmed: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    label: "Confirmed",
    description: "Your booking is confirmed! Proceed to payment to secure your reservation.",
  },
  in_progress: {
    icon: Car,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "In Progress",
    description: "Your trip is currently active",
  },
  completed: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    label: "Completed",
    description: "Trip completed. Don't forget to leave a review!",
  },
  cancelled: {
    icon: Clock,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Cancelled",
    description: "This booking has been cancelled",
  },
};

export default function P2PBookingConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { data: booking, isLoading, refetch } = useBookingDetail(id);
  const createCheckout = useCreateP2PCheckout();

  // Handle payment return query params
  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
    if (paymentStatus === "success") {
      toast.success("Payment successful! Your booking is confirmed.");
      refetch(); // Refresh booking data to get updated payment status
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled. You can try again when ready.");
    }
  }, [paymentStatus, refetch]);

  const handlePayment = () => {
    if (!booking?.id) return;
    createCheckout.mutate({ bookingId: booking.id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <Skeleton className="h-32 w-full rounded-xl mb-6" />
            <Skeleton className="h-64 w-full rounded-xl mb-6" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <Car className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Booking Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find this booking
            </p>
            <Button asChild>
              <Link to="/p2p/my-trips">View My Trips</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;
  const vehicle = booking.vehicle;
  const owner = booking.owner;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Booking Confirmation | ZIVO"
        description="Your P2P car rental booking details"
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Status Banner */}
          <Card className={`mb-6 ${status.bgColor} border-0`}>
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${status.bgColor}`}>
                  <StatusIcon className={`w-8 h-8 ${status.color}`} />
                </div>
                <div>
                  <h1 className="text-xl font-bold mb-1">{status.label}</h1>
                  <p className="text-muted-foreground">{status.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Reference */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Booking Reference</p>
              <p className="font-mono font-bold text-lg">
                {booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {format(parseISO(booking.created_at!), "MMM d, yyyy 'at' h:mm a")}
            </Badge>
          </div>

          {/* Vehicle Card */}
          {vehicle && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {(vehicle.images as string[])?.[0] && (
                    <img
                      src={(vehicle.images as string[])[0]}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      {vehicle.location_city}, {vehicle.location_state}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trip Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Trip Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    Pick-up
                  </div>
                  <p className="font-semibold">
                    {format(parseISO(booking.pickup_date), "EEEE, MMM d, yyyy")}
                  </p>
                  {booking.pickup_location && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.pickup_location}
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    Return
                  </div>
                  <p className="font-semibold">
                    {format(parseISO(booking.return_date), "EEEE, MMM d, yyyy")}
                  </p>
                  {booking.return_location && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.return_location}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>
                    ${booking.daily_rate.toFixed(0)} × {booking.total_days} days
                  </span>
                  <span>${booking.subtotal.toFixed(2)}</span>
                </div>
                {booking.service_fee && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service fee</span>
                    <span>${booking.service_fee.toFixed(2)}</span>
                  </div>
                )}
                {booking.insurance_fee && booking.insurance_accepted && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Insurance</span>
                    <span>${booking.insurance_fee.toFixed(2)}</span>
                  </div>
                )}
                {booking.taxes && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes</span>
                    <span>${booking.taxes.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>${booking.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Info */}
          {owner && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{owner.full_name}</p>
                    {owner.rating && (
                      <p className="text-sm text-muted-foreground">
                        ★ {owner.rating.toFixed(1)} rating
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.status === "pending" && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Wait for owner approval</p>
                      <p className="text-sm text-muted-foreground">
                        The owner will review your request and respond within 24 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 opacity-50">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Complete payment</p>
                      <p className="text-sm text-muted-foreground">
                        Once approved, you'll be able to pay securely
                      </p>
                    </div>
                  </div>
                </>
              )}
              {booking.status === "confirmed" && booking.payment_status === "pending" && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Complete your payment</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Secure your booking by paying now
                    </p>
                    {paymentStatus === "cancelled" && (
                      <Alert className="mb-3 bg-amber-500/10 border-amber-500/20">
                        <XCircle className="w-4 h-4 text-amber-500" />
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                          Payment was cancelled. Click below to try again.
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      onClick={handlePayment}
                      disabled={createCheckout.isPending}
                      className="gap-2"
                    >
                      {createCheckout.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating checkout...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pay ${booking.total_amount.toFixed(2)}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {booking.status === "confirmed" && (booking.payment_status === "captured" || booking.payment_status === "paid" as unknown) && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">Payment complete!</p>
                    <p className="text-sm text-muted-foreground">
                      You're all set. Contact your host for pickup details.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 gap-2" asChild>
              <Link to="/p2p/my-trips">
                View All Trips
              </Link>
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
