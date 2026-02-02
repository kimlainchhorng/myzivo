/**
 * Booking Return Page
 * Handles callback from partner checkout
 */
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
  Plane,
  Hotel,
  CarFront,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";
import { useUpdateBookingStatus, TravelServiceType } from "@/hooks/useTravelBookings";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";

type BookingStatus = "success" | "failed" | "pending" | "loading";

const serviceConfig = {
  flights: {
    icon: Plane,
    label: "Flight",
    color: "text-flights",
    bgColor: "bg-flights/10",
  },
  hotels: {
    icon: Hotel,
    label: "Hotel",
    color: "text-hotels",
    bgColor: "bg-hotels/10",
  },
  cars: {
    icon: CarFront,
    label: "Car Rental",
    color: "text-cars",
    bgColor: "bg-cars/10",
  },
};

export default function BookingReturnPage() {
  const [searchParams] = useSearchParams();
  const updateStatus = useUpdateBookingStatus();

  // Parse URL params
  const bookingRef = searchParams.get("bookingRef") || searchParams.get("ref");
  const status = searchParams.get("status") as BookingStatus | null;
  const bookingId = searchParams.get("bookingId");
  const serviceType = (searchParams.get("type") as TravelServiceType) || "flights";
  const partnerName = searchParams.get("partner") || "our travel partner";

  const [pageStatus, setPageStatus] = useState<BookingStatus>("loading");
  const [copied, setCopied] = useState(false);

  const config = serviceConfig[serviceType];
  const Icon = config.icon;

  useEffect(() => {
    const processReturn = async () => {
      // If we have a booking ID, update its status
      if (bookingId) {
        try {
          const newStatus = status === "success" ? "completed" : status === "failed" ? "failed" : "redirected";
          await updateStatus.mutateAsync({
            bookingId,
            status: newStatus,
            partnerBookingRef: bookingRef || undefined,
          });
        } catch (error) {
          console.error("Failed to update booking status:", error);
        }
      }

      // Determine page status
      if (status === "success" || bookingRef) {
        setPageStatus("success");
      } else if (status === "failed") {
        setPageStatus("failed");
      } else {
        setPageStatus("pending");
      }
    };

    processReturn();
  }, [bookingId, status, bookingRef]);

  const handleCopyRef = () => {
    if (bookingRef) {
      navigator.clipboard.writeText(bookingRef);
      setCopied(true);
      toast.success("Booking reference copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (pageStatus === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Processing your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={pageStatus === "success" ? "Booking Confirmed - ZIVO" : "Booking Status - ZIVO"}
        description="View your booking confirmation and details."
        noIndex
      />

      <div className="min-h-screen bg-background">
        <NavBar />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            {/* Success State */}
            {pageStatus === "success" && (
              <Card className="overflow-hidden">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center text-white">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
                  <p className="text-white/90">
                    Your booking has been successfully processed
                  </p>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Service Badge */}
                  <div className="flex justify-center">
                    <Badge variant="outline" className={cn("gap-2 px-4 py-2", config.color)}>
                      <Icon className="w-4 h-4" />
                      {config.label} Booking
                    </Badge>
                  </div>

                  {/* Booking Reference */}
                  {bookingRef && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
                      <div className="inline-flex items-center gap-2 px-4 py-3 bg-muted rounded-xl">
                        <span className="text-xl font-mono font-bold tracking-wider">
                          {bookingRef}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleCopyRef}
                        >
                          <Copy className={cn("w-4 h-4", copied && "text-green-500")} />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Save this reference for your records
                      </p>
                    </div>
                  )}

                  {/* Partner Info */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>Booked via</span>
                    <Badge variant="secondary">{partnerName}</Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <Link to="/trips">
                        View My Trips
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/">
                        Back to Home
                      </Link>
                    </Button>
                  </div>

                  {/* Confirmation Note */}
                  <p className="text-xs text-center text-muted-foreground">
                    A confirmation email has been sent to your email address.
                    Check your spam folder if you don't see it.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Failed State */}
            {pageStatus === "failed" && (
              <Card className="overflow-hidden">
                {/* Error Header */}
                <div className="bg-gradient-to-r from-red-500 to-rose-500 p-8 text-center text-white">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <XCircle className="w-12 h-12" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Booking Failed</h1>
                  <p className="text-white/90">
                    There was an issue processing your booking
                  </p>
                </div>

                <CardContent className="p-6 space-y-6">
                  <p className="text-center text-muted-foreground">
                    Don't worry! Your payment was not processed. Please try again or contact support if the issue persists.
                  </p>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => window.history.go(-2)}
                    >
                      Try Again
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/help">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Contact Support
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending State */}
            {pageStatus === "pending" && (
              <Card className="overflow-hidden">
                {/* Pending Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-center text-white">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <Loader2 className="w-12 h-12 animate-spin" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Booking Pending</h1>
                  <p className="text-white/90">
                    Waiting for confirmation from our partner
                  </p>
                </div>

                <CardContent className="p-6 space-y-6">
                  <p className="text-center text-muted-foreground">
                    Your booking is being processed. You'll receive an email confirmation once it's complete.
                  </p>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <Link to="/trips">
                        Check Trip Status
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/">
                        Back to Home
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Help */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <Link to="/help" className="text-primary hover:underline">
                  Visit our Help Center
                </Link>{" "}
                or{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
