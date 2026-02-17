import { Star, ArrowRight, MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const featuredDestinations = [
  { id: 1, name: "Miami Beach", image: "🏖️", description: "Beachfront stays", rating: 4.8 },
  { id: 2, name: "Maui", image: "🌴", description: "Island getaways", rating: 4.9 },
  { id: 3, name: "New York City", image: "🗽", description: "City center hotels", rating: 4.7 },
  { id: 4, name: "Las Vegas", image: "🎰", description: "Resort & casino stays", rating: 4.6 },
];

const HotelLastMinuteDeals = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
              <Building2 className="w-3 h-3 mr-1" /> Featured
            </Badge>
            <h2 className="text-2xl md:text-3xl font-display font-bold">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground">
              Top-rated stays in trending locations
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            Explore All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.id}
              className="group relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all"
            >
              <div className="p-6">
                <div className="text-5xl text-center mb-3">{dest.image}</div>
                <h3 className="font-bold text-center mb-1">{dest.name}</h3>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-3">
                  <MapPin className="w-3 h-3" />
                  {dest.description}
                </div>

                <div className="flex items-center justify-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{dest.rating} avg rating</span>
                </div>

                <Button className="w-full" size="sm">
                  Search Hotels
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelLastMinuteDeals;
