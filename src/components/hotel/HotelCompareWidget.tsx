import { useState } from "react";
import { Scale, X, Plus, ArrowRight, Star, MapPin, Wifi, Coffee, Car, Building2, Umbrella, Mountain, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompareHotel {
  id: string;
  name: string;
  hotelIcon: LucideIcon;
  iconGradient: string;
  iconColor: string;
  rating: number;
  price: number;
  location: string;
  amenities: string[];
}

const HotelCompareWidget = () => {
  // TODO: Populate from user's selected hotels
  const [compareList, setCompareList] = useState<CompareHotel[]>([]);

  const addToCompare = (hotel: CompareHotel) => {
    if (compareList.length < 3 && !compareList.find(h => h.id === hotel.id)) {
      setCompareList([...compareList, hotel]);
    }
  };

  const removeFromCompare = (id: string) => {
    setCompareList(compareList.filter(h => h.id !== id));
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <Scale className="w-3 h-3 mr-1" /> Smart Compare
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Compare Hotels Side by Side
          </h2>
          <p className="text-muted-foreground">
            Make the best choice with our comparison tool
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {compareList.map((hotel, index) => (
            <div key={hotel.id} className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
              <button
                onClick={() => removeFromCompare(hotel.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all duration-200 active:scale-[0.90] touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center", hotel.iconGradient)}>
                <hotel.hotelIcon className={cn("w-8 h-8", hotel.iconColor)} />
              </div>
              <h3 className="font-bold text-lg text-center mb-2">{hotel.name}</h3>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{hotel.rating}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{hotel.location}</span>
                </div>
              </div>

              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-primary">${hotel.price}</span>
                <span className="text-muted-foreground">/night</span>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {hotel.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>

              <Button className="w-full" variant={index === 0 ? "default" : "outline"}>
                {index === 0 ? "Best Value" : "Select"}
              </Button>
            </div>
          ))}

          {compareList.length < 3 && compareList.length > 0 && (
            <button
              onClick={() => {}}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/50 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <p className="font-semibold">Add Hotel to Compare</p>
              <p className="text-sm text-muted-foreground">Up to 3 hotels</p>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HotelCompareWidget;
