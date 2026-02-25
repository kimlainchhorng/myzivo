import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plane, 
  Hotel, 
  Car, 
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Clock,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActiveBooking {
  id: string;
  type: "flight" | "hotel" | "car";
  title: string;
  subtitle: string;
  status: "in-progress" | "pending" | "confirmed";
  href: string;
}

interface ActiveBookingsBarProps {
  className?: string;
}

// Active bookings loaded from real user session/localStorage
function getActiveBookings(): ActiveBooking[] {
  try {
    const raw = localStorage.getItem("zivo_active_bookings");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

const typeConfig = {
  flight: { icon: Plane, color: "text-sky-500", bg: "bg-sky-500/10" },
  hotel: { icon: Hotel, color: "text-amber-500", bg: "bg-amber-500/10" },
  car: { icon: Car, color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

const statusConfig = {
  "in-progress": { label: "In Progress", color: "bg-primary/10 text-primary" },
  pending: { label: "Pending", color: "bg-muted text-muted-foreground" },
  confirmed: { label: "Confirmed", color: "bg-emerald-500/10 text-emerald-500" },
};

const ActiveBookingsBar = ({ className }: ActiveBookingsBarProps) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const activeBookings = getActiveBookings();

  const inProgressBooking = activeBookings.find(b => b.status === "in-progress");
  const otherBookings = activeBookings.filter(b => b.status !== "in-progress");

  if (activeBookings.length === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t shadow-lg",
      className
    )}>
      {/* Main Bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Current Booking */}
          {inProgressBooking && (
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl",
                typeConfig[inProgressBooking.type].bg
              )}>
                {(() => {
                  const Icon = typeConfig[inProgressBooking.type].icon;
                  return <Icon className={cn("w-5 h-5", typeConfig[inProgressBooking.type].color)} />;
                })()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{inProgressBooking.title}</span>
                  <Badge className={statusConfig[inProgressBooking.status].color} variant="secondary">
                    {statusConfig[inProgressBooking.status].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{inProgressBooking.subtitle}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {otherBookings.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                {otherBookings.length} more
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronUp className="w-4 h-4 ml-1" />
                )}
              </Button>
            )}
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-teal-500"
              onClick={() => inProgressBooking && navigate(inProgressBooking.href)}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && otherBookings.length > 0 && (
          <div className="pb-3 space-y-2 border-t pt-3">
            {otherBookings.map((booking) => {
              const config = typeConfig[booking.type];
              const Icon = config.icon;
              
              return (
                <button
                  key={booking.id}
                  onClick={() => navigate(booking.href)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] touch-manipulation"
                >
                  <div className={cn("p-1.5 rounded-xl", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-sm">{booking.title}</span>
                  </div>
                  <Badge className={statusConfig[booking.status].color} variant="secondary">
                    {statusConfig[booking.status].label}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveBookingsBar;
