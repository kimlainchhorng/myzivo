/**
 * Travel Trips Page
 * Shows user's travel booking history (Flights, Hotels, Cars)
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  Hotel,
  CarFront,
  Calendar,
  ExternalLink,
  Search,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";
import { useTravelBookings, TravelBooking, TravelServiceType, parseOfferData } from "@/hooks/useTravelBookings";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import { BookingSupportPanel } from "@/components/flight";

const serviceConfig = {
  flights: {
    icon: Plane,
    label: "Flight",
    color: "text-flights",
    bgColor: "bg-flights/10",
    borderColor: "border-flights/30",
  },
  hotels: {
    icon: Hotel,
    label: "Hotel",
    color: "text-hotels",
    bgColor: "bg-hotels/10",
    borderColor: "border-hotels/30",
  },
  cars: {
    icon: CarFront,
    label: "Car Rental",
    color: "text-cars",
    bgColor: "bg-cars/10",
    borderColor: "border-cars/30",
  },
};

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const },
  redirected: { label: "In Progress", variant: "outline" as const },
  completed: { label: "Confirmed", variant: "default" as const },
  failed: { label: "Failed", variant: "destructive" as const },
  cancelled: { label: "Cancelled", variant: "secondary" as const },
};

function TripCard({ booking }: { booking: TravelBooking }) {
  const config = serviceConfig[booking.service_type];
  const statusInfo = statusConfig[booking.status];
  const Icon = config.icon;
  const offerData = booking.offer?.offer_data ? parseOfferData(booking.offer.offer_data) : {};

  const getRouteOrLocation = () => {
    switch (booking.service_type) {
      case "flights":
        return `${offerData.origin || "—"} → ${offerData.destination || "—"}`;
      case "hotels":
        return String(offerData.hotelName || offerData.location || "Hotel");
      case "cars":
        return String(offerData.pickupLocation || "Car Rental");
      default:
        return "Trip";
    }
  };

  const getDateRange = () => {
    switch (booking.service_type) {
      case "flights":
        return offerData.departureDate
          ? format(new Date(String(offerData.departureDate)), "MMM d, yyyy")
          : format(new Date(booking.created_at), "MMM d, yyyy");
      case "hotels":
        if (offerData.checkIn && offerData.checkOut) {
          return `${format(new Date(String(offerData.checkIn)), "MMM d")} - ${format(new Date(String(offerData.checkOut)), "MMM d, yyyy")}`;
        }
        return format(new Date(booking.created_at), "MMM d, yyyy");
      case "cars":
        if (offerData.pickupDate && offerData.dropoffDate) {
          return `${format(new Date(String(offerData.pickupDate)), "MMM d")} - ${format(new Date(String(offerData.dropoffDate)), "MMM d, yyyy")}`;
        }
        return format(new Date(booking.created_at), "MMM d, yyyy");
      default:
        return format(new Date(booking.created_at), "MMM d, yyyy");
    }
  };

  const getPrice = () => {
    const price = booking.offer?.price_amount || offerData.price;
    const currency = booking.offer?.price_currency || offerData.currency || "USD";
    if (!price) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currency),
    }).format(Number(price));
  };

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", config.borderColor)}>
      <div className={cn("px-4 py-2 flex items-center justify-between", config.bgColor)}>
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", config.color)} />
          <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{getRouteOrLocation()}</h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{getDateRange()}</span>
            </div>

            {booking.partner_booking_ref && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  Ref: {booking.partner_booking_ref}
                </span>
              </div>
            )}

            {offerData.partnerName && (
              <p className="text-xs text-muted-foreground mt-2">
                via {String(offerData.partnerName)}
              </p>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            {getPrice() && (
              <p className="text-lg font-bold text-primary">{getPrice()}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {format(new Date(booking.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          {booking.partner_redirect_url && booking.status === "completed" && (
            <Button variant="outline" size="sm" asChild className="flex-1">
              <a
                href={booking.partner_redirect_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Manage Booking
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="flex-1">
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No trips found</h3>
      <p className="text-muted-foreground mb-6">
        {filter === "all"
          ? "You haven't made any bookings yet."
          : `No ${filter} trips found.`}
      </p>
      <Button asChild>
        <Link to="/">Start Planning</Link>
      </Button>
    </div>
  );
}

function GuestLookup() {
  const [email, setEmail] = useState("");
  const [bookingRef, setBookingRef] = useState("");

  const handleLookup = () => {
    if (!email || !bookingRef) return;
    // Guest lookup requires sign-in for security
    window.location.href = `/login?redirect=/travel/trips&ref=${encodeURIComponent(bookingRef)}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Find Your Booking</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your email and booking reference to find your trip.
        </p>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Booking reference"
            value={bookingRef}
            onChange={(e) => setBookingRef(e.target.value)}
          />
          <Button onClick={handleLookup} className="w-full">
            Find Booking
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to see all your trips
        </p>
      </CardContent>
    </Card>
  );
}

export default function TravelTrips() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useTravelBookings();
  const [filter, setFilter] = useState<"all" | TravelServiceType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter bookings
  const filteredBookings = bookings?.filter((booking) => {
    if (filter !== "all" && booking.service_type !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const offerData = booking.offer?.offer_data ? parseOfferData(booking.offer.offer_data) : {};
      return (
        booking.partner_booking_ref?.toLowerCase().includes(query) ||
        String(offerData.origin || "").toLowerCase().includes(query) ||
        String(offerData.destination || "").toLowerCase().includes(query) ||
        String(offerData.hotelName || "").toLowerCase().includes(query) ||
        String(offerData.location || "").toLowerCase().includes(query) ||
        String(offerData.pickupLocation || "").toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Separate into upcoming and past
  const now = new Date();
  const upcomingBookings = filteredBookings?.filter((b) => {
    const offerData = b.offer?.offer_data ? parseOfferData(b.offer.offer_data) : {};
    const date = offerData.departureDate || offerData.checkIn || offerData.pickupDate;
    if (!date) return b.status !== "completed" && b.status !== "cancelled";
    return new Date(String(date)) >= now;
  });
  const pastBookings = filteredBookings?.filter((b) => {
    const offerData = b.offer?.offer_data ? parseOfferData(b.offer.offer_data) : {};
    const date = offerData.departureDate || offerData.checkIn || offerData.pickupDate;
    if (!date) return b.status === "completed" || b.status === "cancelled";
    return new Date(String(date)) < now;
  });

  return (
    <>
      <SEOHead
        title="My Trips - ZIVO Travel"
        description="View and manage your travel bookings including flights, hotels, and car rentals."
        noIndex
      />

      <div className="min-h-screen bg-background">
        <NavBar />

        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">My Trips</h1>
              <p className="text-muted-foreground">
                View and manage your travel bookings
              </p>
            </div>

            {!user ? (
              /* Guest Lookup */
              <GuestLookup />
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search trips..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === "flights" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("flights")}
                      className="gap-1"
                    >
                      <Plane className="w-4 h-4" />
                      Flights
                    </Button>
                    <Button
                      variant={filter === "hotels" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("hotels")}
                      className="gap-1"
                    >
                      <Hotel className="w-4 h-4" />
                      Hotels
                    </Button>
                    <Button
                      variant={filter === "cars" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("cars")}
                      className="gap-1"
                    >
                      <CarFront className="w-4 h-4" />
                      Cars
                    </Button>
                  </div>
                </div>

                {/* Bookings Tabs */}
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="upcoming" className="gap-2">
                      <Clock className="w-4 h-4" />
                      Upcoming ({upcomingBookings?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="past" className="gap-2">
                      <Calendar className="w-4 h-4" />
                      Past ({pastBookings?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <Card key={i} className="h-40 animate-pulse bg-muted" />
                        ))}
                      </div>
                    ) : upcomingBookings?.length === 0 ? (
                      <EmptyState filter={filter} />
                    ) : (
                      <div className="space-y-4">
                        {upcomingBookings?.map((booking) => (
                          <TripCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="past">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <Card key={i} className="h-40 animate-pulse bg-muted" />
                        ))}
                      </div>
                    ) : pastBookings?.length === 0 ? (
                      <EmptyState filter={filter} />
                    ) : (
                      <div className="space-y-4">
                        {pastBookings?.map((booking) => (
                          <TripCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Support Panel - Required for dispute reduction */}
                <BookingSupportPanel variant="compact" className="mt-8" />
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
