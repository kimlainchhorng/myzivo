/**
 * Renter Trips Page
 * View and manage P2P rental bookings
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO, isPast } from "date-fns";
import {
  Car, Calendar, MapPin, Clock, CheckCircle, XCircle,
  ChevronRight, Search, Filter, Star
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRenterBookings, type BookingWithDetails } from "@/hooks/useP2PBooking";
import { useBookingReview } from "@/hooks/useP2PReview";

const statusBadges = {
  pending: { variant: "secondary" as const, label: "Pending Approval" },
  confirmed: { variant: "default" as const, label: "Confirmed" },
  in_progress: { variant: "default" as const, label: "In Progress" },
  completed: { variant: "outline" as const, label: "Completed" },
  cancelled: { variant: "destructive" as const, label: "Cancelled" },
};

export default function RenterTrips() {
  const { data: bookings, isLoading } = useRenterBookings();
  const [activeTab, setActiveTab] = useState("upcoming");

  // Filter bookings by status - use "active" instead of "in_progress" to match DB enum
  const upcomingBookings = bookings?.filter(
    (b) => ["pending", "confirmed"].includes(b.status || "") && !isPast(parseISO(b.pickup_date))
  ) || [];
  
  const activeBookings = bookings?.filter(
    (b) => b.status === "active"
  ) || [];
  
  const pastBookings = bookings?.filter(
    (b) => ["completed", "cancelled"].includes(b.status || "") || isPast(parseISO(b.return_date))
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="My Trips | ZIVO"
        description="Manage your P2P car rental bookings"
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">My Trips</h1>
              <p className="text-muted-foreground">
                Manage your P2P car rental bookings
              </p>
            </div>
            <Button asChild>
              <Link to="/p2p/search">
                <Search className="w-4 h-4 mr-2" />
                Find a Car
              </Link>
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming" className="gap-2">
                Upcoming
                {upcomingBookings.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {upcomingBookings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="gap-2">
                Active
                {activeBookings.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeBookings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="w-24 h-20 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="upcoming">
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No upcoming trips"
                      description="Browse available cars and book your next adventure"
                      actionLabel="Find a Car"
                      actionLink="/p2p/search"
                    />
                  )}
                </TabsContent>

                <TabsContent value="active">
                  {activeBookings.length > 0 ? (
                    <div className="space-y-4">
                      {activeBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No active trips"
                      description="You don't have any trips in progress"
                    />
                  )}
                </TabsContent>

                <TabsContent value="past">
                  {pastBookings.length > 0 ? (
                    <div className="space-y-4">
                      {pastBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} showReviewStatus />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No past trips"
                      description="Your completed trips will appear here"
                    />
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function BookingCard({ booking, showReviewStatus }: { booking: BookingWithDetails; showReviewStatus?: boolean }) {
  const vehicle = booking.vehicle;
  const status = statusBadges[booking.status as keyof typeof statusBadges] || statusBadges.pending;
  const images = (vehicle?.images as string[]) || [];
  
  // Check review status for completed bookings
  const { data: vehicleReview } = useBookingReview(
    showReviewStatus && booking.status === "completed" ? booking.id : undefined,
    "renter_to_vehicle"
  );

  const hasReviewed = !!vehicleReview;
  const showReviewCTA = showReviewStatus && booking.status === "completed" && !hasReviewed;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Vehicle Image */}
          <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-lg bg-muted overflow-hidden shrink-0">
            {images[0] ? (
              <img
                src={images[0]}
                alt={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-8 h-8 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold truncate">
                  {vehicle
                    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                    : "Vehicle"}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {vehicle?.location_city}, {vehicle?.location_state}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={status.variant}>{status.label}</Badge>
                {showReviewStatus && booking.status === "completed" && (
                  hasReviewed ? (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Reviewed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      Leave Review
                    </Badge>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(parseISO(booking.pickup_date), "MMM d")} -{" "}
                {format(parseISO(booking.return_date), "MMM d")}
              </div>
              <div className="font-medium text-foreground">
                ${booking.total_amount.toFixed(0)}
              </div>
            </div>

            {/* Quick Review CTA for completed trips */}
            {showReviewCTA && (
              <Link to={`/p2p/booking/${booking.id}/confirmation`}>
                <Button size="sm" variant="outline" className="gap-2 text-amber-600 border-amber-500/30 hover:bg-amber-500/10">
                  <Star className="w-4 h-4" />
                  Leave a Review
                </Button>
              </Link>
            )}
          </div>

          <Link to={`/p2p/booking/${booking.id}/confirmation`} className="shrink-0 self-center">
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  actionLink,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
}) {
  return (
    <div className="text-center py-16">
      <Car className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {actionLabel && actionLink && (
        <Button asChild>
          <Link to={actionLink}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
