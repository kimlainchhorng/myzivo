import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, DollarSign, Calendar, TrendingUp, Sparkles, ArrowUpRight, ChevronRight, Gauge } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const CarRentalOverview = () => {
  const stats = [
    { label: "Active Rentals", value: "12", icon: Car, gradient: "from-primary to-teal-400", trend: "+3" },
    { label: "Revenue", value: "$8,450", icon: DollarSign, gradient: "from-emerald-500 to-green-600", trend: "+12%" },
    { label: "Bookings", value: "28", icon: Calendar, gradient: "from-amber-500 to-orange-500", trend: "+5" },
    { label: "Fleet Utilization", value: "78%", icon: Gauge, gradient: "from-blue-500 to-indigo-500", trend: "+8%" },
  ];

  const recentBookings = [
    { id: "CAR-001", car: "Tesla Model 3", customer: "John D.", dates: "Jan 25 - Jan 28", status: "active", total: "$255" },
    { id: "CAR-002", car: "BMW X5", customer: "Sarah M.", dates: "Jan 24 - Jan 26", status: "completed", total: "$320" },
    { id: "CAR-003", car: "Mercedes C-Class", customer: "Mike R.", dates: "Jan 27 - Jan 30", status: "upcoming", total: "$285" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500" };
      case "completed": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500" };
      case "upcoming": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500" };
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

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Car Rental Dashboard
        </h1>
        <p className="text-muted-foreground">Manage your fleet and bookings</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.trend}
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest rental bookings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {recentBookings.map((booking, index) => {
                const statusConfig = getStatusConfig(booking.status);
                return (
                  <motion.div 
                    key={booking.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.08 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-lg group-hover:scale-110 transition-transform">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{booking.car}</p>
                        <p className="text-sm text-muted-foreground">{booking.customer} • {booking.dates}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${booking.status === 'active' ? 'animate-pulse' : ''}`} />
                        {booking.status}
                      </Badge>
                      <span className="font-bold text-lg">{booking.total}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CarRentalOverview;
