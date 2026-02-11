import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Sparkles, Clock, DollarSign, Users, ArrowRight, Cloud } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CustomerFlights = () => {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["customer-flight-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("flight_bookings")
        .select("*, flights(flight_number, departure_city, arrival_city, departure_time, arrival_time, airlines(name, code))")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500" };
      case "cancelled": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", dot: "bg-red-500" };
      case "confirmed": return { bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/20", dot: "bg-sky-500" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground" };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your flights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Floating Decorations */}
      <motion.div
        className="absolute -top-2 right-16 pointer-events-none hidden md:block"
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/15 to-blue-500/15 flex items-center justify-center backdrop-blur-sm opacity-30">
          <Plane className="w-5 h-5 text-sky-500/50" />
        </div>
      </motion.div>
      <motion.div
        className="absolute top-20 right-4 pointer-events-none hidden md:block"
        animate={{ y: [0, 10, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm opacity-25">
          <Sparkles className="w-4 h-4 text-primary/50" />
        </div>
      </motion.div>
      <motion.div
        className="absolute top-40 right-8 pointer-events-none hidden lg:block"
        animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/15 to-yellow-500/15 flex items-center justify-center backdrop-blur-sm opacity-20">
          <Cloud className="w-4 h-4 text-amber-500/50" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-6 w-6 text-sky-500" />
            </motion.div>
            Flight Bookings
          </h1>
          <p className="text-muted-foreground">Your flight history and upcoming trips</p>
        </div>
        <Link to="/book-flight">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all">
              <Plane className="h-4 w-4" />
              Book Flight
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Plane className="h-5 w-5 text-sky-500" />
              </div>
              <div>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>All your flight bookings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {bookings && bookings.length > 0 ? (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-border/50"
              >
                {bookings.map((booking: any) => {
                  const statusConfig = getStatusConfig(booking.status);
                  return (
                    <motion.div 
                      key={booking.id}
                      variants={item}
                      className="flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform">
                        <Plane className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{booking.flights?.departure_city}</p>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <p className="font-semibold text-lg">{booking.flights?.arrival_city}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {booking.flights?.airlines?.code} {booking.flights?.flight_number} • Ref: <span className="font-mono">{booking.booking_reference}</span>
                            </p>
                          </div>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border flex-shrink-0`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                            <Clock className="h-3.5 w-3.5" />
                            {booking.flights?.departure_time && format(new Date(booking.flights.departure_time), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                            <Users className="h-3.5 w-3.5" />
                            {booking.total_passengers} passenger{booking.total_passengers > 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm font-semibold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500">
                            <DollarSign className="h-3.5 w-3.5" />
                            {booking.total_amount?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="p-4 rounded-2xl bg-muted/30 w-fit mx-auto mb-4">
                  <Plane className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">No flight bookings yet</p>
                <p className="text-sm text-muted-foreground mb-6">Book a flight for your next adventure!</p>
                <Link to="/book-flight">
                  <Button className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600">
                    <Plane className="h-4 w-4" />
                    Search Flights
                  </Button>
                </Link>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomerFlights;
