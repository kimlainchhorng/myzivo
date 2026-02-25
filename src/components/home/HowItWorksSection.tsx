/**
 * How It Works - Clean step cards with dotted connectors
 */
import { Search, CreditCard, Plane, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  { icon: Search, step: "1", title: "Search", description: "Compare flights, hotels, and car rentals from hundreds of providers in one search.", iconBg: "bg-[hsl(var(--flights-light))]", iconColor: "text-[hsl(var(--flights))]" },
  { icon: CreditCard, step: "2", title: "Book", description: "Secure your booking with instant confirmation and encrypted payment processing.", iconBg: "bg-primary/10", iconColor: "text-primary" },
  { icon: Plane, step: "3", title: "Travel", description: "Get your e-tickets and confirmation instantly. Track your trip in the ZIVO app.", iconBg: "bg-[hsl(var(--cars-light))]", iconColor: "text-[hsl(var(--cars))]" },
  { icon: CheckCircle, step: "4", title: "Enjoy", description: "24/7 support, price alerts, and loyalty rewards for every trip you take.", iconBg: "bg-[hsl(var(--hotels-light))]", iconColor: "text-[hsl(var(--hotels))]" },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
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
              {/* Dotted connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-50px)] border-t-2 border-dashed border-border/60" />
              )}
              
              <div className="relative z-10 text-center p-6 sm:p-8 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className={cn(
                  "w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center relative",
                  step.iconBg,
                  "group-hover:scale-110 transition-transform duration-300"
                )}>
                  <step.icon className={cn("w-7 h-7", step.iconColor)} />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                    {step.step}
                  </span>
                </div>

                <h3 className="font-bold text-xl mb-2.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
