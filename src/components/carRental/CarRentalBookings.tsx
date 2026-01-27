import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Calendar, Sparkles, Phone, MapPin, Download, MoreVertical, Eye, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CarRentalBookings = () => {
  const { user } = useAuth();

  // Fetch user's car rentals
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["user-car-rentals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("car_rentals")
        .select(`
          id,
          status,
          total_amount,
          daily_rate,
          total_days,
          deposit_paid,
          pickup_date,
          return_date,
          pickup_location,
          return_location,
          driver_license_number,
          rental_cars (
            id,
            make,
            model,
            year,
            category,
            image_url
          )
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500", gradient: "from-emerald-500 to-green-600" };
      case "completed": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500", gradient: "from-blue-500 to-indigo-500" };
      case "pending": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-500" };
      case "cancelled": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", dot: "bg-red-500", gradient: "from-red-500 to-rose-500" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground", gradient: "from-muted to-muted" };
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

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            My Rentals
          </h1>
          <p className="text-muted-foreground">View and manage your car rentals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <Skeleton className="h-16 w-16 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                      <div className="flex gap-3">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-10 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings && bookings.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {bookings.map((booking: any) => {
            const statusConfig = getStatusConfig(booking.status);
            const car = booking.rental_cars;
            
            return (
              <motion.div key={booking.id} variants={item}>
                <Card className="relative border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${statusConfig.gradient}`} />
                  <CardContent className="p-5 pl-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${statusConfig.gradient} shadow-lg group-hover:scale-105 transition-transform`}>
                          <Car className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-xl">
                              {car?.make} {car?.model}
                            </span>
                            <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${booking.status === 'confirmed' ? 'animate-pulse' : ''}`} />
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {car?.year} • {car?.category} • {booking.total_days} days @ ${booking.daily_rate}/day
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {booking.pickup_date ? format(new Date(booking.pickup_date), "MMM d") : "TBD"} - {booking.return_date ? format(new Date(booking.return_date), "MMM d, yyyy") : "TBD"}
                              </span>
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{booking.pickup_location || "N/A"}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3">
                        <p className="font-bold text-2xl">${booking.total_amount?.toFixed(2) || "0.00"}</p>
                        <p className="text-sm text-muted-foreground">Deposit: ${booking.deposit_paid?.toFixed(2) || "0.00"}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1.5">
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Contract
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Extend Rental
                              </DropdownMenuItem>
                              {booking.status === "confirmed" && (
                                <DropdownMenuItem className="text-destructive">
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel Rental
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-1">No Rentals Yet</p>
              <p className="text-muted-foreground">Start exploring cars to rent your first vehicle.</p>
              <Button className="mt-4 gap-2 bg-gradient-to-r from-primary to-teal-400">
                <Car className="h-4 w-4" />
                Browse Cars
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default CarRentalBookings;
