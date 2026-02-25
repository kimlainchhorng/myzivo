/**
 * Booking Management Page
 * User-facing page to view and manage individual bookings
 */

import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Plane,
  Calendar,
  Users,
  FileText,
  Phone,
  Mail,
  Download,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowLeft,
  ExternalLink,
  Info,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TicketStatus = "issued" | "pending" | "changed" | "cancelled";

interface BookingDetails {
  bookingRef: string;
  airlineCode: string;
  status: TicketStatus;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureDate: string;
  passengers: number;
  cabinClass: string;
  providerPhone: string;
  providerEmail: string;
  changePolicy: string;
  cancelPolicy: string;
  baggagePolicy: string;
  refundEligibility: string;
}

// Mock booking data (would be fetched from API)
const mockBooking: BookingDetails = {
  bookingRef: "ZV-ABC123",
  airlineCode: "DL1234",
  status: "issued",
  flightNumber: "DL1234",
  airline: "Delta Air Lines",
  origin: "New York (JFK)",
  destination: "Los Angeles (LAX)",
  departureDate: "February 10, 2024",
  passengers: 2,
  cabinClass: "Economy",
  providerPhone: "1-800-221-1212",
  providerEmail: "support@delta.com",
  changePolicy: "Changes permitted for $75 fee up to 24 hours before departure",
  cancelPolicy: "Refundable with $50 fee if cancelled 24+ hours before departure",
  baggagePolicy: "1 carry-on bag included. Checked bags from $35",
  refundEligibility: "Eligible for refund minus cancellation fee",
};

const statusConfig: Record<TicketStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  issued: {
    label: "Ticket Issued",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  changed: {
    label: "Changed",
    icon: AlertCircle,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
};

const BookingManagement = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking] = useState<BookingDetails>(mockBooking);

  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Booking ${bookingId} | ZIVO`}
        description="Manage your booking, view ticket status, and access provider contact information."
        canonical={`https://hizivo.com/bookings/${bookingId}`}
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back Navigation */}
          <Link
            to="/my-trips"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Trips
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold mb-2">
                  Booking Management
                </h1>
                <p className="text-muted-foreground">
                  Reference: <span className="font-mono font-semibold text-foreground">{booking.bookingRef}</span>
                </p>
              </div>
              <Badge className={cn(status.bg, status.color, "border-0 gap-1.5 py-1.5 px-3")}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Flight Details Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                Flight Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {booking.origin.split(" (")[0]} → {booking.destination.split(" (")[0]}
                  </p>
                  <p className="text-muted-foreground">
                    {booking.airline} {booking.flightNumber}
                  </p>
                </div>
                <Badge variant="outline">{booking.cabinClass}</Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Departure</p>
                    <p className="font-medium">{booking.departureDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Passengers</p>
                    <p className="font-medium">{booking.passengers} Adult{booking.passengers > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Airline Confirmation: <span className="font-mono font-semibold text-foreground">{booking.airlineCode}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Rules Accordion */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Booking Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="changes" className="border-border/50">
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Change Policy
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {booking.changePolicy}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="cancel" className="border-border/50">
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      Cancellation Policy
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {booking.cancelPolicy}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="baggage" className="border-border/50">
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      Baggage Allowance
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {booking.baggagePolicy}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="refund" className="border-border/50">
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Refund Eligibility
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {booking.refundEligibility}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Provider Contact Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5 text-primary" />
                Provider Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plane className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold">{booking.airline}</p>
                  <p className="text-sm text-muted-foreground">Operating Carrier</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <a
                  href={`tel:${booking.providerPhone.replace(/-/g, "")}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] touch-manipulation"
                >
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{booking.providerPhone}</span>
                </a>
                <a
                  href={`mailto:${booking.providerEmail}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] touch-manipulation"
                >
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{booking.providerEmail}</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Download E-Ticket
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/help">
                <MessageCircle className="w-4 h-4" />
                Request Support
              </Link>
            </Button>
          </div>

          {/* Important Notice */}
          <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Important Information</p>
                <p className="text-muted-foreground">
                  For changes, cancellations, or refunds, please contact the airline directly using the details above.
                  ZIVO facilitates the booking but does not control fare conditions or airline policies.
                </p>
                <p className="text-muted-foreground">
                  Refunds and changes are governed by the airline or travel provider's rules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingManagement;
