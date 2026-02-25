// CSS animations used instead of framer-motion for performance
import { Button } from "@/components/ui/button";
import { Car, Users, Sparkles, Briefcase, ChevronRight, Shield, Clock, Star, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const rideOptions = [
  {
    id: "economy",
    name: "ZIVO X",
    description: "Affordable rides for everyday trips",
    icon: Car,
    price: "From $8",
    eta: "3-5 min",
    capacity: "1-4",
    gradient: "from-primary to-teal-400",
    glow: "shadow-primary/30",
    popular: false,
  },
  {
    id: "comfort",
    name: "ZIVO Comfort",
    description: "Extra legroom and top-rated drivers",
    icon: Sparkles,
    price: "From $12",
    eta: "4-6 min",
    capacity: "1-4",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/30",
    popular: true,
  },
  {
    id: "xl",
    name: "ZIVO XL",
    description: "Spacious SUVs for groups",
    icon: Users,
    price: "From $18",
    eta: "5-8 min",
    capacity: "1-6",
    gradient: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/30",
    popular: false,
  },
  {
    id: "black",
    name: "ZIVO Black",
    description: "Premium rides with professional drivers",
    icon: Briefcase,
    price: "From $25",
    eta: "6-10 min",
    capacity: "1-4",
    gradient: "from-slate-700 to-slate-900",
    glow: "shadow-slate-700/30",
    popular: false,
  },
];

const features = [
  { icon: Shield, label: "Safe & Verified", description: "Background-checked drivers" },
  { icon: Clock, label: "24/7 Available", description: "Rides anytime you need" },
  { icon: Star, label: "Top Rated", description: "4.9★ average rating" },
];

const RideOptionsSection = () => {
  const navigate = useNavigate();

  return (
    <section id="rides" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/15 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-teal-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-violet-500/15 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-gradient-radial from-sky-500/10 to-transparent rounded-full blur-3xl" />
      
      {/* Static floating emojis - CSS animated */}
      <div className="absolute top-32 right-[10%] text-5xl hidden lg:block opacity-40 animate-float">
        🚙
      </div>
      <div className="absolute bottom-40 left-[6%] text-4xl hidden lg:block opacity-30 animate-float-delayed">
        ⚡
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="animate-in fade-in slide-in-from-left-6 duration-500">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-teal-400 text-white text-sm font-semibold mb-6 shadow-lg shadow-primary/30 animate-in zoom-in-95 duration-200"
              style={{ animationDelay: '100ms', animationFillMode: 'both' }}
            >
              <Car className="w-4 h-4" />
              ZIVO Rides
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              A ride for every
              <br />
              <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                moment
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              From quick errands to airport pickups, we've got the perfect ride option for you. All rides include 24/7 support and real-time tracking.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {features.map((feature, index) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-lg animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              size="lg" 
              onClick={() => navigate("/ride")}
              className="h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-xl shadow-primary/30 gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-5 h-5" />
              Request a ride
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right - Ride Options */}
          <div className="space-y-4">
            {rideOptions.map((option, index) => (
              <div
                key={option.id}
                onClick={() => navigate("/ride")}
                className="relative p-5 lg:p-6 rounded-2xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group overflow-hidden hover:translate-x-2 hover:scale-[1.01] active:scale-[0.99] animate-in fade-in slide-in-from-right-4"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                {/* Corner glow on hover */}
                <div className={cn(
                  "absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
                  option.gradient
                )} />

                {/* Popular badge */}
                {option.popular && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full shadow-lg">
                      Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 relative">
                  <div 
                    className={cn(
                      "w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3",
                      option.gradient,
                      option.glow
                    )}
                  >
                    <option.icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-lg lg:text-xl text-foreground group-hover:text-primary transition-colors">
                        {option.name}
                      </h3>
                      <span className="text-xs px-2.5 py-1 bg-muted/50 rounded-full text-muted-foreground font-medium">
                        {option.capacity} seats
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg lg:text-xl text-foreground">{option.price}</p>
                    <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{option.eta}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
