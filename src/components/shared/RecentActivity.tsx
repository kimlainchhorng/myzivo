import { useEffect, useState } from "react";
import { CheckCircle, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  { user: "Sarah M.", action: "booked a flight", location: "NYC → Paris", time: "Just now" },
  { user: "James L.", action: "reserved a hotel", location: "Dubai Marina", time: "2 min ago" },
  { user: "Emily C.", action: "rented a car", location: "Los Angeles", time: "3 min ago" },
  { user: "Michael R.", action: "completed a ride", location: "San Francisco", time: "5 min ago" },
  { user: "Anna K.", action: "ordered food", location: "Manhattan", time: "6 min ago" },
];

const RecentActivity = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const activity = activities[currentIndex];

  return (
    <div className="fixed bottom-24 left-4 z-40 max-w-xs hidden md:block">
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-2xl bg-card/90 border border-border/50 backdrop-blur-xl shadow-lg",
          "transition-all duration-300",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            <span className="text-primary">{activity.user}</span> {activity.action}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{activity.location}</span>
            <span>•</span>
            <Clock className="w-3 h-3" />
            <span>{activity.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
