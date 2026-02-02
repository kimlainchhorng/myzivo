/**
 * Hizovo Travel App - Trips Tab
 * Shows past searches and booking history
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Briefcase, Plane, Hotel, CarFront, Calendar, 
  ChevronRight, Search, Clock, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import HizovoAppLayout from "@/components/app/HizovoAppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Demo trip data
const upcomingTrips = [
  {
    id: "1",
    type: "flight",
    title: "New York → Los Angeles",
    subtitle: "Delta Air Lines",
    date: "Feb 15, 2026",
    status: "confirmed",
    bookingRef: "DL-ABC123",
    price: 199,
  },
  {
    id: "2",
    type: "hotel",
    title: "Marriott Downtown Miami",
    subtitle: "3 nights",
    date: "Feb 18-21, 2026",
    status: "pending",
    bookingRef: null,
    price: 567,
  },
];

const pastTrips = [
  {
    id: "3",
    type: "flight",
    title: "San Francisco → Seattle",
    subtitle: "United Airlines",
    date: "Jan 10, 2026",
    status: "completed",
    bookingRef: "UA-XYZ789",
    price: 145,
  },
  {
    id: "4",
    type: "car",
    title: "LAX Airport Rental",
    subtitle: "Toyota Camry - 4 days",
    date: "Jan 5-9, 2026",
    status: "completed",
    bookingRef: "HTZ-456",
    price: 180,
  },
];

const recentSearches = [
  { id: "1", type: "flight", query: "JFK → LAX", date: "Today" },
  { id: "2", type: "hotel", query: "Miami, FL", date: "Yesterday" },
  { id: "3", type: "car", query: "LAX Airport", date: "2 days ago" },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'flight': return Plane;
    case 'hotel': return Hotel;
    case 'car': return CarFront;
    default: return Briefcase;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'flight': return 'text-flights bg-flights/10';
    case 'hotel': return 'text-hotels bg-hotels/10';
    case 'car': return 'text-cars bg-cars/10';
    default: return 'text-primary bg-primary/10';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-500/10', label: 'Confirmed' };
    case 'pending':
      return { icon: Loader2, color: 'text-amber-600 bg-amber-500/10', label: 'Pending' };
    case 'completed':
      return { icon: CheckCircle, color: 'text-muted-foreground bg-muted', label: 'Completed' };
    default:
      return { icon: AlertCircle, color: 'text-muted-foreground bg-muted', label: status };
  }
};

const HizovoTrips = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Handle new booking from checkout
  const newBooking = location.state?.newBooking;
  
  useEffect(() => {
    if (newBooking) {
      // In a real app, this would save to database
      console.log('New booking:', newBooking);
    }
  }, [newBooking]);

  const TripCard = ({ trip }: { trip: typeof upcomingTrips[0] }) => {
    const Icon = getTypeIcon(trip.type);
    const colorClass = getTypeColor(trip.type);
    const statusBadge = getStatusBadge(trip.status);
    const StatusIcon = statusBadge.icon;
    
    return (
      <button
        onClick={() => navigate(`/app/trips/${trip.id}`)}
        className="w-full p-4 rounded-2xl bg-card border border-border/50 text-left touch-manipulation active:scale-[0.99] transition-transform"
      >
        <div className="flex items-start gap-3">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold truncate pr-2">{trip.title}</h3>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">{trip.subtitle}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {trip.date}
              </span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", statusBadge.color)}>
                <StatusIcon className={cn("w-3 h-3", trip.status === 'pending' && "animate-spin")} />
                {statusBadge.label}
              </span>
            </div>
            {trip.bookingRef && (
              <p className="text-xs font-mono text-muted-foreground mt-2">
                Ref: {trip.bookingRef}
              </p>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <HizovoAppLayout title="My Trips">
      <div className="pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="grid grid-cols-3 w-full h-12 rounded-xl">
              <TabsTrigger value="upcoming" className="rounded-lg">Upcoming</TabsTrigger>
              <TabsTrigger value="past" className="rounded-lg">Past</TabsTrigger>
              <TabsTrigger value="searches" className="rounded-lg">Searches</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming" className="px-4 pt-4 space-y-3">
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold mb-2">No Upcoming Trips</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start planning your next adventure!
                </p>
                <Button onClick={() => navigate('/app/flights')} className="gap-2">
                  <Search className="w-4 h-4" />
                  Search Flights
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="px-4 pt-4 space-y-3">
            {pastTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </TabsContent>

          <TabsContent value="searches" className="px-4 pt-4 space-y-3">
            <p className="text-sm text-muted-foreground mb-3">Recent searches</p>
            {recentSearches.map((search) => {
              const Icon = getTypeIcon(search.type);
              const colorClass = getTypeColor(search.type);
              
              return (
                <button
                  key={search.id}
                  onClick={() => navigate(`/app/${search.type}s`)}
                  className="w-full p-3 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-3 text-left touch-manipulation active:scale-[0.99]"
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClass)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{search.query}</p>
                    <p className="text-xs text-muted-foreground">{search.date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
            
            <Button variant="outline" className="w-full mt-4" onClick={() => {}}>
              Clear Search History
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </HizovoAppLayout>
  );
};

export default HizovoTrips;
