/**
 * Flight Booking History Page — /flights/bookings
 * Polished, mobile-first, with detailed modal and status states
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Plane, ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle, Loader2, ChevronRight, Calendar, Users, Mail, MessageCircle, Ticket, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFlightBookings, useFlightBooking, getTicketingStatusInfo } from "@/hooks/useFlightBooking";
import { getDuffelAirlineLogo } from "@/hooks/useDuffelFlights";
import { cn } from "@/lib/utils";

const statusIcons: Record<string, typeof CheckCircle> = {
  issued: CheckCircle,
  failed: AlertCircle,
  cancelled: XCircle,
  voided: XCircle,
  pending: Clock,
  processing: Loader2,
};

const statusColors: Record<string, string> = {
  issued: "text-primary border-primary/30 bg-primary/5",
  failed: "text-destructive border-destructive/30 bg-destructive/5",
  cancelled: "text-muted-foreground border-border bg-muted/30",
  voided: "text-muted-foreground border-border bg-muted/30",
  pending: "text-amber-600 border-amber-500/30 bg-amber-500/5",
  processing: "text-[hsl(var(--flights))] border-[hsl(var(--flights))]/30 bg-[hsl(var(--flights))]/5",
};

export default function FlightBookingsPage() {
  const { data: bookings, isLoading, error } = useFlightBookings();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead title="My Flight Bookings – ZIVO" description="View your flight booking history." />

      {/* Decorative orb */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/6 blur-3xl" />
      </div>

      <Header />

      <main className="pt-20 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 mb-6"
          >
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="shrink-0">
                <Link to="/flights"><ArrowLeft className="w-5 h-5" /></Link>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">My Bookings</h1>
                <p className="text-sm text-muted-foreground">
                  {bookings && bookings.length > 0 ? `${bookings.length} booking${bookings.length > 1 ? "s" : ""}` : "Your flight booking history"}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="border-border/40">
              <Link to="/flights">New Search</Link>
            </Button>
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-card/60 border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div>
                          <Skeleton className="h-4 w-28 mb-1.5" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <Card className="border-destructive/20">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 text-destructive" />
                <p className="font-medium mb-2">Could not load bookings</p>
                <p className="text-sm text-muted-foreground">Please try again later.</p>
              </CardContent>
            </Card>
          )}

          {/* Empty */}
          {!isLoading && !error && bookings && bookings.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--flights))]/10 flex items-center justify-center mx-auto mb-5">
                    <Plane className="w-8 h-8 text-[hsl(var(--flights))]" />
                  </div>
                  <h2 className="text-lg font-bold mb-2">No Bookings Yet</h2>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                    Search and book your first flight to see your bookings here.
                  </p>
                  <Button asChild className="bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 active:scale-[0.98]">
                    <Link to="/flights">Search Flights</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Bookings list */}
          <div className="space-y-3">
            {bookings?.map((booking: any, idx: number) => {
              const status = getTicketingStatusInfo(booking.ticketing_status || "pending");
              const StatusIcon = statusIcons[booking.ticketing_status] || Clock;
              const colorClass = statusColors[booking.ticketing_status] || statusColors.pending;
              const airlineCode = booking.airline_code || "";

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Card
                    className="bg-card/80 backdrop-blur-sm border-border/40 hover:border-[hsl(var(--flights))]/30 hover:shadow-lg hover:shadow-[hsl(var(--flights))]/5 transition-all duration-200 cursor-pointer group active:scale-[0.99]"
                    onClick={() => setSelectedId(booking.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {/* Airline logo */}
                          <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border/30 flex items-center justify-center overflow-hidden shrink-0">
                            {airlineCode ? (
                              <img
                                src={getDuffelAirlineLogo(airlineCode)}
                                alt={airlineCode}
                                className="w-7 h-7 object-contain"
                                onError={(e) => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = 'none';
                                  el.parentElement!.innerHTML = `<span class="text-xs font-bold text-muted-foreground">${airlineCode}</span>`;
                                }}
                              />
                            ) : (
                              <Plane className="w-4 h-4 text-[hsl(var(--flights))]" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-sm block">
                              {booking.origin} → {booking.destination}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {booking.departure_date}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] gap-1 shrink-0", colorClass)}>
                          <StatusIcon className={cn("w-3 h-3", booking.ticketing_status === "processing" && "animate-spin")} />
                          {status.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {String(booking.passengers)} pax
                          </span>
                          <span className="font-mono">
                            {booking.booking_reference}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[hsl(var(--flights))] tabular-nums">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: String(booking.currency || "USD"),
                              minimumFractionDigits: 0,
                            }).format(Number(booking.total_amount))}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[hsl(var(--flights))] transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Booking Details Modal */}
      <BookingDetailsModal bookingId={selectedId} onClose={() => setSelectedId(null)} />

      <Footer />
    </div>
  );
}

function BookingDetailsModal({ bookingId, onClose }: { bookingId: string | null; onClose: () => void }) {
  const { data: booking, isLoading } = useFlightBooking(bookingId);

  if (!bookingId) return null;

  const statusInfo = booking ? getTicketingStatusInfo(booking.ticketing_status) : null;
  const StatusIcon = booking ? (statusIcons[booking.ticketing_status] || Clock) : Clock;
  const colorClass = booking ? (statusColors[booking.ticketing_status] || statusColors.pending) : "";

  return (
    <Dialog open={!!bookingId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/40 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-[hsl(var(--flights))]" />
            Booking Details
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[hsl(var(--flights))]" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        )}

        {booking && (
          <div className="space-y-4">
            {/* Status badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="outline" className={cn("text-xs gap-1", colorClass)}>
                <StatusIcon className={cn("w-3 h-3", booking.ticketing_status === "processing" && "animate-spin")} />
                {statusInfo?.label}
              </Badge>
            </div>

            {/* Route card */}
            <div className="text-center py-3 bg-muted/30 rounded-xl border border-border/20">
              <p className="text-lg font-bold">
                {booking.origin} <Plane className="w-4 h-4 inline text-[hsl(var(--flights))] -rotate-12 mx-1" /> {booking.destination}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{booking.departure_date}</p>
            </div>

            <Separator className="bg-border/30" />

            {/* Info rows */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking Reference</span>
                <span className="font-mono font-bold">{booking.booking_reference}</span>
              </div>
              {booking.pnr && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PNR</span>
                  <span className="font-mono font-bold">{booking.pnr}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Passengers</span>
                <span>{String(booking.passengers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> Cabin</span>
                <span className="capitalize">{String(booking.cabin_class || "").replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Payment</span>
                <span className="capitalize">{booking.payment_status}</span>
              </div>
            </div>

            <Separator className="bg-border/30" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold text-[hsl(var(--flights))] tabular-nums">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: String(booking.currency || "USD"),
                  minimumFractionDigits: 0,
                }).format(Number(booking.total_amount) * Number(booking.passengers || 1))}
              </span>
            </div>

            {/* Passengers */}
            {booking.flight_passengers && Array.isArray(booking.flight_passengers) && booking.flight_passengers.length > 0 && (
              <>
                <Separator className="bg-border/30" />
                <div>
                  <p className="text-sm font-medium mb-2">Travelers</p>
                  {booking.flight_passengers.map((fp: any) => (
                    <p key={fp.id} className="text-sm text-muted-foreground">{fp.given_name} {fp.family_name}</p>
                  ))}
                </div>
              </>
            )}

            {/* Ticket numbers */}
            {booking.ticket_numbers && Array.isArray(booking.ticket_numbers) && booking.ticket_numbers.length > 0 && (
              <>
                <Separator className="bg-border/30" />
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-primary" />
                    E-Tickets
                  </p>
                  {(booking.ticket_numbers as string[]).map((t: string, i: number) => (
                    <p key={i} className="font-mono text-sm text-muted-foreground">{t}</p>
                  ))}
                </div>
              </>
            )}

            {/* Failed: support contact */}
            {booking.ticketing_status === "failed" && (
              <>
                <Separator className="bg-border/30" />
                <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2">
                  <p className="text-xs font-semibold text-destructive">Need help with this booking?</p>
                  <a
                    href="mailto:support@hizivo.com"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    support@hizivo.com
                  </a>
                  <a
                    href="https://hizivo.com/help"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Help Center
                  </a>
                </div>
              </>
            )}

            {/* Processing indicator */}
            {(booking.ticketing_status === "pending" || booking.ticketing_status === "processing") && (
              <div className="text-center p-3 rounded-xl bg-[hsl(var(--flights))]/5 border border-[hsl(var(--flights))]/20">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-[hsl(var(--flights))]" />
                <p className="text-xs font-medium">{statusInfo?.description}</p>
              </div>
            )}

            {/* View full page */}
            <Button asChild className="w-full bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 active:scale-[0.98]">
              <Link to={`/flights/confirmation/${booking.id}`}>View Full Details</Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
