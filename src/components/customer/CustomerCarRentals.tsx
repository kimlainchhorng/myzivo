import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Sparkles, Clock, DollarSign, MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CustomerCarRentals = () => {
  const { user } = useAuth();

  const { data: rentals, isLoading } = useQuery({
    queryKey: ["customer-car-rentals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("car_rentals")
        .select("*, rental_cars(make, model, year, images, color)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const activeRentalsCount = rentals?.filter((r: any) => 
    r.status === "confirmed" || r.status === "in_progress"
  ).length || 0;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500" };
      case "cancelled": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", dot: "bg-red-500" };
      case "in_progress": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500" };
      case "confirmed": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500" };
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
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your rentals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Floating Decorations */}
      <motion.div
        className="absolute -top-2 right-16 text-3xl pointer-events-none hidden md:block"
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🚙
      </motion.div>
      <motion.div
        className="absolute top-20 right-4 text-2xl pointer-events-none hidden md:block"
        animate={{ y: [0, 10, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute top-40 right-8 text-xl pointer-events-none hidden lg:block"
        animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        🔑
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
              <Sparkles className="h-6 w-6 text-primary" />
            </motion.div>
            Car Rentals
          </h1>
          <p className="text-muted-foreground">Your rental history and active bookings</p>
        </div>
        <div className="flex items-center gap-3">
          {activeRentalsCount > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 border shadow-lg shadow-primary/10">
              {activeRentalsCount} active
            </Badge>
          )}
          <Link to="/rent-car">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className="gap-2 bg-gradient-to-r from-primary to-teal-400 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Car className="h-4 w-4" />
                Rent a Car
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Rental History</CardTitle>
                <CardDescription>All your car rentals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {rentals && rentals.length > 0 ? (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-border/50"
              >
                {rentals.map((rental: any) => {
                  const statusConfig = getStatusConfig(rental.status);
                  return (
                    <motion.div 
                      key={rental.id}
                      variants={item}
                      className="flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-lg group-hover:scale-110 transition-transform">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg">
                              {rental.rental_cars?.year} {rental.rental_cars?.make} {rental.rental_cars?.model}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {rental.pickup_location}
                            </div>
                          </div>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border flex-shrink-0`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${rental.status === 'in_progress' ? 'animate-pulse' : ''}`} />
                            {rental.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(rental.pickup_date), 'MMM d')} - {format(new Date(rental.return_date), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                            <Clock className="h-3.5 w-3.5" />
                            {rental.total_days} day{rental.total_days > 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm font-semibold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500">
                            <DollarSign className="h-3.5 w-3.5" />
                            {rental.total_amount?.toFixed(2)}
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
                  <Car className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">No car rentals yet</p>
                <p className="text-sm text-muted-foreground mb-6">Rent a car for your next trip!</p>
                <Link to="/rent-car">
                  <Button className="gap-2 bg-gradient-to-r from-primary to-teal-400">
                    <Car className="h-4 w-4" />
                    Browse Cars
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

export default CustomerCarRentals;
