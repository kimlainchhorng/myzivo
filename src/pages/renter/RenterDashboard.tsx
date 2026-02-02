/**
 * Renter Dashboard
 * Main dashboard for P2P renters showing bookings summary and verification status
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRenterBookings } from "@/hooks/useP2PBooking";
import { useIsRenterVerified } from "@/hooks/useRenterVerification";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Search, Car, Calendar, CheckCircle, AlertTriangle,
  Clock, ChevronRight, ShieldCheck, FileCheck, MapPin
} from "lucide-react";
import { format, parseISO, isPast } from "date-fns";

export default function RenterDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: bookings, isLoading: bookingsLoading } = useRenterBookings();
  const { isVerified, isPending, isRejected, isLoading: verificationLoading } = useIsRenterVerified();
  
  // Derive status from hook values
  const status = isPending ? "pending" : isRejected ? "rejected" : isVerified ? "approved" : null;

  // Calculate stats
  const upcomingTrips = bookings?.filter(
    (b) => ["pending", "confirmed"].includes(b.status || "") && !isPast(parseISO(b.pickup_date))
  ) || [];
  
  const activeTrips = bookings?.filter((b) => b.status === "active") || [];
  
  const completedTrips = bookings?.filter((b) => b.status === "completed") || [];

  const isLoading = bookingsLoading || verificationLoading;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Renter Dashboard | ZIVO"
        description="Manage your P2P car rental bookings"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/")}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold">Renter Dashboard</h1>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button onClick={() => navigate("/cars")} className="gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Find Cars</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Verification Banner */}
        {!isLoading && !isVerified && (
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    Complete Verification to Book
                  </h3>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mb-3">
                    {status === "pending"
                      ? "Your verification is under review. We'll notify you once approved."
                      : status === "rejected"
                      ? "Your verification was not approved. Please resubmit your documents."
                      : "Verify your driver's license to start booking cars from local owners."}
                  </p>
                  {status !== "pending" && (
                    <Button asChild size="sm" variant="outline" className="border-amber-500/50 hover:bg-amber-500/10">
                      <Link to="/verify/driver">
                        <FileCheck className="w-4 h-4 mr-2" />
                        {status === "rejected" ? "Resubmit Documents" : "Start Verification"}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verified Badge */}
        {!isLoading && isVerified && (
          <Card className="border-emerald-500/50 bg-emerald-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Verified Renter
                  </h3>
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                    You're all set to book cars on ZIVO
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-7 w-8" /> : upcomingTrips.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-7 w-8" /> : activeTrips.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-7 w-8" /> : completedTrips.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  {isVerified ? (
                    <ShieldCheck className="w-5 h-5 text-violet-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-violet-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold truncate">
                    {isLoading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : isVerified ? (
                      "Verified"
                    ) : status === "pending" ? (
                      "Pending"
                    ) : (
                      "Not Verified"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Upcoming Trips</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/renter/bookings" className="gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-20 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingTrips.length > 0 ? (
              <div className="space-y-4">
                {upcomingTrips.slice(0, 3).map((booking) => {
                  const vehicle = booking.vehicle;
                  const images = (vehicle?.images as string[]) || [];
                  
                  return (
                    <Link 
                      key={booking.id} 
                      to={`/p2p/booking/${booking.id}/confirmation`}
                      className="flex gap-4 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-20 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {images[0] ? (
                          <img
                            src={images[0]}
                            alt={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle"}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(parseISO(booking.pickup_date), "MMM d")} - {format(parseISO(booking.return_date), "MMM d")}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {vehicle?.location_city}, {vehicle?.location_state}
                        </div>
                      </div>
                      <div className="shrink-0 self-center">
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                          {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Car className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">No upcoming trips</p>
                <Button asChild>
                  <Link to="/cars">
                    <Search className="w-4 h-4 mr-2" />
                    Find a Car
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/renter/bookings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">My Bookings</h3>
                    <p className="text-sm text-muted-foreground">View all trips</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/verify/driver">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      {isVerified ? "View status" : "Complete verification"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
