import { MapPin, Utensils, ShoppingBag, Landmark, TreePine, Train, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const nearbyPlaces = [
  { name: "Central Park", type: "Attraction", distance: "0.3 mi", time: "5 min walk", icon: TreePine, color: "text-green-400" },
  { name: "Times Square", type: "Entertainment", distance: "0.8 mi", time: "15 min walk", icon: Landmark, color: "text-yellow-400" },
  { name: "Grand Central", type: "Transport", distance: "0.5 mi", time: "10 min walk", icon: Train, color: "text-blue-400" },
  { name: "5th Avenue", type: "Shopping", distance: "0.2 mi", time: "3 min walk", icon: ShoppingBag, color: "text-pink-400" },
  { name: "The Plaza Food Hall", type: "Dining", distance: "0.1 mi", time: "2 min walk", icon: Utensils, color: "text-orange-400" },
  { name: "MoMA", type: "Culture", distance: "0.4 mi", time: "8 min walk", icon: Landmark, color: "text-purple-400" },
];

const HotelNeighborhood = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <MapPin className="w-3 h-3 mr-1" /> Neighborhood
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Explore the Area
          </h2>
          <p className="text-muted-foreground">Discover what's nearby your hotel</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Map Placeholder */}
          <div className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6 min-h-[300px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-sky-500/5" />
            <div className="text-center z-10">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Interactive Map</h3>
              <p className="text-sm text-muted-foreground">Midtown Manhattan, NYC</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge variant="outline">Walk Score: 98</Badge>
                <Badge variant="outline">Transit Score: 100</Badge>
              </div>
            </div>
          </div>

          {/* Nearby Places */}
          <div className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6">
            <h3 className="font-bold mb-4">What's Nearby</h3>
            <div className="space-y-3">
              {nearbyPlaces.map((place, index) => {
                const Icon = place.icon;
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center ${place.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{place.name}</p>
                        <p className="text-xs text-muted-foreground">{place.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{place.distance}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {place.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelNeighborhood;
