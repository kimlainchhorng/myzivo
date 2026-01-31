import { useEffect, useState } from "react";
import { Car, Plane, Hotel, Package, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: number;
  type: "ride" | "flight" | "hotel" | "delivery";
  message: string;
  location: string;
  time: string;
}

const activities: Activity[] = [
  { id: 1, type: "ride", message: "Ride completed", location: "Los Angeles, CA", time: "Just now" },
  { id: 2, type: "flight", message: "Flight booked", location: "NYC → London", time: "2 min ago" },
  { id: 3, type: "hotel", message: "Hotel reserved", location: "Paris, France", time: "3 min ago" },
  { id: 4, type: "delivery", message: "Package delivered", location: "Miami, FL", time: "5 min ago" },
  { id: 5, type: "ride", message: "Driver matched", location: "Chicago, IL", time: "6 min ago" },
  { id: 6, type: "flight", message: "Check-in complete", location: "LAX Terminal 4", time: "8 min ago" },
  { id: 7, type: "hotel", message: "5-star review left", location: "Tokyo, Japan", time: "10 min ago" },
  { id: 8, type: "delivery", message: "Express pickup", location: "Seattle, WA", time: "12 min ago" },
];

const typeConfig = {
  ride: { icon: Car, color: "text-primary", bg: "bg-primary/20" },
  flight: { icon: Plane, color: "text-sky-400", bg: "bg-sky-500/20" },
  hotel: { icon: Hotel, color: "text-amber-400", bg: "bg-amber-500/20" },
  delivery: { icon: Package, color: "text-violet-400", bg: "bg-violet-500/20" },
};

const LiveActivityFeed = () => {
  const [visibleActivities, setVisibleActivities] = useState<Activity[]>(activities.slice(0, 4));
  const [currentIndex, setCurrentIndex] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleActivities((prev) => {
        const newActivity = activities[currentIndex % activities.length];
        return [{ ...newActivity, id: Date.now() }, ...prev.slice(0, 3)];
      });
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-primary">Live Activity</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Happening Right Now</h2>
          <p className="text-muted-foreground">Join thousands of users on ZIVO</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {visibleActivities.map((activity, index) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                  "transition-all duration-500",
                  index === 0 && "animate-in slide-in-from-top-4 fade-in"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.bg)}>
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{activity.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{activity.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LiveActivityFeed;
