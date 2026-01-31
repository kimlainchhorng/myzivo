import { useState } from "react";
import { 
  Car, 
  Compass, 
  ArrowRight, 
  MapPin, 
  Calendar,
  Star,
  Clock,
  Ticket,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AFFILIATE_LINKS, AFFILIATE_DISCLOSURE_TEXT, openAffiliateLink } from "@/config/affiliateLinks";

interface CarToActivityBridgeProps {
  destination?: string;
  rentalDates?: { start: Date; end: Date };
  className?: string;
}

const suggestedActivities = [
  { id: "1", name: "City Tour", type: "Sightseeing", price: 45, duration: "3h", rating: 4.9, image: "🏛️" },
  { id: "2", name: "Wine Tasting", type: "Food & Drink", price: 85, duration: "4h", rating: 4.8, image: "🍷" },
  { id: "3", name: "Adventure Park", type: "Outdoor", price: 65, duration: "5h", rating: 4.7, image: "🎢" },
];

const CarToActivityBridge = ({ 
  destination = "Paris",
  rentalDates,
  className 
}: CarToActivityBridgeProps) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const handleBookActivity = () => {
    openAffiliateLink("activities");
  };

  return (
    <Card className={cn(
      "overflow-hidden border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-card to-pink-500/5",
      className
    )}>
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <Car className="w-5 h-5 text-emerald-500" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Compass className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Explore {destination}</h3>
            <p className="text-sm text-muted-foreground">
              Book activities & experiences
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Ticket className="w-3 h-3 mr-1" />
            Skip Lines
          </Badge>
        </div>

        {/* Context */}
        <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{destination} area</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Available dates</span>
          </div>
        </div>

        {/* Activities */}
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-muted-foreground">Popular experiences:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {suggestedActivities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => setSelectedActivity(activity.id)}
                className={cn(
                  "flex flex-col gap-2 p-3 rounded-xl border-2 transition-all text-left",
                  selectedActivity === activity.id
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-border hover:border-purple-500/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activity.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{activity.name}</p>
                    <p className="text-xs text-muted-foreground">{activity.type}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs">{activity.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {activity.duration}
                  </div>
                </div>
                <p className="font-bold text-sm">${activity.price}<span className="text-xs font-normal">/person</span></p>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Skip for now
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 gap-2"
            onClick={handleBookActivity}
          >
            Browse Activities
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Affiliate Notice */}
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          {AFFILIATE_DISCLOSURE_TEXT.short}
        </p>
      </CardContent>
    </Card>
  );
};

export default CarToActivityBridge;
