import { Shield, DollarSign, Globe, Lock, CheckCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WHY ZIVO - Trust & Transparency Section
 * Official launch content matching brand guidelines
 */

const valueProps = [
  {
    icon: Search,
    title: "Compare Multiple Providers",
    description: "Search across hundreds of airlines, hotels, and rental partners per trip.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "See prices from multiple providers upfront. No hidden fees from ZIVO.",
  },
  {
    icon: Lock,
    title: "Price Alerts",
    description: "Track routes you care about and get notified when prices change.",
  },
  {
    icon: Globe,
    title: "Flexible Search",
    description: "Flexible dates and nearby airport suggestions for better options.",
  },
];

export default function WhyZivo() {
  return (
    <section className="py-16 sm:py-20 bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-teal-500/10 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Why Compare with{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              ZIVO
            </span>
            ?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Your trusted travel comparison platform
          </p>
        </div>

        {/* Value Props Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {valueProps.map((prop, index) => (
            <div
              key={prop.title}
              className={cn(
                "group p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50",
                "hover:border-primary/30 hover:shadow-xl hover:-translate-y-1.5",
                "transition-all duration-200 text-center",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <prop.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-bold text-base sm:text-lg mb-2">{prop.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {prop.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Indicator */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            ZIVO does not issue tickets or process payments. All bookings are completed on partner sites.
          </p>
        </div>
      </div>
    </section>
  );
}
