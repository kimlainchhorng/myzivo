import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hotel, Calendar, Users, MoreVertical, Download, Eye, X, Sparkles, Moon, AlertCircle, MapPin, ChevronRight } from "lucide-react";
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

const HotelBookings = () => {
  const { user } = useAuth();

  // Fetch user's hotel bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["user-hotel-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("hotel_bookings")
        .select(`
          id,
          booking_reference,
          check_in_date,
          check_out_date,
          nights,
          guests,
          status,
          total_amount,
          room_count,
          special_requests,
          guest_name,
          hotel_id,
          room_id,
          hotels (
            id,
            name,
            city,
            country
          ),
          hotel_rooms (
            id,
            name,
            room_type
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
      case "pending": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-500" };
      case "completed": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500", gradient: "from-blue-500 to-indigo-500" };
      case "cancelled": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", dot: "bg-red-500", gradient: "from-red-500 to-rose-500" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground", gradient: "from-muted to-muted" };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-0 right-12 text-3xl pointer-events-none opacity-20 hidden lg:block"
      >
        📋
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        className="absolute top-24 right-0 text-2xl pointer-events-none opacity-15 hidden lg:block"
      >
        🏨
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6 text-amber-500" />
            </motion.div>
            My Bookings
          </h1>
          <p className="text-muted-foreground">View and manage your hotel reservations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
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
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
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
            const hotel = booking.hotels;
            const room = booking.hotel_rooms;
            
            return (
              <motion.div key={booking.id} variants={item}>
                <Card className="relative border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusConfig.gradient}`} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-105 transition-transform">
                          <Hotel className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-xl">{hotel?.name || "Hotel"}</span>
                            <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${booking.status === 'pending' ? 'animate-pulse' : ''}`} />
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            {hotel?.city}, {hotel?.country} • {room?.name || room?.room_type || "Room"} • Ref: <span className="font-mono font-medium text-foreground">{booking.booking_reference}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {format(new Date(booking.check_in_date), "MMM d")} - {format(new Date(booking.check_out_date), "MMM d, yyyy")}
                              </span>
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50">
                              <Moon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3">
                        <p className="font-bold text-2xl">${booking.total_amount?.toFixed(2) || "0.00"}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1.5 rounded-xl">
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-xl">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Confirmation
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Modify Dates
                              </DropdownMenuItem>
                              {booking.status === "confirmed" && (
                                <DropdownMenuItem className="text-destructive">
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel Booking
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
              <p className="text-lg font-medium mb-1">No Bookings Yet</p>
              <p className="text-muted-foreground mb-6">Start exploring hotels to make your first reservation.</p>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg">
                <Hotel className="h-4 w-4" />
                Browse Hotels
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default HotelBookings;
