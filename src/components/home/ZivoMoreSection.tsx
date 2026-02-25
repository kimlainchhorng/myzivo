/**
 * ZIVO More Section — Homepage component showing additional services
 * Displays ZIVO Rides (Coming Soon), ZIVO Eats (Coming Soon), and Travel Extras (Live)
 */

import { useNavigate } from "react-router-dom";
import { Car, UtensilsCrossed, Sparkles, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const zivoMoreServices = [
  {
    id: "rides",
    title: "ZIVO Rides",
    description: "Transportation discovery platform",
    icon: Car,
    href: "/zivo-rides",
    status: "coming-soon" as const,
    gradient: "from-primary/20 to-teal-400/10",
    iconGradient: "from-primary to-teal-400",
    iconColor: "text-primary",
  },
  {
    id: "eats",
    title: "ZIVO Eats",
    description: "Food discovery and delivery concept",
    icon: UtensilsCrossed,
    href: "/zivo-eats",
    status: "coming-soon" as const,
    gradient: "from-orange-500/20 to-amber-400/10",
    iconGradient: "from-orange-500 to-amber-400",
    iconColor: "text-orange-500",
  },
  {
    id: "extras",
    title: "Travel Extras",
    description: "Airport transfers, activities, eSIM & more",
    icon: Sparkles,
    href: "/extras",
    status: "live" as const,
    gradient: "from-violet-500/20 to-purple-400/10",
    iconGradient: "from-violet-500 to-purple-400",
    iconColor: "text-violet-500",
  },
];

const ZivoMoreSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            ZIVO More
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore additional services to enhance your travel experience
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {zivoMoreServices.map((service) => (
            <div
              key={service.id}
              className={cn(
                "group relative p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm",
                "hover:border-border hover:shadow-lg transition-all duration-200",
                "flex flex-col items-center text-center"
              )}
            >
              {/* Status Badge */}
              {service.status === "coming-soon" ? (
                <Badge 
                  variant="secondary" 
                  className="absolute top-4 right-4 bg-muted text-muted-foreground text-xs gap-1"
                >
                  <Clock className="w-3 h-3" />
                  Coming Soon
                </Badge>
              ) : (
                <Badge 
                  className="absolute top-4 right-4 bg-emerald-500 text-white border-0 text-xs"
                >
                  Live
                </Badge>
              )}

              {/* Icon */}
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mt-2",
                `bg-gradient-to-br ${service.gradient}`
              )}>
                <service.icon className={cn("w-8 h-8", service.iconColor)} />
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-bold mb-2">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6 flex-1">
                {service.description}
              </p>

              {/* CTA Button */}
              {service.status === "coming-soon" ? (
                <Button
                  variant="outline"
                  className="w-full gap-2 cursor-default opacity-70"
                  disabled
                >
                  <Clock className="w-4 h-4" />
                  Coming Soon
                </Button>
              ) : (
                <Button
                  onClick={() => navigate(service.href)}
                  className={cn(
                    "w-full gap-2",
                    "bg-gradient-to-r from-violet-500 to-purple-500 text-white",
                    "hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                  )}
                >
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ZivoMoreSection;
