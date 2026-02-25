import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Snowflake, Sun, Leaf, Flower2, Percent, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const seasonalOffers = [
  {
    season: "Winter",
    icon: Snowflake,
    title: "Winter Escape Deals",
    discount: "25% OFF",
    description: "SUVs & 4WDs perfect for mountain getaways",
    validUntil: "Mar 31",
    gradient: "from-sky-500 to-blue-600",
    vehicles: ["Jeep Wrangler", "Ford Explorer", "Subaru Outback"],
  },
  {
    season: "Spring",
    icon: Flower2,
    title: "Spring Break Specials",
    discount: "20% OFF",
    description: "Convertibles & sports cars for scenic drives",
    validUntil: "May 31",
    gradient: "from-pink-500 to-rose-600",
    vehicles: ["Ford Mustang", "Mazda MX-5", "BMW Z4"],
  },
  {
    season: "Summer",
    icon: Sun,
    title: "Summer Road Trip",
    discount: "30% OFF",
    description: "Minivans & spacious SUVs for family adventures",
    validUntil: "Aug 31",
    gradient: "from-amber-500 to-orange-600",
    vehicles: ["Honda Odyssey", "Toyota Sienna", "Chevrolet Traverse"],
  },
  {
    season: "Fall",
    icon: Leaf,
    title: "Autumn Adventures",
    discount: "15% OFF",
    description: "Luxury sedans for foliage touring",
    validUntil: "Nov 30",
    gradient: "from-orange-500 to-red-600",
    vehicles: ["Mercedes C-Class", "BMW 5 Series", "Audi A6"],
  },
];

const CarSeasonalOffers = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <Calendar className="w-3 h-3 mr-1" /> Seasonal Savings
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Limited Time Offers
          </h2>
          <p className="text-muted-foreground">Special seasonal rates on popular vehicles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {seasonalOffers.map((offer, index) => {
            const Icon = offer.icon;
            return (
              <Link key={offer.season} to={`/rent-car?season=${offer.season.toLowerCase()}`}>
                <div
                  className={cn(
                    "group relative overflow-hidden p-6 rounded-2xl h-full",
                    "border border-border/50 bg-card/50 backdrop-blur-sm",
                    "hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 cursor-pointer",
                    "animate-in fade-in slide-in-from-bottom-4"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Discount Badge */}
                  <Badge className={cn(
                    "absolute top-4 right-4 text-white border-0 font-bold",
                    "bg-gradient-to-r",
                    offer.gradient
                  )}>
                    <Percent className="w-3 h-3 mr-1" />
                    {offer.discount}
                  </Badge>

                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl mb-4 flex items-center justify-center text-white",
                    "bg-gradient-to-br",
                    offer.gradient
                  )}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {offer.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {offer.description}
                  </p>

                  {/* Featured Vehicles */}
                  <div className="space-y-1 mb-4">
                    {offer.vehicles.map((vehicle) => (
                      <div key={vehicle} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {vehicle}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      Valid until {offer.validUntil}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CarSeasonalOffers;
