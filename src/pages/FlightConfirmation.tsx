/**
 * Flight Confirmation Page — /flights/confirmation/:bookingId
 * Shows booking status, reference, and ticketing progress
 */

import { useParams, Link } from "react-router-dom";
import { CheckCircle, Clock, AlertCircle, Plane, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFlightBooking, getTicketingStatusInfo } from "@/hooks/useFlightBooking";

const FlightConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { data: booking, isLoading, error } = useFlightBooking(bookingId || null);

  const statusInfo = booking ? getTicketingStatusInfo(booking.ticketing_status) : null;

  const StatusIcon = () => {
    if (!booking) return <Clock className="w-10 h-10 text-muted-foreground" />;
    switch (booking.ticketing_status) {
      case "issued":
        return <CheckCircle className="w-10 h-10 text-emerald-500" />;
      case "failed":
        return <AlertCircle className="w-10 h-10 text-destructive" />;
      case "processing":
      case "pending":
        return <Loader2 className="w-10 h-10 text-[hsl(var(--flights))] animate-spin" />;
      default:
        return <Clock className="w-10 h-10 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Booking Confirmation – ZIVO Flights" description="Your flight booking confirmation." />
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-lg">
          {isLoading && (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[hsl(var(--flights))]" />
              <p className="text-muted-foreground">Loading booking...</p>
            </div>
          )}

          {error && (
            <div className="py-20 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-3 text-destructive" />
              <p className="font-medium mb-2">Could not load booking</p>
              <Button variant="outline" asChild><Link to="/flights">Back to Flights</Link></Button>
            </div>
          )}

          {booking && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Status hero */}
              <div className="text-center mb-6 pt-4">
                <StatusIcon />
                <h1 className="text-2xl font-bold mt-4 mb-1">
                  {booking.ticketing_status === "issued" ? "Booking Confirmed!" : statusInfo?.label}
                </h1>
                <p className="text-sm text-muted-foreground">{statusInfo?.description}</p>
              </div>

              {/* Booking card */}
              <Card className="mb-4">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booking Reference</span>
                    <span className="font-mono font-bold text-lg">{booking.booking_reference}</span>
                  </div>

                  {booking.pnr && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">PNR</span>
                      <span className="font-mono font-bold">{booking.pnr}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[hsl(var(--flights))]" />
                      <span className="font-semibold">{booking.origin} → {booking.destination}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        booking.ticketing_status === "issued"
                          ? "border-emerald-500/30 text-emerald-600"
                          : booking.ticketing_status === "failed"
                          ? "border-destructive/30 text-destructive"
                          : "border-[hsl(var(--flights))]/30 text-[hsl(var(--flights))]"
                      }
                    >
                      {statusInfo?.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{booking.departure_date}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Passengers</span>
                    <span>{booking.passengers}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cabin</span>
                    <span className="capitalize">{booking.cabin_class?.replace("_", " ")}</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Paid</span>
                    <span className="text-xl font-bold text-[hsl(var(--flights))]">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: booking.currency || "USD",
                        minimumFractionDigits: 0,
                      }).format(booking.total_amount * (booking.passengers || 1))}
                    </span>
                  </div>

                  {/* Passengers list */}
                  {booking.flight_passengers && booking.flight_passengers.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Travelers</p>
                        {booking.flight_passengers.map((fp: any) => (
                          <p key={fp.id} className="text-sm text-muted-foreground">
                            {fp.given_name} {fp.family_name}
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Ticket numbers */}
              {booking.ticket_numbers && booking.ticket_numbers.length > 0 && (
                <Card className="mb-4 border-emerald-500/20">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium mb-2">E-Ticket Numbers</p>
                    {booking.ticket_numbers.map((t: string, i: number) => (
                      <p key={i} className="font-mono text-sm">{t}</p>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Processing indicator */}
              {(booking.ticketing_status === "pending" || booking.ticketing_status === "processing") && (
                <div className="text-center p-4 rounded-xl bg-[hsl(var(--flights-light))] border border-[hsl(var(--flights))]/20 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[hsl(var(--flights))]" />
                  <p className="text-sm font-medium">Your ticket is being processed</p>
                  <p className="text-xs text-muted-foreground">This page updates automatically</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90">
                  <Link to="/app/trips">View My Trips</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/flights">Search More Flights</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightConfirmation;
