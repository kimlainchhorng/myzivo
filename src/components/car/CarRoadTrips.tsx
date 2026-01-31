import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map, Clock, Fuel, Camera, ArrowRight, Star, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

const roadTrips = [
  {
    id: 1,
    name: "Pacific Coast Highway",
    route: "San Francisco → Los Angeles",
    distance: "380 miles",
    duration: "2-3 days",
    highlights: ["Big Sur", "Monterey", "Santa Barbara"],
    rating: 4.9,
    image: "🌊",
    scenicLevel: "Breathtaking"
  },
  {
    id: 2,
    name: "Route 66 Classic",
    route: "Chicago → Los Angeles",
    distance: "2,400 miles",
    duration: "7-10 days",
    highlights: ["Grand Canyon", "Painted Desert", "Santa Fe"],
    rating: 4.8,
    image: "🛣️",
    scenicLevel: "Iconic"
  },
  {
    id: 3,
    name: "Florida Keys Drive",
    route: "Miami → Key West",
    distance: "160 miles",
    duration: "1-2 days",
    highlights: ["Seven Mile Bridge", "Bahia Honda", "Key Largo"],
    rating: 4.7,
    image: "🏝️",
    scenicLevel: "Tropical"
  },
  {
    id: 4,
    name: "Blue Ridge Parkway",
    route: "Virginia → North Carolina",
    distance: "469 miles",
    duration: "3-4 days",
    highlights: ["Shenandoah", "Asheville", "Great Smokies"],
    rating: 4.8,
    image: "🏔️",
    scenicLevel: "Mountain Views"
  }
];

export default function CarRoadTrips() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
              <Map className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Road Trip Ideas</CardTitle>
              <p className="text-sm text-muted-foreground">Popular scenic routes</p>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
            <Navigation className="w-3 h-3 mr-1" />
            GPS Included
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {roadTrips.map((trip) => (
          <div
            key={trip.id}
            className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{trip.image}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium group-hover:text-emerald-400 transition-colors">
                    {trip.name}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium">{trip.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  {trip.route}
                </p>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {trip.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {trip.duration}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    <Camera className="w-3 h-3 mr-1" />
                    {trip.scenicLevel}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1">
                  {trip.highlights.map((highlight, i) => (
                    <span key={highlight} className="text-xs text-muted-foreground">
                      {highlight}{i < trip.highlights.length - 1 && " • "}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                <Fuel className="w-3 h-3 inline mr-1" />
                Recommended: SUV or Convertible
              </p>
              <Button size="sm" variant="ghost" className="gap-1 text-emerald-400 hover:text-emerald-300">
                View Route <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            🚗 Road Trip Package
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Get 20% off rentals over 5 days + free GPS navigation & roadside assistance
          </p>
          <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600">
            Explore Packages
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
