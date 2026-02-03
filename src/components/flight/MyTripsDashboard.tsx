import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plane,
  Calendar,
  Clock,
  MapPin,
  Search,
  ChevronRight,
  ArrowRight,
  Download,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  SortAsc,
  Share2,
  RefreshCw,
  CalendarDays,
  Ticket,
  ArrowUpDown,
  Eye,
  Trash2,
  Copy,
  ExternalLink,
  Zap,
  Loader2,
  FileText
} from "lucide-react";
import { format, addDays, subDays, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useFlightBookings, getTicketingStatusInfo, canRequestRefund } from "@/hooks/useFlightBooking";
import FlightTicketCard from "./FlightTicketCard";

interface Trip {
  id: string;
  bookingRef: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  ticketingStatus?: 'pending' | 'processing' | 'issued' | 'failed' | 'cancelled' | 'voided';
  pnr?: string;
  ticketNumbers?: string[];
  route: {
    origin: string;
    originCode: string;
    destination: string;
    destCode: string;
  };
  departureDate: Date;
  returnDate?: Date;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  passengers: number;
  totalAmount: number;
  boardingPassAvailable: boolean;
  fareClass: 'economy' | 'premium' | 'business' | 'first';
  isRealPrice?: boolean;
}

interface MyTripsDashboardProps {
  className?: string;
  onViewTrip?: (trip: Trip) => void;
  onDownloadBoardingPass?: (trip: Trip) => void;
  onRequestChange?: (trip: Trip) => void;
  onRequestRefund?: (trip: Trip) => void;
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
    airlineCode: 'BA',
    flightNumber: 'BA178',
    passengers: 2,
    totalAmount: 2840,
    boardingPassAvailable: true,
    fareClass: 'business',
    isRealPrice: true
  },
  {
    id: '2',
    bookingRef: 'ZIVO-DEF456',
    status: 'upcoming',
    route: { origin: 'London', originCode: 'LHR', destination: 'Paris', destCode: 'CDG' },
    departureDate: addDays(new Date(), 21),
    airline: 'Air France',
    airlineCode: 'AF',
    flightNumber: 'AF1681',
    passengers: 1,
    totalAmount: 380,
    boardingPassAvailable: false,
    fareClass: 'economy'
  },
  {
    id: '3',
    bookingRef: 'ZIVO-GHI789',
    status: 'completed',
    route: { origin: 'Los Angeles', originCode: 'LAX', destination: 'Tokyo', destCode: 'NRT' },
    departureDate: subDays(new Date(), 30),
    returnDate: subDays(new Date(), 20),
    airline: 'Japan Airlines',
    airlineCode: 'JL',
    flightNumber: 'JL61',
    passengers: 2,
    totalAmount: 4200,
    boardingPassAvailable: false,
    fareClass: 'premium',
    isRealPrice: true
  },
  {
    id: '4',
    bookingRef: 'ZIVO-JKL012',
    status: 'cancelled',
    route: { origin: 'Chicago', originCode: 'ORD', destination: 'Miami', destCode: 'MIA' },
    departureDate: subDays(new Date(), 5),
    airline: 'American Airlines',
    airlineCode: 'AA',
    flightNumber: 'AA1234',
    passengers: 1,
    totalAmount: 320,
    boardingPassAvailable: false,
    fareClass: 'economy'
  },
  {
    id: '5',
    bookingRef: 'ZIVO-MNO345',
    status: 'completed',
    route: { origin: 'San Francisco', originCode: 'SFO', destination: 'Sydney', destCode: 'SYD' },
    departureDate: subDays(new Date(), 60),
    returnDate: subDays(new Date(), 45),
    airline: 'Qantas',
    airlineCode: 'QF',
    flightNumber: 'QF74',
    passengers: 3,
    totalAmount: 8900,
    boardingPassAvailable: false,
    fareClass: 'first',
    isRealPrice: true
  },
  {
    id: '6',
    bookingRef: 'ZIVO-PQR678',
    status: 'upcoming',
    route: { origin: 'Dubai', originCode: 'DXB', destination: 'Singapore', destCode: 'SIN' },
    departureDate: addDays(new Date(), 3),
    airline: 'Emirates',
    airlineCode: 'EK',
    flightNumber: 'EK354',
    passengers: 2,
    totalAmount: 1560,
    boardingPassAvailable: true,
    fareClass: 'business',
    isRealPrice: true
  },
];

type SortOption = 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'destination';

export const MyTripsDashboard = ({ className, onViewTrip, onDownloadBoardingPass }: MyTripsDashboardProps) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');
  const [dateFilter, setDateFilter] = useState<'all' | 'this-month' | 'next-month'>('all');

  const filteredTrips = useMemo(() => {
    let trips = MOCK_TRIPS.filter(trip => {
      const matchesTab = activeTab === 'all' || trip.status === activeTab;
      const matchesSearch = searchQuery === '' || 
        trip.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.route.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.airline.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date filter
      let matchesDate = true;
      if (dateFilter === 'this-month') {
        const now = new Date();
        matchesDate = isWithinInterval(trip.departureDate, {
          start: startOfMonth(now),
          end: endOfMonth(now)
        });
      } else if (dateFilter === 'next-month') {
        const nextMonth = addDays(new Date(), 30);
        matchesDate = isWithinInterval(trip.departureDate, {
          start: startOfMonth(nextMonth),
          end: endOfMonth(nextMonth)
        });
      }
      
      return matchesTab && matchesSearch && matchesDate;
    });

    // Sort
    trips.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return a.departureDate.getTime() - b.departureDate.getTime();
        case 'date-desc':
          return b.departureDate.getTime() - a.departureDate.getTime();
        case 'price-asc':
          return a.totalAmount - b.totalAmount;
        case 'price-desc':
          return b.totalAmount - a.totalAmount;
        case 'destination':
          return a.route.destination.localeCompare(b.route.destination);
        default:
          return 0;
      }
    });

    return trips;
  }, [activeTab, searchQuery, sortBy, dateFilter]);

  const upcomingCount = MOCK_TRIPS.filter(t => t.status === 'upcoming').length;
  const completedCount = MOCK_TRIPS.filter(t => t.status === 'completed').length;
  const cancelledCount = MOCK_TRIPS.filter(t => t.status === 'cancelled').length;

  const totalSpent = MOCK_TRIPS.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTrips = MOCK_TRIPS.filter(t => t.status === 'completed').length;

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

  const getFareClassColor = (fareClass: string) => {
    switch (fareClass) {
      case 'first': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'business': return 'bg-violet-500/20 text-violet-400 border-violet-500/40';
      case 'premium': return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCopyBookingRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
  };

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 border border-sky-500/40 flex items-center justify-center">
              <Plane className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <CardTitle className="text-lg">My Trips</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalTrips} trips completed • ${totalSpent.toLocaleString()} spent
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as typeof dateFilter)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <CalendarDays className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="this-month">This month</SelectItem>
                <SelectItem value="next-month">Next month</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Date ↑</SelectItem>
                <SelectItem value="date-desc">Date ↓</SelectItem>
                <SelectItem value="price-asc">Price ↑</SelectItem>
                <SelectItem value="price-desc">Price ↓</SelectItem>
                <SelectItem value="destination">Destination</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/50 overflow-x-auto">
            <TabsList className="w-full justify-start rounded-none bg-transparent h-auto p-0 min-w-max">
              <TabsTrigger
                value="upcoming"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent py-3 px-4 sm:px-6"
              >
                <Clock className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upcoming</span>
                {upcomingCount > 0 && (
                  <Badge className="ml-2 bg-sky-500/20 text-sky-400">{upcomingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent py-3 px-4 sm:px-6"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Completed</span>
                {completedCount > 0 && (
                  <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">{completedCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent py-3 px-4 sm:px-6"
              >
                <XCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cancelled</span>
                {cancelledCount > 0 && (
                  <Badge className="ml-2 bg-red-500/20 text-red-400">{cancelledCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4 sm:px-6"
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
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Route */}
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold">{trip.route.originCode}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{trip.route.origin}</p>
                        </div>
                        <div className="flex flex-col items-center px-2 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-sky-500" />
                            <div className="w-8 sm:w-16 h-px bg-gradient-to-r from-sky-500 to-violet-500" />
                            <Plane className="w-4 h-4 rotate-90" />
                            <div className="w-8 sm:w-16 h-px bg-gradient-to-r from-violet-500 to-sky-500" />
                            <div className="w-2 h-2 rounded-full bg-violet-500" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{trip.flightNumber}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold">{trip.route.destCode}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{trip.route.destination}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-medium">
                            {format(trip.departureDate, 'MMM d, yyyy')}
                          </p>
                          {trip.returnDate && (
                            <p className="text-xs text-muted-foreground">
                              Return: {format(trip.returnDate, 'MMM d')}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(trip.status)}>
                            {getStatusIcon(trip.status)}
                            <span className="ml-1 capitalize hidden sm:inline">{trip.status}</span>
                          </Badge>
                          
                          <Badge variant="outline" className={getFareClassColor(trip.fareClass)}>
                            {trip.fareClass.charAt(0).toUpperCase() + trip.fareClass.slice(1)}
                          </Badge>
                          
                          {trip.isRealPrice && (
                            <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/30">
                              <Zap className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">${trip.totalAmount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {trip.passengers} pax
                          </p>
                        </div>

                        <ChevronRight className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform hidden sm:block",
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
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                <div>
                                  <p className="text-xs text-muted-foreground">Booking Reference</p>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono font-semibold">{trip.bookingRef}</p>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyBookingRef(trip.bookingRef);
                                      }}
                                      className="text-muted-foreground hover:text-foreground"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Airline</p>
                                  <p className="font-medium">{trip.airline}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Class</p>
                                  <p className="font-medium capitalize">{trip.fareClass}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                {trip.boardingPassAvailable && (
                                  <Button 
                                    size="sm" 
                                    className="gap-2 flex-1 sm:flex-initial"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDownloadBoardingPass?.(trip);
                                    }}
                                  >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden sm:inline">Boarding Pass</span>
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="gap-2 flex-1 sm:flex-initial"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewTrip?.(trip);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="hidden sm:inline">View Details</span>
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Share2 className="w-4 h-4 mr-2" />
                                      Share Trip
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <RefreshCw className="w-4 h-4 mr-2" />
                                      Rebook Similar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Airline Website
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {trip.status === 'upcoming' && (
                                      <DropdownMenuItem className="text-red-500">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Cancel Booking
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
