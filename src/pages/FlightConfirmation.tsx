/**
 * Flight Confirmation Page
 * Shows booking confirmation after successful payment
 * Displays PNR, e-ticket numbers, itinerary with airline info
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CheckoutTrustFooter from '@/components/checkout/CheckoutTrustFooter';
import { CHECKOUT_CONFIRMATION } from '@/config/checkoutCompliance';
import {
  Plane,
  CheckCircle,
  Ticket,
  Mail,
  Download,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Loader2,
  AlertCircle,
  Copy,
  Briefcase,
  Send,
  Home,
  Headphones,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useFlightBooking, getTicketingStatusInfo } from '@/hooks/useFlightBooking';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import FlightTicketCard from '@/components/flight/FlightTicketCard';

interface OfferDetails {
  airline?: string;
  airlineCode?: string;
  flightNumber?: string;
  cabinClass?: string;
  duration?: string;
  stops?: number;
  departure?: string;
  arrival?: string;
}

const FlightConfirmation = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const paymentSuccess = searchParams.get('success') === 'true';
  
  const { data: booking, isLoading, error } = useFlightBooking(bookingId || null);
  
  // Get stored offer details for richer display
  const [offerDetails, setOfferDetails] = useState<OfferDetails | null>(null);
  
  useEffect(() => {
    const storedOfferDetails = sessionStorage.getItem('flightOfferDetails');
    if (storedOfferDetails) {
      try {
        setOfferDetails(JSON.parse(storedOfferDetails));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleCopyPNR = () => {
    if (booking?.pnr) {
      navigator.clipboard.writeText(booking.pnr);
      toast({
        title: 'Copied!',
        description: 'Booking reference copied to clipboard.',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your booking...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Booking Not Found – ZIVO" description="Unable to find your booking." />
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h1 className="text-xl font-bold mb-2">Booking Not Found</h1>
                <p className="text-muted-foreground mb-6">
                  We couldn't find this booking. Please check your email for confirmation.
                </p>
                <Button onClick={() => navigate('/dashboard/trips')} className="gap-2">
                  <Briefcase className="w-4 h-4" />
                  View My Trips
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusInfo = getTicketingStatusInfo(booking.ticketing_status);
  const isProcessing = booking.ticketing_status === 'pending' || booking.ticketing_status === 'processing';
  const isIssued = booking.ticketing_status === 'issued';
  const isFailed = booking.ticketing_status === 'failed';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Booking Confirmed – ZIVO"
        description="Your flight booking has been confirmed."
      />
      <Header />

      <main className="pt-20 pb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 max-w-3xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            {isIssued ? (
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
            ) : isProcessing ? (
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : isFailed ? (
              <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
            ) : null}

            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              {isIssued ? CHECKOUT_CONFIRMATION.success : isProcessing ? 'Processing Your Booking' : 'Booking Status'}
            </h1>
            <p className="text-muted-foreground">
              {isIssued ? CHECKOUT_CONFIRMATION.received : statusInfo.description}
            </p>
            {isIssued && (
              <p className="text-sm text-muted-foreground mt-1">
                {CHECKOUT_CONFIRMATION.email}
              </p>
            )}
          </div>

          {/* Booking Reference */}
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold font-mono tracking-wider">
                      {booking.pnr || booking.booking_reference}
                    </p>
                    {booking.pnr && (
                      <Button size="icon" variant="ghost" onClick={handleCopyPNR} aria-label="Copy booking reference">
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Badge
                  className={cn(
                    "text-sm py-1 px-3",
                    statusInfo.color === 'green' && "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
                    statusInfo.color === 'blue' && "bg-blue-500/20 text-blue-600 border-blue-500/30",
                    statusInfo.color === 'yellow' && "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
                    statusInfo.color === 'red' && "bg-red-500/20 text-red-600 border-red-500/30",
                    statusInfo.color === 'gray' && "bg-muted text-muted-foreground",
                  )}
                >
                  {statusInfo.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Booking Confirmed Block - Enhanced when ticket is issued */}
          {isIssued && (
            <Card className="mb-6 border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold mb-2">Booking Confirmed</h2>
                <p className="text-muted-foreground mb-4">
                  Your ticket has been issued. Your e-ticket and itinerary have been sent to your email.
                </p>
                
                {/* Key details grid */}
                <div className="grid grid-cols-3 gap-4 mt-4 text-left max-w-md mx-auto">
                  <div>
                    <p className="text-xs text-muted-foreground">Airline</p>
                    <p className="font-medium">{offerDetails?.airline || 'Airline'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Booking Reference</p>
                    <p className="font-mono font-bold">{booking.pnr || booking.booking_reference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ticket Number</p>
                    <p className="font-mono text-sm">
                      {(booking.ticket_numbers as string[])?.[0] || 'Pending'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Confirmation Notice - when ticket is issued */}
          {isIssued && (
            <Alert className="mb-6 border-emerald-500/30 bg-emerald-500/5">
              <Send className="w-4 h-4 text-emerald-500" />
              <AlertDescription>
                <strong>Your e-ticket is on the way!</strong> Confirmation has been sent to the email addresses provided for each passenger.
              </AlertDescription>
            </Alert>
          )}

          {/* Processing Alert */}
          {isProcessing && (
            <Alert className="mb-6 border-blue-500/30 bg-blue-500/5">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <AlertDescription>
                <strong>Your ticket is being issued.</strong> This usually takes a few minutes. 
                You'll receive an email once your e-ticket is ready. This page will update automatically.
              </AlertDescription>
            </Alert>
          )}

          {/* Failed Alert */}
          {isFailed && (
            <Alert className="mb-6 border-destructive/30 bg-destructive/5">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <AlertDescription>
                <strong>There was an issue with your booking.</strong> Our team is looking into it and will contact you shortly. 
                Your payment is secure - if we cannot issue your ticket, you will receive a full refund.
              </AlertDescription>
            </Alert>
          )}

          {/* Boarding Pass Style Ticket Card */}
          <FlightTicketCard
            bookingReference={booking.booking_reference}
            pnr={booking.pnr}
            airline={offerDetails?.airline}
            airlineCode={offerDetails?.airlineCode}
            flightNumber={offerDetails?.flightNumber}
            origin={(booking as any).origin || 'Origin'}
            destination={(booking as any).destination || 'Destination'}
            departureDate={(booking as any).departure_date || ''}
            returnDate={(booking as any).return_date}
            departureTime={offerDetails?.departure}
            arrivalTime={offerDetails?.arrival}
            duration={offerDetails?.duration}
            stops={offerDetails?.stops}
            cabinClass={booking.cabin_class}
            passengers={(booking as any).passengers || 1}
            totalAmount={booking.total_amount}
            currency={(booking as any).currency || 'USD'}
            ticketNumbers={booking.ticket_numbers as string[] | undefined}
            ticketingStatus={booking.ticketing_status}
            className="mb-6"
          />

          {/* Chargeback Prevention - Support Contact */}
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">Need Help with Your Booking?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    For changes, cancellations, or any issues with your booking, please contact ZIVO Support before disputing charges with your bank.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <a href="mailto:support@hizovo.com" className="ml-1 font-medium text-primary hover:underline">
                        support@hizovo.com
                      </a>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Booking Reference:</span>
                      <span className="ml-1 font-mono font-medium">{booking.pnr || booking.booking_reference}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Your e-ticket is on the way</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive your e-ticket and booking confirmation within minutes.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Online check-in</p>
                  <p className="text-sm text-muted-foreground">
                    Most airlines allow online check-in 24 hours before departure.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Briefcase className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Manage your trip</p>
                  <p className="text-sm text-muted-foreground">
                    View your booking anytime in My Trips.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => navigate('/dashboard/trips')}
            >
              <Briefcase className="w-4 h-4" />
              {CHECKOUT_CONFIRMATION.buttons.view}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => window.location.href = 'mailto:support@hizovo.com'}
            >
              <Headphones className="w-4 h-4" />
              {CHECKOUT_CONFIRMATION.buttons.support}
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4" />
              {CHECKOUT_CONFIRMATION.buttons.home}
            </Button>
          </div>

          {/* Trust Footer */}
          <CheckoutTrustFooter className="mt-8" />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightConfirmation;
