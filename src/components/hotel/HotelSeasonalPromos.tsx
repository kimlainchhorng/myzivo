import { Snowflake, Sun, Leaf, Flower2, Gift, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const seasons = [
  {
    id: "winter",
    name: "Winter Wonderland",
    icon: Snowflake,
    color: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
    discount: "30%",
    description: "Cozy mountain retreats & ski resorts",
    destinations: ["Aspen", "Vail", "Park City"],
  },
  {
    id: "spring",
    name: "Spring Bloom",
    icon: Flower2,
    color: "from-pink-400 to-rose-500",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-400",
    discount: "25%",
    description: "Cherry blossoms & garden escapes",
    destinations: ["Kyoto", "Amsterdam", "Washington DC"],
  },
  {
    id: "summer",
    name: "Summer Splash",
    icon: Sun,
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    discount: "35%",
    description: "Beach resorts & tropical getaways",
    destinations: ["Maldives", "Bali", "Cancun"],
  },
  {
    id: "fall",
    name: "Autumn Adventure",
    icon: Leaf,
    color: "from-orange-400 to-red-500",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-400",
    discount: "20%",
    description: "Foliage tours & wine country",
    destinations: ["Vermont", "Tuscany", "Bavaria"],
  },
];

const HotelSeasonalPromos = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary border-primary/20">
            <Gift className="w-3 h-3 mr-1" /> Limited Time
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Seasonal Specials
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover curated experiences for every season with exclusive savings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {seasons.map((season) => (
            <div
              key={season.id}
              className="group relative overflow-hidden bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${season.color} opacity-10 blur-3xl`} />
              
              <div className={`w-14 h-14 rounded-xl ${season.bgColor} flex items-center justify-center mb-4`}>
                <season.icon className={`w-7 h-7 ${season.textColor}`} />
              </div>

              <h3 className="font-bold text-lg mb-2">{season.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{season.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <Badge className={`${season.bgColor} ${season.textColor} border-0`}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Up to {season.discount} off
                </Badge>
              </div>

              <div className="space-y-1 mb-4">
                <p className="text-xs text-muted-foreground">Top destinations:</p>
                <div className="flex flex-wrap gap-1">
                  {season.destinations.map((dest) => (
                    <span key={dest} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                      {dest}
                    </span>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" size="sm">
                Explore <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelSeasonalPromos;
