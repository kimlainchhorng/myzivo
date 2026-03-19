/**
 * Flight Booking History Page — /flights/bookings
 * Shows all user flight bookings with status and details
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Plane, ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle, Loader2, ChevronRight, Calendar, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
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
            className="flex items-center gap-3 mb-6"
          >
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link to="/flights"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">My Bookings</h1>
              <p className="text-sm text-muted-foreground">Your flight booking history</p>
            </div>
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-card/60 border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-24" />
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
            <Card className="border-border/40">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-7 h-7 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-bold mb-2">No Bookings Yet</h2>
                <p className="text-sm text-muted-foreground mb-6">Search and book your first flight!</p>
                <Button asChild className="bg-[hsl(var(--flights))]">
                  <Link to="/flights">Search Flights</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Bookings list */}
          <div className="space-y-3">
            {bookings?.map((booking: any, idx: number) => {
              const status = getTicketingStatusInfo(booking.ticketing_status || "pending");
              const StatusIcon = statusIcons[booking.ticketing_status] || Clock;
              const colorClass = statusColors[booking.ticketing_status] || statusColors.pending;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className="bg-card/80 backdrop-blur-sm border-border/40 hover:border-[hsl(var(--flights))]/30 transition-all duration-200 cursor-pointer group"
                    onClick={() => setSelectedId(booking.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-[hsl(var(--flights))]" />
                          <span className="font-semibold text-sm">
                            {booking.origin} → {booking.destination}
                          </span>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] gap-1", colorClass)}>
                          <StatusIcon className={cn("w-3 h-3", booking.ticketing_status === "processing" && "animate-spin")} />
                          {status.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {booking.departure_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {String(booking.passengers)} pax
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">
                          Ref: {booking.booking_reference}
                        </span>
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

  return (
    <Dialog open={!!bookingId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/40">
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
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className={cn("text-xs", statusColors[booking.ticketing_status] || "")}
              >
                {statusInfo?.label}
              </Badge>
            </div>

            {/* Route */}
            <div className="text-center py-3 bg-muted/30 rounded-xl">
              <p className="text-lg font-bold">
                {booking.origin} <Plane className="w-4 h-4 inline text-[hsl(var(--flights))] -rotate-12 mx-1" /> {booking.destination}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{booking.departure_date}</p>
            </div>

            <Separator />

            {/* Details rows */}
            <div className="space-y-3 text-sm">
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
                <span className="text-muted-foreground">Passengers</span>
                <span>{String(booking.passengers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cabin</span>
                <span className="capitalize">{String(booking.cabin_class || "").replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="capitalize">{booking.payment_status}</span>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold text-[hsl(var(--flights))]">
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
                <Separator />
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
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">E-Tickets</p>
                  {(booking.ticket_numbers as string[]).map((t: string, i: number) => (
                    <p key={i} className="font-mono text-sm text-muted-foreground">{t}</p>
                  ))}
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
            <Button asChild className="w-full bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90">
              <Link to={`/flights/confirmation/${booking.id}`}>View Full Details</Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
