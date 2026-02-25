import { useState } from "react";
import { Scale, Check, X, Star, MapPin, Wifi, Coffee, Waves, Dumbbell, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const sampleHotels = [
  {
    id: 1,
    name: "The Grand Plaza",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
    rating: 4.8,
    price: 289,
    location: "Downtown",
    amenities: ["wifi", "pool", "gym", "spa", "restaurant"],
  },
  {
    id: 2,
    name: "Ocean View Resort",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400",
    rating: 4.6,
    price: 245,
    location: "Beachfront",
    amenities: ["wifi", "pool", "gym", "restaurant"],
  },
  {
    id: 3,
    name: "City Boutique Hotel",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
    rating: 4.4,
    price: 179,
    location: "City Center",
    amenities: ["wifi", "restaurant", "gym"],
  },
];

const allAmenities = [
  { key: "wifi", icon: Wifi, label: "Free WiFi" },
  { key: "pool", icon: Waves, label: "Pool" },
  { key: "gym", icon: Dumbbell, label: "Fitness Center" },
  { key: "spa", icon: Coffee, label: "Spa & Wellness" },
  { key: "restaurant", icon: Coffee, label: "Restaurant" },
];

const HotelComparisonTool = () => {
  const [selectedHotels, setSelectedHotels] = useState(sampleHotels.slice(0, 2));

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-indigo-500/20 text-indigo-400 border-indigo-500/20">
            <Scale className="w-3 h-3 mr-1" /> Compare Hotels
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Find Your Perfect Stay
          </h2>
          <p className="text-muted-foreground">
            Compare hotels side by side to make the best choice
          </p>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="inline-flex gap-4 min-w-full">
            {selectedHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="w-[280px] flex-shrink-0 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden"
              >
                <div className="relative h-40 overflow-hidden group/img">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <Badge className="absolute top-3 right-3 bg-black/60 text-white border-0">
                    <Star className="w-3 h-3 mr-1 text-yellow-400" />
                    {hotel.rating}
                  </Badge>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-3 h-3" />
                    {hotel.location}
                  </div>

                  <div className="space-y-3 mb-4">
                    {allAmenities.map((amenity) => {
                      const hasAmenity = hotel.amenities.includes(amenity.key);
                      return (
                        <div key={amenity.key} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <amenity.icon className="w-4 h-4 text-muted-foreground" />
                            <span>{amenity.label}</span>
                          </div>
                          {hasAmenity ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <X className="w-4 h-4 text-red-400/50" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-2xl font-bold">${hotel.price}</span>
                      <span className="text-sm text-muted-foreground">/night</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
                      Select Hotel
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {selectedHotels.length < 3 && (
              <div className="w-[280px] flex-shrink-0 bg-card/30 backdrop-blur-xl border-2 border-dashed border-border/50 rounded-2xl flex items-center justify-center min-h-[500px]">
                <Button variant="ghost" className="flex-col gap-2 h-auto py-8">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-muted-foreground">Add Hotel</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Tip: Add up to 3 hotels to compare their features and prices
          </p>
        </div>
      </div>
    </section>
  );
};

export default HotelComparisonTool;
