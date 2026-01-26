import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Eye,
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  Star,
  AlertCircle
} from "lucide-react";

// Mock trip data
const mockTrips = [
  {
    id: "TRP-001",
    rider: "John Smith",
    driver: "Maria Garcia",
    pickupAddress: "123 Main Street, Downtown",
    dropoffAddress: "456 Oak Avenue, Uptown",
    distanceKm: 8.5,
    durationMinutes: 22,
    fareAmount: 24.50,
    status: "completed",
    paymentStatus: "paid",
    rating: 5,
    createdAt: "2024-06-20T14:30:00",
    completedAt: "2024-06-20T14:52:00",
  },
  {
    id: "TRP-002",
    rider: "Sarah Johnson",
    driver: "James Wilson",
    pickupAddress: "789 Pine Road, Midtown",
    dropoffAddress: "321 Elm Street, Suburbs",
    distanceKm: 15.2,
    durationMinutes: 35,
    fareAmount: 42.80,
    status: "in_progress",
    paymentStatus: "pending",
    rating: null,
    createdAt: "2024-06-20T15:45:00",
    completedAt: null,
  },
  {
    id: "TRP-003",
    rider: "Michael Brown",
    driver: "Linda Martinez",
    pickupAddress: "555 Cedar Lane, Business District",
    dropoffAddress: "777 Maple Drive, Airport",
    distanceKm: 25.0,
    durationMinutes: 45,
    fareAmount: 68.00,
    status: "en_route",
    paymentStatus: "pending",
    rating: null,
    createdAt: "2024-06-20T16:00:00",
    completedAt: null,
  },
  {
    id: "TRP-004",
    rider: "Emily Davis",
    driver: null,
    pickupAddress: "999 Birch Street, Residential",
    dropoffAddress: "111 Walnut Ave, Shopping Center",
    distanceKm: 5.8,
    durationMinutes: null,
    fareAmount: 15.20,
    status: "requested",
    paymentStatus: "pending",
    rating: null,
    createdAt: "2024-06-20T16:15:00",
    completedAt: null,
  },
  {
    id: "TRP-005",
    rider: "David Wilson",
    driver: "Maria Garcia",
    pickupAddress: "222 Spruce Court, North Side",
    dropoffAddress: "444 Ash Boulevard, South End",
    distanceKm: 12.3,
    durationMinutes: 28,
    fareAmount: 35.40,
    status: "cancelled",
    paymentStatus: "refunded",
    rating: null,
    createdAt: "2024-06-20T13:00:00",
    completedAt: null,
  },
  {
    id: "TRP-006",
    rider: "Anna Thompson",
    driver: "James Wilson",
    pickupAddress: "888 River Road, Waterfront",
    dropoffAddress: "666 Mountain View, Hills",
    distanceKm: 18.7,
    durationMinutes: 40,
    fareAmount: 52.30,
    status: "completed",
    paymentStatus: "paid",
    rating: 4,
    createdAt: "2024-06-20T12:00:00",
    completedAt: "2024-06-20T12:40:00",
  },
];

const AdminTripMonitoring = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<typeof mockTrips[0] | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredTrips = mockTrips.filter((trip) => {
    const matchesSearch =
      trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.rider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.driver?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") {
      return matchesSearch && ["requested", "accepted", "en_route", "arrived", "in_progress"].includes(trip.status);
    }
    return matchesSearch && trip.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { class: string; label: string }> = {
      requested: { class: "bg-blue-500/10 text-blue-600", label: "Requested" },
      accepted: { class: "bg-indigo-500/10 text-indigo-600", label: "Accepted" },
      en_route: { class: "bg-purple-500/10 text-purple-600", label: "En Route" },
      arrived: { class: "bg-cyan-500/10 text-cyan-600", label: "Arrived" },
      in_progress: { class: "bg-yellow-500/10 text-yellow-600", label: "In Progress" },
      completed: { class: "bg-green-500/10 text-green-600", label: "Completed" },
      cancelled: { class: "bg-red-500/10 text-red-600", label: "Cancelled" },
    };
    const config = statusConfig[status] || { class: "bg-gray-500/10 text-gray-600", label: status };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-600">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>;
      case "refunded":
        return <Badge className="bg-gray-500/10 text-gray-600">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeTripsCount = mockTrips.filter(t => 
    ["requested", "accepted", "en_route", "arrived", "in_progress"].includes(t.status)
  ).length;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trip Monitoring</h1>
        <p className="text-muted-foreground">Monitor and manage all trips in real-time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTripsCount}</p>
                <p className="text-sm text-muted-foreground">Active Trips</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockTrips.filter(t => t.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockTrips.filter(t => t.status === "cancelled").length}
                </p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${mockTrips.filter(t => t.paymentStatus === "paid").reduce((sum, t) => sum + t.fareAmount, 0).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Revenue Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Trips</CardTitle>
              <CardDescription>Track and monitor trip details and status</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip ID</TableHead>
                    <TableHead className="hidden md:table-cell">Rider</TableHead>
                    <TableHead className="hidden lg:table-cell">Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Fare</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment</TableHead>
                    <TableHead className="hidden md:table-cell">Time</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-mono text-sm">{trip.id}</TableCell>
                      <TableCell className="hidden md:table-cell">{trip.rider}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {trip.driver || <span className="text-muted-foreground">Unassigned</span>}
                      </TableCell>
                      <TableCell>{getStatusBadge(trip.status)}</TableCell>
                      <TableCell className="hidden sm:table-cell">${trip.fareAmount.toFixed(2)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{getPaymentBadge(trip.paymentStatus)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatTime(trip.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedTrip(trip);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Trip Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Trip Details</DialogTitle>
            <DialogDescription>Complete trip information</DialogDescription>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-lg font-semibold">{selectedTrip.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedTrip.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(selectedTrip.status)}
                  {getPaymentBadge(selectedTrip.paymentStatus)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rider</p>
                  <p className="font-medium">{selectedTrip.rider}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Driver</p>
                  <p className="font-medium">
                    {selectedTrip.driver || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Navigation className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup</p>
                    <p className="font-medium">{selectedTrip.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dropoff</p>
                    <p className="font-medium">{selectedTrip.dropoffAddress}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold">{selectedTrip.distanceKm} km</p>
                  <p className="text-xs text-muted-foreground">Distance</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold">
                    {selectedTrip.durationMinutes ? `${selectedTrip.durationMinutes} min` : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold">${selectedTrip.fareAmount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Fare</p>
                </div>
              </div>

              {selectedTrip.rating && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Rating:</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedTrip.rating!
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTripMonitoring;
