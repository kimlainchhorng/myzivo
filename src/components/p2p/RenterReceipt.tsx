/**
 * Renter Receipt Component
 * Displays a detailed receipt after P2P booking payment
 */

import { format, parseISO, differenceInDays } from "date-fns";
import { Calendar, Car, MapPin, User, CreditCard, Download, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import type { BookingWithDetails } from "@/types/p2p";

interface RenterReceiptProps {
  booking: BookingWithDetails;
  showActions?: boolean;
}

export default function RenterReceipt({ booking, showActions = true }: RenterReceiptProps) {
  const startDate = booking.pickup_date ? parseISO(booking.pickup_date) : new Date();
  const endDate = booking.return_date ? parseISO(booking.return_date) : new Date();
  const rentalDays = booking.total_days || differenceInDays(endDate, startDate) || 1;

  const vehicleImages = (booking.vehicle?.images as string[]) || [];
  const primaryImage = vehicleImages[0] || "/placeholder.svg";

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "ZIVO Booking Confirmation",
        text: `Booking ${booking.id.slice(0, 8).toUpperCase()} confirmed!`,
        url: window.location.href,
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center border-b">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
        <CardDescription>
          Confirmation #{booking.id.slice(0, 8).toUpperCase()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Vehicle Info */}
        <div className="flex gap-4">
          <img
            src={primaryImage}
            alt={`${booking.vehicle?.make} ${booking.vehicle?.model}`}
            className="w-24 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-semibold">
              {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {booking.vehicle?.location_city}, {booking.vehicle?.location_state}
            </p>
          </div>
        </div>

        <Separator />

        {/* Rental Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pick-up</p>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {format(startDate, "EEE, MMM d, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Return</p>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {format(endDate, "EEE, MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Pick-up Location */}
        {booking.vehicle?.location_address && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pick-up Location</p>
            <p className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {booking.vehicle.location_address}
            </p>
          </div>
        )}

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <h4 className="font-semibold">Price Details</h4>
          
          <div className="flex justify-between text-sm">
            <span>
              {formatPrice(booking.daily_rate || 0)} x {rentalDays} day{rentalDays > 1 ? "s" : ""}
            </span>
            <span>{formatPrice((booking.daily_rate || 0) * rentalDays)}</span>
          </div>

          {booking.service_fee && booking.service_fee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Service fee</span>
              <span>{formatPrice(booking.service_fee)}</span>
            </div>
          )}

          {booking.insurance_fee && booking.insurance_fee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Insurance</span>
              <span>{formatPrice(booking.insurance_fee)}</span>
            </div>
          )}


          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total Paid</span>
            <span>{formatPrice(booking.total_amount || 0)}</span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Payment Status</span>
          </div>
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            Paid
          </Badge>
        </div>

        {/* Owner Info */}
        {booking.owner && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Your Host</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{booking.owner.full_name}</p>
                  {booking.owner.rating && (
                    <p className="text-sm text-muted-foreground">
                      ★ {booking.owner.rating.toFixed(1)} rating
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Important Info */}
        <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <h4 className="font-medium text-amber-600 mb-2">Important Information</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Bring a valid driver's license and ID</li>
            <li>• Contact your host for pick-up arrangements</li>
            <li>• Review the cancellation policy in your booking details</li>
          </ul>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            {navigator.share && (
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
