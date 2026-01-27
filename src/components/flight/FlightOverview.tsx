import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, DollarSign, Users, TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const FlightOverview = () => {
  const stats = [
    { label: "Bookings Today", value: "42", icon: Plane, gradient: "from-sky-500 to-blue-600", trend: "+8", trendUp: true },
    { label: "Revenue", value: "$28,450", icon: DollarSign, gradient: "from-emerald-500 to-green-600", trend: "+15%", trendUp: true },
    { label: "Passengers", value: "156", icon: Users, gradient: "from-amber-500 to-orange-600", trend: "+12%", trendUp: true },
    { label: "Occupancy Rate", value: "82%", icon: TrendingUp, gradient: "from-primary to-teal-400", trend: "+5%", trendUp: true },
  ];

  const popularRoutes = [
    { route: "NYC → LAX", flights: 24, avgPrice: "$299", occupancy: "85%", trend: "+12%" },
    { route: "LAX → SFO", flights: 18, avgPrice: "$149", occupancy: "78%", trend: "+8%" },
    { route: "NYC → MIA", flights: 15, avgPrice: "$189", occupancy: "82%", trend: "+15%" },
    { route: "CHI → NYC", flights: 12, avgPrice: "$179", occupancy: "75%", trend: "+5%" },
  ];

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
            Flight Booking Dashboard
          </h1>
          <p className="text-muted-foreground">Manage flights and bookings</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-sm font-medium text-primary">Live Data</span>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.trend}
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sky-500/10">
                    <Plane className="h-5 w-5 text-sky-500" />
                  </div>
                  Popular Routes
                </CardTitle>
                <CardDescription>Most booked flight routes this week</CardDescription>
              </div>
              <button className="text-sm text-primary hover:underline">View All</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularRoutes.map((route, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform">
                      <Plane className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{route.route}</p>
                      <p className="text-sm text-muted-foreground">{route.flights} flights/day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-lg">{route.avgPrice}</p>
                      <p className="text-sm text-muted-foreground">avg. price</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{route.occupancy}</p>
                      <p className="text-sm text-muted-foreground">occupancy</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                      <ArrowUpRight className="h-4 w-4" />
                      {route.trend}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FlightOverview;
