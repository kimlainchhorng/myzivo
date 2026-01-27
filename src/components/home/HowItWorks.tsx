import { motion } from "framer-motion";
import { MapPin, Search, Car, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: 1,
    title: "Set Location",
    description: "Enter your pickup location or let us detect it automatically",
    icon: MapPin,
    gradient: "from-primary to-teal-400",
    glow: "shadow-primary/30",
  },
  {
    step: 2,
    title: "Choose Service",
    description: "Select from rides, food delivery, flights, hotels, and more",
    icon: Search,
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/30",
  },
  {
    step: 3,
    title: "Book & Track",
    description: "Confirm your booking and track everything in real-time",
    icon: Car,
    gradient: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/30",
  },
  {
    step: 4,
    title: "Enjoy & Rate",
    description: "Complete your trip and share your experience",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-500/30",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  },
};

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-teal-400/10 border border-primary/20 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Simple Process</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            How it{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in just a few simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {/* Connection Line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary via-violet-500 via-sky-500 to-emerald-500 opacity-30" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              variants={itemVariants}
              className="relative group"
            >
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 text-center h-full">
                {/* Step Number */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                  className={cn(
                    "w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl relative",
                    step.gradient,
                    step.glow
                  )}
                >
                  <step.icon className="w-8 h-8 text-white" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-current text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </motion.div>

                <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
