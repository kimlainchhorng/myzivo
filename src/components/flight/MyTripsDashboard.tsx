import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Plane,
  Calendar,
  Clock,
  MapPin,
  Search,
  ChevronRight,
  ArrowRight,
  Star,
  Download,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface Trip {
  id: string;
  bookingRef: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  route: {
    origin: string;
    originCode: string;
    destination: string;
    destCode: string;
  };
  departureDate: Date;
  returnDate?: Date;
  airline: string;
  flightNumber: string;
  passengers: number;
  totalAmount: number;
  boardingPassAvailable: boolean;
}

interface MyTripsDashboardProps {
  className?: string;
}

const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    bookingRef: 'ZIVO-ABC123',
    status: 'upcoming',
    route: { origin: 'New York', originCode: 'JFK', destination: 'London', destCode: 'LHR' },
    departureDate: addDays(new Date(), 7),
    returnDate: addDays(new Date(), 14),
    airline: 'British Airways',
    flightNumber: 'BA178',
    passengers: 2,
    totalAmount: 2840,
    boardingPassAvailable: true
  },
  {
    id: '2',
    bookingRef: 'ZIVO-DEF456',
    status: 'upcoming',
    route: { origin: 'London', originCode: 'LHR', destination: 'Paris', destCode: 'CDG' },
    departureDate: addDays(new Date(), 21),
    airline: 'Air France',
    flightNumber: 'AF1681',
    passengers: 1,
    totalAmount: 380,
    boardingPassAvailable: false
  },
  {
    id: '3',
    bookingRef: 'ZIVO-GHI789',
    status: 'completed',
    route: { origin: 'Los Angeles', originCode: 'LAX', destination: 'Tokyo', destCode: 'NRT' },
    departureDate: subDays(new Date(), 30),
    returnDate: subDays(new Date(), 20),
    airline: 'Japan Airlines',
    flightNumber: 'JL61',
    passengers: 2,
    totalAmount: 4200,
    boardingPassAvailable: false
  },
  {
    id: '4',
    bookingRef: 'ZIVO-JKL012',
    status: 'cancelled',
    route: { origin: 'Chicago', originCode: 'ORD', destination: 'Miami', destCode: 'MIA' },
    departureDate: subDays(new Date(), 5),
    airline: 'American Airlines',
    flightNumber: 'AA1234',
    passengers: 1,
    totalAmount: 320,
    boardingPassAvailable: false
  },
  {
    id: '5',
    bookingRef: 'ZIVO-MNO345',
    status: 'completed',
    route: { origin: 'San Francisco', originCode: 'SFO', destination: 'Sydney', destCode: 'SYD' },
    departureDate: subDays(new Date(), 60),
    returnDate: subDays(new Date(), 45),
    airline: 'Qantas',
    flightNumber: 'QF74',
    passengers: 3,
    totalAmount: 8900,
    boardingPassAvailable: false
  },
];

export const MyTripsDashboard = ({ className }: MyTripsDashboardProps) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const filteredTrips = MOCK_TRIPS.filter(trip => {
    const matchesTab = activeTab === 'all' || trip.status === activeTab;
    const matchesSearch = searchQuery === '' || 
      trip.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.route.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const upcomingCount = MOCK_TRIPS.filter(t => t.status === 'upcoming').length;
  const completedCount = MOCK_TRIPS.filter(t => t.status === 'completed').length;
  const cancelledCount = MOCK_TRIPS.filter(t => t.status === 'cancelled').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return '';
    }
  };

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 border border-sky-500/40 flex items-center justify-center">
              <Plane className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <CardTitle className="text-lg">My Trips</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage all your flight bookings in one place
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by booking ref or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/50">
            <TabsList className="w-full justify-start rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="upcoming"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent py-3 px-6"
              >
                <Clock className="w-4 h-4 mr-2" />
                Upcoming
                {upcomingCount > 0 && (
                  <Badge className="ml-2 bg-sky-500/20 text-sky-400">{upcomingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent py-3 px-6"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed
                {completedCount > 0 && (
                  <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">{completedCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent py-3 px-6"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelled
                {cancelledCount > 0 && (
                  <Badge className="ml-2 bg-red-500/20 text-red-400">{cancelledCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
              >
                All Trips
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            {filteredTrips.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No trips found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Start planning your next adventure!"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTrips.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedTrip(selectedTrip === trip.id ? null : trip.id)}
                    className={cn(
                      "rounded-xl border p-4 cursor-pointer transition-all",
                      selectedTrip === trip.id
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-border bg-card/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      {/* Route */}
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{trip.route.originCode}</p>
                          <p className="text-xs text-muted-foreground">{trip.route.origin}</p>
                        </div>
                        <div className="flex flex-col items-center px-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-sky-500" />
                            <div className="w-16 h-px bg-gradient-to-r from-sky-500 to-violet-500" />
                            <Plane className="w-4 h-4 rotate-90" />
                            <div className="w-16 h-px bg-gradient-to-r from-violet-500 to-sky-500" />
                            <div className="w-2 h-2 rounded-full bg-violet-500" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{trip.flightNumber}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{trip.route.destCode}</p>
                          <p className="text-xs text-muted-foreground">{trip.route.destination}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(trip.departureDate, 'MMM d, yyyy')}
                          </p>
                          {trip.returnDate && (
                            <p className="text-xs text-muted-foreground">
                              Return: {format(trip.returnDate, 'MMM d')}
                            </p>
                          )}
                        </div>
                        
                        <Badge className={getStatusColor(trip.status)}>
                          {getStatusIcon(trip.status)}
                          <span className="ml-1 capitalize">{trip.status}</span>
                        </Badge>

                        <div className="text-right">
                          <p className="font-semibold">${trip.totalAmount}</p>
                          <p className="text-xs text-muted-foreground">
                            {trip.passengers} passenger{trip.passengers > 1 ? 's' : ''}
                          </p>
                        </div>

                        <ChevronRight className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          selectedTrip === trip.id && "rotate-90"
                        )} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {selectedTrip === trip.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div>
                                  <p className="text-xs text-muted-foreground">Booking Reference</p>
                                  <p className="font-mono font-semibold">{trip.bookingRef}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Airline</p>
                                  <p className="font-medium">{trip.airline}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {trip.boardingPassAvailable && (
                                  <Button size="sm" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Boarding Pass
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" className="gap-2">
                                  View Details
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MyTripsDashboard;
