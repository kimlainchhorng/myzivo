import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Ticket, Utensils, Camera, Mountain, Waves, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const attractions = [
  {
    name: "Central Park",
    type: "Nature",
    distance: "0.3 miles",
    rating: 4.8,
    reviews: "45K",
    icon: Mountain,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    name: "Times Square",
    type: "Landmark",
    distance: "0.5 miles",
    rating: 4.6,
    reviews: "120K",
    icon: Camera,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    name: "Broadway Shows",
    type: "Entertainment",
    distance: "0.4 miles",
    rating: 4.9,
    reviews: "32K",
    icon: Ticket,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    name: "The Met Museum",
    type: "Culture",
    distance: "0.8 miles",
    rating: 4.9,
    reviews: "67K",
    icon: Camera,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    name: "Hudson River Park",
    type: "Nature",
    distance: "1.2 miles",
    rating: 4.7,
    reviews: "18K",
    icon: Waves,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    name: "Fine Dining District",
    type: "Restaurants",
    distance: "0.2 miles",
    rating: 4.5,
    reviews: "89K",
    icon: Utensils,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

const HotelNearbyAttractions = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-amber-500/10 text-amber-500 border-amber-500/20">
            <MapPin className="w-3 h-3 mr-1" /> Location Highlights
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            What's Nearby
          </h2>
          <p className="text-muted-foreground">Explore attractions within walking distance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attractions.map((attraction, index) => {
            const Icon = attraction.icon;
            return (
              <div
                key={attraction.name}
                className={cn(
                  "group p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                  "hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    attraction.bg
                  )}>
                    <Icon className={cn("w-6 h-6", attraction.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {attraction.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className={attraction.color}>{attraction.type}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {attraction.distance}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-semibold">{attraction.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({attraction.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" className="gap-2">
            View Full Map <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HotelNearbyAttractions;
