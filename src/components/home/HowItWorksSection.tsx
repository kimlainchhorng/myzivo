/**
 * How It Works - Premium step-by-step with glassmorphism and connector lines
 */
import { Search, CreditCard, Plane, CheckCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search",
    description: "Compare flights, hotels, and car rentals from hundreds of providers in one search.",
    gradient: "from-sky-500 to-blue-600",
    glow: "shadow-sky-500/20",
  },
  {
    icon: CreditCard,
    step: "02",
    title: "Book",
    description: "Secure your booking with instant confirmation and encrypted payment processing.",
    gradient: "from-primary to-teal-500",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: Plane,
    step: "03",
    title: "Travel",
    description: "Get your e-tickets and confirmation instantly. Track your trip in the ZIVO app.",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Enjoy",
    description: "24/7 support, price alerts, and loyalty rewards for every trip you take.",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-5 shimmer-chip">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple & Fast</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
            How{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              ZIVO
            </span>{" "}
            Works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            From search to takeoff in 4 simple steps
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px">
                  <div className="w-full h-full bg-gradient-to-r from-border via-primary/20 to-border" />
                </div>
              )}
              
              <div className={cn(
                "relative z-10 text-center p-6 sm:p-8 rounded-3xl",
                "bg-card/60 backdrop-blur-sm border border-border/50",
                "glow-border-hover hover:-translate-y-2 transition-all duration-300",
                `hover:shadow-xl hover:${step.glow}`
              )}>
                <span className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em]">{step.step}</span>
                
                <div className={cn(
                  "w-16 h-16 mx-auto my-5 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br shadow-lg",
                  step.gradient,
                  "group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                )}>
                  <step.icon className="w-8 h-8 text-white" />
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
