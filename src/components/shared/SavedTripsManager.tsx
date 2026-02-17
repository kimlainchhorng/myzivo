import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bookmark, 
  Plane, 
  Hotel, 
  Car, 
  Calendar,
  Trash2,
  ArrowRight,
  Clock,
  MapPin,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SavedTrip {
  id: string;
  destination: string;
  iconGradient: string;
  services: ("flight" | "hotel" | "car")[];
  savedAt: string;
  expiresIn: string;
  totalPrice: number;
  progress: number;
}

interface SavedTripsManagerProps {
  className?: string;
}

// Saved trips loaded from real localStorage/database
function loadSavedTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem("zivo_saved_trips");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

const serviceIcons = {
  flight: { icon: Plane, color: "text-sky-500", bg: "bg-sky-500/10" },
  hotel: { icon: Hotel, color: "text-amber-500", bg: "bg-amber-500/10" },
  car: { icon: Car, color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

const SavedTripsManager = ({ className }: SavedTripsManagerProps) => {
  const navigate = useNavigate();
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(loadSavedTrips());

  const handleDeleteTrip = (tripId: string) => {
    setSavedTrips(prev => prev.filter(t => t.id !== tripId));
  };

  const handleContinueTrip = (trip: SavedTrip) => {
    if (trip.services.includes("flight")) {
      navigate("/book-flight");
    } else if (trip.services.includes("hotel")) {
      navigate("/book-hotel");
    } else {
      navigate("/rent-car");
    }
  };

  if (savedTrips.length === 0) {
    return null;
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Bookmark className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Saved Trips</CardTitle>
              <p className="text-sm text-muted-foreground">
                Continue where you left off
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            {savedTrips.length} saved
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {savedTrips.map((trip) => (
          <div
            key={trip.id}
            className="p-3 rounded-xl border bg-card/50 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", trip.iconGradient)}>
                <MapPin className="w-5 h-5 text-foreground/70" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{trip.destination}</h4>
                  <div className="flex gap-1">
                    {trip.services.map((service) => {
                      const config = serviceIcons[service];
                      return (
                        <div key={service} className={cn("p-1 rounded", config.bg)}>
                          <config.icon className={cn("w-3 h-3", config.color)} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-teal-500 rounded-full"
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{trip.progress}%</span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Saved {trip.savedAt}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Clock className="w-3 h-3" />
                    Expires in {trip.expiresIn}
                  </span>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="text-right shrink-0">
                <p className="font-bold text-lg">${trip.totalPrice}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleContinueTrip(trip)}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Continue
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => handleContinueTrip(trip)}
            >
              Continue Booking
              <ArrowRight className="w-3 h-3 ml-2" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SavedTripsManager;
