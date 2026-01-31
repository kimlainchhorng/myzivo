import { UtensilsCrossed, Clock, Star, Coffee, Croissant, Wine, Salad, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const diningOptions = [
  { icon: Croissant, title: "Breakfast Buffet", time: "6:30 AM - 10:30 AM", price: "$35/person", rating: 4.8 },
  { icon: Salad, title: "Lunch Menu", time: "12:00 PM - 3:00 PM", price: "À la carte", rating: 4.7 },
  { icon: Wine, title: "Fine Dining", time: "6:00 PM - 11:00 PM", price: "From $85", rating: 4.9 },
  { icon: Coffee, title: "Room Service", time: "24/7", price: "+15% service", rating: 4.6 },
];

const HotelDiningOptions = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-orange-500/20 text-orange-400 border-orange-500/20">
            <UtensilsCrossed className="w-3 h-3 mr-1" /> Dining
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Culinary Experiences
          </h2>
          <p className="text-muted-foreground">
            Savor world-class cuisine during your stay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {diningOptions.map((option) => (
            <div
              key={option.title}
              className="p-5 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl hover:border-orange-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <option.icon className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold">{option.rating}</span>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2">{option.title}</h3>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />
                {option.time}
              </div>

              <p className="text-orange-400 font-bold">{option.price}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">Special Dietary Requirements?</h3>
            <p className="text-sm text-muted-foreground">We cater to all dietary needs including vegan, gluten-free, halal & kosher</p>
          </div>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
            Contact Chef <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HotelDiningOptions;
