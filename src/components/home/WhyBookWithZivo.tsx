/**
 * Why Book with ZIVO
 * Premium value proposition with glassmorphism cards and gradient icons
 */

import { Search, ShieldCheck, BadgeCheck, Globe, Award } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const valueProps = [
  {
    icon: Search,
    title: "Compare Multiple Providers",
    description: "Search across hundreds of airlines, hotels, and rental partners to compare prices per trip.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Pricing",
    description: "See prices from multiple providers upfront. No hidden fees from ZIVO — what you see is what partners charge.",
    gradient: "from-primary to-teal-500",
  },
  {
    icon: BadgeCheck,
    title: "Price Alerts",
    description: "Track routes you care about and get notified when prices change. Never miss a price drop.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Globe,
    title: "Flexible Search",
    description: "Flexible dates and nearby airport suggestions help you find the best options available.",
    gradient: "from-violet-500 to-purple-600",
  },
];

interface WhyBookWithZivoProps {
  className?: string;
  variant?: "default" | "compact";
}

export function WhyBookWithZivo({ className, variant = "default" }: WhyBookWithZivoProps) {
  const isCompact = variant === "compact";

  return (
    <section className={cn(
      "relative overflow-hidden",
      isCompact ? "py-8" : "py-20 sm:py-28",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.04)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn("text-center", isCompact ? "mb-6" : "mb-12 sm:mb-14")}
        >
          {!isCompact && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-5 shimmer-chip">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Why Choose ZIVO</span>
            </div>
          )}
          <h2 className={cn(
            "font-bold tracking-tight",
            isCompact ? "text-xl" : "text-3xl sm:text-4xl lg:text-5xl"
          )}>
            Why Compare with{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              ZIVO
            </span>
            ?
          </h2>
          {!isCompact && (
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mt-3">
              Your trusted travel comparison platform
            </p>
          )}
        </motion.div>

        <div className={cn(
          "grid gap-5",
          isCompact ? "grid-cols-1 sm:grid-cols-4 max-w-4xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto sm:gap-6"
        )}>
          {valueProps.map((prop, index) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "group text-center",
                isCompact ? "p-4" : "p-6 sm:p-8",
                "rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50",
                "glow-border-hover hover:-translate-y-2",
                "transition-all duration-300",
              )}
            >
              <div className={cn(
                "mx-auto rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br shadow-lg",
                prop.gradient,
                "group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
                "float-gentle",
                isCompact ? "w-12 h-12 mb-3" : "w-16 h-16 mb-6"
              )}
              style={{ animationDelay: `${index * 200}ms` }}
              >
                <prop.icon className={cn(
                  isCompact ? "w-6 h-6" : "w-8 h-8",
                  "text-white"
                )} />
              </div>

              <h3 className={cn(
                "font-bold mb-2.5",
                isCompact ? "text-base" : "text-lg sm:text-xl"
              )}>
                {prop.title}
              </h3>
              <p className={cn(
                "text-muted-foreground leading-relaxed",
                isCompact ? "text-xs" : "text-sm sm:text-base"
              )}>
                {prop.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={cn(
            "text-center text-muted-foreground/70 max-w-lg mx-auto",
            isCompact ? "text-[10px] mt-4" : "text-xs mt-10"
          )}
        >
          ZIVO does not issue tickets or process payments. All bookings are completed on partner sites.
        </motion.p>
      </div>
    </section>
  );
}

export default WhyBookWithZivo;
