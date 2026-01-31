import { Shield, DollarSign, Globe, Lock, CheckCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WHY ZIVO - Trust & Transparency Section
 * Official launch content matching brand guidelines
 */

const valueProps = [
  {
    icon: Search,
    title: "Compare Prices from Trusted Partners",
    description: "Search across 500+ airlines, hotels, and car rental companies worldwide.",
  },
  {
    icon: DollarSign,
    title: "No Booking Fees on ZIVO",
    description: "We don't charge any fees. Book directly with our trusted travel partners.",
  },
  {
    icon: Lock,
    title: "Secure Booking on Partner Sites",
    description: "Complete your reservation safely on verified partner websites.",
  },
  {
    icon: Globe,
    title: "Worldwide Coverage",
    description: "Find travel options for any destination around the globe.",
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
            Why Use{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              ZIVO
            </span>
            ?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            The smarter way to search and compare travel deals
          </p>
        </div>

        {/* Value Props Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {valueProps.map((prop, index) => (
            <div
              key={prop.title}
              className={cn(
                "group p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50",
                "hover:border-primary/30 hover:shadow-xl hover:-translate-y-1",
                "transition-all duration-300 text-center",
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
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/80 backdrop-blur-sm border border-border/50">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Trusted by travelers in <span className="text-foreground font-bold">150+ countries</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
