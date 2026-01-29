import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Navigation, Clock, DollarSign, Users, Car, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle, 
  Search, Filter, RefreshCw, Eye, Phone, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockActiveRides = [
  { id: "R001", rider: "John D.", driver: "Mike S.", status: "in_progress", pickup: "Downtown", dropoff: "Airport", fare: 45.00, eta: "12 min" },
  { id: "R002", rider: "Sarah M.", driver: "Alex K.", status: "accepted", pickup: "Mall", dropoff: "Office Park", fare: 22.50, eta: "5 min" },
  { id: "R003", rider: "Tom H.", driver: null, status: "requested", pickup: "Central Station", dropoff: "Hospital", fare: 18.00, eta: "Pending" },
];

const mockRideStats = {
  activeRides: 156,
  completedToday: 1847,
  cancelledToday: 89,
  avgWaitTime: "4.2 min",
  avgFare: 24.50,
  peakHour: "5-6 PM",
};

export default function AdminRidesManagement() {
  const [activeTab, setActiveTab] = useState("live");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string) => {
    const styles = {
      requested: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      accepted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[status as keyof typeof styles] || styles.requested;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10">
            <Navigation className="h-6 w-6 text-sky-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Rides Management</h1>
            <p className="text-muted-foreground">Monitor and manage all ride operations</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        {[
          { label: "Active Rides", value: mockRideStats.activeRides, icon: Car, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Completed Today", value: mockRideStats.completedToday, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Cancelled", value: mockRideStats.cancelledToday, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Avg Wait Time", value: mockRideStats.avgWaitTime, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Avg Fare", value: `$${mockRideStats.avgFare}`, icon: DollarSign, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Peak Hour", value: mockRideStats.peakHour, icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
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
          <TabsTrigger value="live" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Navigation className="h-4 w-4" />
            Live Rides
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending Requests
          </TabsTrigger>
          <TabsTrigger value="dispatch" className="gap-2">
            <Users className="h-4 w-4" />
            Manual Dispatch
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Issues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          {/* Search & Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search rides, riders, drivers..."
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

          {/* Active Rides Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-sky-500" />
                Live Rides
                <Badge variant="outline" className="ml-2 text-emerald-500 border-emerald-500/30">
                  {mockActiveRides.length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActiveRides.map((ride, i) => (
                  <div 
                    key={ride.id}
                    className="p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-all animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-mono text-sm font-bold">{ride.id}</p>
                          <Badge variant="outline" className={cn("text-[10px] mt-1", getStatusBadge(ride.status))}>
                            {ride.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="h-12 w-px bg-border" />
                        <div>
                          <p className="font-medium">{ride.rider}</p>
                          <p className="text-xs text-muted-foreground">Rider</p>
                        </div>
                        <div>
                          <p className="font-medium">{ride.driver || "Unassigned"}</p>
                          <p className="text-xs text-muted-foreground">Driver</p>
                        </div>
                        <div className="h-12 w-px bg-border" />
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm">{ride.pickup}</span>
                          <span className="text-muted-foreground">→</span>
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{ride.dropoff}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">${ride.fare.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">ETA: {ride.eta}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Pending ride requests will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispatch" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Manual dispatch controls for assigning drivers</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ride issues and incidents will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
