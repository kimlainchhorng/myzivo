/**
 * Flight Confirmation Page — /flights/confirmation/:bookingId
 * Clear success/failure states with support contact on failures
 */

import { useParams, Link } from "react-router-dom";
import { CheckCircle, Clock, AlertCircle, Plane, Loader2, Ticket, Calendar, Users, CreditCard, Mail, Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFlightBooking, getTicketingStatusInfo } from "@/hooks/useFlightBooking";
import { cn } from "@/lib/utils";

const FlightConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { data: booking, isLoading, error } = useFlightBooking(bookingId || null);

  const statusInfo = booking ? getTicketingStatusInfo(booking.ticketing_status) : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead title="Booking Confirmation – ZIVO Flights" description="Your flight booking confirmation." />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/6 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-64 h-64 rounded-full bg-primary/4 blur-3xl" />
      </div>

      <Header />

      <main className="pt-20 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-lg">
          {isLoading && (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--flights))]/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 animate-spin text-[hsl(var(--flights))]" />
              </div>
              <p className="text-muted-foreground">Loading your booking...</p>
            </div>
          )}

          {error && (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <p className="font-medium mb-2">Could not load booking</p>
              <p className="text-sm text-muted-foreground mb-4">The booking may not exist or you may not have access.</p>
              <Button variant="outline" asChild><Link to="/flights">Back to Flights</Link></Button>
            </div>
          )}

          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Status hero */}
              <div className="text-center mb-6 pt-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2, damping: 12 }}
                  className={cn(
                    "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                    booking.ticketing_status === "issued" && "bg-primary/10",
                    booking.ticketing_status === "failed" && "bg-destructive/10",
                    !["issued", "failed"].includes(booking.ticketing_status) && "bg-[hsl(var(--flights))]/10",
                  )}
                >
                  {booking.ticketing_status === "issued" ? (
                    <CheckCircle className="w-8 h-8 text-primary" />
                  ) : booking.ticketing_status === "failed" ? (
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  ) : (
                    <Loader2 className="w-8 h-8 text-[hsl(var(--flights))] animate-spin" />
                  )}
                </motion.div>
                <h1 className="text-2xl font-bold mb-1">
                  {booking.ticketing_status === "issued"
                    ? "Booking Confirmed!"
                    : booking.ticketing_status === "failed"
                    ? "Booking Issue"
                    : statusInfo?.label}
                </h1>
                <p className="text-sm text-muted-foreground">{statusInfo?.description}</p>
              </div>

              {/* FAILED STATE: Support contact section */}
              {booking.ticketing_status === "failed" && (
                <Card className="mb-4 border-destructive/20 bg-destructive/5">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">Ticketing Failed</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          There was an issue creating your airline ticket. Your payment may be held temporarily.
                          Our team is reviewing this automatically. If the issue persists, please contact support.
                        </p>
                      </div>
                    </div>
                    <Separator className="mb-4 bg-destructive/10" />
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Contact Support</p>
                    <div className="space-y-2.5">
                      <a
                        href="mailto:support@hizivo.com"
                        className="flex items-center gap-3 text-sm text-foreground hover:text-[hsl(var(--flights))] transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        support@hizivo.com
                      </a>
                      <a
                        href="https://hizivo.com/help"
                        className="flex items-center gap-3 text-sm text-foreground hover:text-[hsl(var(--flights))] transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        Help Center
                      </a>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3">
                      Reference: <span className="font-mono font-medium">{booking.booking_reference}</span>
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* SUCCESS STATE: Green confirmation banner */}
              {booking.ticketing_status === "issued" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-primary">E-ticket issued successfully</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your confirmation has been sent to your email. Present your booking reference at check-in.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Main card — glassmorphic */}
              <Card className="bg-card/80 backdrop-blur-xl border-border/40 mb-4">
                <CardContent className="p-5 space-y-4">
                  {/* Booking ref */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booking Reference</span>
                    <span className="font-mono font-bold text-base tracking-wider">{booking.booking_reference}</span>
                  </div>

                  {booking.pnr && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">PNR</span>
                      <span className="font-mono font-bold tracking-wider">{booking.pnr}</span>
                    </div>
                  )}

                  <Separator className="bg-border/30" />

                  {/* Route */}
                  <div className="text-center py-3 bg-muted/20 rounded-xl border border-border/20">
                    <p className="text-xl font-bold flex items-center justify-center gap-2">
                      {booking.origin}
                      <Plane className="w-4 h-4 text-[hsl(var(--flights))] -rotate-12" />
                      {booking.destination}
                    </p>
                  </div>

                  {/* Info rows */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{booking.departure_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{String(booking.passengers)} traveler{Number(booking.passengers) > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Ticket className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="capitalize">{String(booking.cabin_class || "economy").replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="capitalize">{booking.payment_status}</span>
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Paid</span>
                    <span className="text-2xl font-bold text-[hsl(var(--flights))] tabular-nums">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: String(booking.currency || "USD"),
                        minimumFractionDigits: 0,
                      }).format(Number(booking.total_amount) * Number(booking.passengers || 1))}
                    </span>
                  </div>

                  {/* Passengers list */}
                  {booking.flight_passengers && Array.isArray(booking.flight_passengers) && booking.flight_passengers.length > 0 && (
                    <>
                      <Separator className="bg-border/30" />
                      <div>
                        <p className="text-sm font-medium mb-2">Travelers</p>
                        <div className="space-y-1">
                          {booking.flight_passengers.map((fp: any) => (
                            <p key={fp.id} className="text-sm text-muted-foreground">
                              {fp.given_name} {fp.family_name}
                            </p>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Ticket numbers */}
              {booking.ticket_numbers && Array.isArray(booking.ticket_numbers) && booking.ticket_numbers.length > 0 && (
                <Card className="mb-4 bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" />
                      E-Ticket Numbers
                    </p>
                    {(booking.ticket_numbers as string[]).map((t: string, i: number) => (
                      <p key={i} className="font-mono text-sm text-muted-foreground">{t}</p>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Processing indicator */}
              {(booking.ticketing_status === "pending" || booking.ticketing_status === "processing") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-4 rounded-xl bg-[hsl(var(--flights))]/5 border border-[hsl(var(--flights))]/20 mb-4"
                >
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[hsl(var(--flights))]" />
                  <p className="text-sm font-medium">Your ticket is being processed</p>
                  <p className="text-xs text-muted-foreground">This page updates automatically</p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 active:scale-[0.98] transition-all">
                  <Link to="/flights/bookings">My Bookings</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 border-border/40">
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
