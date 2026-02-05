/**
 * TripTimeline Component
 * Visual journey flow connecting flight to hotel with weather widget
 */
import { motion } from "framer-motion";
import { Plane, Hotel, CloudRain, Sun, ArrowRight, Calendar, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMyTrips, type TravelOrder } from "@/hooks/useMyTrips";
import { format, formatDistanceToNow, isAfter, isTomorrow, isToday } from "date-fns";

// Mock weather data by city
const mockWeatherByCity: Record<string, { temp: string; condition: string; Icon: LucideIcon }> = {
  london: { temp: "12°C", condition: "Rainy", Icon: CloudRain },
  paris: { temp: "15°C", condition: "Cloudy", Icon: Sun },
  "new york": { temp: "18°C", condition: "Sunny", Icon: Sun },
  tokyo: { temp: "22°C", condition: "Cloudy", Icon: Sun },
  dubai: { temp: "35°C", condition: "Sunny", Icon: Sun },
  "los angeles": { temp: "24°C", condition: "Sunny", Icon: Sun },
  miami: { temp: "28°C", condition: "Sunny", Icon: Sun },
  default: { temp: "20°C", condition: "Clear", Icon: Sun },
};

function getWeatherForCity(city: string) {
  const normalized = city.toLowerCase().trim();
  return mockWeatherByCity[normalized] || mockWeatherByCity.default;
}

function getDepartureLabel(date: Date): string {
  if (isToday(date)) return "Departing Today";
  if (isTomorrow(date)) return "Departing Tomorrow";
  return `Departing ${format(date, "MMM d")}`;
}

interface TimelineItemProps {
  type: "flight" | "hotel" | "activity";
  title: string;
  subtitle: string;
  date: Date;
  details: Record<string, string | undefined>;
  city?: string;
  isActive?: boolean;
}

function TimelineItem({ type, title, subtitle, date, details, city, isActive = false }: TimelineItemProps) {
  const weather = city ? getWeatherForCity(city) : null;
  const Icon = type === "flight" ? Plane : type === "hotel" ? Hotel : Calendar;

  return (
    <div className="relative pl-20">
      {/* Icon Bubble */}
      <div
        className={`absolute left-0 top-0 w-16 h-16 rounded-2xl flex items-center justify-center z-10 transition-all ${
          isActive
            ? "bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
            : "bg-muted border border-border"
        }`}
      >
        <Icon className={`w-7 h-7 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-card border rounded-3xl p-6 relative overflow-hidden transition-colors ${
          isActive ? "border-primary/30 hover:border-primary/50" : "border-border hover:border-border/80"
        }`}
      >
        {/* Weather Widget Overlay (for hotels) */}
        {weather && type === "hotel" && (
          <div className="absolute top-0 right-0 p-6 text-right z-20">
            <weather.Icon className="w-6 h-6 text-primary ml-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{weather.temp}</div>
            <div className="text-[10px] text-muted-foreground">{weather.condition} in {city}</div>
          </div>
        )}

        <div className={`relative z-10 ${weather && type === "hotel" ? "pr-20" : ""}`}>
          <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
            {getDepartureLabel(date)}
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>}

          {/* Details Grid */}
          {Object.keys(details).length > 0 && (
            <div className="flex gap-4 items-center bg-muted/50 rounded-xl p-4">
              {Object.entries(details).map(([label, value]) => (
                <div key={label} className="flex-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">{label}</div>
                  <div className={`font-mono ${value === "TBD" ? "text-warning" : "text-foreground"}`}>
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Get Directions CTA for hotels */}
          {type === "hotel" && (
            <Button variant="ghost" size="sm" className="mt-4 gap-2">
              Get Directions <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function TripTimeline() {
  const { data: upcomingTrips, isLoading } = useMyTrips("upcoming");

  // Get the next upcoming trip
  const nextTrip = upcomingTrips?.[0];

  // Extract timeline items from the trip
  const timelineItems: TimelineItemProps[] = [];

  if (nextTrip) {
    nextTrip.travel_order_items?.forEach((item, index) => {
      const meta = item.meta as Record<string, unknown>;
      const startDate = new Date(item.start_date);

      if (item.type === "hotel") {
        timelineItems.push({
          type: "hotel",
          title: item.title || "Hotel Stay",
          subtitle: meta?.room_type as string || "Standard Room",
          date: startDate,
          details: {
            "Check-in": format(startDate, "MMM d"),
            "Nights": item.end_date 
              ? Math.ceil((new Date(item.end_date).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)).toString()
              : "1",
          },
          city: (meta?.city as string) || (meta?.destination as string),
          isActive: index === 0,
        });
      } else if (item.type === "activity") {
        timelineItems.push({
          type: "activity",
          title: item.title || "Activity",
          subtitle: meta?.location as string || "",
          date: startDate,
          details: {
            "Date": format(startDate, "MMM d"),
            "Time": meta?.time as string || "TBD",
          },
          isActive: index === 0,
        });
      }
    });
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Journey</h2>
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="pl-20 relative">
              <div className="absolute left-0 top-0 w-16 h-16 rounded-2xl bg-muted animate-pulse" />
              <div className="bg-card border border-border rounded-3xl p-6 h-40 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!nextTrip || timelineItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Journey</h2>
        <div className="bg-card border border-border rounded-3xl p-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No upcoming trips</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start planning your next adventure!
          </p>
          <Button asChild>
            <Link to="/hotels">
              <Plane className="w-4 h-4 mr-2" />
              Browse Destinations
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 relative">
      <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Journey</h2>

      {/* Vertical Connecting Line */}
      <div className="timeline-connector" />

      {/* Timeline Items */}
      {timelineItems.map((item, index) => (
        <TimelineItem key={index} {...item} />
      ))}
    </div>
  );
}

export default TripTimeline;