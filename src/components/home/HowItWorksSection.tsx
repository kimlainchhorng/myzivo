/**
 * How It Works - Premium step cards with animated connectors
 */
import { Search, CreditCard, Plane, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Search, step: "01", title: "Search", description: "Compare flights, hotels, and car rentals from hundreds of providers in one search.", iconBg: "bg-[hsl(var(--flights-light))]", iconColor: "text-[hsl(var(--flights))]", accent: "border-[hsl(var(--flights)/0.3)]" },
  { icon: CreditCard, step: "02", title: "Compare", description: "See all your options side-by-side with transparent pricing — no hidden fees.", iconBg: "bg-primary/10", iconColor: "text-primary", accent: "border-primary/30" },
  { icon: Plane, step: "03", title: "Book", description: "Complete your booking securely through our trusted travel partners.", iconBg: "bg-[hsl(var(--cars-light))]", iconColor: "text-[hsl(var(--cars))]", accent: "border-[hsl(var(--cars)/0.3)]" },
  { icon: CheckCircle, step: "04", title: "Travel", description: "Get instant confirmation, 24/7 support, and loyalty rewards on every trip.", iconBg: "bg-[hsl(var(--hotels-light))]", iconColor: "text-[hsl(var(--hotels))]", accent: "border-[hsl(var(--hotels)/0.3)]" },
];

export default function HowItWorksSection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Subtle dot pattern background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">Simple process</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
            How <span className="text-primary">ZIVO</span> Works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            From search to takeoff in 4 simple steps
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative group"
            >
              {/* Animated connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-12 left-[calc(50%+40px)] w-[calc(100%-50px)] items-center">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 + 0.3 }}
                    className="flex-1 h-[2px] bg-gradient-to-r from-primary/40 to-primary/10 origin-left"
                  />
                  <ArrowRight className="w-4 h-4 text-primary/30 -ml-1" />
                </div>
              )}
              
              <div className={cn(
                "relative z-10 text-center p-6 sm:p-8 rounded-2xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300",
                step.accent
              )}>
                {/* Step number */}
                <span className="absolute top-4 right-4 text-4xl font-black text-muted-foreground/[0.06] leading-none">{step.step}</span>

                <div className={cn(
                  "w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center relative",
                  step.iconBg,
                  "group-hover:scale-110 transition-transform duration-300"
                )}>
                  <step.icon className={cn("w-7 h-7", step.iconColor)} />
                </div>

                <h3 className="font-bold text-xl mb-2.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="rounded-full px-8 gap-2 font-semibold shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-shadow"
            onClick={() => navigate("/flights")}
          >
            Start Searching <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
