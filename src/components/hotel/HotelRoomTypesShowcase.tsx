import { Bed, Users, Maximize, Wifi, Coffee, Bath, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const roomTypes = [
  {
    id: 1,
    name: "Standard Room",
    description: "Comfortable essentials for a restful stay",
    size: "25 m²",
    beds: "1 Queen",
    guests: 2,
    price: 89,
    features: ["Free WiFi", "Air Conditioning", "TV"],
    popular: false,
  },
  {
    id: 2,
    name: "Deluxe Room",
    description: "Spacious comfort with premium amenities",
    size: "35 m²",
    beds: "1 King",
    guests: 2,
    price: 149,
    features: ["City View", "Mini Bar", "Work Desk", "Rain Shower"],
    popular: true,
  },
  {
    id: 3,
    name: "Executive Suite",
    description: "Luxury living with separate lounge area",
    size: "55 m²",
    beds: "1 King",
    guests: 3,
    price: 249,
    features: ["Living Room", "Jacuzzi", "Butler Service", "Club Access"],
    popular: false,
  },
  {
    id: 4,
    name: "Family Suite",
    description: "Perfect for families with extra space",
    size: "65 m²",
    beds: "2 Queens",
    guests: 4,
    price: 299,
    features: ["Kitchenette", "Kids Amenities", "2 Bathrooms", "Balcony"],
    popular: false,
  },
];

const HotelRoomTypesShowcase = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Bed className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Room Types</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Find Your Perfect Room
          </h2>
          <p className="text-muted-foreground">From cozy standards to luxurious suites</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roomTypes.map((room, index) => (
            <div
              key={room.id}
              className={cn(
                "group relative p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                "transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {room.popular && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-white">
                  Most Popular
                </div>
              )}

              <div className="aspect-video rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mb-4">
                <Bed className="w-12 h-12 text-amber-400/50" />
              </div>

              <h3 className="font-bold text-lg mb-1">{room.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{room.description}</p>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Maximize className="w-4 h-4" />
                  <span>{room.size}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{room.guests}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {room.features.slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 text-xs rounded-lg bg-muted/50 text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
                {room.features.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-400">
                    +{room.features.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <span className="text-2xl font-bold text-amber-400">${room.price}</span>
                  <span className="text-sm text-muted-foreground">/night</span>
                </div>
                <Button size="sm" variant="outline" className="rounded-xl group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500">
                  View
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelRoomTypesShowcase;
