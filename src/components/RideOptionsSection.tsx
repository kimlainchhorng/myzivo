import { Button } from "@/components/ui/button";
import { Car, Users, Sparkles, Briefcase, ChevronRight } from "lucide-react";

const rideOptions = [
  {
    id: "economy",
    name: "ZIVO X",
    description: "Affordable rides for everyday trips",
    icon: Car,
    price: "From $8",
    eta: "3-5 min",
    capacity: "1-4",
  },
  {
    id: "comfort",
    name: "ZIVO Comfort",
    description: "Extra legroom and top-rated drivers",
    icon: Sparkles,
    price: "From $12",
    eta: "4-6 min",
    capacity: "1-4",
  },
  {
    id: "xl",
    name: "ZIVO XL",
    description: "Spacious SUVs for groups",
    icon: Users,
    price: "From $18",
    eta: "5-8 min",
    capacity: "1-6",
  },
  {
    id: "black",
    name: "ZIVO Black",
    description: "Premium rides with professional drivers",
    icon: Briefcase,
    price: "From $25",
    eta: "6-10 min",
    capacity: "1-4",
  },
];

const RideOptionsSection = () => {
  return (
    <section id="rides" className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-rides text-primary-foreground text-sm font-medium mb-6">
              <Car className="w-4 h-4" />
              ZIVO Rides
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              A ride for every
              <br />
              <span className="text-gradient-rides">moment</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              From quick errands to airport pickups, we've got the perfect ride option for you. All rides include 24/7 support and real-time tracking.
            </p>
            <Button variant="rides" size="lg">
              Request a ride
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right - Ride Options */}
          <div className="space-y-4">
            {rideOptions.map((option, index) => (
              <div
                key={option.id}
                className="glass-card p-4 lg:p-5 hover:border-rides/50 transition-all duration-300 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center group-hover:gradient-rides transition-all">
                    <option.icon className="w-7 h-7 text-rides group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-semibold text-lg text-foreground">{option.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                        {option.capacity} seats
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{option.price}</p>
                    <p className="text-xs text-muted-foreground">{option.eta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RideOptionsSection;
