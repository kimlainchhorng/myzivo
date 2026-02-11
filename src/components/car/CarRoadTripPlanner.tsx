import { useNavigate } from "react-router-dom";
import { Map, Clock, Fuel, Camera, Star, ArrowRight, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const roadTrips = [
  {
    id: 1,
    name: "Pacific Coast Highway",
    route: "San Francisco → Los Angeles",
    distance: "380 miles",
    duration: "2-3 days",
    highlights: ["Big Sur", "Carmel", "Santa Barbara"],
    rating: 4.9,
    difficulty: "Easy",
  },
  {
    id: 2,
    name: "Route 66 Classic",
    route: "Chicago → Los Angeles",
    distance: "2,400 miles",
    duration: "7-10 days",
    highlights: ["Grand Canyon", "Santa Fe", "Mojave Desert"],
    rating: 4.8,
    difficulty: "Moderate",
  },
  {
    id: 3,
    name: "Florida Keys Adventure",
    route: "Miami → Key West",
    distance: "160 miles",
    duration: "1-2 days",
    highlights: ["Seven Mile Bridge", "Islamorada", "Key Largo"],
    rating: 4.7,
    difficulty: "Easy",
  },
  {
    id: 4,
    name: "Blue Ridge Parkway",
    route: "Virginia → North Carolina",
    distance: "469 miles",
    duration: "3-5 days",
    highlights: ["Shenandoah", "Asheville", "Great Smokies"],
    rating: 4.8,
    difficulty: "Moderate",
  },
];

const CarRoadTripPlanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Route className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Road Trips</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Epic Road Trip Ideas
          </h2>
          <p className="text-muted-foreground">Curated routes for your next adventure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {roadTrips.map((trip, index) => (
            <div
              key={trip.id}
              className={cn(
                "group relative p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                "transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center">
                  <Route className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">
                      {trip.name}
                    </h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10">
                      <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">{trip.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{trip.route}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Map className="w-4 h-4" />
                  <span>{trip.distance}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{trip.duration}</span>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  trip.difficulty === "Easy" 
                    ? "bg-green-500/10 text-green-400" 
                    : "bg-amber-500/10 text-amber-400"
                )}>
                  {trip.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {trip.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="px-2 py-1 text-xs rounded-lg bg-muted/50 text-muted-foreground"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => navigate("/rent-car")}
                variant="outline" 
                className="w-full rounded-xl group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500"
              >
                Plan This Trip
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarRoadTripPlanner;
