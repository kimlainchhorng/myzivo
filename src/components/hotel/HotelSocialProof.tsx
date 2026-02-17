import { Users, TrendingUp, Shield, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Hotels listed", value: "500,000+", icon: Users },
  { label: "Destinations", value: "190+", icon: TrendingUp },
  { label: "Partner-verified reviews", value: "Millions", icon: Star },
];

const HotelSocialProof = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <Shield className="w-3 h-3 mr-1" /> Trusted by Travelers
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Your Next Stay Starts Here
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Compare prices from top hotel booking partners in one search.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl">
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-primary">
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

export default HotelSocialProof;
