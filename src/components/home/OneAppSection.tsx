import { Plane, Hotel, CarFront, Car, UtensilsCrossed, Package } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ONE APP. MANY SERVICES.
 * Value proposition section highlighting ZIVO's unified platform
 */

const services = [
  {
    icon: Plane,
    secondaryIcons: [Hotel, CarFront],
    text: "Book flights, hotels, and rental cars worldwide",
    gradient: "from-sky-500/20 to-amber-500/10",
    iconColor: "text-sky-400",
  },
  {
    icon: Car,
    secondaryIcons: [UtensilsCrossed],
    text: "Get rides, food delivery, and local transport",
    gradient: "from-primary/20 to-eats/10",
    iconColor: "text-primary",
  },
  {
    icon: Package,
    secondaryIcons: [],
    text: "Move packages with trusted drivers",
    gradient: "from-violet-500/20 to-primary/10",
    iconColor: "text-violet-400",
  },
];

interface OneAppSectionProps {
  compact?: boolean;
}

export default function OneAppSection({ compact = false }: OneAppSectionProps) {
  if (compact) {
    return (
      <section className="px-4 py-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-violet-500/5 border border-border/50">
          <h3 className="font-display font-bold text-base mb-3 text-center">
            One app.{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              Many services.
            </span>
          </h3>
          
          <div className="space-y-2">
            {services.map((service, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 text-xs text-muted-foreground"
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                  "bg-gradient-to-br",
                  service.gradient
                )}>
                  <service.icon className={cn("w-3.5 h-3.5", service.iconColor)} />
                </div>
                <span>{service.text}</span>
              </div>
            ))}
          </div>
          
          <p className="text-[10px] text-muted-foreground/70 text-center mt-3 leading-relaxed">
            ZIVO connects you to the best travel partners and local service providers.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-gradient-radial from-primary/8 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-radial from-violet-500/8 to-transparent rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Headline */}
        <div className="text-center mb-10 sm:mb-14 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            One app.{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Many services.
            </span>
          </h2>
        </div>

        {/* Service bullets */}
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
          {services.map((service, index) => (
            <div
              key={index}
              className={cn(
                "group flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl",
                "bg-card/60 backdrop-blur-sm border border-border/50",
                "hover:border-primary/30 hover:bg-card/80",
                "transition-all duration-300",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100 + 100}ms`, animationFillMode: 'both' }}
            >
              {/* Icon container */}
              <div className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                "bg-gradient-to-br border border-white/10",
                "group-hover:scale-110 transition-transform duration-300",
                service.gradient
              )}>
                <service.icon className={cn("w-6 h-6 sm:w-7 sm:h-7", service.iconColor)} />
              </div>

              {/* Text */}
              <p className="text-base sm:text-lg font-medium text-foreground/90">
                {service.text}
              </p>

              {/* Secondary icons (decorative) */}
              <div className="hidden sm:flex items-center gap-2 ml-auto opacity-40 group-hover:opacity-60 transition-opacity">
                {service.secondaryIcons.map((SecIcon, i) => (
                  <SecIcon key={i} className="w-4 h-4 text-muted-foreground" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p
          className="text-center text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mt-10 sm:mt-12 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: '400ms', animationFillMode: 'both' }}
        >
          ZIVO connects you to the best travel partners and local service providers — all in one place.
        </p>
      </div>
    </section>
  );
}
