import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hotel, Calendar, Users, MoreVertical, Download, Eye, X, Sparkles, Moon } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HotelBookings = () => {
  const bookings = [
    { id: "HTL-001", hotel: "Grand Plaza Hotel", city: "New York", dates: "Jan 28 - Jan 30", nights: 2, guests: 2, status: "confirmed", total: "$378", ref: "HP12345", roomType: "Deluxe Suite" },
    { id: "HTL-002", hotel: "Seaside Resort", city: "Miami", dates: "Feb 10 - Feb 14", nights: 4, guests: 2, status: "pending", total: "$996", ref: "SR67890", roomType: "Ocean View" },
    { id: "HTL-003", hotel: "Mountain Lodge", city: "Denver", dates: "Jan 10 - Jan 12", nights: 2, guests: 1, status: "completed", total: "$278", ref: "ML11111", roomType: "Standard Room" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500" };
      case "pending": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500" };
      case "completed": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500" };
      case "cancelled": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", dot: "bg-red-500" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground" };
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
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            My Bookings
          </h1>
          <p className="text-muted-foreground">View and manage your hotel reservations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {bookings.map((booking) => {
          const statusConfig = getStatusConfig(booking.status);
          return (
            <motion.div key={booking.id} variants={item}>
              <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusConfig.dot}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-105 transition-transform">
                        <Hotel className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-xl">{booking.hotel}</span>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {booking.city} • {booking.roomType} • Ref: <span className="font-mono font-medium text-foreground">{booking.ref}</span>
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.dates}</span>
                          </span>
                          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                            <Moon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                          </span>
                          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-3">
                      <p className="font-bold text-2xl">{booking.total}</p>
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
    </div>
  );
};

export default HotelBookings;
