import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, User, Star, Car, MapPin, Phone, Mail,
  CheckCircle, XCircle, DollarSign, Percent, TrendingUp, Clock, Navigation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { useDriverDetailStats, useDriverRecentTrips } from "@/hooks/useDriverDetailStats";

export default function DriverDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch driver details
  const { data: driver, isLoading: driverLoading } = useQuery({
    queryKey: ["driver-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Driver ID required");
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: stats, isLoading: statsLoading } = useDriverDetailStats(id);
  const { data: recentTrips, isLoading: tripsLoading } = useDriverRecentTrips(id);

  const getStatusBadge = (status: string | null) => {
    const styles = {
      requested: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      accepted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      en_route: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      arrived: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      in_progress: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[status as keyof typeof styles] || "bg-muted";
  };

  if (driverLoading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Driver not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/drivers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Drivers
        </Button>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Rides",
      value: stats?.totalRides ?? 0,
      icon: Navigation,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      label: "Total Earnings",
      value: `$${(stats?.totalEarnings ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Platform Commission",
      value: `$${(stats?.platformCommission ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: Percent,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Completion Rate",
      value: `${(stats?.completionRate ?? 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate("/admin/drivers")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Drivers
      </Button>

      {/* Driver Info Card */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                {driver.avatar_url ? (
                  <img 
                    src={driver.avatar_url} 
                    alt={driver.full_name} 
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <div className={cn(
                "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background",
                driver.is_online ? "bg-emerald-500" : "bg-muted"
              )} />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{driver.full_name}</h1>
                {driver.rating && (
                  <Badge variant="outline" className="gap-1 text-amber-500 border-amber-500/30">
                    <Star className="h-3 w-3 fill-amber-500" />
                    {driver.rating.toFixed(1)}
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={cn(
                    driver.is_online 
                      ? "text-emerald-500 border-emerald-500/30" 
                      : "text-muted-foreground"
                  )}
                >
                  {driver.is_online ? "Online" : "Offline"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Car className="h-4 w-4" />
                <span>{driver.vehicle_model || driver.vehicle_type}</span>
                <span>·</span>
                <span>{driver.vehicle_plate}</span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {driver.phone}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {driver.email}
                </div>
                {driver.updated_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last update: {formatDistanceToNow(new Date(driver.updated_at), { addSuffix: true })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Badge variant="outline">
                  Status: {driver.status || "pending"}
                </Badge>
                {driver.documents_verified && (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card 
            key={i} 
            className="border-0 bg-card/50 backdrop-blur-xl"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {statsLoading ? <Skeleton className="h-6 w-16" /> : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Trips */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-sky-500" />
            Recent Trips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tripsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !recentTrips?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Navigation className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No trips found for this driver</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Date</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Dropoff</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(trip.created_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm">
                        {trip.pickup_address}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm">
                        {trip.dropoff_address}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${(trip.fare_amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getStatusBadge(trip.status))}>
                          {trip.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
