import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, Car, Store, Building2, Plane, UserPlus, 
  Search, Filter, MoreVertical, Eye, Mail, Phone,
  CheckCircle, XCircle, Clock, Shield, Ban, UserCog, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hook to fetch account stats
const useAccountStats = () => {
  return useQuery({
    queryKey: ["admin-account-stats"],
    queryFn: async () => {
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();

      const [profiles, drivers, restaurants, carRentals, hotels, airlines] = await Promise.all([
        supabase.from("profiles").select("id, created_at", { count: "exact" }),
        supabase.from("drivers").select("id, status, created_at", { count: "exact" }),
        supabase.from("restaurants").select("id, status, created_at", { count: "exact" }),
        supabase.from("rental_cars").select("id, is_available, created_at", { count: "exact" }),
        supabase.from("hotels").select("id, status, created_at", { count: "exact" }),
        supabase.from("airlines").select("id, is_active, created_at", { count: "exact" }),
      ]);

      const verifiedDrivers = drivers.data?.filter(d => d.status === "verified").length || 0;
      const pendingDrivers = drivers.data?.filter(d => d.status === "pending").length || 0;
      const suspendedDrivers = drivers.data?.filter(d => d.status === "suspended").length || 0;
      const newThisWeek = profiles.data?.filter(p => p.created_at >= weekAgo).length || 0;

      return {
        totalCustomers: profiles.count || 0,
        activeDrivers: verifiedDrivers,
        partners: (restaurants.count || 0) + (carRentals.count || 0) + (hotels.count || 0) + (airlines.count || 0),
        pendingApprovals: pendingDrivers,
        suspendedAccounts: suspendedDrivers,
        newThisWeek,
      };
    },
    refetchInterval: 30000,
  });
};

// Hook to fetch customers (profiles with trip data)
const useCustomers = (searchQuery: string) => {
  return useQuery({
    queryKey: ["admin-customers", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, user_id, full_name, email, phone, avatar_url, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data: profiles, error } = await query;
      if (error) throw error;

      // Get trip stats for each customer
      const userIds = profiles?.map(p => p.user_id).filter(Boolean) || [];
      const { data: trips } = userIds.length > 0 ? await supabase
        .from("trips")
        .select("rider_id, fare_amount, status")
        .in("rider_id", userIds) : { data: [] };

      return profiles?.map(profile => {
        const customerTrips = trips?.filter(t => t.rider_id === profile.user_id) || [];
        const completedTrips = customerTrips.filter(t => t.status === "completed");
        const totalSpent = completedTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0);

        return {
          id: profile.id,
          name: profile.full_name || "Unknown",
          email: profile.email || "No email",
          phone: profile.phone || "No phone",
          avatar_url: profile.avatar_url,
          status: profile.status || "active",
          totalRides: completedTrips.length,
          totalSpent,
          joined: profile.created_at,
        };
      }) || [];
    },
  });
};

// Hook to fetch drivers
const useDriversList = (searchQuery: string) => {
  return useQuery({
    queryKey: ["admin-drivers-list", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("drivers")
        .select("id, full_name, email, phone, avatar_url, status, rating, total_trips, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data: drivers, error } = await query;
      if (error) throw error;

      // Get earnings for each driver
      const driverIds = drivers?.map(d => d.id) || [];
      const { data: earnings } = driverIds.length > 0 ? await supabase
        .from("driver_earnings")
        .select("driver_id, net_amount")
        .in("driver_id", driverIds) : { data: [] };

      return drivers?.map(driver => {
        const driverEarnings = earnings?.filter(e => e.driver_id === driver.id) || [];
        const totalEarnings = driverEarnings.reduce((sum, e) => sum + (e.net_amount || 0), 0);

        return {
          id: driver.id,
          name: driver.full_name,
          email: driver.email,
          phone: driver.phone,
          avatar_url: driver.avatar_url,
          status: driver.status || "pending",
          rating: driver.rating || 0,
          trips: driver.total_trips || 0,
          earnings: totalEarnings,
        };
      }) || [];
    },
  });
};

// Hook to fetch restaurants
const useRestaurantsList = (searchQuery: string) => {
  return useQuery({
    queryKey: ["admin-restaurants-list", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("restaurants")
        .select("id, name, email, phone, logo_url, status, rating, total_orders, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get order stats
      const restaurantIds = data?.map(r => r.id) || [];
      const { data: orders } = restaurantIds.length > 0 ? await supabase
        .from("food_orders")
        .select("restaurant_id, total_amount, status")
        .in("restaurant_id", restaurantIds) : { data: [] };

      return data?.map(restaurant => {
        const restaurantOrders = orders?.filter(o => o.restaurant_id === restaurant.id) || [];
        const completedOrders = restaurantOrders.filter(o => o.status === "confirmed");
        const revenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

        return {
          id: restaurant.id,
          name: restaurant.name,
          email: restaurant.email || "No email",
          phone: restaurant.phone || "No phone",
          logo_url: restaurant.logo_url,
          status: restaurant.status === "active" ? "active" : "inactive",
          rating: restaurant.rating || 0,
          orders: restaurant.total_orders || completedOrders.length,
          revenue,
        };
      }) || [];
    },
  });
};

// Hook to fetch hotels
const useHotelsList = (searchQuery: string) => {
  return useQuery({
    queryKey: ["admin-hotels-list", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("hotels")
        .select("id, name, email, phone, logo_url, status, rating, star_rating, city, total_bookings, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get booking stats
      const hotelIds = data?.map(h => h.id) || [];
      const { data: bookings } = hotelIds.length > 0 ? await supabase
        .from("hotel_bookings")
        .select("hotel_id, total_amount, status")
        .in("hotel_id", hotelIds) : { data: [] };

      return data?.map(hotel => {
        const hotelBookings = bookings?.filter(b => b.hotel_id === hotel.id) || [];
        const confirmedBookings = hotelBookings.filter(b => b.status === "confirmed" || b.status === "completed");
        const revenue = confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

        return {
          id: hotel.id,
          name: hotel.name,
          email: hotel.email || "No email",
          phone: hotel.phone || "No phone",
          logo_url: hotel.logo_url,
          status: hotel.status === "active" ? "active" : "inactive",
          rating: hotel.rating || 0,
          star_rating: hotel.star_rating || 0,
          city: hotel.city,
          bookings: hotel.total_bookings || confirmedBookings.length,
          revenue,
        };
      }) || [];
    },
  });
};

// Hook to fetch car rentals
const useCarRentalsList = (searchQuery: string) => {
  return useQuery({
    queryKey: ["admin-car-rentals-list", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("rental_cars")
        .select("id, make, model, year, daily_rate, is_available, images, location_address, total_rentals, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (searchQuery) {
        query = query.or(`make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get rental stats
      const carIds = data?.map(c => c.id) || [];
      const { data: rentals } = carIds.length > 0 ? await supabase
        .from("car_rentals")
        .select("car_id, total_amount, status")
        .in("car_id", carIds) : { data: [] };

      return data?.map(car => {
        const carRentals = rentals?.filter(r => r.car_id === car.id) || [];
        const completedRentals = carRentals.filter(r => r.status === "completed" || r.status === "confirmed");
        const revenue = completedRentals.reduce((sum, r) => sum + (r.total_amount || 0), 0);
        const images = car.images as string[] | null;
        const firstImage = Array.isArray(images) && images.length > 0 ? images[0] : null;

        return {
          id: car.id,
          name: `${car.make} ${car.model} (${car.year})`,
          price_per_day: car.daily_rate,
          location: car.location_address,
          image_url: firstImage,
          status: car.is_available ? "available" : "rented",
          bookings: car.total_rentals || completedRentals.length,
          revenue,
        };
      }) || [];
    },
  });
};

// Hook to fetch airlines
const useAirlinesList = (searchQuery: string) => {
  return useQuery({
    queryKey: ["admin-airlines-list", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("airlines")
        .select("id, name, code, logo_url, is_active, country, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(airline => ({
        id: airline.id,
        name: airline.name,
        code: airline.code,
        logo_url: airline.logo_url,
        status: airline.is_active ? "active" : "inactive",
        country: airline.country,
      })) || [];
    },
  });
};

export default function AdminAccountsManagement() {
  const [activeTab, setActiveTab] = useState("customers");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading } = useAccountStats();
  const { data: customers, isLoading: customersLoading } = useCustomers(searchQuery);
  const { data: drivers, isLoading: driversLoading } = useDriversList(searchQuery);
  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurantsList(searchQuery);
  const { data: hotels, isLoading: hotelsLoading } = useHotelsList(searchQuery);
  const { data: carRentals, isLoading: carRentalsLoading } = useCarRentalsList(searchQuery);
  const { data: airlines, isLoading: airlinesLoading } = useAirlinesList(searchQuery);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      verified: "bg-green-500/10 text-green-500 border-green-500/20",
      available: "bg-green-500/10 text-green-500 border-green-500/20",
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      suspended: "bg-red-500/10 text-red-500 border-red-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
      inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      rented: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    return styles[status] || styles.pending;
  };

  const accountStats = [
    { label: "Total Customers", value: stats?.totalCustomers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Drivers", value: stats?.activeDrivers || 0, icon: Car, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Partners", value: stats?.partners || 0, icon: Store, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Pending Approval", value: stats?.pendingApprovals || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Suspended", value: stats?.suspendedAccounts || 0, icon: Ban, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "New This Week", value: stats?.newThisWeek || 0, icon: UserPlus, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  ];

  const renderAccountCard = (
    item: { id: string; name: string; email?: string; phone?: string; avatar_url?: string | null; logo_url?: string | null; image_url?: string | null; status: string },
    stats: { label: string; value: string | number }[],
    gradientFrom: string,
    gradientTo: string,
    index: number
  ) => (
    <div 
      key={item.id}
      className="p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-all animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={item.avatar_url || item.logo_url || item.image_url || undefined} />
            <AvatarFallback className={`bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
              {item.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{item.name}</p>
              <Badge variant="outline" className={cn("text-[10px]", getStatusBadge(item.status))}>
                {item.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              {item.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {item.email}
                </span>
              )}
              {item.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {item.phone}
                </span>
              )}
            </div>
          </div>
          <div className="h-12 w-px bg-border mx-4" />
          {stats.map((stat, i) => (
            <div key={i} className="text-center px-2">
              <p className="font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            View
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <UserCog className="h-4 w-4" />
                Edit Account
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Mail className="h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-500">
                <Ban className="h-4 w-4" />
                Suspend Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );

  const renderEmptyState = (type: string) => (
    <div className="text-center py-12 text-muted-foreground">
      <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
      <p className="font-medium">No {type} found</p>
      <p className="text-sm">Try adjusting your search or add new {type}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10">
            <Users className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Accounts Management</h1>
            <p className="text-muted-foreground">Manage all user accounts across the platform</p>
          </div>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        {accountStats.map((stat, i) => (
          <Card key={i} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <p className="text-xl font-bold">{stat.value.toLocaleString()}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="customers" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4" />
            Customers ({customers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2">
            <Car className="h-4 w-4" />
            Drivers ({drivers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="gap-2">
            <Store className="h-4 w-4" />
            Restaurants ({restaurants?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="car-rentals" className="gap-2">
            <Car className="h-4 w-4" />
            Car Rentals ({carRentals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="hotels" className="gap-2">
            <Building2 className="h-4 w-4" />
            Hotels ({hotels?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="flights" className="gap-2">
            <Plane className="h-4 w-4" />
            Airlines ({airlines?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Search Bar */}
        <div className="flex items-center gap-4 my-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search accounts by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Customers Tab */}
        <TabsContent value="customers" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Customer Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customersLoading ? renderLoadingSkeleton() : (
                <div className="space-y-3">
                  {customers?.length === 0 ? renderEmptyState("customers") : (
                    customers?.map((customer, i) => 
                      renderAccountCard(
                        customer,
                        [
                          { label: "Rides", value: customer.totalRides },
                          { label: "Spent", value: `$${customer.totalSpent.toFixed(0)}` }
                        ],
                        "from-primary/20",
                        "to-teal-500/20",
                        i
                      )
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-emerald-500" />
                Driver Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {driversLoading ? renderLoadingSkeleton() : (
                <div className="space-y-3">
                  {drivers?.length === 0 ? renderEmptyState("drivers") : (
                    drivers?.map((driver, i) => 
                      renderAccountCard(
                        driver,
                        [
                          { label: "Rating", value: driver.rating > 0 ? driver.rating.toFixed(1) : "-" },
                          { label: "Trips", value: driver.trips },
                          { label: "Earnings", value: `$${driver.earnings.toFixed(0)}` }
                        ],
                        "from-emerald-500/20",
                        "to-green-500/20",
                        i
                      )
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurants Tab */}
        <TabsContent value="restaurants" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-orange-500" />
                Restaurant Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              {restaurantsLoading ? renderLoadingSkeleton() : (
                <div className="space-y-3">
                  {restaurants?.length === 0 ? renderEmptyState("restaurants") : (
                    restaurants?.map((restaurant, i) => 
                      renderAccountCard(
                        { ...restaurant, avatar_url: restaurant.logo_url },
                        [
                          { label: "Rating", value: restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "-" },
                          { label: "Orders", value: restaurant.orders },
                          { label: "Revenue", value: `$${restaurant.revenue.toFixed(0)}` }
                        ],
                        "from-orange-500/20",
                        "to-amber-500/20",
                        i
                      )
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Car Rentals Tab */}
        <TabsContent value="car-rentals" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-500" />
                Rental Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {carRentalsLoading ? renderLoadingSkeleton() : (
                <div className="space-y-3">
                  {carRentals?.length === 0 ? renderEmptyState("rental cars") : (
                    carRentals?.map((car, i) => 
                      renderAccountCard(
                        { ...car, avatar_url: car.image_url, email: car.location || undefined, phone: `$${car.price_per_day}/day` },
                        [
                          { label: "Bookings", value: car.bookings },
                          { label: "Revenue", value: `$${car.revenue.toFixed(0)}` }
                        ],
                        "from-blue-500/20",
                        "to-indigo-500/20",
                        i
                      )
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hotels Tab */}
        <TabsContent value="hotels" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-violet-500" />
                Hotel Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hotelsLoading ? renderLoadingSkeleton() : (
                <div className="space-y-3">
                  {hotels?.length === 0 ? renderEmptyState("hotels") : (
                    hotels?.map((hotel, i) => 
                      renderAccountCard(
                        { ...hotel, avatar_url: hotel.logo_url },
                        [
                          { label: "Stars", value: `${hotel.star_rating}⭐` },
                          { label: "Bookings", value: hotel.bookings },
                          { label: "Revenue", value: `$${hotel.revenue.toFixed(0)}` }
                        ],
                        "from-violet-500/20",
                        "to-purple-500/20",
                        i
                      )
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Airlines Tab */}
        <TabsContent value="flights" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-sky-500" />
                Airline Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              {airlinesLoading ? renderLoadingSkeleton() : (
                <div className="space-y-3">
                  {airlines?.length === 0 ? renderEmptyState("airlines") : (
                    airlines?.map((airline, i) => 
                      renderAccountCard(
                        { ...airline, avatar_url: airline.logo_url, email: airline.code, phone: airline.country || undefined },
                        [],
                        "from-sky-500/20",
                        "to-cyan-500/20",
                        i
                      )
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
