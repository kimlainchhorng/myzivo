import { Clock, ArrowRight, X, Star, MapPin, Plane, Car, Hotel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const recentItems = [
  {
    id: 1,
    type: "hotel",
    name: "The Grand Plaza",
    location: "New York",
    price: 289,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200",
    viewedAt: "2 hours ago",
  },
  {
    id: 2,
    type: "flight",
    name: "NYC → Los Angeles",
    location: "Delta Airlines",
    price: 199,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200",
    viewedAt: "3 hours ago",
  },
  {
    id: 3,
    type: "car",
    name: "Tesla Model 3",
    location: "LAX Airport",
    price: 89,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200",
    viewedAt: "5 hours ago",
  },
  {
    id: 4,
    type: "hotel",
    name: "Ocean View Resort",
    location: "Miami Beach",
    price: 245,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200",
    viewedAt: "Yesterday",
  },
];

const typeIcons = {
  hotel: Hotel,
  flight: Plane,
  car: Car,
};

const typeColors = {
  hotel: "bg-amber-500",
  flight: "bg-sky-500",
  car: "bg-emerald-500",
};

const RecentlyViewed = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge className="mb-2 bg-muted text-muted-foreground border-border/50">
              <Clock className="w-3 h-3 mr-1" /> Recently Viewed
            </Badge>
            <h2 className="text-xl md:text-2xl font-display font-bold">
              Continue Where You Left Off
            </h2>
          </div>
          <Button variant="ghost" size="sm">
            Clear All <X className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentItems.map((item) => {
            const TypeIcon = typeIcons[item.type as keyof typeof typeIcons];
            const typeColor = typeColors[item.type as keyof typeof typeColors];

            return (
              <div
                key={item.id}
                className="group bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all"
              >
                <div className="relative h-32">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute top-2 left-2 w-8 h-8 ${typeColor} rounded-lg flex items-center justify-center`}>
                    <TypeIcon className="w-4 h-4 text-white" />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/60 text-white border-0 text-xs">
                    <Star className="w-3 h-3 mr-1 text-yellow-400" />
                    {item.rating}
                  </Badge>
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-sm mb-1 truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">${item.price}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.type === "car" ? "/day" : item.type === "hotel" ? "/night" : ""}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.viewedAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
