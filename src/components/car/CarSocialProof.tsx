import { TrendingUp, Car, Shield, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Rental partners", value: "50+", icon: Car },
  { label: "Pickup locations", value: "30,000+", icon: MapPin },
  { label: "Price match guarantee", value: "100%", icon: Shield },
];

const CarSocialProof = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-emerald-500/5 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <TrendingUp className="w-3 h-3 mr-1" /> Why ZIVO
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Rent Smarter, Save More
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Compare car rental prices from top providers in one search.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl">
              <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-emerald-400">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarSocialProof;
