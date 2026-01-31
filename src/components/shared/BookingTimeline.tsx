import { useState } from "react";
import { 
  Plane, 
  Hotel, 
  Car, 
  MapPin, 
  Clock, 
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TimelineEvent {
  id: string;
  type: "flight" | "hotel" | "car" | "activity" | "transfer";
  title: string;
  subtitle: string;
  date: Date;
  time?: string;
  duration?: string;
  status: "confirmed" | "pending" | "action-needed";
  details?: {
    confirmation?: string;
    location?: string;
    notes?: string;
  };
}

interface BookingTimelineProps {
  events?: TimelineEvent[];
  className?: string;
}

const defaultEvents: TimelineEvent[] = [
  {
    id: "1",
    type: "flight",
    title: "Flight to Paris",
    subtitle: "AA 1234 • JFK → CDG",
    date: new Date(2024, 2, 15, 8, 30),
    time: "8:30 AM",
    duration: "7h 45m",
    status: "confirmed",
    details: {
      confirmation: "ABC123",
      location: "Terminal 4, Gate B22",
      notes: "Boarding starts 40 min before departure"
    }
  },
  {
    id: "2",
    type: "transfer",
    title: "Airport Transfer",
    subtitle: "CDG → Hotel Le Marais",
    date: new Date(2024, 2, 15, 17, 15),
    time: "5:15 PM (local)",
    duration: "45 min",
    status: "pending",
    details: {
      notes: "Driver will meet you at arrivals"
    }
  },
  {
    id: "3",
    type: "hotel",
    title: "Hotel Le Marais",
    subtitle: "Deluxe Room • 4 nights",
    date: new Date(2024, 2, 15, 18, 0),
    time: "6:00 PM check-in",
    status: "confirmed",
    details: {
      confirmation: "HM98765",
      location: "15 Rue des Archives, Paris",
      notes: "Late checkout requested"
    }
  },
  {
    id: "4",
    type: "car",
    title: "Car Rental Pickup",
    subtitle: "Compact SUV • Hertz",
    date: new Date(2024, 2, 16, 9, 0),
    time: "9:00 AM",
    duration: "3 days",
    status: "action-needed",
    details: {
      location: "Hotel Lobby",
      notes: "Driver's license required"
    }
  }
];

const typeIcons = {
  flight: Plane,
  hotel: Hotel,
  car: Car,
  activity: MapPin,
  transfer: Car
};

const typeColors = {
  flight: "text-sky-500 bg-sky-500/10 border-sky-500/30",
  hotel: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  car: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  activity: "text-pink-500 bg-pink-500/10 border-pink-500/30",
  transfer: "text-violet-500 bg-violet-500/10 border-violet-500/30"
};

const statusConfig = {
  confirmed: { icon: CheckCircle2, color: "text-primary", label: "Confirmed" },
  pending: { icon: Circle, color: "text-amber-500", label: "Pending" },
  "action-needed": { icon: AlertCircle, color: "text-rose-500", label: "Action Needed" }
};

const BookingTimeline = ({ events = defaultEvents, className }: BookingTimelineProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = format(event.date, "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-teal-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Trip Timeline</CardTitle>
            <p className="text-sm text-muted-foreground">{events.length} bookings</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-6">
        {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
          <div key={dateKey} className="relative">
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1.5 rounded-lg bg-muted text-sm font-semibold">
                {format(new Date(dateKey), "EEE, MMM d")}
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>
            
            {/* Events for this day */}
            <div className="space-y-3 relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
              
              {dayEvents.map((event, idx) => {
                const Icon = typeIcons[event.type];
                const colorClass = typeColors[event.type];
                const StatusIcon = statusConfig[event.status].icon;
                const isExpanded = expandedId === event.id;
                
                return (
                  <div key={event.id} className="relative pl-12">
                    {/* Icon on timeline */}
                    <div className={cn(
                      "absolute left-0 w-10 h-10 rounded-xl flex items-center justify-center border",
                      colorClass
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Event Card */}
                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="w-full text-left p-3 rounded-xl border border-border/50 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={cn("w-4 h-4", statusConfig[event.status].color)} />
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                        )}
                        {event.duration && (
                          <span>{event.duration}</span>
                        )}
                      </div>
                      
                      {/* Expanded Details */}
                      {isExpanded && event.details && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          {event.details.confirmation && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Confirmation</span>
                              <span className="font-mono font-medium">{event.details.confirmation}</span>
                            </div>
                          )}
                          {event.details.location && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                              <span>{event.details.location}</span>
                            </div>
                          )}
                          {event.details.notes && (
                            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                              💡 {event.details.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BookingTimeline;
