import { useNavigate } from "react-router-dom";
import { 
  Plane, 
  Hotel, 
  Car, 
  MapPin, 
  Calendar,
  Users,
  ArrowRight,
  Sparkles,
  Edit,
  Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BookedItem {
  type: "flight" | "hotel" | "car";
  title: string;
  subtitle: string;
  price: number;
  date?: Date;
  confirmed: boolean;
}

interface TripSummaryCardProps {
  destination: string;
  dates: { start: Date; end: Date };
  travelers: number;
  items: BookedItem[];
  className?: string;
}

const typeIcons = {
  flight: Plane,
  hotel: Hotel,
  car: Car
};

const typeColors = {
  flight: "text-sky-500 bg-sky-500/10",
  hotel: "text-amber-500 bg-amber-500/10",
  car: "text-emerald-500 bg-emerald-500/10"
};

const TripSummaryCard = ({ 
  destination, 
  dates, 
  travelers, 
  items,
  className 
}: TripSummaryCardProps) => {
  const navigate = useNavigate();
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const confirmedCount = items.filter(i => i.confirmed).length;

  return (
    <Card className={cn("overflow-hidden border-primary/20", className)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary/10 via-teal-500/5 to-primary/10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg font-bold">{destination}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(dates.start, "MMM d")} - {format(dates.end, "MMM d")}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {travelers} traveler{travelers > 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            {confirmedCount}/{items.length} Booked
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        {/* Booked Items */}
        {items.map((item, index) => {
          const Icon = typeIcons[item.type];
          const colorClass = typeColors[item.type];
          
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border",
                item.confirmed ? "border-primary/20 bg-primary/5" : "border-border"
              )}
            >
              <div className={cn("p-2 rounded-lg", colorClass)}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{item.title}</span>
                  {item.confirmed && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
              </div>
              
              <div className="text-right shrink-0">
                <span className="font-bold text-sm">${item.price}</span>
                {!item.confirmed && (
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Add More */}
        <button
          onClick={() => navigate("/book-flight")}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Add more to your trip</span>
        </button>

        {/* Total */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Total Trip Cost</span>
              <p className="text-xs text-primary">Bundle savings applied</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">${totalPrice}</span>
            </div>
          </div>
        </div>

        <Button className="w-full bg-gradient-to-r from-primary to-teal-500">
          View Full Itinerary
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TripSummaryCard;
