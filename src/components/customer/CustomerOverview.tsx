import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, UtensilsCrossed, Plane, Hotel, MapPin, TrendingUp, ArrowUpRight, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CustomerOverview = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Total Rides", value: "24", icon: MapPin, gradient: "from-rides to-green-500", trend: "+3" },
    { label: "Food Orders", value: "18", icon: UtensilsCrossed, gradient: "from-eats to-red-500", trend: "+5" },
    { label: "Car Rentals", value: "3", icon: Car, gradient: "from-primary to-teal-400", trend: "+1" },
    { label: "Flights", value: "5", icon: Plane, gradient: "from-sky-500 to-blue-600", trend: "+2" },
    { label: "Hotels", value: "7", icon: Hotel, gradient: "from-amber-500 to-orange-600", trend: "+1" },
  ];

  const recentActivity = [
    { type: "ride", description: "Trip to Airport", date: "Today, 2:30 PM", amount: "$32.50", icon: MapPin, gradient: "from-rides to-green-500" },
    { type: "food", description: "Order from Bella Italia", date: "Yesterday", amount: "$24.99", icon: UtensilsCrossed, gradient: "from-eats to-red-500" },
    { type: "hotel", description: "Check-in at Grand Hotel", date: "Jan 20", amount: "$189.00", icon: Hotel, gradient: "from-amber-500 to-orange-600" },
    { type: "flight", description: "NYC → LAX", date: "Jan 18", amount: "$299.00", icon: Plane, gradient: "from-sky-500 to-blue-600" },
    { type: "car", description: "Tesla Model 3 Rental", date: "Jan 15", amount: "$85.00", icon: Car, gradient: "from-primary to-teal-400" },
  ];

  const quickActions = [
    { label: "Book Ride", icon: MapPin, gradient: "from-rides to-green-500", href: "/ride" },
    { label: "Order Food", icon: UtensilsCrossed, gradient: "from-eats to-red-500", href: "/food" },
    { label: "Book Flight", icon: Plane, gradient: "from-sky-500 to-blue-600", href: "/book-flight" },
    { label: "Book Hotel", icon: Hotel, gradient: "from-amber-500 to-orange-600", href: "/book-hotel" },
  ];

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
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">Here's an overview of your bookings and activity.</p>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
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

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest bookings and orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.08 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${activity.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                        <activity.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{activity.amount}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <Sparkles className="h-5 w-5 text-secondary-foreground" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>Book your next adventure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link
                      to={action.href}
                      className="flex flex-col items-center justify-center p-5 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerOverview;
