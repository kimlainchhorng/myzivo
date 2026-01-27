import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, Users, MoreVertical, Download, Eye, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FlightBookings = () => {
  const bookings = [
    { id: "FLT-001", route: "NYC → LAX", flight: "DL 1234", date: "Jan 28, 2024", passengers: 2, status: "confirmed", total: "$598", ref: "ABCD12", airline: "Delta" },
    { id: "FLT-002", route: "LAX → SFO", flight: "UA 5678", date: "Feb 5, 2024", passengers: 1, status: "pending", total: "$149", ref: "EFGH34", airline: "United" },
    { id: "FLT-003", route: "MIA → NYC", flight: "AA 9012", date: "Jan 15, 2024", passengers: 3, status: "completed", total: "$567", ref: "IJKL56", airline: "American" },
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
          <p className="text-muted-foreground">View and manage your flight bookings</p>
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
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg group-hover:scale-105 transition-transform">
                        <Plane className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-xl">{booking.route}</span>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {booking.airline} • {booking.flight} • Ref: <span className="font-mono font-medium text-foreground">{booking.ref}</span>
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.date}</span>
                          </span>
                          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}</span>
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
                              Download Ticket
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              Reschedule
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

export default FlightBookings;
