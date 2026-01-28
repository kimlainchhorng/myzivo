import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Store,
  Car,
  Plane,
  Hotel,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface ServiceMetrics {
  name: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  total: number;
  active: number;
  pending: number;
  revenue: number;
  trend: number;
  bookings: number;
}

const AdminServiceOverview = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const { data: metrics, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-service-metrics"],
    queryFn: async () => {
      // Fetch all service data in parallel
      const [restaurants, hotels, flights, cars, rentals, hotelBookings, flightBookings] = await Promise.all([
        supabase.from("restaurants").select("id, status, total_orders, rating"),
        supabase.from("hotels").select("id, status, total_bookings, rating"),
        supabase.from("flights").select("id, is_active, economy_price"),
        supabase.from("rental_cars").select("id, status, total_rentals, daily_rate"),
        supabase.from("car_rentals").select("id, total_amount, status"),
        supabase.from("hotel_bookings").select("id, total_amount, status"),
        supabase.from("flight_bookings").select("id, total_amount, status"),
      ]);

      const restaurantData = restaurants.data || [];
      const hotelData = hotels.data || [];
      const flightData = flights.data || [];
      const carData = cars.data || [];
      const rentalData = rentals.data || [];
      const hotelBookingData = hotelBookings.data || [];
      const flightBookingData = flightBookings.data || [];

      const services: ServiceMetrics[] = [
        {
          name: "Restaurants",
          icon: Store,
          color: "text-orange-500",
          gradient: "from-orange-500/20 to-red-500/10",
          total: restaurantData.length,
          active: restaurantData.filter(r => r.status === "active").length,
          pending: restaurantData.filter(r => r.status === "pending").length,
          revenue: restaurantData.reduce((sum, r) => sum + ((r.total_orders || 0) * 25), 0), // Avg order $25
          trend: 12.5,
          bookings: restaurantData.reduce((sum, r) => sum + (r.total_orders || 0), 0),
        },
        {
          name: "Hotels",
          icon: Hotel,
          color: "text-amber-500",
          gradient: "from-amber-500/20 to-yellow-500/10",
          total: hotelData.length,
          active: hotelData.filter(h => h.status === "active").length,
          pending: hotelData.filter(h => h.status === "pending").length,
          revenue: hotelBookingData.reduce((sum, b) => sum + Number(b.total_amount || 0), 0),
          trend: 8.3,
          bookings: hotelBookingData.length,
        },
        {
          name: "Flights",
          icon: Plane,
          color: "text-sky-500",
          gradient: "from-sky-500/20 to-blue-500/10",
          total: flightData.length,
          active: flightData.filter(f => f.is_active).length,
          pending: 0,
          revenue: flightBookingData.reduce((sum, b) => sum + Number(b.total_amount || 0), 0),
          trend: 15.2,
          bookings: flightBookingData.length,
        },
        {
          name: "Car Rentals",
          icon: Car,
          color: "text-purple-500",
          gradient: "from-purple-500/20 to-pink-500/10",
          total: carData.length,
          active: carData.filter(c => c.status === "active").length,
          pending: carData.filter(c => c.status === "pending").length,
          revenue: rentalData.reduce((sum, r) => sum + Number(r.total_amount || 0), 0),
          trend: -2.1,
          bookings: rentalData.length,
        },
      ];

      return services;
    },
    refetchInterval: 60000,
  });

  const totalRevenue = metrics?.reduce((sum, s) => sum + s.revenue, 0) || 0;
  const totalBookings = metrics?.reduce((sum, s) => sum + s.bookings, 0) || 0;
  const totalActive = metrics?.reduce((sum, s) => sum + s.active, 0) || 0;
  const totalPending = metrics?.reduce((sum, s) => sum + s.pending, 0) || 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/10 shadow-lg"
          >
            <BarChart3 className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Service Overview
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.div>
            </h1>
            <p className="text-muted-foreground">Cross-service performance metrics</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </motion.div>

      {/* Global Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{totalBookings}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{totalActive}</p>
                )}
                <p className="text-sm text-muted-foreground">Active Partners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{totalPending}</p>
                )}
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Service Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 bg-card/50 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-xl" />
                      <div>
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          : metrics?.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "border-0 bg-card/50 backdrop-blur-xl transition-all cursor-pointer group",
                    "hover:shadow-lg hover:bg-card/70",
                    selectedService === service.name && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedService(selectedService === service.name ? null : service.name)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={cn("p-3.5 rounded-xl bg-gradient-to-br shadow-lg", service.gradient)}
                        >
                          <service.icon className={cn("h-7 w-7", service.color)} />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {service.active} active / {service.total} total
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium",
                        service.trend >= 0
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      )}>
                        {service.trend >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {Math.abs(service.trend)}%
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-lg font-semibold">${service.revenue.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Bookings</p>
                        <p className="text-lg font-semibold">{service.bookings}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-lg font-semibold">{service.pending}</p>
                      </div>
                    </div>

                    {/* Revenue Share Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Revenue share</span>
                        <span className="font-medium">
                          {totalRevenue > 0 ? ((service.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <Progress
                        value={totalRevenue > 0 ? (service.revenue / totalRevenue) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      {/* Performance Comparison */}
      <motion.div variants={item}>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Comparison
            </CardTitle>
            <CardDescription>Side-by-side service metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.map((service) => (
                <div key={service.name} className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg bg-gradient-to-br", service.gradient)}>
                    <service.icon className={cn("h-4 w-4", service.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ${service.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative h-6 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totalRevenue > 0 ? (service.revenue / totalRevenue) * 100 : 0}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full",
                          service.name === "Restaurants" && "bg-gradient-to-r from-orange-500 to-red-500",
                          service.name === "Hotels" && "bg-gradient-to-r from-amber-500 to-yellow-500",
                          service.name === "Flights" && "bg-gradient-to-r from-sky-500 to-blue-500",
                          service.name === "Car Rentals" && "bg-gradient-to-r from-purple-500 to-pink-500"
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminServiceOverview;
