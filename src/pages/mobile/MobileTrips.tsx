/**
 * ZIVO Mobile Trips Screen
 * Upcoming & past bookings management
 */
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Plane, Hotel, Car, Calendar, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTrips, type TripFilter, type TravelOrder } from "@/hooks/useMyTrips";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { format } from "date-fns";

type TabType = "upcoming" | "past";

export default function MobileTrips() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  
  // Map tab to filter
  const filterMap: Record<TabType, TripFilter> = {
    upcoming: "upcoming",
    past: "past",
  };
  
  const { data: trips, isLoading, refetch } = useMyTrips(filterMap[activeTab]);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const getServiceIcon = (trip: TravelOrder) => {
    const firstItem = trip.travel_order_items?.[0];
    const type = firstItem?.type || "hotel";
    
    switch (type) {
      case "transfer": return Car;
      case "activity": return Plane;
      case "hotel": 
      default: return Hotel;
    }
  };

  const getServiceColor = (trip: TravelOrder) => {
    const firstItem = trip.travel_order_items?.[0];
    const type = firstItem?.type || "hotel";
    
    switch (type) {
      case "transfer": return "text-cars";
      case "activity": return "text-primary";
      case "hotel":
      default: return "text-hotels";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTripTitle = (trip: TravelOrder) => {
    const firstItem = trip.travel_order_items?.[0];
    if (firstItem?.title) {
      return firstItem.title;
    }
    return `Booking ${trip.order_number}`;
  };

  const getTripDate = (trip: TravelOrder) => {
    const firstItem = trip.travel_order_items?.[0];
    if (firstItem?.start_date) {
      return format(new Date(firstItem.start_date), "MMM d, yyyy");
    }
    return format(new Date(trip.created_at), "MMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">My Trips</h1>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-full hover:bg-muted touch-manipulation active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-4">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
          {(["upcoming", "past"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all touch-manipulation capitalize",
                activeTab === tab
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="space-y-3">
            {trips.map((trip) => {
              const Icon = getServiceIcon(trip);
              const colorClass = getServiceColor(trip);
              
              return (
                <Card 
                  key={trip.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/my-trips/${trip.order_number}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0", colorClass)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium truncate">
                              {getTripTitle(trip)}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{getTripDate(trip)}</span>
                            </div>
                          </div>
                          {getStatusBadge(trip.status)}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <div className="text-xs text-muted-foreground">
                            Booking: <span className="font-mono">{trip.order_number}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/my-trips/${trip.order_number}`);
                            }}
                          >
                            Manage <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">
                {activeTab === "upcoming" ? "No upcoming trips" : "No past trips"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === "upcoming"
                  ? "Start planning your next adventure!"
                  : "Your completed trips will appear here"}
              </p>
              {activeTab === "upcoming" && (
                <Button onClick={() => navigate("/search")}>
                  <Plane className="w-4 h-4 mr-2" />
                  Book a Trip
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <ZivoMobileNav />
    </div>
  );
}
