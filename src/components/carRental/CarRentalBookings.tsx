import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Calendar, Sparkles, Phone, MapPin, DollarSign, Clock } from "lucide-react";
import { motion } from "framer-motion";

const CarRentalBookings = () => {
  const bookings = [
    { id: "CAR-001", car: "Tesla Model 3", customer: "John D.", phone: "+1 234 5678", dates: "Jan 25 - Jan 28", status: "active", total: "$255", deposit: "$100", location: "Downtown" },
    { id: "CAR-002", car: "BMW X5", customer: "Sarah M.", phone: "+1 345 6789", dates: "Jan 24 - Jan 26", status: "completed", total: "$320", deposit: "$150", location: "Airport" },
    { id: "CAR-003", car: "Mercedes C-Class", customer: "Mike R.", phone: "+1 456 7890", dates: "Jan 27 - Jan 30", status: "pending", total: "$285", deposit: "$120", location: "Mall" },
    { id: "CAR-004", car: "Audi A4", customer: "Emily K.", phone: "+1 567 8901", dates: "Jan 29 - Feb 1", status: "upcoming", total: "$340", deposit: "$130", location: "Hotel" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500", gradient: "from-emerald-500 to-green-600" };
      case "completed": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500", gradient: "from-blue-500 to-indigo-500" };
      case "pending": return { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20", dot: "bg-yellow-500", gradient: "from-yellow-500 to-amber-500" };
      case "upcoming": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-500" };
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
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Bookings
        </h1>
        <p className="text-muted-foreground">Manage car rental bookings</p>
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
              <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${statusConfig.gradient}`} />
                <CardContent className="p-5 pl-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${statusConfig.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                        <Car className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{booking.id}</span>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${booking.status === 'active' ? 'animate-pulse' : ''}`} />
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="font-semibold text-lg">{booking.car}</p>
                        <p className="text-sm text-muted-foreground">{booking.customer}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                            <Phone className="h-3 w-3" />
                            {booking.phone}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                            <MapPin className="h-3 w-3" />
                            {booking.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                            <Calendar className="h-3 w-3" />
                            {booking.dates}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl">{booking.total}</p>
                      <p className="text-sm text-muted-foreground">Deposit: {booking.deposit}</p>
                      <div className="flex gap-2 mt-3">
                        {booking.status === "pending" && (
                          <>
                            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg hover:shadow-xl">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                              Reject
                            </Button>
                          </>
                        )}
                        {booking.status === "active" && (
                          <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10">
                            Complete
                          </Button>
                        )}
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

export default CarRentalBookings;
