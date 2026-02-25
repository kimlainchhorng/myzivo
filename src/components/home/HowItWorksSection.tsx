/**
 * How It Works - Step-by-step section for homepage
 */
import { Search, CreditCard, Plane, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search",
    description: "Compare flights, hotels, and car rentals from hundreds of providers in one search.",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: CreditCard,
    step: "02",
    title: "Book",
    description: "Secure your booking with instant confirmation and encrypted payment processing.",
    color: "from-primary to-teal-500",
  },
  {
    icon: Plane,
    step: "03",
    title: "Travel",
    description: "Get your e-tickets and confirmation instantly. Track your trip in the ZIVO app.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Enjoy",
    description: "24/7 support, price alerts, and loyalty rewards for every trip you take.",
    color: "from-amber-500 to-orange-500",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            How{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              ZIVO
            </span>{" "}
            Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From search to takeoff in 4 simple steps
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px bg-gradient-to-r from-border to-transparent z-0" />
              )}
              
              <div className="relative z-10 text-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 glow-border-hover hover:-translate-y-1 transition-all duration-300">
                {/* Step number */}
                <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">{step.step}</span>
                
                {/* Icon */}
                <div className={cn(
                  "w-16 h-16 mx-auto my-4 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br shadow-lg",
                  step.color,
                  "group-hover:scale-110 transition-transform duration-300"
                )}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
