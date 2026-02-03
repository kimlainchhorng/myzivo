/**
 * My Trips Page
 * Unified view of all bookings across ZIVO services
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Filter, Calendar, ChevronRight,
  Plane, Car, UtensilsCrossed, Package, MapPin
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUnifiedTrips, type UnifiedTrip, type ServiceType } from "@/hooks/useUnifiedTrips";
import { getServiceMeta } from "@/hooks/useZivoWallet";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { format } from "date-fns";

const serviceFilters: Array<{ id: ServiceType | "all"; label: string; icon?: React.ElementType }> = [
  { id: "all", label: "All" },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "p2p_cars", label: "Cars", icon: Car },
  { id: "rides", label: "Rides", icon: MapPin },
  { id: "eats", label: "Eats", icon: UtensilsCrossed },
  { id: "move", label: "Move", icon: Package },
];

const statusFilters = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function TripCard({ trip }: { trip: UnifiedTrip }) {
  const meta = getServiceMeta(trip.service);
  
  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    approved: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    in_progress: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    delivered: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
    rejected: "bg-red-100 text-red-800",
  }[trip.status] || "bg-gray-100 text-gray-800";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="text-3xl shrink-0">{trip.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{trip.title}</p>
                  <p className="text-sm text-muted-foreground">{trip.subtitle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className={`text-xs ${statusColor}`}>
                  {trip.status.replace("_", " ")}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(trip.date), "MMM d, yyyy")}
                </span>
              </div>
              
              <div className="mt-2 pt-2 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{meta.label}</span>
                <span className="font-semibold">${trip.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MyTripsPage() {
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: trips, isLoading } = useUnifiedTrips({
    services: serviceFilter === "all" ? undefined : [serviceFilter],
    status: statusFilter as any,
    limit: 50,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/app">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">My Trips</h1>
              <p className="text-sm text-muted-foreground">
                All your bookings in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[73px] z-30 bg-background border-b">
        <div className="container px-4 py-3 space-y-3">
          {/* Service Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {serviceFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={serviceFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setServiceFilter(filter.id)}
                className="shrink-0"
              >
                {filter.icon && <filter.icon className="w-4 h-4 mr-1" />}
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Status Filter */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="w-full grid grid-cols-5">
              {statusFilters.map((filter) => (
                <TabsTrigger key={filter.id} value={filter.id} className="text-xs">
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Trips List */}
      <div className="container px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No trips found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {statusFilter !== "all" 
                  ? `No ${statusFilter} trips in ${serviceFilter === "all" ? "any service" : serviceFilter}`
                  : "Start booking to see your trips here"}
              </p>
              <Button asChild>
                <Link to="/app">Browse Services</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
