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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign in to view history</h2>
              <p className="text-muted-foreground mb-6">
                You need to be logged in to see your trip history
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl">
                  Home
                </Button>
                <Button onClick={() => navigate("/login")} className="rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white">
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const TripCard = ({ trip, index }: { trip: typeof trips[0]; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                  trip.status === "completed" 
                    ? "bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30" 
                    : "bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/30"
                )}
              >
                {trip.status === "completed" ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <XCircle className="w-6 h-6 text-white" />
                )}
              </motion.div>
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
              <span className="font-medium">{trip.distance_km?.toFixed(1)} km</span>
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
          <div className="flex gap-3">
            {trip.status === "completed" && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-semibold gap-2"
                  onClick={() => handleViewReceipt(trip)}
                >
                  <Receipt className="w-4 h-4" />
                  Receipt
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                className="w-full rounded-xl font-semibold bg-gradient-to-r from-primary to-teal-400 text-white gap-2"
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
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/12 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/20 to-teal-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-0 w-[350px] h-[350px] bg-gradient-to-tr from-emerald-500/10 to-green-500/5 rounded-full blur-3xl" />
      
      {/* Floating emojis */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-32 right-[8%] text-5xl hidden lg:block opacity-40"
      >
        🚗
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-1/3 left-[5%] text-4xl hidden lg:block opacity-30"
      >
        📍
      </motion.div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
              <Route className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display font-bold text-xl">Trip History</h1>
          </div>
        </div>
      </header>

      <div className="p-4 relative z-10">
        {/* Stats Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { value: completedTrips.length, label: "Trips", icon: Car, gradient: "from-primary to-teal-400" },
            { value: `$${completedTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0).toFixed(0)}`, label: "Total Spent", icon: TrendingUp, gradient: "from-emerald-500 to-green-500" },
            { value: `${completedTrips.reduce((sum, t) => sum + (t.distance_km || 0), 0).toFixed(0)}`, label: "km Traveled", icon: Navigation, gradient: "from-violet-500 to-purple-500" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
                <CardContent className="p-4 text-center">
                  <div className={cn(
                    "w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    stat.gradient
                  )}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className={cn(
                    "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                    stat.gradient
                  )}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

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
