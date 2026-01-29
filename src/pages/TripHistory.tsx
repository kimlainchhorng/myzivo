import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Star,
  Receipt,
  Clock,
  Navigation,
  CheckCircle,
  XCircle,
  Car,
  TrendingUp,
  Route,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRiderTripHistory } from "@/hooks/useRiderTripHistory";
import TripReceiptModal from "@/components/rider/TripReceiptModal";
import { Trip } from "@/hooks/useTrips";
import { cn } from "@/lib/utils";
import ZivoLogo from "@/components/ZivoLogo";

const TripHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: trips, isLoading } = useRiderTripHistory(user?.id);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const completedTrips = trips?.filter((t) => t.status === "completed") || [];
  const cancelledTrips = trips?.filter((t) => t.status === "cancelled") || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewReceipt = (trip: Trip) => {
    setSelectedTrip(trip);
    setReceiptOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden safe-area-top safe-area-bottom">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
        <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-teal-500/5" />
          <CardContent className="p-6 sm:p-8 text-center relative">
            <div className="mx-auto mb-5 sm:mb-6">
              <ZivoLogo size="lg" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Sign in to view history</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6">
              You need to be logged in to see your trip history
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl touch-manipulation active:scale-95">
                Home
              </Button>
              <Button onClick={() => navigate("/login")} className="rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white touch-manipulation active:scale-95">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TripCard = ({ trip, index }: { trip: typeof trips[0]; index: number }) => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card shadow-lg active:scale-[0.98] transition-transform">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-md",
                  trip.status === "completed" 
                    ? "bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/20" 
                    : "bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/20"
                )}
              >
                {trip.status === "completed" ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <XCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold">{formatDate(trip.created_at)}</p>
                <p className="text-sm text-muted-foreground">{formatTime(trip.created_at)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-2xl bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                ${trip.fare_amount?.toFixed(2)}
              </p>
              {trip.rating && (
                <div className="flex items-center gap-1 justify-end">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium">{trip.rating}</span>
                </div>
              )}
            </div>
          </div>

          {/* Route */}
          <div className="space-y-3 mb-4 p-4 rounded-2xl bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0 ring-4 ring-emerald-500/20" />
              <p className="text-sm truncate flex-1 font-medium">{trip.pickup_address}</p>
            </div>
            <div className="ml-1.5 w-0.5 h-4 bg-gradient-to-b from-emerald-500 to-foreground" />
            <div className="flex items-start gap-3">
              <div className="w-3.5 h-3.5 rounded-sm bg-foreground mt-1 flex-shrink-0 ring-4 ring-foreground/20" />
              <p className="text-sm truncate flex-1 font-medium">{trip.dropoff_address}</p>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">
              <Navigation className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">{((trip.distance_km || 0) * 0.621371).toFixed(1)} mi</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">{trip.duration_minutes} min</span>
            </div>
            {trip.driver && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">
                <span className="font-medium">{trip.driver.full_name}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            {trip.status === "completed" && (
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-semibold gap-2 touch-manipulation active:scale-[0.98]"
                onClick={() => handleViewReceipt(trip)}
              >
                <Receipt className="w-4 h-4" />
                Receipt
              </Button>
            )}
            <Button
              className="flex-1 rounded-xl font-semibold bg-gradient-to-r from-primary to-teal-400 text-white gap-2 touch-manipulation active:scale-[0.98]"
              onClick={() => {
                navigate("/ride", {
                  state: {
                    pickup: {
                      address: trip.pickup_address,
                      lat: trip.pickup_lat,
                      lng: trip.pickup_lng,
                    },
                    dropoff: {
                      address: trip.dropoff_address,
                      lat: trip.dropoff_lat,
                      lng: trip.dropoff_lng,
                    },
                  },
                });
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Book Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Background effects - simplified for mobile */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/4 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-primary/15 to-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-0 w-[180px] h-[180px] bg-gradient-to-tr from-emerald-500/8 to-green-500/4 rounded-full blur-3xl" />

      {/* Header - Mobile optimized */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-9 w-9 rounded-xl hover:bg-white/10 active:scale-95 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-md shadow-primary/30">
              <Route className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-display font-bold text-base">Trip History</h1>
          </div>
        </div>
      </header>

      <div className="p-4 relative z-10">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {[
            { value: completedTrips.length, label: "Trips", icon: Car, gradient: "from-primary to-teal-400" },
            { value: `$${completedTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0).toFixed(0)}`, label: "Spent", icon: TrendingUp, gradient: "from-emerald-500 to-green-500" },
            { value: `${(completedTrips.reduce((sum, t) => sum + (t.distance_km || 0), 0) * 0.621371).toFixed(0)}`, label: "Miles", icon: Navigation, gradient: "from-violet-500 to-purple-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-2 rounded-lg sm:rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  stat.gradient
                )}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className={cn(
                  "text-xl sm:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                  stat.gradient
                )}>{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : !trips?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
              <CardContent className="p-10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">No trips yet</h3>
                <p className="text-muted-foreground mb-6">
                  Your completed trips will appear here
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={() => navigate("/ride")} className="rounded-xl font-semibold bg-gradient-to-r from-primary to-teal-400 text-white gap-2">
                    <Sparkles className="w-4 h-4" />
                    Book a Ride
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Tabs defaultValue="completed">
            <TabsList className="w-full mb-6 bg-muted/50 p-1.5 rounded-xl h-auto">
              <TabsTrigger 
                value="completed" 
                className="flex-1 rounded-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white font-semibold"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed ({completedTrips.length})
              </TabsTrigger>
              <TabsTrigger 
                value="cancelled" 
                className="flex-1 rounded-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white font-semibold"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelled ({cancelledTrips.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="space-y-4">
              {completedTrips.length === 0 ? (
                <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No completed trips</p>
                  </CardContent>
                </Card>
              ) : (
                completedTrips.map((trip, index) => <TripCard key={trip.id} trip={trip} index={index} />)
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledTrips.length === 0 ? (
                <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No cancelled trips</p>
                  </CardContent>
                </Card>
              ) : (
                cancelledTrips.map((trip, index) => <TripCard key={trip.id} trip={trip} index={index} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedTrip && (
        <TripReceiptModal
          trip={selectedTrip as any}
          open={receiptOpen}
          onOpenChange={setReceiptOpen}
        />
      )}
    </div>
  );
};

export default TripHistory;
