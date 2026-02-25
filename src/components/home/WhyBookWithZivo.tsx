/**
 * Why Choose ZIVO - Numbered feature cards with CTA
 */
import { Search, ShieldCheck, BadgeCheck, Globe, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const valueProps = [
  { icon: Search, title: "Compare Multiple Providers", description: "Search across hundreds of airlines, hotels, and rental partners to compare prices per trip.", iconBg: "bg-[hsl(var(--flights-light))]", iconColor: "text-[hsl(var(--flights))]" },
  { icon: ShieldCheck, title: "Transparent Pricing", description: "See prices from multiple providers upfront. No hidden fees from ZIVO — what you see is what partners charge.", iconBg: "bg-primary/10", iconColor: "text-primary" },
  { icon: BadgeCheck, title: "Price Alerts", description: "Track routes you care about and get notified when prices change. Never miss a price drop.", iconBg: "bg-[hsl(var(--hotels-light))]", iconColor: "text-[hsl(var(--hotels))]" },
  { icon: Globe, title: "Flexible Search", description: "Flexible dates and nearby airport suggestions help you find the best options available.", iconBg: "bg-[hsl(var(--cars-light))]", iconColor: "text-[hsl(var(--cars))]" },
];

interface WhyBookWithZivoProps {
  className?: string;
  variant?: "default" | "compact";
}

export function WhyBookWithZivo({ className, variant = "default" }: WhyBookWithZivoProps) {
  const isCompact = variant === "compact";

  return (
    <section className={cn("relative", isCompact ? "py-8" : "section-padding", className)}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn("text-center", isCompact ? "mb-6" : "mb-12")}
        >
          <h2 className={cn("font-bold tracking-tight", isCompact ? "text-xl" : "text-3xl sm:text-4xl")}>
            Why Choose{" "}
            <span className="text-primary">ZIVO</span>?
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={cn(
                "group text-center card-premium",
                isCompact ? "p-4" : "p-6 sm:p-8",
              )}
            >
              {/* Step number */}
              {!isCompact && (
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-3 block">
                  0{index + 1}
                </span>
              )}

              <div className={cn(
                "mx-auto rounded-2xl flex items-center justify-center",
                prop.iconBg,
                "group-hover:scale-110 transition-transform duration-300",
                isCompact ? "w-12 h-12 mb-3" : "w-14 h-14 mb-5"
              )}>
                <prop.icon className={cn(isCompact ? "w-6 h-6" : "w-7 h-7", prop.iconColor)} />
              </div>

              <h3 className={cn("font-bold mb-2", isCompact ? "text-base" : "text-lg sm:text-xl")}>
                {prop.title}
              </h3>
              <p className={cn("text-muted-foreground leading-relaxed", isCompact ? "text-xs" : "text-sm sm:text-base")}>
                {prop.description}
              </p>

              {/* Animated check */}
              {!isCompact && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                  className="mt-4"
                >
                  <CheckCircle className="w-5 h-5 text-primary/30 mx-auto" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {!isCompact && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
            >
              Learn More About ZIVO <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={cn("text-center text-muted-foreground/60 max-w-lg mx-auto", isCompact ? "text-[10px] mt-4" : "text-xs mt-8")}
        >
          ZIVO does not issue tickets or process payments. All bookings are completed on partner sites.
        </motion.p>
      </div>
    </section>
  );
}

export default WhyBookWithZivo;
