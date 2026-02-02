/**
 * Completed Booking Section
 * Shows completion banner, review forms, and dispute option for completed P2P bookings
 */

import { CheckCircle, Star, PartyPopper, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReviewForm from "@/components/p2p/ReviewForm";
import DisputeForm from "@/components/p2p/DisputeForm";
import type { BookingWithDetails } from "@/types/p2p";

interface CompletedBookingSectionProps {
  booking: BookingWithDetails;
}

export default function CompletedBookingSection({ booking }: CompletedBookingSectionProps) {
  const vehicle = booking.vehicle;
  const owner = booking.owner;

  return (
    <div className="space-y-6">
      {/* Completion Banner */}
      <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-emerald-500/20">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  Trip Completed!
                </h2>
                <PartyPopper className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-muted-foreground">
                Thank you for renting with ZIVO P2P. We hope you had a great experience!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-amber-500" />
            Share Your Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Your reviews help other renters make informed decisions and reward great hosts.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Vehicle Review */}
            {vehicle && (
              <ReviewForm
                bookingId={booking.id}
                reviewType="renter_to_vehicle"
                vehicleId={vehicle.id}
                vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              />
            )}

            {/* Owner Review */}
            {owner && (
              <ReviewForm
                bookingId={booking.id}
                reviewType="renter_to_owner"
                revieweeId={owner.id}
                ownerName={owner.full_name}
              />
            )}
          </div>

          {/* Dispute Option */}
          <Separator className="my-6" />
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Had a problem?</p>
              <p className="text-sm text-muted-foreground mb-3">
                If something went wrong during your trip, you can report an issue to our support team.
              </p>
              <DisputeForm bookingId={booking.id} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
